"""
Valor de trade (0-100) basado en evidencia.

1) Puntos por encima de un titular de la liga, semana a semana, con la incertidumbre real del rol
   (medida con 2025). Se guarda como "VOR ROS" y se usa para K y DST.
2) Valor de mercado: FantasyCalc (valores redraft calculados a partir de millones de trades
   reales, 12 equipos, 1 QB, 0.5 PPR, se actualizan cada 3 h), llevado a 0-100.
3) Escala: por posición se ajusta una curva suave "precio de mercado según puntos ROS" y cada jugador
   recibe el precio que corresponde a los puntos que el modelo le proyecta. K y DST, sin mercado
   suficiente, usan el valor por encima del titular.
4) Valor final: parte del precio de mercado (lo que realmente paga la liga) y el modelo lo ajusta:
   final = mercado x (modelo / mercado) ^ PESO_MODELO, con la razón modelo/mercado limitada entre
   1/TOPE y TOPE. Si no hay precio de mercado, se usa el valor del modelo.
   Para que el valor no cambie a mitad de semana, se usan solo las semanas futuras de todos.
"""
import json, math, os
import numpy as np
import pandas as pd
import requests

PESO_MODELO = 0.35   # cuánto puede mover el modelo al precio de mercado (0 = solo mercado)
TOPE = 2.0           # el modelo puede duplicar o reducir a la mitad el precio de mercado, no más
TITULAR = dict(QB=13, RB=28, WR=43, TE=13, K=13, DST=13)   # nivel de un titular de la liga, por semana
FC_URL = "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=0.5"
SENAL = 8  # diferencia (puntos de valor) para marcar comprar / vender

_EXTRA = {}


def _Phi(x):
    x = np.asarray(x, dtype=float)
    if x.size == 0:
        return x
    return 0.5 * (1 + np.vectorize(math.erf, otypes=[float])(x / math.sqrt(2)))


def incertidumbre(pg25):
    """Por posición: cuánto cambia el nivel real de un jugador entre mitades de temporada (log)."""
    s, cvw = {}, {}
    if pg25 is None or not len(pg25):
        return {p: 0.35 for p in TITULAR}
    g = pg25[pg25["pos"].isin(TITULAR.keys())]
    for p, gp in g.groupby("pos"):
        a = gp[gp["week"] <= 8].groupby("id")["pts"].agg(["mean", "std", "count"])
        b = gp[gp["week"] >= 10].groupby("id")["pts"].agg(["mean", "count"])
        m = a.join(b, rsuffix="2", how="inner")
        m = m[(m["count"] >= 4) & (m["count2"] >= 4) & (m["mean"] >= 3) & (m["mean2"] > 0.5)]
        if len(m) < 8:
            s[p] = 0.35
            continue
        cv = float((m["std"] / m["mean"]).median())
        ruido = (cv ** 2) * (1 / m["count"] + 1 / m["count2"]).mean()
        var = float(np.log(m["mean2"] / m["mean"]).var()) - ruido
        s[p] = float(np.clip(math.sqrt(max(var, 0.0)), 0.15, 0.6))
        cvw[p] = cv
    for p in TITULAR:
        s.setdefault(p, 0.35)
    print("Incertidumbre del rol por posición (2025):", {k: round(v, 2) for k, v in s.items()})
    return s


def ausencias(pg25):
    """Por posición: % de semanas (2.ª mitad 2025) que se perdió un jugador que era titular en la 1.ª mitad."""
    q = {}
    if pg25 is None or not len(pg25):
        return {p: 0.08 for p in TITULAR}
    jugo = pg25.groupby(["nfl", "week"]).size().reset_index()[["nfl", "week"]]
    for p, gp in pg25[pg25["pos"].isin(TITULAR.keys())].groupby("pos"):
        a = gp[gp["week"] <= 8].groupby("id").agg(g=("week", "nunique"), m=("pts", "mean"), nfl=("nfl", "last"))
        a = a[(a["g"] >= 6)]
        a = a[a["m"] >= a["m"].quantile(0.5)]
        tot = fal = 0
        for pid, r in a.iterrows():
            sem = set(jugo[(jugo["nfl"] == r["nfl"]) & (jugo["week"] >= 10)]["week"])
            js = set(gp[(gp["id"] == pid) & (gp["week"] >= 10)]["week"])
            tot += len(sem)
            fal += len(sem - js)
        q[p] = float(np.clip(fal / tot, 0.03, 0.25)) if tot else 0.08
    for p in TITULAR:
        q.setdefault(p, 0.08)
    print("Semanas perdidas por titulares (2025):", {k: round(v, 3) for k, v in q.items()})
    return q


