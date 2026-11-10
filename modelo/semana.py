"""
Partido de la semana para cada equipo de cada liga (Inicio, Alineación y Rival de la app).

Corre después de modelo.py (lee data/modelo_<liga>.json) y agrega 3 tablas al mismo archivo:
- App_SemResumen: Equipo, clave, valor (equipo, rival, récords, puntos proyectados con la alineación
  puesta en Sleeper y con la óptima, prob. de ganar, puntos que se ganan cambiando la alineación,
  mensajes de alineación, bajas y enfoque).
- App_SemAlin: Equipo, Slot, Jugador, Rival, Proy (alineación óptima con las proyecciones del modelo).
- App_SemRival: Equipo, Jugador, Pos, Rival NFL, Proy (titulares del rival que más proyectan).
La app usa las filas del equipo del usuario. Si algo falla, el archivo queda como estaba.
"""
import json, os, re, sys
from datetime import datetime, timezone
from math import erf, sqrt
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelo as m  # noqa: E402

SD_DIF = 35.0  # desviación de la diferencia de puntos entre 2 equipos (calibrada con el Excel)
URL_LIGA = "https://api.sleeper.app/v1/league/{lg}"
URL_MATCH = "https://api.sleeper.app/v1/league/{lg}/matchups/{w}"
FLEX = {"FLEX": {"RB", "WR", "TE"}, "WRRB_FLEX": {"RB", "WR"}, "REC_FLEX": {"WR", "TE"},
        "SUPER_FLEX": {"QB", "RB", "WR", "TE"}, "IDP_FLEX": set()}
NO_TITULAR = {"BN", "IR", "TAXI"}
EQ_NFL = {"LAR": "LA", "JAC": "JAX", "WSH": "WAS"}  # abreviaturas de Sleeper/ESPN -> nflverse


def prob_normal(z):
    return 0.5 * (1 + erf(z / sqrt(2)))


def json_url(nombre, url):
    if m.LOCAL:
        ruta = os.path.join(m.LOCAL, nombre + ".json")
        return json.load(open(ruta, encoding="utf-8")) if os.path.exists(ruta) else None
    try:
        r = requests.get(url, timeout=60, headers={"User-Agent": "fantasy-modelo"})
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"AVISO: no pude bajar {url}: {e}")
        return None


def ids_sleeper():
    slp = m.bajar("sl_players", "json") or {}
    sl_a = {sid: p["gsis_id"].strip() for sid, p in slp.items() if p.get("gsis_id")}
    ids = m.bajar("ids")
    if ids is not None and "sleeper_id" in ids and "gsis_id" in ids:
        for g, s in zip(ids["gsis_id"], ids["sleeper_id"]):
            if isinstance(g, str) and s == s and s is not None:
                sl_a.setdefault(str(int(s)) if isinstance(s, float) else str(s), g)
    return sl_a


def tabla_obj(t):
    if not t or len(t) < 2:
        return []
    h = t[0]
    return [dict(zip(h, r)) for r in t[1:]]


def clave(sid, sl_a):
    sid = str(sid)
    if sid.isalpha():
        return ("LA" if sid == "LAR" else sid) + " DST"
    return sl_a.get(sid, sid)


def optima(jug, slots, puestos=None):
    """jug: lista de dicts con pos y proy. Los jugadores cuyo partido ya empezó ("lock") no se pueden
    mover: si son titulares en Sleeper se quedan en su puesto y si están en la banca no pueden entrar.
    Con el resto se llenan primero los puestos fijos y después los flex."""
    out = [None] * len(slots)
    usados = set()
    for i, j in enumerate((puestos or [])[:len(slots)]):
        if j and j.get("lock"):
            out[i] = j
            usados.add(j["k"])
    libres = sorted([j for j in jug if j["proy"] > 0 and not j.get("lock") and j["k"] not in usados],
                    key=lambda j: -j["proy"])
    orden = sorted([i for i in range(len(slots)) if out[i] is None],
                   key=lambda i: (slots[i] in FLEX, len(FLEX.get(slots[i], ()))))
    for i in orden:
        s = slots[i]
        ok = FLEX.get(s, {s})
        for j in libres:
            if j["pos"] in ok:
                out[i] = j
                libres.remove(j)
                break
    return out


def inicios(w):
    """{equipo NFL: hora de inicio (UTC)} de la semana w, desde el calendario de nflverse."""
    try:
        cal = m.calendario(m.bajar("games"), m.TEMPORADA)
        cal = cal[cal["week"] == w]
        return {r["nfl"]: r["inicio"].astimezone(timezone.utc) for _, r in cal.iterrows()}
    except Exception as e:
        print(f"Semana: sin calendario ({e}); no bloqueo jugadores que ya jugaron")
        return {}


