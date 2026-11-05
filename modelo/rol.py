"""
Proyección por partido basada en evidencia (rol actual + producción), ajustada contra resultados reales.

Para cada posición (QB, RB, WR, TE) se entrena una regresión con TODOS los partidos de la temporada
anterior: con lo que se sabía antes de cada partido (promedio de puntos, forma reciente, carreras y
targets de los últimos 2 partidos y de la temporada, jugadas en zona roja, % de snaps del último
partido y su cambio, y nivel del año anterior) predice los puntos de ese partido.
Luego se valida con las semanas ya jugadas de este año (sin usarlas para entrenar) y se reentrena con
todo para proyectar la semana actual. Así los pesos salen de los datos y no de supuestos.
"""
import json, os, re
import numpy as np
import pandas as pd

POSICIONES = ["QB", "RB", "WR", "TE"]
LAMBDA = 5.0      # regularización (evita pesos extremos)
MIN_PREV = 2      # partidos previos mínimos en la temporada para usar la regresión
COLS = ["const", "ppg", "forma", "carr_u2", "tgt_u2", "carr", "tgt", "snap_u", "snap_cambio",
        "pases_u2", "rz_c", "rz_t", "ppg_ant", "tiene_ant"]
INFORME = {}


def _m():
    import __main__
    return __main__


def snaps(y):
    m = _m()
    m.URL.setdefault("snaps", m.NV + "/snap_counts/snap_counts_{y}.csv")
    s = m.bajar("snaps", y=y)
    if s is None or not len(s):
        print(f"AVISO: sin snaps {y}; la regresión usa solo volumen y producción")
        return {}
    s = s[s["game_type"] == "REG"] if "game_type" in s else s
    return {(m.norm(n), t, int(w)): float(p) for n, t, w, p in
            zip(s["player"], s["team"], s["week"], s["offense_pct"].fillna(0))}


def ppg_previo(y):
    """Puntos por partido de la temporada y-1 (solo jugadores con 3+ partidos)."""
    m = _m()
    st = m.bajar("stats", y=y)
    if st is None:
        return {}
    st = st[(st["season_type"] == "REG") & st["position"].isin(POSICIONES)].copy()
    st["pts"] = m.pts_jugador(st)
    g = st.groupby("player_id")["pts"].agg(["mean", "count"])
    return g.loc[g["count"] >= 3, "mean"].to_dict()


def filas(pg, sn, ant, desde=4, hasta=99, solo_ultima=False):
    """Una fila de features por jugador-partido, con datos previos al partido."""
    m = _m()
    pg = pg[pg["pos"].isin(POSICIONES)].copy()
    pg["snap"] = [sn.get((m.norm(n), t, int(w)), np.nan) for n, t, w in zip(pg["nombre"], pg["nfl"], pg["week"])]
    out, y, ids = [], [], []
    for pid, g in pg.sort_values("week").groupby("id"):
        g = g.reset_index(drop=True)
        rango = [len(g)] if solo_ultima else range(MIN_PREV, len(g))
        for j in rango:
            if j < MIN_PREV:
                continue
            if not solo_ultima and not (desde <= g.at[j, "week"] <= hasta):
                continue
            pr = g.iloc[:j]
            u2 = pr.tail(2)
            pesos = 0.6 ** np.arange(len(pr))[::-1]
            sn_ok = pr["snap"].dropna()
            snap_u = pr["snap"].iloc[-1] if pd.notna(pr["snap"].iloc[-1]) else (sn_ok.mean() if len(sn_ok) else 0.5)
            snap_m = sn_ok.mean() if len(sn_ok) else snap_u
            a = ant.get(pid)
            out.append([1, pr["pts"].mean(), np.average(pr["pts"], weights=pesos), u2["carr"].mean(), u2["tgt"].mean(),
                        pr["carr"].mean(), pr["tgt"].mean(), snap_u, snap_u - snap_m, u2["pases"].mean(),
                        pr["rz_c"].mean(), pr["rz_t"].mean(), a if a is not None else 0.0, 1.0 if a is not None else 0.0])
            y.append(np.nan if solo_ultima else g.at[j, "pts"])
            ids.append((pid, g.at[0, "pos"]))
    X = pd.DataFrame(out, columns=COLS)
    X["id"] = [i for i, _ in ids]
    X["pos"] = [p for _, p in ids]
    X["y"] = y
    return X


def entrenar(X):
    A = X[COLS].values.astype(float)
    y = X["y"].values.astype(float)
    reg = LAMBDA * np.eye(A.shape[1])
    reg[0, 0] = 0
    return np.linalg.solve(A.T @ A + reg, A.T @ y)


def ajustar(df, pg26, pg25, semana=None):
    m = _m()
    y = m.TEMPORADA
    try:
        sn26, sn25 = snaps(y), snaps(y - 1)
        ant26, ant25 = ppg_previo(y - 1), ppg_previo(y - 2)
        tr = filas(pg25, sn25, ant25, 4, 17)
        te = filas(pg26, sn26, ant26, 4, 99)
        hoy = filas(pg26, sn26, ant26, solo_ultima=True)
    except Exception as e:
        print(f"AVISO: no pude armar la regresión de rol ({e}); sigo con la proyección anterior")
        return df
    df = df.copy()
    df["O_anterior"] = df["O"]
    informe = []
    for p in POSICIONES:
        a, b, h = tr[tr["pos"] == p], te[te["pos"] == p], hoy[hoy["pos"] == p]
        if len(a) < 100:
            continue
        beta = entrenar(a)
        if len(b) >= 30:
            pred = np.clip(b[COLS].values @ beta, 0, None)
            mae_n = float(np.mean(np.abs(b["y"] - pred)))
            mae_p = float(np.mean(np.abs(b["y"] - b["ppg"])))
            informe.append([p, int(len(b)), round(mae_n, 2), round(mae_p, 2)])
            if mae_n > mae_p * 1.01:
                print(f"  {p}: la regresión no mejora al promedio de temporada; dejo la proyección anterior")
                continue
            beta = entrenar(pd.concat([a, b]))  # para proyectar se usa toda la evidencia
        pr = pd.Series(np.clip(h[COLS].values @ beta, 0, None), index=h["id"].values)
        pr = pr[pr.index.isin(df.index)]
        df.loc[pr.index, "O"] = pr.values
        INFORME[p] = dict(zip(COLS, np.round(beta, 3).tolist()))
    if informe:
        print("Prueba contra resultados reales 2026 (error medio por partido, pts):")
        for p, n, a1, a2 in informe:
            print(f"  {p}: {n} partidos · modelo nuevo {a1} · promedio de temporada {a2}")
        os.makedirs(os.path.join(m.RAIZ, "data"), exist_ok=True)
        with open(os.path.join(m.RAIZ, "data", "backtest.json"), "w", encoding="utf-8") as f:
            json.dump({"generado": pd.Timestamp.utcnow().isoformat(timespec="minutes"),
                       "prueba": [["Pos", "Partidos", "Error modelo", "Error promedio temporada"]] + informe,
                       "pesos": INFORME}, f, ensure_ascii=False)
    return df