def _opcion(mu, r, sig):
    out = pd.Series(0.0, index=mu.index)
    ok = (mu > 0.05) & (r > 0.05)
    if not ok.any():
        return out
    d1 = (np.log(mu[ok] / r[ok]) + sig[ok] ** 2 / 2) / sig[ok]
    out[ok] = mu[ok] * _Phi(d1) - r[ok] * _Phi(d1 - sig[ok])
    return out


def valor_modelo(df, proy, semana, s, q=None):
    """Suma semanal de E[max(nivel real - titular, 0)] con nivel real lognormal alrededor de la proyección."""
    ros_sin_actual = proy[[w for w in proy.columns if w > semana]].sum(axis=1)
    incluye_actual = (df["ros"] - ros_sin_actual) > 0.01
    tot = pd.Series(0.0, index=df.index)
    for w in proy.columns:
        if w < semana:
            continue
        mu = proy[w].clip(lower=0)
        if w == semana:
            mu = mu.where(incluye_actual, 0)
        r = pd.Series(0.0, index=df.index)
        for p, n in TITULAR.items():
            m = df["pos"] == p
            if m.any():
                r[m] = proy.loc[m, w].sort_values(ascending=False).iloc[n - 1:n + 2].mean()
        sig = df["pos"].map(s).fillna(0.35) * min(1.25, max(0.35, math.sqrt((w - semana + 1) / 8)))
        base = _opcion(mu, r, sig)
        if q is None or "opp_g" not in df:
            tot += base
            continue
        # Suplente: si se pierde el titular de su equipo y posición, hereda parte de su volumen
        extra = pd.Series(0.0, index=df.index)
        for (tm, p), g in df[df["pos"].isin(["RB", "WR", "TE"])].groupby(["nfl", "pos"]):
            og = g["opp_g"].fillna(0)
            if len(g) < 2 or og.sum() <= 0:
                continue
            lid = og.idxmax()
            sh = og / og.sum()
            otros = sh.drop(lid)
            if otros.sum() <= 0:
                continue
            vol = 0.7 if p == "RB" else 0.5
            extra[otros.index] = (vol * mu[lid] * otros / otros.sum()).clip(upper=0.8 * mu[lid]).values
        qq = df["pos"].map(q).fillna(0.08)
        sube = _opcion(mu + extra, r, sig)
        tot += (1 - qq) * base + qq * sube
    return tot


def mercado(gsis_a_sl):
    """Valor FantasyCalc por id nflverse (gsis)."""
    data = None
    local = os.environ.get("MODELO_LOCAL")
    try:
        if local:
            ruta = os.path.join(local, "fantasycalc.json")
            data = json.load(open(ruta)) if os.path.exists(ruta) else None
        else:
            r = requests.get(FC_URL, timeout=60, headers={"User-Agent": "fantasy-modelo"})
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        print(f"AVISO: no pude bajar FantasyCalc ({e}); uso solo el valor del modelo")
    if not data:
        return pd.Series(dtype=float)
    sl_a_gsis = {str(v): k for k, v in gsis_a_sl.items()}
    out = {}
    for x in data:
        sid = str((x.get("player") or {}).get("sleeperId") or "")
        v = x.get("redraftValue") or x.get("value")
        if sid in sl_a_gsis and isinstance(v, (int, float)) and v > 0:
            out[sl_a_gsis[sid]] = float(v)
    print(f"FantasyCalc: {len(out)} jugadores con valor de mercado")
    return pd.Series(out, dtype=float)


