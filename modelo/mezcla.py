"""
Mezcla de proyecciones: modelo propio + Sleeper.

precision.py mide con resultados reales qué peso de Sleeper da menos error en cada posición y lo
guarda en data/mezcla.json. Este archivo aplica ese peso a la proyección de todas las semanas que
faltan (por eso también se mueven el ROS, los rankings y el valor de trade).
- Antes de mezclar, guarda la proyección pura del modelo en historial/puro_<año>_sNN.csv (solo
  mientras la semana no empezó), para que precision.py no mida la mezcla contra sí misma.
- Las proyecciones de Sleeper se pasan al puntaje de la liga (TD de pase = 6, intercepción = -2).
- Si no hay mezcla.json o Sleeper no responde, queda la proyección del modelo sin cambios.
"""
import json, os
import pandas as pd
import requests

SL_PROY = ("https://api.sleeper.app/projections/nfl/{y}/{w}?season_type=regular"
           "&position[]=QB&position[]=RB&position[]=WR&position[]=TE")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL = os.environ.get("MODELO_LOCAL")


def pts_liga(st, pts):
    g = lambda k: float(st.get(k) or 0)
    v = (g("pass_yd") * pts["pass_yd"] + g("pass_td") * pts["pass_td"] + g("pass_int") * pts["inter"]
         + (g("pass_2pt") + g("rush_2pt") + g("rec_2pt")) * pts["dos"]
         + g("rush_yd") * pts["rush_yd"] + g("rush_td") * pts["rush_td"]
         + g("rec") * pts["rec"] + g("rec_yd") * pts["rec_yd"] + g("rec_td") * pts["rec_td"]
         + g("fum_lost") * pts["fum"])
    if v == 0 and isinstance(st.get("pts_half_ppr"), (int, float)):
        v = float(st["pts_half_ppr"])
    return round(v, 2)


def bajar_sleeper(y, w, sl_a_gsis, pts):
    data = None
    if LOCAL:
        ruta = os.path.join(LOCAL, f"sleeper_proy_{w}.json")
        data = json.load(open(ruta)) if os.path.exists(ruta) else None
    else:
        try:
            r = requests.get(SL_PROY.format(y=y, w=w), timeout=60, headers={"User-Agent": "fantasy-modelo"})
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            print(f"AVISO: no pude bajar proyecciones de Sleeper semana {w} ({e})")
            return pd.Series(dtype=float)
    out = {}
    for x in data or []:
        gid = sl_a_gsis.get(str(x.get("player_id")))
        st = x.get("stats") or {}
        if gid and st:
            out[gid] = pts_liga(st, pts)
    return pd.Series(out, dtype=float)


def aplicar(df, proy, semana, cal, ahora, sl_a_gsis, pts, temporada):
    carpeta = os.path.join(RAIZ, "historial")
    os.makedirs(carpeta, exist_ok=True)
    inicio = cal[cal["week"] == semana]["inicio"].min()
    if pd.isna(inicio) or ahora < inicio:  # la semana no empezó: se guarda (y se congela al empezar)
        pd.DataFrame({"Semana": semana, "Clave": df.index, "Jugador": df["nombre"], "Pos": df["pos"],
                      "NFL": df["nfl"], "Proy": proy[semana]}).to_csv(
            os.path.join(carpeta, f"puro_{temporada}_s{semana:02d}.csv"), index=False)
    archivo = os.path.join(RAIZ, "data", "mezcla.json")
    if not os.path.exists(archivo):
        print("Mezcla: todavía no hay pesos (los calcula precision.py); uso solo el modelo")
        return proy
    pesos = json.load(open(archivo, encoding="utf-8")).get("peso_sleeper") or {}
    if not pesos:
        return proy
    proy = proy.copy()
    ws = df["pos"].map(pesos).astype(float).reindex(proy.index)
    n = 0
    for w in proy.columns:
        s = bajar_sleeper(temporada, int(w), sl_a_gsis, pts).reindex(proy.index)
        ok = ws.notna() & s.notna() & (s > 0) & (proy[w] > 0)
        proy.loc[ok, w] = ((1 - ws[ok]) * proy.loc[ok, w] + ws[ok] * s[ok]).round(2)
        n += int(ok.sum())
    print(f"Mezcla modelo + Sleeper (peso de Sleeper: {pesos}): {n} proyecciones mezcladas")
    return proy
