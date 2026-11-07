"""
Ajustes de clima y de QB rival fuera para la semana actual (opción B: cambian las proyecciones).

Se llama desde modelo.py justo después de la mezcla con Sleeper y ANTES de calcular ROS, valor y los
archivos data/modelo_<liga>.json, así que ranking, alineación, streaming, waivers, trades y simulación
usan las proyecciones ya ajustadas.

Fuentes (gratis, sin clave):
- Calendario de nflverse (games.csv): estadio, hora y techo (dome / closed / open / outdoors).
- Open-Meteo: pronóstico por hora de viento, lluvia, nieve y temperatura en el estadio.
- Sleeper: QB titular (depth chart) y su estado de lesión.

Solo ajusta la semana actual: más adelante el pronóstico no sirve. Si algo falla, devuelve las
proyecciones sin cambios y la app sigue funcionando.
Salida extra: App_Ajustes (Equipo, Pos, Nota, Ajuste) que la app muestra en Streaming DST / K.
"""
from datetime import timedelta

import numpy as np
import pandas as pd
import requests

# ---------------------------------------------------------------- PARÁMETROS (cámbialos aquí)
VIENTO_BASE = 12        # mph desde donde el viento empieza a afectar
VIENTO = dict(K=-0.015, PASE=-0.008, RB=0.003, DST=0.006)     # por cada mph sobre VIENTO_BASE
VIENTO_TOPE = dict(K=-0.25, PASE=-0.12, RB=0.04, DST=0.08)
LLUVIA_FUERTE = 0.10    # pulgadas por hora (promedio del partido)
LLUVIA_MEDIA = 0.03
LLUVIA = dict(K=-0.05, PASE=-0.04, RB=0.02, DST=0.03)          # lluvia fuerte (la media vale la mitad)
NIEVE_FUERTE = 0.20     # pulgadas de nieve por hora
NIEVE = dict(K=-0.08, PASE=-0.06, RB=0.03, DST=0.04)
FRIO = 20               # °F o menos
FRIO_AJ = dict(K=-0.05, PASE=-0.02)
CON_VEGAS = 0.6         # si hay línea de Vegas, el clima ya está en parte en ella: se aplica el 60 %
QB_FUERA_DST = 0.12     # DST que enfrenta a un QB suplente (sin línea de Vegas)
QB_FUERA_DST_VEGAS = 0.04  # ... si hay línea de Vegas (que ya lo refleja en parte)
QB_MALO = ("out", "ir", "pup", "sus", "doubtful", "na")
MIN_MOSTRAR = 0.01      # ajustes menores a 1 % no se muestran
TOPE_TOTAL = (-0.30, 0.20)

GRUPO = dict(QB="PASE", WR="PASE", TE="PASE", RB="RB", K="K", DST="DST")
NOMBRE_GRUPO = dict(K="K", DST="DST", PASE="Pase (QB, WR, TE)", RB="RB")
URL_METEO = ("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
             "&hourly=temperature_2m,precipitation,snowfall,wind_speed_10m"
             "&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch"
             "&timezone=UTC&start_date={d}&end_date={d2}")

