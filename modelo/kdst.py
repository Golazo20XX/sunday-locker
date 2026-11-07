"""
Calibración de K y DST con resultados reales (reemplaza los factores fijos CAL_K y CAL_DST).

Hasta ahora K y DST salían de reglas fijas que nunca se probaron. Este archivo:
1. Guarda, cada semana y antes de que empiece cada partido, la proyección base de K y DST en
   historial/kdst_sNN.csv (lo ya jugado se congela).
2. Con las semanas ya jugadas compara esa proyección con los puntos reales y busca el peso (cuánto
   creerle al jugador vs al promedio de la posición) con menos error; el factor de escala se fija para
   que el promedio proyectado sea igual al real (sin sesgo).
3. Solo la usa si baja el error real en más de MEJORA_MIN pts por partido; si no, deja todo igual.
4. Escribe en el registro el error de K y DST (modelo, calibrado y promedio de temporada) y guarda
   el resultado en data/kdst.json.
Se llama desde modelo.py después de la mezcla con Sleeper y antes del clima.
"""
import json, os, re

import numpy as np
import pandas as pd

POSICIONES = ["K", "DST"]
FACTORES = np.array([0.70, 1.40])                      # límites del factor de escala
PESOS = np.round(np.arange(0.30, 1.01, 0.05), 2)      # 1 = solo el jugador · 0.3 = 70 % promedio de la posición
MIN_PROY = 2.0          # se miden solo jugadores con proyección de al menos 2 pts (los que alguien alinearía)
MIN_PARTIDOS = 40       # partidos medidos mínimos para calibrar una posición
MEJORA_MIN = 0.05       # pts por partido que tiene que bajar el error para usar la calibración
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA = os.path.join(RAIZ, "historial")


def _guardar(df, proy, semana, cal, ahora):
    os.makedirs(CARPETA, exist_ok=True)
    m = df["pos"].isin(POSICIONES)
    nuevo = pd.DataFrame({"Semana": semana, "Clave": df.index[m], "Jugador": df.loc[m, "nombre"],
                          "Pos": df.loc[m, "pos"], "NFL": df.loc[m, "nfl"],
                          "Base": proy.loc[df.index[m], semana].round(2)})
    ruta = os.path.join(CARPETA, f"kdst_s{semana:02d}.csv")
    ini = cal[cal["week"] == semana].drop_duplicates("nfl").set_index("nfl")["inicio"]
    empezo = {tm for tm, t in ini.items() if pd.Timestamp(t) <= pd.Timestamp(ahora)}
    if os.path.exists(ruta):
        viejo = pd.read_csv(ruta)
        nuevo = pd.concat([viejo[viejo["NFL"].isin(empezo)], nuevo[~nuevo["NFL"].isin(empezo)]],
                          ignore_index=True)
    nuevo.to_csv(ruta, index=False)


def _historial(pg):
    """Proyección base vs real de las semanas ya jugadas (usa proy_*.csv para semanas antiguas)."""
    real = pg.groupby(["id", "week"])["pts"].sum()
    jugadas = set(int(w) for w in pg["week"].unique())
    filas, vistas = [], set()
    if not os.path.isdir(CARPETA):
        return pd.DataFrame()
    archivos = sorted(os.listdir(CARPETA), key=lambda f: (0 if f.startswith("kdst_") else 1, f))
    for f in archivos:
        mm = re.match(r"(?:kdst_s|proy_\d+_s|puro_\d+_s)(\d+)\.csv$", f)
        if not mm:
            continue
        w = int(mm.group(1))
        if w not in jugadas or w in vistas:
            continue
        h = pd.read_csv(os.path.join(CARPETA, f))
        h = h[h["Pos"].isin(POSICIONES)].copy()
        if "Base" not in h:
            h["Base"] = h["Proy"]
        h["Real"] = [real.get((c, w), np.nan) for c in h["Clave"]]
        h = h.dropna(subset=["Real"])
        if len(h):
            vistas.add(w)
            h["Semana"] = w
            filas.append(h[["Semana", "Clave", "Pos", "Base", "Real"]])
    if not filas:
        return pd.DataFrame()
    h = pd.concat(filas, ignore_index=True)
    # promedio de temporada antes de cada partido (para comparar)
    pp = pg[pg["pos"].isin(POSICIONES)].sort_values("week")
    prev = {}
    for cid, g in pp.groupby("id"):
        acum = g["pts"].expanding().mean().shift()
        for w, v in zip(g["week"], acum):
            prev[(cid, int(w))] = v
    h["Prom"] = [prev.get((c, w), np.nan) for c, w in zip(h["Clave"], h["Semana"])]
    return h


