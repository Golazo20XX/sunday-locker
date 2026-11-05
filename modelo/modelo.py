"""
Modelo propio de proyecciones fantasy (sin FantasyPros).
Fuentes automáticas: nflverse (estadísticas, jugada a jugada, calendario y líneas de Vegas),
Sleeper (estado de lesión, rosters de las ligas, semana actual) y ESPN (fecha estimada de regreso).
Salida: data/modelo_<liga>.json para la app + historial/ con las proyecciones guardadas cada semana.
"""
import io, json, os, re, sys, unicodedata
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
import numpy as np
import pandas as pd
import requests

# ---------------------------------------------------------------- CONFIGURACIÓN
TEMPORADA = 2026
ULT_SEM, PLAYOFF = 17, 15
LIGAS = {"Football Ecuatoriano": "1387905805835051008",
         "Football Is Life": "1387310811537506304"}

PTS = dict(pass_yd=0.04, pass_td=6, inter=-2, dos=2, rush_yd=0.1, rush_td=6,
           rec=0.5, rec_yd=0.1, rec_td=6, fum=-2,
           fg_corto=3, fg_40=4, fg_50=5, pat=1, fg_falla=-1, pat_falla=-1,
           sack=1, d_int=2, d_fr=2, d_td=6, safety=2)
PA_TABLA = [(0, 10), (1, 8), (7, 5), (14, 2), (21, 0), (28, -1), (35, -4)]

P = dict(
    K26=2.0,          # juegos de 'confianza' 2026 (más bajo = reacciona más rápido)
    K26_CAMBIO=0.7,   # ... cuando el rol cambió mucho
    CAMBIO_MIN=1.4, CAMBIO_MAX=2.0,
    USO=0.35,         # peso de los pts esperados por uso vs pts reales
    MIN_G25=3,
    FORMA=0.30,       # peso de la forma reciente (últimos FORMA_N partidos)
    FORMA_N=4,
    NOVATO_PRIOR_G=2, # juegos ficticios hacia el nivel de reemplazo si hay poca muestra
    DVP=0.5, DVP_REG=6,
    VEGAS=0.6,
    VOL_ABS=0.7, VOL_CAP=dict(WR=0.6, TE=0.4, RB=1.0), FADE_LO=4, FADE_HI=12,
    QB_FAC=dict(WR=0.92, TE=0.85, RB=0.86), QB_MIN_PASES=50,
    ENC=0.35, CAL_DST=0.8, CAL_K=0.92,
    TOP_CAL=dict(QB=12, RB=30, WR=42, TE=12),
    REEMPLAZO=dict(QB=13, RB=28, WR=43, TE=13, K=13, DST=13),  # nivel titular de la liga
)
POS = ["QB", "RB", "WR", "TE", "K", "DST"]

NV = "https://github.com/nflverse/nflverse-data/releases/download"
URL = dict(
    stats=NV + "/stats_player/stats_player_week_{y}.csv",
    pbp=NV + "/pbp/play_by_play_{y}.parquet",
    games="https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv",
    ids="https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv",
    sl_state="https://api.sleeper.app/v1/state/nfl",
    sl_players="https://api.sleeper.app/v1/players/nfl",
    sl_rosters="https://api.sleeper.app/v1/league/{lg}/rosters",
    sl_users="https://api.sleeper.app/v1/league/{lg}/users",
    espn_inj="https://site.api.espn.com/apis/site/v2/sports/football/nfl/injuries",
)
PBP_COLS = ["season_type", "week", "play_type", "rusher_player_id", "receiver_player_id", "yardline_100",
            "rushing_yards", "receiving_yards", "rush_touchdown", "pass_touchdown", "complete_pass",
            "fumble_lost", "two_point_attempt"]
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL = os.environ.get("MODELO_LOCAL")  # carpeta con archivos de prueba (sin internet)


# ---------------------------------------------------------------- UTILIDADES
def norm(n):
    n = unicodedata.normalize("NFKD", str(n)).encode("ascii", "ignore").decode().lower()
    n = re.sub(r"[.'’]", "", n)
    n = re.sub(r"\b(jr|sr|ii|iii|iv|v)\b", "", n)
    return re.sub(r"\s+", " ", n).strip()


def bajar(clave, fmt="csv", **kw):
    url = URL[clave].format(**kw)
    if LOCAL:
        nombre = clave + ("_" + "_".join(str(v) for v in kw.values()) if kw else "")
        ruta = os.path.join(LOCAL, nombre + "." + fmt)
        if not os.path.exists(ruta):
            return None
        if fmt == "json":
            return json.load(open(ruta, encoding="utf-8"))
        return pd.read_parquet(ruta, columns=PBP_COLS) if fmt == "parquet" else pd.read_csv(ruta, low_memory=False)
    try:
        r = requests.get(url, timeout=120, headers={"User-Agent": "fantasy-modelo"})
        r.raise_for_status()
    except Exception as e:
        print(f"AVISO: no pude bajar {url}: {e}")
        return None
    if fmt == "json":
        return r.json()
    if fmt == "parquet":
        return pd.read_parquet(io.BytesIO(r.content), columns=PBP_COLS)
    return pd.read_csv(io.BytesIO(r.content), low_memory=False)


