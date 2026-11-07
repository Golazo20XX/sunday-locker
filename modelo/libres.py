"""
Waivers, streaming, byes y libres a futuro para cada equipo de cada liga (pestañas de Herramientas).

Corre después de semana.py y agrega al archivo data/modelo_<liga>.json:
- App_LibResumen: Equipo, clave, valor (faab_restante, msg_waivers, msg_qb, msg_te, msg_dst, msg_k).
- App_LibStream: streaming de QB, TE, DST y K para esta semana (libres vs tu mejor titular).
- App_LibWaivers: altas sugeridas para el resto de la temporada (a quién tomar y a quién soltar).
- App_LibByes: semanas próximas en que te queda un puesto vacío o flojo, con el mejor libre.
- App_Libres: libres para guardar (resto de temporada y playoffs), igual para todos.
Las mejoras salen de la alineación óptima semana a semana con las proyecciones del modelo.
Las ofertas son una regla simple (parámetros abajo). Si algo falla, el archivo queda como estaba.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelo as m  # noqa: E402
import semana as sm  # noqa: E402

STREAM_POS = ["QB", "TE", "DST", "K"]
STREAM_TOP = 5          # libres que se muestran por posición
STREAM_MIN = 1.0        # pts que tiene que superar a tu titular para recomendarlo
STREAM_PRECIO = 0.3     # $ por punto de mejora en un streaming de 1 semana
WAIV_CAND = 40          # libres que se prueban (los de más ROS)
WAIV_TOP = 8            # altas sugeridas por equipo
WAIV_MIN = 3.0          # mejora mínima de pts ROS para sugerir un alta
WAIV_TOPE = 0.6         # máximo % del FAAB restante en una sola oferta
WAIV_PTS_SEM = 12.0     # mejora por semana que justificaría ese máximo
BYES_SEMANAS = 4        # semanas hacia adelante que se revisan
BYES_MIN = 2.0          # pts de mejora para avisar
LIBRES_TOP = 25
PLAYOFF = 15


def num(x):
    return float(x) if isinstance(x, (int, float)) else 0.0


def lineup(jug, slots, w):
    """Puntos de la alineación óptima de la semana w."""
    js = [{"pos": j["pos"], "proy": num(j["S"].get(w)), "j": j} for j in jug]
    return sm.optima(js, slots)


def pts(op):
    return sum(x["proy"] for x in op if x)


def oferta_stream(mej, rest):
    mx = int(min(rest, max(1, round(mej * STREAM_PRECIO))))
    return max(0, min(mx, max(1, mx - 1))), mx


def oferta_waiver(mej_sem, rest):
    mx = int(min(rest, round(rest * WAIV_TOPE * min(1.0, mej_sem / WAIV_PTS_SEM))))
    mx = max(1, mx) if rest > 0 else 0
    return max(0, min(mx, max(1, round(mx * 0.85)))), mx


# ---------- Radar de noticias automático (reemplaza el radar escrito a mano en el Excel) ----------
RADAR_TOP = 12          # filas del radar
RADAR_HORAS = 48        # ventana de "más agregados" en Sleeper
RADAR_MIN_ROS = 5.0     # pts por semana ROS mínimos del suplente para mostrarlo
URL_TREND = "https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours={h}&limit=60"
URL_PLAYERS = "https://api.sleeper.app/v1/players/nfl"
_RADAR = {}


def _clave(s):
    s = m.norm(str(s or "")) if hasattr(m, "norm") else str(s or "").lower()
    s = re.sub(r"[.'\u2019,-]", "", s)
    s = re.sub(r"\b(jr|sr|ii|iii|iv|v)\b", "", s)
    return re.sub(r"\s+", "", s)


def _malo(n):
    pr = n.get("Prob")
    if isinstance(pr, (int, float)) and pr < 0.5:
        return True
    return bool(re.match(r"(out|ir|pup|sus|doubt|fuera|baja)", str(n.get("Estado") or "").lower()))


def _trending():
    """{clave del nombre: altas en Sleeper en las últimas RADAR_HORAS}, una sola vez por corrida."""
    if "t" not in _RADAR:
        _RADAR["t"] = {}
        try:
            tr = sm.json_url("sl_trending", URL_TREND.format(h=RADAR_HORAS)) or []
            pl = sm.json_url("sl_players_nfl", URL_PLAYERS) or {}
            for x in tr:
                p = pl.get(str(x.get("player_id"))) or {}
                nm = p.get("full_name") or f"{p.get('first_name', '')} {p.get('last_name', '')}".strip()
                if nm:
                    _RADAR["t"][_clave(nm)] = int(x.get("count") or 0)
        except Exception as ex:
            print(f"Radar: no pude leer los más agregados de Sleeper ({ex})")
    return _RADAR["t"]


def radar(ros, nov, valor):
    """Filas de App_Radar: suplentes de titulares lesionados + los más agregados en Sleeper."""
    tr, filas, vistos = _trending(), [], set()
    por_eq = {}
    for r in ros.values():
        if r.get("Pos") in ("QB", "RB", "WR", "TE") and r.get("NFL"):
            por_eq.setdefault((r["NFL"], r["Pos"]), []).append(r)

    def fila(r, fuente, noticia, puntaje):
        j = r["Jugador"]
        if j in vistos:
            return
        vistos.add(j)
        filas.append((puntaje, [j, r.get("Pos", ""), r.get("NFL", ""), r.get("Dueño", "Libre"),
                                round(num((valor.get(j) or {}).get("Valor")), 1), round(num(r.get("ROS")), 1),
                                fuente, noticia]))

    # 1) titulares lesionados → su mejor suplente sano
    for j, n in nov.items():
        t = ros.get(j)
        if not t or not _malo(n) or t.get("Pos") not in ("QB", "RB", "WR", "TE"):
            continue
        grupo = sorted([x for x in por_eq.get((t.get("NFL"), t["Pos"]), [])
                        if x["Jugador"] != j and not _malo(nov.get(x["Jugador"]) or {})],
                       key=lambda x: -num(x.get("ROS")))
        if not grupo or num(grupo[0].get("ROS por semana")) < RADAR_MIN_ROS:
            continue
        s = grupo[0]
        est = n.get("Estado") or "fuera"
        alt = tr.get(_clave(s["Jugador"]), 0)
        fila(s, "Lesiones (modelo)" + (f" + Sleeper ({alt} altas)" if alt else ""),
             f"{t['NFL']}: {j} ({est}). {s['Jugador']} es el siguiente {t['Pos']} del equipo "
             f"({num(s.get('ROS por semana')):.1f} pts por semana ROS).",
             100 + num(s.get("ROS")) + alt / 100)

    # 2) los más agregados en Sleeper que el modelo también ve con valor
    for r in ros.values():
        alt = tr.get(_clave(r["Jugador"]), 0)
        if alt <= 0 or r.get("Pos") not in ("QB", "RB", "WR", "TE", "K", "DST"):
            continue
        fila(r, f"Sleeper: {alt:,} altas en {RADAR_HORAS} h".replace(",", "."),
             f"Uno de los más agregados en Sleeper. El modelo le da {num(r.get('ROS')):.1f} pts ROS "
             f"({num(r.get('ROS por semana')):.1f} por semana).",
             num(r.get("ROS")) + min(alt, 50000) / 1000)

    filas.sort(key=lambda x: -x[0])
    libres = [f for f in filas if f[1][3] == "Libre"]
    otros = [f for f in filas if f[1][3] != "Libre"]
    return [f[1] for f in (libres + otros)[:RADAR_TOP]]


def main():
    for liga, lg in m.LIGAS.items():
        nombre = re.sub(r"[^a-z0-9]+", "_", m.norm(liga))
        ruta = os.path.join(m.RAIZ, "data", f"modelo_{nombre}.json")
        try:
            out = json.load(open(ruta, encoding="utf-8"))
            w = int(out["semana"])
            info = sm.json_url(f"sl_league_{lg}", sm.URL_LIGA.format(lg=lg)) or {}
            slots = [("DST" if s == "DEF" else s) for s in info.get("roster_positions", []) if s not in sm.NO_TITULAR]
            presupuesto = int((info.get("settings") or {}).get("waiver_budget") or 100)
            rosters = m.bajar("sl_rosters", "json", lg=lg) or []
            users = {u["user_id"]: (u.get("metadata", {}) or {}).get("team_name") or u.get("display_name")
                     for u in (m.bajar("sl_users", "json", lg=lg) or [])}
            if not slots or not rosters:
                print(f"Libres {liga}: faltan datos de Sleeper; no cambio nada")
                continue
            semanas = list(range(w, m.ULT_SEM + 1))
            ps = sm.tabla_obj(out.get("App_ProySem"))
            rk = sm.tabla_obj(out.get("App_RankSemana"))
            ros = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_RankROS"))}
            nov = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_Novedades"))}
            rk_j = {r["Jugador"]: r for r in rk}
            for r in ps:
                r["S"] = {s: r.get(f"S{s}") for s in semanas}
                r["pos"] = r["Pos"]
            libres_ps = sorted([r for r in ps if r.get("Dueño") == "Libre"],
                               key=lambda r: -num((ros.get(r["Jugador"]) or {}).get("ROS")))
            libres_rk = [r for r in rk if r.get("Dueño") == "Libre"]

            res, stream, waiv, byes = [], [], [], []
            for r in rosters:
                eqn = users.get(r.get("owner_id"), f"Equipo {r.get('roster_id')}")
                rest = max(0, presupuesto - int((r.get("settings") or {}).get("waiver_budget_used") or 0))
                mio = [x for x in ps if x.get("Dueño") == eqn]
                vals = {"faab_restante": rest}

                # Streaming (esta semana)
                for p in STREAM_POS:
                    mios = sorted([x for x in mio if x["Pos"] == p], key=lambda x: -num(x["S"].get(w)))
                    yo = mios[0] if mios else None
                    yo_p = num(yo["S"].get(w)) if yo else 0.0
                    yo_n = yo["Jugador"] if yo else "—"
                    cands = sorted([x for x in libres_rk if x["Pos"] == p and num(x.get("Proy")) > 0],
                                   key=lambda x: -num(x.get("Proy")))[:STREAM_TOP]
                    for c in cands:
                        mej = round(num(c["Proy"]) - yo_p, 2)
                        of, mx = oferta_stream(mej, rest) if mej >= STREAM_MIN else (0, 0)
                        dec = f"Reclama sobre {yo_n}" if mej >= STREAM_MIN else f"No supera a {yo_n}"
                        stream.append([eqn, p, c["Jugador"], c.get("NFL", ""), c.get("Rival", ""), num(c["Proy"]),
                                       mej, of, mx, dec])
                    best = cands[0] if cands else None
                    if best and num(best["Proy"]) - yo_p >= STREAM_MIN:
                        mej = num(best["Proy"]) - yo_p
                        of, mx = oferta_stream(mej, rest)
                        vals[f"msg_{p.lower()}"] = (f"Reclama {best['Jugador']} — oferta ${of} (máx ${mx}), "
                                                    f"+{mej:.1f} pts vs {yo_n}")
                    else:
                        vals[f"msg_{p.lower()}"] = (f"Quédate con {yo_n}: ningún libre lo supera por "
                                                    f"{STREAM_MIN:.0f}+ pts" if yo else f"No tienes {p} y no hay libres con proyección")

                # Waivers (resto de temporada)
                base = {s: pts(lineup(mio, slots, s)) for s in semanas}
                tot0 = sum(base.values())
                altas = []
                for c in libres_ps[:WAIV_CAND]:
                    mejor = None
                    for d in mio:
                        nuevo = [x for x in mio if x is not d] + [c]
                        g = sum(pts(lineup(nuevo, slots, s)) for s in semanas) - tot0
                        if mejor is None or g > mejor[0]:
                            mejor = (g, d)
                    if mejor and mejor[0] >= WAIV_MIN:
                        altas.append((mejor[0], c, mejor[1]))
                altas.sort(key=lambda x: -x[0])
                usados = set()
                for g, c, d in altas:
                    if len(waiv) and sum(1 for x in waiv if x[0] == eqn) >= WAIV_TOP:
                        break
                    if c["Jugador"] in usados:
                        continue
                    usados.add(c["Jugador"])
                    of, mx = oferta_waiver(g / max(1, len(semanas)), rest)
                    rr = ros.get(c["Jugador"], {})
                    porque = (f"+{g:.1f} pts en tu alineación hasta la semana {m.ULT_SEM} · "
                              f"{num(rr.get('ROS por semana')):.1f} pts por semana ROS")
                    les = nov.get(c["Jugador"], {}).get("Estado")
                    if les:
                        porque += f" · {les}"
                    n_eq = sum(1 for x in waiv if x[0] == eqn) + 1
                    waiv.append([eqn, n_eq, c["Jugador"], c["Pos"], d["Jugador"], round(g, 2), of, mx, porque])
                mis = [x for x in waiv if x[0] == eqn]
                vals["msg_waivers"] = (f"Reclama {mis[0][2]} (suelta a {mis[0][4]}): +{mis[0][5]:.1f} pts ROS, "
                                       f"oferta ${mis[0][6]} (máx ${mis[0][7]})") if mis else \
                    "Ningún libre mejora tu equipo lo suficiente; guarda el FAAB."

                # Byes y huecos (próximas semanas)
                for s in semanas[:BYES_SEMANAS]:
                    op = lineup(mio, slots, s)
                    vistos = set()
                    for sl, x in zip(slots, op):
                        okp = sm.FLEX.get(sl, {sl})
                        if sl in sm.FLEX or sl in vistos:
                            continue
                        vistos.add(sl)
                        act = x["proy"] if x else 0.0
                        fl = sorted([c for c in libres_ps if c["Pos"] in okp and num(c["S"].get(s)) > 0],
                                    key=lambda c: -num(c["S"].get(s)))
                        if not fl:
                            continue
                        mej = num(fl[0]["S"].get(s)) - act
                        en_bye = [y["Jugador"] for y in mio if y["Pos"] == sl and num(y["S"].get(s)) == 0]
                        if x and (mej < BYES_MIN or not en_bye):
                            continue  # solo avisa si el puesto queda vacío o tienes a alguien en bye/fuera
                        estado = "Puesto vacío" if not x else f"Mejora +{mej:.1f}"
                        byes.append([eqn, s, sl, ", ".join(en_bye) or (x["j"]["Jugador"] if x else "—"), estado,
                                     fl[0]["Jugador"], fl[0].get("NFL", ""), round(num(fl[0]["S"].get(s)), 2),
                                     ", ".join(c["Jugador"] for c in fl[1:3])])
                res += [[eqn, k, v] for k, v in vals.items()]

            # Libres a futuro (igual para todos)
            fut = []
            for r in libres_ps:
                if r["Pos"] not in ("QB", "RB", "WR", "TE"):
                    continue
                rr = ros.get(r["Jugador"], {})
                rps, po = num(rr.get("ROS por semana")), num(rr.get("Playoffs"))
                punt = round(0.6 * rps + 0.4 * po / 3, 2)
                est = nov.get(r["Jugador"], {}).get("Estado") or "Sano"
                fut.append([r["Jugador"], r["Pos"], r.get("NFL", ""), round(num(rr.get("ROS")), 1),
                            num((rk_j.get(r["Jugador"]) or {}).get("Proy")), est, punt,
                            f"{rps:.1f} pts por semana ROS · {po:.1f} en playoffs (sem {PLAYOFF}-{m.ULT_SEM})"])
            fut.sort(key=lambda x: -x[6])

            out["App_LibResumen"] = [["Equipo", "clave", "valor"]] + res
            out["App_LibStream"] = [["Equipo", "Pos", "Jugador", "NFL", "Rival", "Proy", "Mejora", "Oferta", "Max",
                                     "Decisión"]] + stream
            out["App_LibWaivers"] = [["Equipo", "Prioridad", "Tomar", "Pos", "Soltar", "Mejora", "Oferta", "Max",
                                      "Por qué"]] + waiv
            out["App_LibByes"] = [["Equipo", "Semana", "Pos", "Tuyos", "Estado", "Mejor libre", "NFL", "Valor",
                                   "Otras"]] + byes
            out["App_Libres"] = [["Jugador", "Pos", "NFL", "ROS", "Proy sem", "Estado", "Puntaje", "Por qué"]] \
                + fut[:LIBRES_TOP]
            try:
                valor = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_Valor"))}
                rad = radar(ros, nov, valor)
                if rad:
                    out["App_Radar"] = [["Jugador", "Pos", "NFL", "Dueño", "Valor 2026", "ROS", "Fuente", "Noticia"]] + rad
            except Exception as ex:
                rad = []
                print(f"Radar {liga}: no pude armarlo ({ex}); la app usa el del Excel")
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, separators=(",", ":"), default=str)
            print(f"Libres {liga}: {len(stream)} streaming, {len(waiv)} altas, {len(byes)} avisos de byes, "
                  f"{min(len(fut), LIBRES_TOP)} libres a futuro, {len(rad)} en el radar")
        except Exception as ex:
            print(f"Libres {liga}: no pude armar waivers/streaming ({ex}); la app usa lo anterior")


if __name__ == "__main__":
    main()