# Estadios (local) y techo por defecto si games.csv no lo trae. "techo" = domo o techo retráctil.
ESTADIO = {
    "ARI": (33.528, -112.263, True), "ATL": (33.755, -84.401, True), "BAL": (39.278, -76.623, False),
    "BUF": (42.774, -78.787, False), "CAR": (35.226, -80.853, False), "CHI": (41.862, -87.617, False),
    "CIN": (39.095, -84.516, False), "CLE": (41.506, -81.700, False), "DAL": (32.748, -97.093, True),
    "DEN": (39.744, -105.020, False), "DET": (42.340, -83.046, True), "GB": (44.501, -88.062, False),
    "HOU": (29.685, -95.411, True), "IND": (39.760, -86.164, True), "JAX": (30.324, -81.637, False),
    "KC": (39.049, -94.484, False), "LA": (33.953, -118.339, True), "LAC": (33.953, -118.339, True),
    "LV": (36.091, -115.184, True), "MIA": (25.958, -80.239, False), "MIN": (44.974, -93.258, True),
    "NE": (42.091, -71.264, False), "NO": (29.951, -90.081, True), "NYG": (40.814, -74.074, False),
    "NYJ": (40.814, -74.074, False), "PHI": (39.901, -75.168, False), "PIT": (40.447, -80.016, False),
    "SEA": (47.595, -122.332, False), "SF": (37.403, -121.970, False), "TB": (27.976, -82.503, False),
    "TEN": (36.166, -86.771, False), "WAS": (38.908, -76.864, False),
}
# Partidos internacionales: palabra del nombre del estadio en games.csv -> (lat, lon, techo)
INTERNACIONAL = {
    "wembley": (51.556, -0.280, False), "tottenham": (51.604, -0.066, False),
    "allianz": (48.219, 11.625, False), "olympiastadion": (52.515, 13.239, False),
    "bernab": (40.453, -3.688, True), "azteca": (19.303, -99.150, False), "banorte": (19.303, -99.150, False),
    "corinthians": (-23.545, -46.474, False), "neo qu": (-23.545, -46.474, False),
    "croke": (53.361, -6.251, False), "stade de france": (48.924, 2.360, False),
    "melbourne": (-37.820, 144.983, False), "maracan": (-22.912, -43.230, False),
}


def _num(x, d=0.0):
    try:
        x = float(x)
        return d if np.isnan(x) else x
    except (TypeError, ValueError):
        return d


def _lugar(g):
    est = str(g.get("stadium") or "").lower()
    for k, v in INTERNACIONAL.items():
        if k in est:
            lat, lon, techo = v
            break
    else:
        lat, lon, techo = ESTADIO.get(g["home_team"], (None, None, True))
    roof = str(g.get("roof") or "").lower()
    if roof in ("dome", "closed"):
        techo = True
    elif roof == "outdoors":
        techo = False
    elif roof == "open":
        techo = True  # techo retráctil: si llueve o hace frío lo cierran
    return lat, lon, techo


def _pronostico(lat, lon, inicio):
    """Promedio del partido (inicio a +3 h): viento mph, lluvia y nieve in/h, temperatura °F."""
    ini = pd.Timestamp(inicio).tz_convert("UTC")
    fin = ini + timedelta(hours=3)
    r = requests.get(URL_METEO.format(lat=lat, lon=lon, d=ini.date(), d2=fin.date()), timeout=30)
    r.raise_for_status()
    h = r.json().get("hourly") or {}
    t = pd.to_datetime(h.get("time", []), utc=True)
    if not len(t):
        return None
    m = (t >= ini.floor("h")) & (t <= fin)
    if not m.any():
        return None
    s = lambda k: float(np.nanmean(np.array(h.get(k, []), dtype=float)[m]))
    return dict(viento=s("wind_speed_10m"), lluvia=s("precipitation"), nieve=s("snowfall"),
                temp=s("temperature_2m"))


def _ajuste_clima(w):
    aj, motivo = {g: 0.0 for g in VIENTO}, []
    v = w["viento"]
    if v > VIENTO_BASE:
        for g in VIENTO:
            lim = VIENTO_TOPE[g]
            aj[g] += max(lim, VIENTO[g] * (v - VIENTO_BASE)) if lim < 0 else min(lim, VIENTO[g] * (v - VIENTO_BASE))
        motivo.append(f"viento {v:.0f} mph")
    if w["nieve"] >= NIEVE_FUERTE:
        for g, x in NIEVE.items():
            aj[g] += x
        motivo.append(f"nieve {w['nieve']:.1f} in/h")
    elif w["lluvia"] >= LLUVIA_MEDIA:
        f = 1 if w["lluvia"] >= LLUVIA_FUERTE else 0.5
        for g, x in LLUVIA.items():
            aj[g] += x * f
        motivo.append(("lluvia fuerte" if f == 1 else "lluvia") + f" {w['lluvia']:.2f} in/h")
    if w["temp"] <= FRIO:
        for g, x in FRIO_AJ.items():
            aj[g] += x
        motivo.append(f"{w['temp']:.0f} °F")
    return aj, ", ".join(motivo)