def col(df, c):
    return df[c].fillna(0) if c in df.columns else 0


# ---------------------------------------------------------------- PUNTOS DE LA LIGA
def pts_jugador(s):
    p = (col(s, "passing_yards") * PTS["pass_yd"] + col(s, "passing_tds") * PTS["pass_td"]
         + col(s, "passing_interceptions") * PTS["inter"]
         + (col(s, "passing_2pt_conversions") + col(s, "rushing_2pt_conversions")
            + col(s, "receiving_2pt_conversions")) * PTS["dos"]
         + col(s, "rushing_yards") * PTS["rush_yd"] + col(s, "rushing_tds") * PTS["rush_td"]
         + col(s, "receptions") * PTS["rec"] + col(s, "receiving_yards") * PTS["rec_yd"]
         + col(s, "receiving_tds") * PTS["rec_td"]
         + (col(s, "sack_fumbles_lost") + col(s, "rushing_fumbles_lost")
            + col(s, "receiving_fumbles_lost")) * PTS["fum"]
         + col(s, "special_teams_tds") * 6)
    k = ((col(s, "fg_made_0_19") + col(s, "fg_made_20_29") + col(s, "fg_made_30_39")) * PTS["fg_corto"]
         + col(s, "fg_made_40_49") * PTS["fg_40"]
         + (col(s, "fg_made_50_59") + col(s, "fg_made_60_")) * PTS["fg_50"]
         + col(s, "pat_made") * PTS["pat"] + col(s, "fg_missed") * PTS["fg_falla"]
         + col(s, "pat_missed") * PTS["pat_falla"])
    return np.where(s["position"].eq("K"), k, p)


def pts_pa(pa):
    out = 0
    for desde, v in PA_TABLA:
        if pa >= desde:
            out = v
    return out


# ---------------------------------------------------------------- CARGA DE DATOS
def cargar_partidos(stats, pbp, games, y):
    """Una fila por jugador-partido (incluye una fila por DST) con puntos y uso."""
    s = stats[(stats["season_type"] == "REG")].copy()
    s["pts"] = pts_jugador(s)
    s = s.rename(columns={"player_id": "id", "player_display_name": "nombre",
                          "position": "pos", "team": "nfl", "opponent_team": "rival"})
    s["carr"] = col(s, "carries")
    s["tgt"] = col(s, "targets")
    s["pases"] = col(s, "attempts")
    s["rz_c"] = 0.0
    s["rz_t"] = 0.0
    if pbp is not None and len(pbp):
        b = pbp[(pbp["season_type"] == "REG") & (pbp["yardline_100"] <= 20)]
        rc = b.groupby(["rusher_player_id", "week"]).size().rename("rz_c")
        rt = b[b["play_type"] == "pass"].groupby(["receiver_player_id", "week"]).size().rename("rz_t")
        s = s.drop(columns=["rz_c", "rz_t"])
        s = s.merge(rc, left_on=["id", "week"], right_index=True, how="left")
        s = s.merge(rt, left_on=["id", "week"], right_index=True, how="left")
        s[["rz_c", "rz_t"]] = s[["rz_c", "rz_t"]].fillna(0)
    s = s[s["pos"].isin(["QB", "RB", "WR", "TE", "K"])]
    jug = s[["id", "nombre", "pos", "nfl", "rival", "week", "pts", "carr", "tgt", "rz_c", "rz_t", "pases"]]

    # DST: estadísticas defensivas sumadas por equipo + puntos permitidos del calendario
    d = stats[stats["season_type"] == "REG"].groupby(["team", "week"]).agg(
        sacks=("def_sacks", "sum"), ints=("def_interceptions", "sum"),
        fr=("fumble_recovery_opp", "sum"), tds=("def_tds", "sum"),
        st=("special_teams_tds", "sum"), sf=("def_safeties", "sum")).reset_index()
    g = games[(games["season"] == y) & (games["game_type"] == "REG") & games["home_score"].notna()]
    pa = pd.concat([
        g[["home_team", "week", "away_score", "away_team"]].set_axis(["team", "week", "pa", "rival"], axis=1),
        g[["away_team", "week", "home_score", "home_team"]].set_axis(["team", "week", "pa", "rival"], axis=1)])
    d = pa.merge(d, on=["team", "week"], how="left").fillna(0)
    d["pts"] = (d["sacks"] * PTS["sack"] + d["ints"] * PTS["d_int"] + d["fr"] * PTS["d_fr"]
                + (d["tds"] + d["st"]) * PTS["d_td"] + d["sf"] * PTS["safety"] + d["pa"].map(pts_pa))
    dst = pd.DataFrame({"id": d["team"] + " DST", "nombre": d["team"] + " DST", "pos": "DST",
                        "nfl": d["team"], "rival": d["rival"], "week": d["week"], "pts": d["pts"]})
    for c in ["carr", "tgt", "rz_c", "rz_t", "pases"]:
        dst[c] = 0.0
    return pd.concat([jug, dst], ignore_index=True)