def modelo_por_mercado(df, mk100):
    """Valor del modelo en la escala del mercado, con una curva suave por posición:
    se ajusta log(precio de mercado) contra los puntos ROS del modelo con los jugadores que tienen
    precio, y cada jugador recibe el precio que corresponde a SUS puntos proyectados.
    Así poca diferencia de puntos da poca diferencia de valor, y la escala sale de trades reales."""
    out = pd.Series(np.nan, index=df.index)
    for p in TITULAR:
        m = df["pos"] == p
        cerca = df.index[m][(df.loc[m, "ros"].rank(ascending=False) <= 2 * TITULAR[p]).values]
        ref = mk100[mk100.index.isin(cerca)]  # solo jugadores relevantes (evita lesionados y suplentes)
        ref = ref[ref > 0.3]
        if len(ref) < 10:
            continue
        b, a = np.polyfit(df.loc[ref.index, "ros"].values, np.log(ref.values), 1)
        if b <= 0:
            continue
        out[m] = np.minimum(100, np.exp(a + b * df.loc[m, "ros"].clip(lower=0)))
    return out


def calcular(df, proy, semana, pg25, gsis_a_sl):
    df = df.copy()
    s = incertidumbre(pg25)
    q = ausencias(pg25)
    vm = valor_modelo(df, proy, semana, s, q)
    opcion = 100 * vm / vm.max() if vm.max() > 0 else vm
    mk = mercado(gsis_a_sl)
    mk = mk[mk.index.isin(df.index)]
    if len(mk) >= 30:
        mk100 = 100 * mk / mk.max()
        futuras = [w for w in proy.columns if w > semana]
        modelo = modelo_por_mercado(df.assign(ros=proy[futuras].sum(axis=1)), mk100).fillna(opcion)
        merc = mk100.reindex(df.index)
    else:
        modelo, merc = opcion, pd.Series(np.nan, index=df.index)
    final = modelo.copy()
    tiene = merc.notna() & (merc > 0)
    razon = (modelo[tiene].clip(lower=0.1) / merc[tiene]).clip(1 / TOPE, TOPE)
    final[tiene] = merc[tiene] * razon ** PESO_MODELO
    final = 100 * final / final.max()
    df["vor"] = vm.round(1)
    df["valor"] = final.round(1)
    df["rank_valor"] = df.groupby("pos")["valor"].rank(ascending=False, method="min").astype(int)
    df["tier"] = (1 + (100 - df["valor"]) // 20).clip(upper=5).astype(int)
    dif = merc - modelo
    senal = np.where(dif > SENAL, "Mercado lo paga más: buen momento para vender",
                     np.where(dif < -SENAL, "Mercado lo paga menos: buen momento para comprar", "Parejo"))
    senal = pd.Series(senal, index=df.index).where(tiene, "Sin dato de mercado")
    _EXTRA.update(modelo=modelo.round(1), mercado=merc.round(1), senal=senal)
    _parchar_tabla()
    return df


def _parchar_tabla():
    """Agrega columnas 'Valor modelo', 'Valor mercado' y 'Señal mercado' a App_Valor sin tocar modelo.py."""
    import __main__
    if getattr(__main__, "_tabla_valor", False) or not hasattr(__main__, "tabla"):
        return
    orig = __main__.tabla

    def tabla(h, d):
        if list(h[:5]) == ["Jugador", "Pos", "NFL", "Dueño", "Valor"]:
            d = d.copy()
            d["_m"] = _EXTRA["modelo"].reindex(d.index)
            d["_k"] = _EXTRA["mercado"].reindex(d.index)
            d["_s"] = _EXTRA["senal"].reindex(d.index)
            h = list(h) + ["Valor modelo", "Valor mercado", "Señal mercado"]
        return orig(h, d)
    __main__.tabla = tabla
    __main__._tabla_valor = True
