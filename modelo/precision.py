"""
Precisión del modelo vs Sleeper, contra los puntos reales.

- Semanas ya jugadas sin proyección guardada (antes de que existiera el modelo): se recalcula la
  proyección por partido del modelo SOLO con lo que se sabía antes de cada semana (2025 + semanas
  previas de 2026) y se compara con la proyección de Sleeper de esa semana.
  Ojo: esta versión no incluye rival, Vegas ni lesiones, así que es una prueba exigente para el modelo.
- Semanas con proyección guardada en historial/ (modelo completo, congelada antes del primer partido):
  comparación directa con Sleeper.
Se compara solo a jugadores relevantes (proyección de alguno de los dos >= 5 pts) que jugaron.
- Las proyecciones de Sleeper se pasan al puntaje de la liga (TD de pase = 6, intercepción = -2).
- Si existe historial/puro_<año>_sNN.csv se usa ese (modelo sin mezclar), para no medir la mezcla
  contra sí misma.
- Mezcla: busca el peso de Sleeper (0 a 1, de a 0.05) que da menos error por posición y lo guarda
  en data/mezcla.json; mezcla.py lo aplica en la siguiente corrida de modelo.py.
Salida: data/precision.json (la app lo muestra en Jugadores > Ranking) y data/mezcla.json.
"""
import json, os, re, sys
import numpy as np
import pandas as pd
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelo as m  # noqa: E402
import __main__  # noqa: E402
for _k in ["URL", "NV", "bajar", "norm", "pts_jugador", "TEMPORADA", "RAIZ"]:
    setattr(__main__, _k, getattr(m, _k))
import rol  # noqa: E402
import mezcla  # noqa: E402

POS = ["QB", "RB", "WR", "TE"]
MIN_PROY = 5.0
MIN_FILAS_MEZCLA = 100
GRILLA = [round(x * 0.05, 2) for x in range(21)]


def ids_sleeper():
    slp = m.bajar("sl_players", "json") or {}
    sl_a_gsis = {sid: p["gsis_id"].strip() for sid, p in slp.items() if p.get("gsis_id")}
    ids = m.bajar("ids")
    if ids is not None and "sleeper_id" in ids and "gsis_id" in ids:
        for g, s in zip(ids["gsis_id"], ids["sleeper_id"]):
            if pd.notna(g) and pd.notna(s):
                sl_a_gsis.setdefault(str(int(s)) if isinstance(s, float) else str(s), g)
    return sl_a_gsis


def sleeper_proy(y, w, sl_a_gsis, semana):
    carpeta = os.path.join(m.RAIZ, "historial")
    os.makedirs(carpeta, exist_ok=True)
    cache = os.path.join(carpeta, f"sleeper_liga_{y}_s{w:02d}.csv")
    if os.path.exists(cache):
        c = pd.read_csv(cache, dtype={"id": str})
        return pd.Series(c["proy"].values, index=c["id"].values)
    s = mezcla.bajar_sleeper(y, w, sl_a_gsis, m.PTS)
    if w < semana and len(s):  # semana ya jugada: la proyección no cambia más, se guarda
        pd.DataFrame({"id": s.index, "proy": s.values}).to_csv(cache, index=False)
    return s


def archivo_modelo(y, w):
    for pref in ("puro", "proy"):
        ruta = os.path.join(m.RAIZ, "historial", f"{pref}_{y}_s{w:02d}.csv")
        if os.path.exists(ruta):
            return ruta
    return None


def filas_con_semana(pg, sn, ant):
    """Igual que rol.filas, pero guarda la semana de cada fila."""
    pg = pg[pg["pos"].isin(POS)].copy()
    pg["snap"] = [sn.get((m.norm(n), t, int(w)), np.nan) for n, t, w in zip(pg["nombre"], pg["nfl"], pg["week"])]
    out = []
    for pid, g in pg.sort_values("week").groupby("id"):
        g = g.reset_index(drop=True)
        for j in range(rol.MIN_PREV, len(g)):
            pr, u2 = g.iloc[:j], g.iloc[:j].tail(2)
            pesos = 0.6 ** np.arange(len(pr))[::-1]
            sn_ok = pr["snap"].dropna()
            snap_u = pr["snap"].iloc[-1] if pd.notna(pr["snap"].iloc[-1]) else (sn_ok.mean() if len(sn_ok) else 0.5)
            snap_m = sn_ok.mean() if len(sn_ok) else snap_u
            a = ant.get(pid)
            out.append([1, pr["pts"].mean(), np.average(pr["pts"], weights=pesos), u2["carr"].mean(), u2["tgt"].mean(),
                        pr["carr"].mean(), pr["tgt"].mean(), snap_u, snap_u - snap_m, u2["pases"].mean(),
                        pr["rz_c"].mean(), pr["rz_t"].mean(), a if a is not None else 0.0, 1.0 if a is not None else 0.0,
                        pid, g.at[0, "pos"], int(g.at[j, "week"]), g.at[j, "pts"]])
    return pd.DataFrame(out, columns=rol.COLS + ["id", "pos", "week", "y"])