def tasas_uso(pbp, pos_de):
    """Pts de la liga por carrera / target (fuera y dentro de zona roja), por posición."""
    res = {}
    if pbp is None or not len(pbp):
        return {p: dict(c=0.6, cz=1.3, t=1.4, tz=2.2) for p in ["RB", "WR", "TE"]}
    b = pbp[(pbp["season_type"] == "REG") & (pbp.get("two_point_attempt", 0) != 1)].copy()
    rz = b["yardline_100"] <= 20
    ru = b[b["play_type"] == "run"].copy()
    ru["p"] = ru["rushing_yards"].fillna(0) * PTS["rush_yd"] + ru["rush_touchdown"].fillna(0) * PTS["rush_td"] \
        + ru["fumble_lost"].fillna(0) * PTS["fum"]
    ru["pos"] = ru["rusher_player_id"].map(pos_de)
    pa = b[(b["play_type"] == "pass") & b["receiver_player_id"].notna()].copy()
    pa["p"] = pa["complete_pass"].fillna(0) * (PTS["rec"] + pa["receiving_yards"].fillna(0) * PTS["rec_yd"]) \
        + pa["pass_touchdown"].fillna(0) * PTS["rec_td"]
    pa["pos"] = pa["receiver_player_id"].map(pos_de)
    for p in ["RB", "WR", "TE"]:
        r1, r2 = ru[ru["pos"] == p], pa[pa["pos"] == p]
        res[p] = dict(c=r1.loc[~rz[r1.index], "p"].mean(), cz=r1.loc[rz[r1.index], "p"].mean(),
                      t=r2.loc[~rz[r2.index], "p"].mean(), tz=r2.loc[rz[r2.index], "p"].mean())
        res[p] = {k: (0 if pd.isna(v) else float(v)) for k, v in res[p].items()}
    return res


def calendario(games, y):
    g = games[(games["season"] == y) & (games["game_type"] == "REG")].copy()
    tz = ZoneInfo("America/New_York")
    g["inicio"] = [pd.Timestamp(f"{d} {(t if isinstance(t, str) else '13:00')}").tz_localize(tz).to_pydatetime()
                   for d, t in zip(g["gameday"], g["gametime"])]
    filas = []
    for _, r in g.iterrows():
        tot, spr = r.get("total_line"), r.get("spread_line")
        ih = ia = np.nan
        if pd.notna(tot) and pd.notna(spr):
            ih, ia = (tot + spr) / 2, (tot - spr) / 2
        filas.append((r["home_team"], r["week"], r["away_team"], ih, ia, r["inicio"]))
        filas.append((r["away_team"], r["week"], r["home_team"], ia, ih, r["inicio"]))
    return pd.DataFrame(filas, columns=["nfl", "week", "rival", "imp", "imp_rival", "inicio"])


# ---------------------------------------------------------------- LESIONES
def estado_lesiones(sl_players, espn, cal, semana):
    """prob de jugar esta semana y semana de regreso por (nombre normalizado, equipo)."""
    prob = {"Out": 0, "IR": 0, "PUP": 0, "Sus": 0, "NA": 0, "DNR": 0, "Doubtful": 0.15, "Questionable": 0.8}
    regreso_espn = {}
    try:
        for t in (espn or {}).get("injuries", []):
            for i in t.get("injuries", []):
                a = i.get("athlete", {})
                det = i.get("details", {}) or {}
                txt = " ".join(str(i.get(k, "")) for k in ["shortComment", "longComment", "status"]).lower()
                rd = det.get("returnDate")
                if "season" in txt and ("out for" in txt or "season-ending" in txt or "rest of" in txt):
                    regreso_espn[norm(a.get("displayName", ""))] = ULT_SEM + 1
                elif rd:
                    f = datetime.fromisoformat(rd[:10]).replace(tzinfo=timezone.utc)
                    fut = cal[cal["inicio"] >= f]["week"]
                    regreso_espn[norm(a.get("displayName", ""))] = int(fut.min()) if len(fut) else ULT_SEM + 1
    except Exception as e:
        print(f"AVISO: no pude leer las lesiones de ESPN ({e}); uso solo Sleeper")
    out = {}
    for sid, p in (sl_players or {}).items():
        st = p.get("injury_status")
        if not st or not p.get("team"):
            continue
        nm = norm(p.get("full_name") or f"{p.get('first_name', '')} {p.get('last_name', '')}")
        pr = prob.get(st, 1)
        reg = regreso_espn.get(nm)
        if reg is None:
            reg = semana + 4 if st in ("IR", "PUP") else (semana + 1 if pr == 0 else 0)
        out[(nm, p["team"])] = dict(prob=pr, regreso=int(reg) if pr < 0.5 else 0,
                                    estado=f"Sleeper: {st}" + (f" ({p.get('injury_body_part')})" if p.get("injury_body_part") else ""),
                                    lesion=p.get("injury_body_part") or "", nota=p.get("injury_notes") or "")
    # Ajustes manuales opcionales (ajustes.csv en la raíz del repo): Jugador,Equipo,Prob,Regreso,Ajuste,Nota
    ruta = os.path.join(RAIZ, "ajustes.csv")
    if os.path.exists(ruta):
        try:
            aj = pd.read_csv(ruta, sep=None, engine="python", encoding="utf-8-sig", dtype=str).fillna("")
            aj.columns = [str(c).strip().capitalize() for c in aj.columns]

            def num(x):
                x = str(x).strip().replace(",", ".")
                return float(x) if x else None
            for _, r in aj.iterrows():
                nm, eq = norm(r.get("Jugador", "")), str(r.get("Equipo", "")).strip().upper()
                if not nm:
                    continue
                k = (nm, eq) if eq else next((x for x in out if x[0] == nm), (nm, eq))
                base = out.get(k, dict(prob=1, regreso=0, estado="Manual", lesion="", nota=""))
                if num(r.get("Prob", "")) is not None:
                    base["prob"] = num(r["Prob"])
                if num(r.get("Regreso", "")) is not None:
                    base["regreso"] = int(num(r["Regreso"]))
                base["ajuste"] = num(r.get("Ajuste", "")) or 0
                if str(r.get("Nota", "")).strip():
                    base["nota"] = str(r["Nota"]).strip()
                base["estado"] = base["estado"] + " · ajuste manual"
                out[k] = base
                print(f"Ajuste manual: {r.get('Jugador')} {eq} -> prob {base['prob']}, regreso {base['regreso']}")
        except Exception as e:
            print(f"AVISO: no pude leer ajustes.csv ({e})")
    return out