def total(lista):
    return round(sum(j["proy"] for j in lista if j), 2)


def main():
    try:
        sl_a = ids_sleeper()
    except Exception as e:
        print(f"Semana: no pude leer los IDs de Sleeper ({e})")
        return
    ahora = datetime.now(timezone.utc)
    ini_sem = {}
    for liga, lg in m.LIGAS.items():
        nombre = re.sub(r"[^a-z0-9]+", "_", m.norm(liga))
        ruta = os.path.join(m.RAIZ, "data", f"modelo_{nombre}.json")
        try:
            out = json.load(open(ruta, encoding="utf-8"))
            w = int(out["semana"])
            info = json_url(f"sl_league_{lg}", URL_LIGA.format(lg=lg)) or {}
            slots = [("DST" if s == "DEF" else s) for s in info.get("roster_positions", []) if s not in NO_TITULAR]
            rosters = m.bajar("sl_rosters", "json", lg=lg) or []
            users = {u["user_id"]: (u.get("metadata", {}) or {}).get("team_name") or u.get("display_name")
                     for u in (m.bajar("sl_users", "json", lg=lg) or [])}
            match = json_url(f"sl_matchups_{lg}_{w}", URL_MATCH.format(lg=lg, w=w)) or []
            if not slots or not rosters or not match:
                print(f"Semana {liga}: faltan datos de Sleeper; no cambio nada")
                continue
            ps = {r["Clave"]: r for r in tabla_obj(out.get("App_ProySem"))}
            rk = {r["Jugador"]: r for r in tabla_obj(out.get("App_RankSemana"))}
            nov = {r["Jugador"]: r for r in tabla_obj(out.get("App_Novedades"))}
            col = f"S{w}"
            if w not in ini_sem:
                ini_sem[w] = inicios(w)
            ini = ini_sem[w]
            pts = {}
            for mt in match:
                pts.update(mt.get("players_points") or {})

            def jugador(sid):
                k = clave(sid, sl_a)
                r = ps.get(k)
                nfl = k[:-4] if str(k).endswith(" DST") else (r or {}).get("NFL", "")
                nfl = EQ_NFL.get(str(nfl), str(nfl))
                hora = ini.get(nfl)
                lock = bool(hora and hora <= ahora)  # su partido ya empezó: Sleeper no deja moverlo
                real = pts.get(str(sid))
                if not r:
                    return {"k": k, "nombre": str(sid), "pos": "", "proy": float(real or 0), "rival": "",
                            "prob": 1, "lock": lock}
                x = rk.get(r["Jugador"], {})
                pr = r.get(col)
                pr = float(pr) if isinstance(pr, (int, float)) else 0.0
                if lock and isinstance(real, (int, float)):
                    pr = max(pr, float(real))  # ya jugó o está jugando: cuenta al menos lo que lleva
                return {"k": k, "nombre": r["Jugador"], "pos": r["Pos"], "proy": pr,
                        "rival": x.get("Rival", ""), "prob": x.get("Prob", 1), "lock": lock}

            eq = {}
            for r in rosters:
                rid = r["roster_id"]
                st = r.get("settings") or {}
                fuera = set(r.get("reserve") or []) | set(r.get("taxi") or [])
                plant = [jugador(s) for s in (r.get("players") or []) if s not in fuera]
                eq[rid] = {"nombre": users.get(r.get("owner_id"), f"Equipo {rid}"), "plant": plant,
                           "record": f"{st.get('wins', 0)}-{st.get('losses', 0)}" + (f"-{st['ties']}" if st.get("ties") else "")}
            for mt in match:
                e = eq.get(mt.get("roster_id"))
                if e is not None:
                    e["mid"] = mt.get("matchup_id")
                    e["puestos"] = [jugador(s) if s and s != "0" else None for s in (mt.get("starters") or [])]
            for e in eq.values():
                e["opt"] = optima(e["plant"], slots, e.get("puestos"))
                e["p_opt"], e["p_sl"] = total(e["opt"]), total(e.get("puestos") or [])

            res, alin, riv = [], [], []
            for rid, e in eq.items():
                rv = [x for x in eq.values() if x is not e and x.get("mid") is not None and x.get("mid") == e.get("mid")]
                rv = rv[0] if rv else None
                gana = round(e["p_opt"] - e["p_sl"], 2)
                prob = prob_normal((e["p_opt"] - rv["p_opt"]) / SD_DIF) if rv else None
                ya = {j["k"] for j in (e.get("puestos") or []) if j}
                op = {j["k"] for j in e["opt"] if j}
                entra = [j["nombre"] for j in e["opt"] if j and j["k"] not in ya]
                sale = [j["nombre"] for j in (e.get("puestos") or []) if j and j["k"] not in op]
                n_lock = sum(1 for j in (e.get("puestos") or []) if j and j.get("lock"))
                nota = ((" (1 titular ya jugó y no se puede mover.)" if n_lock == 1 else
                         f" ({n_lock} titulares ya jugaron y no se pueden mover.)") if n_lock else "")
                if gana > 0.5 and entra:
                    msg_al = (f"Cambia tu alineación en Sleeper: ganas {gana:.1f} pts proyectados. Entra: "
                              + ", ".join(entra) + (". Sale: " + ", ".join(sale) if sale else "") + "." + nota)
                elif n_lock and n_lock >= len([j for j in (e.get("puestos") or []) if j]):
                    msg_al = "Todos tus titulares ya jugaron; no hay cambios posibles."
                else:
                    msg_al = "Tu alineación en Sleeper ya es la óptima." + nota
                bajas = []
                for j in (e.get("puestos") or []):
                    if not j:
                        bajas.append("Puesto vacío en tu alineación")
                        continue
                    if j.get("lock"):
                        continue  # ya jugó: no es una baja
                    nv = nov.get(j["nombre"], {})
                    if str(j["rival"]).upper() == "BYE":
                        bajas.append(f"{j['nombre']} (bye)")
                    elif isinstance(j["prob"], (int, float)) and j["prob"] < 1:
                        est = nv.get("Estado") or f"{round(j['prob'] * 100)}% de jugar"
                        les = nv.get("Lesión")
                        bajas.append(f"{j['nombre']} ({est}{' · ' + les if les else ''})")
                if prob is None:
                    enf = ""
                elif prob >= 0.65:
                    enf = f"Eres favorito ({prob:.0%}): prioriza jugadores seguros."
                elif prob >= 0.45:
                    enf = f"Partido parejo ({prob:.0%}): cada punto cuenta, revisa los titulares dudosos."
                else:
                    enf = f"Vas abajo ({prob:.0%}): conviene arriesgar con jugadores de techo alto."
                mi_k = next((j["nombre"] for j in e["opt"] if j and j["pos"] == "K"), "—")
                mi_d = next((j["nombre"] for j in e["opt"] if j and j["pos"] == "DST"), "—")
                vals = dict(semana=w, equipo=e["nombre"], rival=rv["nombre"] if rv else "—",
                            record_yo=e["record"], record_rival=rv["record"] if rv else "",
                            proy_yo_optima=e["p_opt"], proy_yo_sleeper=e["p_sl"],
                            proy_rival_optima=rv["p_opt"] if rv else 0, proy_rival_sleeper=rv["p_sl"] if rv else 0,
                            prob_ganar=round(prob, 4) if prob is not None else "", ganancia_alineacion=gana,
                            msg_alineacion=msg_al, msg_bajas=" · ".join(bajas) or "Sin bajas entre tus titulares",
                            msg_prioridad=enf, slots=",".join(slots), liga_id=lg, mi_k=mi_k, mi_dst=mi_d,
                            fuente_partido=f"Modelo + Sleeper ({out.get('generado', '')[:16].replace('T', ' ')} UTC)")
                res += [[e["nombre"], k, v] for k, v in vals.items()]
                alin += [[e["nombre"], s, j["nombre"] if j else "—",
                          ((str(j["rival"]) + " 🔒").strip() if j.get("lock") else j["rival"]) if j else "", j["proy"] if j else 0]
                         for s, j in zip(slots, e["opt"])]
                if rv:
                    top = sorted([j for j in (rv.get("puestos") or []) if j], key=lambda j: -j["proy"])[:6]
                    riv += [[e["nombre"], j["nombre"], j["pos"], j["rival"], j["proy"]] for j in top]
            out["App_SemResumen"] = [["Equipo", "clave", "valor"]] + res
            out["App_SemAlin"] = [["Equipo", "Slot", "Jugador", "Rival", "Proy"]] + alin
            out["App_SemRival"] = [["Equipo", "Jugador", "Pos", "Rival NFL", "Proy"]] + riv
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, separators=(",", ":"), default=str)
            con = sum(1 for e in eq.values() if e.get("mid") is not None)
            print(f"Semana {liga}: {len(eq)} equipos, {con} con partido en la semana {w}")
        except Exception as ex:
            print(f"Semana {liga}: no pude armar el partido ({ex}); la app usa lo anterior")


if __name__ == "__main__":
    main()