def main():
    y = m.TEMPORADA
    estado = m.bajar("sl_state", "json") or {}
    semana = int(os.environ.get("SEMANA") or estado.get("week") or 1)
    games = m.bajar("games")
    st26, st25 = m.bajar("stats", y=y), m.bajar("stats", y=y - 1)
    if games is None or st26 is None or st25 is None:
        print("AVISO: faltan datos de nflverse; no actualizo la precisión")
        return
    pg26 = m.cargar_partidos(st26, m.bajar("pbp", "parquet", y=y), games, y)
    pg25 = m.cargar_partidos(st25, m.bajar("pbp", "parquet", y=y - 1), games, y - 1)
    real = pg26.groupby(["id", "week"])["pts"].sum()
    jugadas = sorted(int(w) for w in pg26["week"].unique())
    sl_a_gsis = ids_sleeper()

    # 1) Semanas pasadas: modelo recalculado con lo que se sabía antes de cada semana
    sn26, sn25 = rol.snaps(y), rol.snaps(y - 1)
    tr = filas_con_semana(pg25, sn25, rol.ppg_previo(y - 2))
    te = filas_con_semana(pg26, sn26, rol.ppg_previo(y - 1))
    filas, todas = [], []
    for w in jugadas:
        if w < 4:
            continue
        sp = sleeper_proy(y, w, sl_a_gsis, semana)
        if not len(sp):
            continue
        guardado = archivo_modelo(y, w)
        if guardado:
            h = pd.read_csv(guardado)
            h = h[h["Pos"].isin(POS)]
            d = pd.DataFrame({"id": h["Clave"], "pos": h["Pos"], "mod": h["Proy"]})
            fuente = "Modelo completo (guardado antes de la semana)"
        else:
            d = []
            for p in POS:
                a = pd.concat([tr[tr["pos"] == p], te[(te["pos"] == p) & (te["week"] < w)]])
                b = te[(te["pos"] == p) & (te["week"] == w)]
                if len(a) < 100 or not len(b):
                    continue
                beta = rol.entrenar(a)
                d.append(pd.DataFrame({"id": b["id"].values, "pos": p,
                                       "mod": np.clip(b[rol.COLS].values.astype(float) @ beta, 0, None)}))
            if not d:
                continue
            d = pd.concat(d)
            fuente = "Modelo recalculado (sin rival/Vegas/lesiones)"
        d["sl"] = d["id"].map(sp)
        d["real"] = [real.get((i, w), np.nan) for i in d["id"]]
        d = d.dropna(subset=["sl", "real"])
        d = d[(d["mod"] >= MIN_PROY) | (d["sl"] >= MIN_PROY)]
        todas.append(d[["pos", "mod", "sl", "real"]])
        for p, g in d.groupby("pos"):
            filas.append([w, p, int(len(g)), round(float((g["real"] - g["mod"]).abs().mean()), 2),
                          round(float((g["real"] - g["sl"]).abs().mean()), 2), fuente])
    if not filas:
        print("Precisión: todavía no hay semanas para comparar")
        return
    t = pd.DataFrame(filas, columns=["Semana", "Pos", "Jugadores", "Error modelo", "Error Sleeper", "Fuente"])
    tot = []
    for p, g in t.groupby("Pos"):
        n = g["Jugadores"].sum()
        em = float((g["Error modelo"] * g["Jugadores"]).sum() / n)
        es = float((g["Error Sleeper"] * g["Jugadores"]).sum() / n)
        tot.append([p, int(n), round(em, 2), round(es, 2), "Modelo" if em < es else "Sleeper"])
    print("Precisión vs Sleeper (error medio por jugador, pts; menos es mejor):")
    for p, n, em, es, gana in tot:
        print(f"  {p}: {n} jugadores · modelo {em} · Sleeper {es} · mejor: {gana}")

    # 2) Mezcla: peso de Sleeper con menos error por posición
    D = pd.concat(todas)
    pesos, mz = {}, []
    for p, g in D.groupby("pos"):
        if len(g) < MIN_FILAS_MEZCLA:
            continue
        errs = [float(np.mean(np.abs(g["real"] - ((1 - a) * g["mod"] + a * g["sl"])))) for a in GRILLA]
        k = int(np.argmin(errs))
        pesos[p] = GRILLA[k]
        mz.append([p, int(len(g)), GRILLA[k], round(errs[k], 2), round(errs[0], 2), round(errs[-1], 2)])
    print("Mezcla (peso de Sleeper con menos error; 0 = solo modelo, 1 = solo Sleeper):")
    for p, n, a, em, e0, e1 in mz:
        print(f"  {p}: peso Sleeper {a} · error mezcla {em} · solo modelo {e0} · solo Sleeper {e1}")

    generado = pd.Timestamp.now("UTC").isoformat(timespec="minutes")
    os.makedirs(os.path.join(m.RAIZ, "data"), exist_ok=True)
    with open(os.path.join(m.RAIZ, "data", "precision.json"), "w", encoding="utf-8") as f:
        json.dump({"generado": generado,
                   "total": [["Pos", "Jugadores", "Error modelo", "Error Sleeper", "Mejor"]] + tot,
                   "semanas": [list(t.columns)] + t.values.tolist(),
                   "mezcla": [["Pos", "Jugadores", "Peso Sleeper", "Error mezcla", "Error modelo",
                               "Error Sleeper"]] + mz}, f, ensure_ascii=False, default=str)
    with open(os.path.join(m.RAIZ, "data", "mezcla.json"), "w", encoding="utf-8") as f:
        json.dump({"generado": generado, "peso_sleeper": pesos}, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