# ---------------------------------------------------------------- MOTOR
def por_jugador(pg, tasas):
    g = pg.groupby("id")
    t = g.agg(nombre=("nombre", "last"), pos=("pos", "last"), nfl=("nfl", "last"),
              G=("week", "nunique"), pts=("pts", "sum"), carr=("carr", "sum"), tgt=("tgt", "sum"),
              rz_c=("rz_c", "sum"), rz_t=("rz_t", "sum"), pases=("pases", "sum"))
    t["ppg"] = t["pts"] / t["G"]

    def xfp(r):
        if r["pos"] not in tasas:
            return np.nan
        a = tasas[r["pos"]]
        rc, rt = min(r["rz_c"], r["carr"]), min(r["rz_t"], r["tgt"])
        return ((r["carr"] - rc) * a["c"] + rc * a["cz"] + (r["tgt"] - rt) * a["t"] + rt * a["tz"]) / r["G"]
    t["xfp"] = t.apply(xfp, axis=1)
    return t


def pts_esperados(t26, t25, pg26, tasas):
    """O = pts por partido esperados (sin rival, sin lesión)."""
    df = t26.join(t25[["G", "ppg", "xfp"]].add_suffix("25"), how="outer")
    for c in ["nombre", "pos", "nfl"]:
        df[c] = df[c].fillna(t25[c].reindex(df.index))
    df["G"] = df["G"].fillna(0)
    df["G25"] = df["G25"].fillna(0)

    def mezcla(ppg, xfp):
        return np.where(pd.isna(xfp), ppg, (1 - P["USO"]) * ppg + P["USO"] * xfp)
    m26 = mezcla(df["ppg"].fillna(0), df["xfp"])
    m25 = mezcla(df["ppg25"].fillna(0), df["xfp25"])
    # Cambio de rol: si el uso 2026 es muy distinto al de 2025, 2026 pesa más rápido
    ratio = (df["xfp"] / df["xfp25"]).where((df["G"] >= 2) & (df["xfp25"] > 0))
    inten = ((np.abs(np.log(ratio)) - np.log(P["CAMBIO_MIN"])) /
             (np.log(P["CAMBIO_MAX"]) - np.log(P["CAMBIO_MIN"]))).clip(0, 1).fillna(0)
    k = P["K26"] - (P["K26"] - P["K26_CAMBIO"]) * inten
    w = np.where(df["G25"] < P["MIN_G25"], 1, df["G"] / (df["G"] + k))
    base = w * m26 + (1 - w) * m25

    # Forma reciente: últimos N partidos de 2026 (más peso a los más recientes)
    pg = pg26.sort_values("week")
    rec = {}
    for pid, gr in pg.groupby("id"):
        gr = gr.tail(P["FORMA_N"])
        wt = np.arange(1, len(gr) + 1, dtype=float)
        pos = gr["pos"].iloc[-1]
        if pos in tasas:
            a = tasas[pos]
            x = (gr["carr"] - gr["rz_c"]).clip(lower=0) * a["c"] + gr["rz_c"] * a["cz"] + \
                (gr["tgt"] - gr["rz_t"]).clip(lower=0) * a["t"] + gr["rz_t"] * a["tz"]
            v = (1 - P["USO"]) * gr["pts"] + P["USO"] * x
        else:
            v = gr["pts"]
        rec[pid] = (float(np.average(v, weights=wt)), float(gr["pts"].mean()), len(gr))
    df["forma"] = [rec.get(i, (np.nan,))[0] for i in df.index]
    df["ppg_rec"] = [rec.get(i, (np.nan, np.nan))[1] for i in df.index]
    o = np.where((df["G"] >= 3) & df["forma"].notna(), (1 - P["FORMA"]) * base + P["FORMA"] * df["forma"], base)
    df["O"] = o
    # Poca muestra y sin historia (novatos): se encoge hacia el nivel de reemplazo de su posición
    for p, n in P["REEMPLAZO"].items():
        m = df["pos"] == p
        if not m.any():
            continue
        rep = df.loc[m & (df["G"] >= 3), "O"].sort_values(ascending=False).iloc[n - 1:n + 2].mean()
        poca = m & (df["G25"] < P["MIN_G25"]) & (df["G"] < 4) & (df["G"] > 0)
        df.loc[poca, "O"] = (df.loc[poca, "G"] * df.loc[poca, "O"] + P["NOVATO_PRIOR_G"] * rep) / \
            (df.loc[poca, "G"] + P["NOVATO_PRIOR_G"])
    return df