def _pred(h, f, p):
    media = h.groupby("Semana")["Base"].transform("mean")
    return f * (p * h["Base"] + (1 - p) * media)


def aplicar(df, proy, semana, cal, ahora, pg):
    try:
        _guardar(df, proy, semana, cal, ahora)
        h = _historial(pg)
        if not len(h):
            print("K/DST: todavía no hay semanas jugadas para calibrar")
            return proy
        h = h[h["Base"] >= MIN_PROY]
        print(f"K/DST: semanas con proyección guardada y resultado real: {sorted(h['Semana'].unique().tolist())}")
        proy = proy.copy()
        res = {}
        for pos in POSICIONES:
            g = h[h["Pos"] == pos]
            if len(g) < MIN_PARTIDOS:
                print(f"  {pos}: {len(g)} partidos medidos (mínimo {MIN_PARTIDOS}); sin calibrar todavía")
                continue
            e0 = float((g["Real"] - g["Base"]).abs().mean())
            best = (e0, 1.0, 1.0)
            for p in PESOS:
                # el factor deja el promedio proyectado igual al real (sin sesgo, así el total del equipo
                # y la simulación no se mueven de más); el peso se elige por menor error
                base_p = _pred(g, 1.0, p)
                f = float(np.clip(g["Real"].mean() / base_p.mean(), FACTORES.min(), FACTORES.max())) \
                    if base_p.mean() > 0 else 1.0
                e = float((g["Real"] - f * base_p).abs().mean())
                if e < best[0] - 1e-9:
                    best = (e, round(f, 3), float(p))
            gp = g.dropna(subset=["Prom"])
            e_prom = float((gp["Real"] - gp["Prom"]).abs().mean()) if len(gp) else float("nan")
            usa = best[0] < e0 - MEJORA_MIN
            res[pos] = dict(partidos=int(len(g)), semanas=int(g["Semana"].nunique()), error_modelo=round(e0, 2),
                            error_calibrado=round(best[0], 2), error_promedio=round(e_prom, 2),
                            factor=best[1], peso=best[2], usa=bool(usa))
            print(f"  {pos}: {len(g)} partidos ({g['Semana'].nunique()} semanas) · modelo {e0:.2f} · "
                  f"calibrado {best[0]:.2f} (factor {best[1]:.2f}, peso {best[2]:.2f}) · "
                  f"promedio de temporada {e_prom:.2f} → " + ("lo uso" if usa else "no mejora lo suficiente; sin cambio"))
            if usa:
                m = (df["pos"] == pos).reindex(proy.index).fillna(False)
                for w in proy.columns:
                    col = proy.loc[m, w]
                    jugando = col > 0
                    media = col[jugando].mean() if jugando.any() else 0
                    proy.loc[col.index[jugando], w] = (best[1] * (best[2] * col[jugando]
                                                                  + (1 - best[2]) * media)).round(2)
        if res:
            os.makedirs(os.path.join(RAIZ, "data"), exist_ok=True)
            with open(os.path.join(RAIZ, "data", "kdst.json"), "w", encoding="utf-8") as f:
                json.dump({"generado": pd.Timestamp.utcnow().isoformat(timespec="minutes"), "posiciones": res},
                          f, ensure_ascii=False)
        return proy
    except Exception as ex:
        print(f"K/DST: no pude calibrar ({ex}); quedan los factores fijos")
        return proy