def _qb_fuera(slp):
    """{equipo NFL: nombre del QB titular que no juega} según el depth chart de Sleeper."""
    tit = {}
    for p in slp.values():
        if p.get("position") == "QB" and p.get("team") and p.get("depth_chart_order") == 1:
            tit[p["team"]] = p
    return {tm: p.get("full_name") or tm for tm, p in tit.items()
            if str(p.get("injury_status") or "").lower().startswith(QB_MALO)}


def aplicar(df, proy, games, cal, semana, slp):
    """Devuelve (proy ajustado, tabla App_Ajustes)."""
    cab = [["Equipo", "Pos", "Nota", "Ajuste"]]
    try:
        g = games[(games["season"] == games["season"].max()) & (games["game_type"] == "REG")
                  & (games["week"] == semana)]
        ini = cal[cal["week"] == semana].drop_duplicates("nfl").set_index("nfl")
        fuera = _qb_fuera(slp or {})
        fac = {}      # (equipo, grupo) -> ajuste total
        nota = {}     # (equipo, grupo) -> texto
        n_clima = 0
        for _, r in g.iterrows():
            casa, vis = r["home_team"], r["away_team"]
            con_vegas = pd.notna(r.get("total_line"))
            lat, lon, techo = _lugar(r)
            if not techo and lat is not None and casa in ini.index:
                try:
                    w = _pronostico(lat, lon, ini.at[casa, "inicio"])
                except Exception as ex:
                    w = None
                    print(f"Clima: sin pronóstico para {vis} @ {casa} ({ex})")
                if w:
                    aj, mot = _ajuste_clima(w)
                    if mot:
                        n_clima += 1
                        k = CON_VEGAS if con_vegas else 1.0
                        for tm, riv in ((casa, vis), (vis, casa)):
                            for gr, x in aj.items():
                                if x:
                                    fac[(tm, gr)] = fac.get((tm, gr), 0) + x * k
                                    nota[(tm, gr)] = f"vs {riv} · {mot}"
            # QB rival fuera -> sube el DST que lo enfrenta
            for tm, riv in ((casa, vis), (vis, casa)):
                if riv in fuera:
                    x = QB_FUERA_DST_VEGAS if con_vegas else QB_FUERA_DST
                    fac[(tm, "DST")] = fac.get((tm, "DST"), 0) + x
                    t = f"QB rival fuera: {fuera[riv]} ({riv})"
                    nota[(tm, "DST")] = (nota[(tm, "DST")] + " · " + t) if (tm, "DST") in nota else f"vs {riv} · {t}"

        if not fac:
            print(f"Clima: semana {semana} sin ajustes (sin viento, lluvia, frío ni QB titulares fuera)")
            return proy, cab + [[f"Semana {semana}", "", "Sin viento, lluvia, nieve, frío ni QB titulares fuera "
                                                     "que muevan las proyecciones", 0]]

        lo, hi = TOPE_TOTAL
        f = pd.Series([1 + min(hi, max(lo, fac.get((tm, GRUPO.get(p, "")), 0)))
                       for tm, p in zip(df["nfl"], df["pos"])], index=df.index)
        proy = proy.copy()
        proy[semana] = (proy[semana] * f.reindex(proy.index).fillna(1)).round(2)

        orden = dict(K=0, DST=1, PASE=2, RB=3)
        filas = sorted(((tm, gr, x) for (tm, gr), x in fac.items() if abs(x) >= MIN_MOSTRAR),
                       key=lambda z: (orden[z[1]], -abs(z[2])))
        tabla = [[f"{tm} · {NOMBRE_GRUPO[gr]}", NOMBRE_GRUPO[gr], nota[(tm, gr)], round(min(hi, max(lo, x)), 3)] for tm, gr, x in filas]
        n_mov = int((f != 1).sum())
        print(f"Clima semana {semana}: {n_clima} partidos con clima, {len(fuera)} QB titulares fuera, "
              f"{n_mov} proyecciones ajustadas")
        return proy, cab + (tabla or [[f"Semana {semana}", "", "Ajustes menores a 1 %", 0]])
    except Exception as ex:
        print(f"Clima: no pude ajustar ({ex}); proyecciones sin cambios")
        return proy, cab