def factores_rival(pg26, pg25):
    """Pts que cada defensa permite a cada posición, regresado a la media (DvP)."""
    fac = {}
    for p in POS:
        a = pg26[pg26["pos"] == p].groupby(["rival", "week"])["pts"].sum().groupby("rival").agg(["mean", "count"])
        liga = a["mean"].mean() if len(a) else 0
        if not liga:
            continue
        reg = (a["mean"] * a["count"] + liga * P["DVP_REG"]) / (a["count"] + P["DVP_REG"])
        for tm, v in reg.items():
            fac[(p, tm)] = 1 + P["DVP"] * (v / liga - 1)
    return fac


def proyectar(df, cal, fac_rival, les, semana, ahora):
    semanas = list(range(semana, ULT_SEM + 1))
    imp_avg = cal["imp"].mean() if cal["imp"].notna().any() else 22.5
    calx = cal.set_index(["nfl", "week"])
    df = df.copy()
    df["clave_les"] = list(zip(df["nombre"].map(norm), df["nfl"]))
    df["prob"] = [les.get(k, {}).get("prob", 1) for k in df["clave_les"]]
    df["regreso"] = [les.get(k, {}).get("regreso", 0) for k in df["clave_les"]]
    df["ajuste"] = [les.get(k, {}).get("ajuste", 0) for k in df["clave_les"]]
    df.loc[df["pos"] == "DST", ["prob", "regreso"]] = [1, 0]
    df["O"] = df["O"] * (1 + df["ajuste"])
    tot_opp = np.where(df["pos"] == "RB", df["carr"].fillna(0) + df["tgt"].fillna(0), df["tgt"].fillna(0))
    df["opp_g"] = tot_opp / df["G"].replace(0, np.nan)

    def disponible(r, w):
        if w == semana:
            return r["prob"]
        return 1.0 if (r["regreso"] == 0 or w >= r["regreso"]) else 0.0

    proy = {}
    detalle = {}
    for w in semanas:
        disp = df.apply(lambda r: disponible(r, w), axis=1)
        # Solo juega un QB por equipo: el de más puntos esperados entre los disponibles
        q = (df["pos"] == "QB") & (disp > 0)
        if q.any():
            top = df.loc[q].groupby("nfl")["O"].transform("max")
            disp[top.index[df.loc[q, "O"] < top]] = 0.0
        # Volumen heredado: oportunidades de compañeros de la misma posición que no juegan
        share = df["opp_g"].fillna(0) / df.groupby(["nfl", "pos"])["opp_g"].transform("sum").replace(0, np.nan)
        share = share.fillna(0)
        vac = (share * (1 - disp)).groupby([df["nfl"], df["pos"]]).transform("sum") - share * (1 - disp)
        cap = df["pos"].map(P["VOL_CAP"]).fillna(0)
        fade = ((P["FADE_HI"] - df["O"]) / (P["FADE_HI"] - P["FADE_LO"])).clip(0, 1)
        fade = np.where(df["pos"] == "RB", 1, fade)
        vol = np.minimum(cap, P["VOL_ABS"] * vac / np.maximum(1 - vac, 0.3)) * fade * (share > 0)
        # Cambio de QB titular (solo si no hay línea de Vegas para esa semana)
        qbf = pd.Series(1.0, index=df.index)
        qbs = df[(df["pos"] == "QB") & (df["pases"].fillna(0) >= P["QB_MIN_PASES"])]
        for tm, gq in qbs.groupby("nfl"):
            fuera = disp[gq.index] <= 0.5
            if not fuera.any():
                continue
            sh = gq.loc[fuera, "pases"].sum() / gq["pases"].sum()
            o_fuera = np.average(gq.loc[fuera, "O"], weights=gq.loc[fuera, "pases"])
            disp_qb = df[(df["nfl"] == tm) & (df["pos"] == "QB") & (disp > 0.5)]
            o_hoy = disp_qb["O"].max() if len(disp_qb) else 0
            if o_hoy >= 0.95 * o_fuera:
                continue
            m = (df["nfl"] == tm) & df["pos"].isin(P["QB_FAC"].keys())
            qbf[m] = 1 - (1 - df.loc[m, "pos"].map(P["QB_FAC"])) * sh
        filas = []
        for i, r in df.iterrows():
            k = (r["nfl"], w)
            if k not in calx.index:
                filas.append((0, "BYE", 1, 1))
                continue
            c = calx.loc[k]
            if isinstance(c, pd.DataFrame):
                c = c.iloc[0]
            fr = fac_rival.get((r["pos"], c["rival"]), 1)
            if pd.notna(c["imp"]):
                fv = (1 - P["VEGAS"] * (c["imp_rival"] / imp_avg - 1)) if r["pos"] == "DST" \
                    else (1 + P["VEGAS"] * (c["imp"] / imp_avg - 1))
                fq = 1
            else:
                fv, fq = 1, qbf[i]
            val = r["O"] * (1 + vol[i]) * fr * fv * fq * disp[i]
            filas.append((val, c["rival"], fr, fv))
        raw = pd.Series([f[0] for f in filas], index=df.index)
        # Calibración: se encogen las proyecciones altas (sesgo medido en semanas pasadas)
        cal_v = raw.copy()
        for p, n in P["TOP_CAL"].items():
            m = df["pos"] == p
            prom = raw[m].sort_values(ascending=False).head(n).mean()
            cal_v[m] = raw[m] - P["ENC"] * np.maximum(0, raw[m] - prom)
        cal_v[df["pos"] == "K"] *= P["CAL_K"]
        cal_v[df["pos"] == "DST"] *= P["CAL_DST"]
        proy[w] = cal_v.round(2)
        detalle[w] = pd.DataFrame({"rival": [f[1] for f in filas], "fac": [f[2] for f in filas],
                                   "vegas": [f[3] for f in filas]}, index=df.index)
    return df, pd.DataFrame(proy), detalle


# ---------------------------------------------------------------- SALIDA
def estrellas(x):
    # 5 = calendario más fácil
    return pd.qcut(x.rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)


def tabla(h, df):
    return [h] + json.loads(df.to_json(orient="values", double_precision=2))


def guardar_historial(df, proy, semana, cal, ahora):
    os.makedirs(os.path.join(RAIZ, "historial"), exist_ok=True)
    ruta = os.path.join(RAIZ, "historial", f"proy_{TEMPORADA}_s{semana:02d}.csv")
    inicio = cal[cal["week"] == semana]["inicio"].min()
    if os.path.exists(ruta) and pd.notna(inicio) and ahora >= inicio:
        return  # la semana ya empezó: se congela lo que se proyectó antes del primer partido
    pd.DataFrame({"Semana": semana, "Clave": df.index, "Jugador": df["nombre"], "Pos": df["pos"],
                  "NFL": df["nfl"], "Proy": proy[semana]}).to_csv(ruta, index=False)


def precision(pg26):
    filas = []
    carpeta = os.path.join(RAIZ, "historial")
    if not os.path.isdir(carpeta):
        return pd.DataFrame()
    real = pg26.groupby(["id", "week"])["pts"].sum()
    for f in sorted(os.listdir(carpeta)):
        m = re.match(rf"proy_{TEMPORADA}_s(\d+)\.csv", f)
        if not m:
            continue
        w = int(m.group(1))
        h = pd.read_csv(os.path.join(carpeta, f))
        if w not in pg26["week"].unique():
            continue
        h["Real"] = [real.get((c, w), 0.0) for c in h["Clave"]]
        h = h[h["Proy"] >= 5]  # jugadores relevantes
        for p, g in h.groupby("Pos"):
            filas.append([w, p, len(g), round((g["Real"] - g["Proy"]).abs().mean(), 2),
                          round((g["Real"] - g["Proy"]).mean(), 2),
                          round(g["Proy"].corr(g["Real"]), 3) if len(g) > 2 else ""])
    return pd.DataFrame(filas, columns=["Semana", "Pos", "Jugadores", "Error medio", "Sesgo", "Correlación"])


def main():
    ahora = datetime.now(timezone.utc)
    estado = bajar("sl_state", "json") or {}
    semana = int(os.environ.get("SEMANA") or estado.get("week") or 1)
    semana = max(1, min(semana, ULT_SEM))
    print(f"Temporada {TEMPORADA}, semana {semana}")

    games = bajar("games")
    st26, st25 = bajar("stats", y=TEMPORADA), bajar("stats", y=TEMPORADA - 1)
    pbp26 = bajar("pbp", "parquet", y=TEMPORADA)
    pbp25 = bajar("pbp", "parquet", y=TEMPORADA - 1)
    slp = bajar("sl_players", "json") or {}
    espn = bajar("espn_inj", "json"); [p.update(team="LA") for p in slp.values() if p.get("team") == "LAR"]      
    if games is None or st26 is None or st25 is None:
        sys.exit("Faltan datos esenciales de nflverse: no actualizo para no dejar la app con datos malos.")

    pos_de = dict(zip(st25["player_id"], st25["position"]))
    tasas = tasas_uso(pbp25, pos_de)
    pg26 = cargar_partidos(st26, pbp26, games, TEMPORADA)
    pg25 = cargar_partidos(st25, pbp25, games, TEMPORADA - 1)
    t26, t25 = por_jugador(pg26, tasas), por_jugador(pg25, tasas)
    df = pts_esperados(t26, t25, pg26, tasas)

    # Equipo y posición actuales desde Sleeper (cambios de equipo, novatos sin stats)
    gsis_a_sl, sl_a_gsis = {}, {}
    for sid, p in slp.items():
        if p.get("gsis_id"):
            gsis_a_sl[p["gsis_id"].strip()] = sid
            sl_a_gsis[sid] = p["gsis_id"].strip()
    ids = bajar("ids")
    if ids is not None and "sleeper_id" in ids and "gsis_id" in ids:
        for g_, s_ in zip(ids["gsis_id"], ids["sleeper_id"]):
            if pd.notna(g_) and pd.notna(s_):
                s_ = str(int(s_)) if isinstance(s_, float) else str(s_)
                gsis_a_sl.setdefault(g_, s_)
                sl_a_gsis.setdefault(s_, g_)
    for i in df.index:
        sp = slp.get(gsis_a_sl.get(i, ""), {})
        if sp.get("team"):
            df.at[i, "nfl"] = sp["team"]
        if pd.isna(df.at[i, "nombre"]) and sp:
            df.at[i, "nombre"] = sp.get("full_name")
            df.at[i, "pos"] = sp.get("position")
    for tm in games.loc[games["season"] == TEMPORADA, "home_team"].unique():
        k = f"{tm} DST"
        if k in df.index:
            df.at[k, "nfl"] = tm
    # Solo jugadores activos este año (con equipo) y con algo de valor
    df = df[df["pos"].isin(POS) & df["nfl"].notna() & (df["O"] > 0.5)]
    def activo(i):
        if i.endswith(" DST"):
            return True
        sp = slp.get(gsis_a_sl.get(i, ""))
        return bool(sp.get("team")) if sp else df.at[i, "G"] > 0
    df = df[[activo(i) for i in df.index]]

    cal = calendario(games, TEMPORADA)
    fac = factores_rival(pg26, pg25)
    les = estado_lesiones(slp, espn, cal, semana)
    df, proy, det = proyectar(df, cal, fac, les, semana, ahora)

    # Puntos ROS: semanas restantes (la actual solo si su partido no empezó)
    inicio = cal.set_index(["nfl", "week"])["inicio"]
    pendiente = np.array([inicio.get((t, semana), ahora + timedelta(days=1)) > ahora for t in df["nfl"]])
    fut = [w for w in proy.columns if w > semana]
    df["ros"] = proy[fut].sum(axis=1) + np.where(pendiente, proy[semana], 0)
    df["playoffs"] = proy[[w for w in proy.columns if w >= PLAYOFF]].sum(axis=1)
    df["partidos_rest"] = (proy[fut] > 0).sum(axis=1) + pendiente
    df["rank_ros"] = df.groupby("pos")["ros"].rank(ascending=False, method="min").astype(int)
    df["rank_sem"] = proy[semana].groupby(df["pos"]).rank(ascending=False, method="min").astype(int)
    # Calendario restante (estrellas): factor medio del rival por posición
    fr = pd.concat([det[w]["fac"].where(proy[w] > 0) for w in fut], axis=1).mean(axis=1) if fut else 1
    frp = pd.concat([det[w]["fac"].where(proy[w] > 0) for w in fut if w >= PLAYOFF], axis=1).mean(axis=1) \
        if any(w >= PLAYOFF for w in fut) else fr
    df["cal_ros"] = df.assign(f=pd.Series(fr, index=df.index).fillna(1)).groupby("pos")["f"].transform(estrellas)
    df["cal_po"] = df.assign(f=pd.Series(frp, index=df.index).fillna(1)).groupby("pos")["f"].transform(estrellas)
    # Valor de trade (0-100) contra el nivel de un titular de la liga, no contra waivers
    df["reemplazo"] = 0.0
    for p, n in P["REEMPLAZO"].items():
        m = df["pos"] == p
        df.loc[m, "reemplazo"] = df.loc[m, "ros"].sort_values(ascending=False).iloc[n - 2:n + 1].mean()
    df["vor"] = (df["ros"] - df["reemplazo"]).clip(lower=0)
    df["valor"] = (100 * df["vor"] / df["vor"].max()).round(1)
    df["rank_valor"] = df.groupby("pos")["valor"].rank(ascending=False, method="min").astype(int)
    df["tier"] = (1 + (100 - df["valor"]) // 20).clip(upper=5).astype(int)

    guardar_historial(df, proy, semana, cal, ahora)
    prec = precision(pg26)

    os.makedirs(os.path.join(RAIZ, "data"), exist_ok=True)
    for liga, lg in LIGAS.items():
        rosters = bajar("sl_rosters", "json", lg=lg) or []
        users = {u["user_id"]: (u.get("metadata", {}) or {}).get("team_name") or u.get("display_name")
                 for u in (bajar("sl_users", "json", lg=lg) or [])}
        dueno = {}
        for r in rosters:
            nombre_eq = users.get(r.get("owner_id"), f"Equipo {r.get('roster_id')}")
            for sid in r.get("players") or []:
                dueno[sl_a_gsis.get(sid, f"{'LA' if sid == 'LAR' else sid} DST" if sid.isalpha() else sid)] = nombre_eq
        d = df.copy()
        d["dueno"] = [dueno.get(i, "Libre") for i in d.index]
        d["clave"] = d.index
        d["dif"] = det[semana]["fac"].map(lambda f: "Fácil" if f > 1.05 else ("Difícil" if f < 0.95 else "Media"))
        d["rival_s"] = det[semana]["rival"]
        d["proy"] = proy[semana]
        for j in (1, 2):
            w = semana + j
            d[f"riv{j}"] = det[w]["rival"] if w in det else ""
            d[f"fac{j}"] = det[w]["fac"].round(2) if w in det else ""
        d["proy_forma"] = (d["ppg_rec"] * det[semana]["fac"] * det[semana]["vegas"] * d["prob"]).round(2)
        rs = d.sort_values("proy", ascending=False)
        rr = d.sort_values("ros", ascending=False)
        ros_sem = (d["ros"] / d["partidos_rest"].replace(0, np.nan)).round(2)
        # Proyección por semana: jugadores con dueño + 60 mejores libres
        keep = d[d["dueno"] != "Libre"].index.union(d[d["dueno"] == "Libre"].nlargest(60, "ros").index)
        ps = d.loc[keep].sort_values("ros", ascending=False)
        semcols = {f"S{w}": (proy.loc[ps.index, w] if w in proy.columns else "") for w in range(1, ULT_SEM + 1)}
        nov = d[d["prob"] < 1].sort_values("ros", ascending=False)
        out = {
            "generado": ahora.isoformat(timespec="minutes"), "semana": semana, "liga": liga,
            "fuente": "Modelo propio: nflverse + Sleeper + ESPN (sin FantasyPros)",
            "App_RankSemana": tabla(["Jugador", "Pos", "NFL", "Dueño", "Rival", "Dificultad", "Prob", "Proy",
                                     "Rank pos", "PPG recientes", "Proy forma"],
                                    rs[["nombre", "pos", "nfl", "dueno", "rival_s", "dif", "prob", "proy",
                                        "rank_sem", "ppg_rec", "proy_forma"]].round(2)),
            "App_RankROS": tabla(["Jugador", "Pos", "NFL", "Dueño", "ROS", "ROS por semana", "Playoffs",
                                  "Rank ROS pos", "Rank FP", "Cal ROS", "Cal playoffs", "Señal", "Regreso"],
                                 rr[["nombre", "pos", "nfl", "dueno", "ros"]].assign(
                                     rps=ros_sem, po=rr["playoffs"], rk=rr["rank_ros"], fp="",
                                     c1=rr["cal_ros"], c2=rr["cal_po"], se=0, rg=rr["regreso"]).round(2)),
            "App_ProySem": tabla(["Jugador", "Pos", "NFL", "Dueño", "Clave"] + list(semcols),
                                 pd.concat([ps[["nombre", "pos", "nfl", "dueno", "clave"]],
                                            pd.DataFrame(semcols, index=ps.index)], axis=1).fillna(0)),
            "App_Valor": tabla(["Jugador", "Pos", "NFL", "Dueño", "Valor", "VOR ROS", "Pts ROS", "Reemplazo",
                                "Rank pos valor", "Tier", "Cal ROS", "Cal playoffs",
                                "Rival S+1", "Factor S+1", "Rival S+2", "Factor S+2"],
                               d.sort_values("valor", ascending=False)[
                                   ["nombre", "pos", "nfl", "dueno", "valor", "vor", "ros", "reemplazo",
                                    "rank_valor", "tier", "cal_ros", "cal_po",
                                    "riv1", "fac1", "riv2", "fac2"]].round(2)),
            "App_Novedades": tabla(["Jugador", "Pos", "NFL", "Equipo Fantasy", "Lesión", "Estado", "Prob",
                                    "Regreso", "Nota"],
                                   nov.assign(
                                       les=[les.get(k, {}).get("lesion", "") for k in nov["clave_les"]],
                                       est=[les.get(k, {}).get("estado", "") for k in nov["clave_les"]],
                                       nota=[les.get(k, {}).get("nota", "") for k in nov["clave_les"]])[
                                       ["nombre", "pos", "nfl", "dueno", "les", "est", "prob", "regreso", "nota"]]),
            "App_PrecisionJug": tabla(list(prec.columns), prec) if len(prec) else [],
        }
        nombre = re.sub(r"[^a-z0-9]+", "_", norm(liga))
        with open(os.path.join(RAIZ, "data", f"modelo_{nombre}.json"), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, separators=(",", ":"), default=str)
        print(f"{liga}: {len(d)} jugadores, {len(ps)} en proyección semanal")


if __name__ == "__main__":
    main()
