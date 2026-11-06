"""
Trades, comprar/vender/riesgo y mercado de waivers para cada equipo de cada liga.

Corre después de libres.py y agrega al archivo data/modelo_<liga>.json:
- App_TrTrades: Equipo, Contraparte, Doy, Recibo, Mi cambio ROS, Su cambio ROS, Mi cambio playoffs, Evaluación.
  Trades 1x1 y 2x1 medidos con la alineación óptima de los dos equipos semana a semana (hasta la 17).
  Solo se sugieren si ganan los dos y si el valor de mercado que recibe la contraparte es razonable.
- App_TrComprar / App_TrVender: jugadores que el modelo ve mejor (o peor) de lo que paga el mercado
  (columna Para = equipo al que va dirigida la sugerencia; Equipo = dueño actual).
- App_Riesgo: jugadores con dueño con riesgo de lesión o de perder partidos.
- App_Mercado, App_Pujas, App_ComoOferta: cómo ofertan los equipos (historial de waivers de Sleeper).
Además ajusta las ofertas de App_LibWaivers con lo que se paga de verdad en la liga.
Si algo falla, el archivo queda como estaba.
"""
import json, os, re, sys
from collections import defaultdict
from statistics import median

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelo as m  # noqa: E402
import semana as sm  # noqa: E402
import libres as lb  # noqa: E402

URL_TX = "https://api.sleeper.app/v1/league/{lg}/transactions/{r}"
CAND = 10            # jugadores por equipo que se prueban en trades (los de más valor, sin K/DST)
CAND_2X1 = 6         # de esos, los que se combinan de a 2
MIN_MIO = 5.0        # pts ROS mínimos que tengo que ganar
MIN_SUYO = 0.0       # pts ROS mínimos que tiene que ganar la contraparte
VALOR_JUSTO = 0.85   # la contraparte recibe al menos este % del valor de mercado que entrega
POR_RIVAL = 3        # trades por contraparte
TOP_TRADES = 25
SENAL_MIN = 5.0      # diferencia modelo - mercado (puntos de valor) para comprar/vender
SEM_MERCADO = 4      # semanas recientes para calibrar ofertas


def num(x):
    return float(x) if isinstance(x, (int, float)) else 0.0


def total(jug, slots, semanas):
    return sum(lb.pts(lb.lineup(jug, slots, s)) for s in semanas)


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
                print(f"Trades {liga}: faltan datos de Sleeper; no cambio nada")
                continue
            semanas = list(range(w, m.ULT_SEM + 1))
            s_po = [s for s in semanas if s >= m.PLAYOFF]
            ps = sm.tabla_obj(out.get("App_ProySem"))
            for r in ps:
                r["S"] = {s: r.get(f"S{s}") for s in semanas}
                r["pos"] = r["Pos"]
            ros = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_RankROS"))}
            rk = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_RankSemana"))}
            val = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_Valor"))}
            nov = {r["Jugador"]: r for r in sm.tabla_obj(out.get("App_Novedades"))}
            nom_eq = {r["roster_id"]: users.get(r.get("owner_id"), f"Equipo {r['roster_id']}") for r in rosters}
            equipos = sorted(set(nom_eq.values()))
            plant = {e: [x for x in ps if x.get("Dueño") == e] for e in equipos}

            def mercado(j):
                v = val.get(j, {})
                return num(v.get("Valor mercado")) if isinstance(v.get("Valor mercado"), (int, float)) else num(v.get("Valor"))

            vmax = max([num(v.get("VOR ROS")) for v in val.values()] + [1.0])

            def modelo_v(j):
                v = val.get(j, {})
                if isinstance(v.get("Valor modelo"), (int, float)):
                    return num(v["Valor modelo"])
                return 100 * num(v.get("VOR ROS")) / vmax

            # ---------------- Trades 1x1 y 2x1
            base = {e: (total(plant[e], slots, semanas), total(plant[e], slots, s_po)) for e in equipos}
            cand = {e: sorted([x for x in plant[e] if x["Pos"] not in ("K", "DST")],
                              key=lambda x: -num((val.get(x["Jugador"]) or {}).get("Valor")))[:CAND] for e in equipos}
            trades = []
            for a in equipos:
                lista = []
                for b in equipos:
                    if b == a:
                        continue
                    ofertas = [[d] for d in cand[a]] + [[cand[a][i], cand[a][j]] for i in range(min(CAND_2X1, len(cand[a])))
                                                       for j in range(i + 1, min(CAND_2X1, len(cand[a])))]
                    pr = []
                    for doy in ofertas:
                        for rec in cand[b]:
                            v_doy = sum(mercado(x["Jugador"]) for x in doy)
                            v_rec = mercado(rec["Jugador"])
                            if v_doy < VALOR_JUSTO * v_rec:
                                continue
                            na = [x for x in plant[a] if x not in doy] + [rec]
                            nb = [x for x in plant[b] if x is not rec] + doy
                            ga = total(na, slots, semanas) - base[a][0]
                            if ga < MIN_MIO:
                                continue
                            gb = total(nb, slots, semanas) - base[b][0]
                            if gb < MIN_SUYO:
                                continue
                            gpo = total(na, slots, s_po) - base[a][1]
                            pr.append((ga, gb, gpo, doy, rec))
                    pr.sort(key=lambda t: -(t[0] + 0.5 * t[1]))
                    usados = set()
                    for ga, gb, gpo, doy, rec in pr:
                        k = (rec["Jugador"],)
                        if k in usados:
                            continue
                        usados.add(k)
                        ev = ("Muy buena: proponla" if ga >= 15 and gb >= 3 else
                              "Buena: les conviene a los dos" if gb >= 3 else
                              "Justa: a ellos les cambia poco")
                        lista.append([a, b, " + ".join(x["Jugador"] for x in doy), rec["Jugador"],
                                      round(ga, 1), round(gb, 1), round(gpo, 1), ev])
                        if len(usados) >= POR_RIVAL:
                            break
                lista.sort(key=lambda t: -(t[4] + 0.5 * t[5]))
                trades += lista[:TOP_TRADES]

            # ---------------- Comprar / Vender / Riesgo
            def ppg(j):
                return num((rk.get(j) or {}).get("PPG recientes"))

            comprar, vender, riesgo = [], [], []
            for e in equipos:
                for x in plant[e]:
                    j = x["Jugador"]
                    if x["Pos"] in ("K", "DST"):
                        continue
                    sen = round(modelo_v(j) - mercado(j), 1)
                    rr = ros.get(j, {})
                    fila = [e, j, x["Pos"], e, round(ppg(j), 1), sen, round(num(rr.get("ROS")), 1)]
                    comprar.append(fila + [f"El modelo lo valora {sen:+.1f} sobre el mercado · "
                                           f"{num(rr.get('ROS por semana')):.1f} pts por semana ROS"])
                    vm = num((val.get(j) or {}).get("Valor"))
                    ver = ("VENDER: el mercado lo paga más de lo que rinde" if sen <= -SENAL_MIN else
                           "MANTENER (élite, difícil de reemplazar)" if vm >= 70 else
                           "COMPRAR MÁS / MANTENER: rinde más de lo que vale" if sen >= SENAL_MIN else "MANTENER")
                    vender.append(fila + [ver])
                    nv = nov.get(j)
                    if nv:
                        pj = num(nv.get("Prob")) if isinstance(nv.get("Prob"), (int, float)) else 1.0
                        rg = int(num(nv.get("Regreso")))
                        if pj < 0.85 or rg > w:
                            txt = f"{nv.get('Estado') or ''} {('· ' + str(nv.get('Lesión'))) if nv.get('Lesión') else ''}".strip()
                            txt += f" · {round(pj * 100)}% de jugar esta semana" + (f" · regreso estimado sem {rg}" if rg > w else "")
                            riesgo.append(fila + [txt])
            todos_eq = equipos
            comp_rows, vend_rows = [], []
            for e in todos_eq:
                c = sorted([r for r in comprar if r[3] != e and r[5] >= SENAL_MIN], key=lambda r: -r[5])[:15]
                comp_rows += [[e] + r[1:] for r in c]
                v = sorted([r for r in vender if r[3] == e], key=lambda r: r[5])
                vend_rows += [[e] + r[1:] for r in v]
            riesgo.sort(key=lambda r: -num((val.get(r[1]) or {}).get("Valor")))
            riesgo = [r[1:] for r in riesgo]

            # ---------------- Mercado de waivers (historial de Sleeper)
            slp = m.bajar("sl_players", "json") or {}
            sl_a = sm.ids_sleeper()
            nom_ps = {x["Clave"]: x["Jugador"] for x in ps}

            def nombre_sl(pid):
                g = sm.clave(pid, sl_a)
                return nom_ps.get(g) or (slp.get(str(pid)) or {}).get("full_name") or str(pid)

            def pos_sl(pid):
                return "DST" if str(pid).isalpha() else (slp.get(str(pid)) or {}).get("position") or ""

            pujas = defaultdict(list)
            for rnd in range(1, w + 1):
                tx = sm.json_url(f"sl_tx_{lg}_{rnd}", URL_TX.format(lg=lg, r=rnd)) or []
                for t in tx:
                    if t.get("type") != "waiver" or not t.get("adds"):
                        continue
                    bid = int(num((t.get("settings") or {}).get("waiver_bid")))
                    rid = (t.get("roster_ids") or [None])[0]
                    for pid in t["adds"]:
                        pujas[(rnd, str(pid))].append((bid, rid, t.get("status") == "complete"))
            per_eq = defaultdict(lambda: {"ofertas": 0, "ganadas": 0, "bids": []})
            filas_p, ganadoras = [], defaultdict(list)
            for (rnd, pid), b in pujas.items():
                b.sort(key=lambda x: -x[0])
                for bid, rid, ok in b:
                    q = per_eq[rid]
                    q["ofertas"] += 1
                    if ok:
                        q["ganadas"] += 1
                        q["bids"].append(bid)
                gan = [x for x in b if x[2]]
                if gan:
                    g = gan[0]
                    seg = max([x[0] for x in b if x is not g] or [0])
                    if rnd > w - SEM_MERCADO:
                        ganadoras[pos_sl(pid)].append(g[0])
                    filas_p.append([rnd, nombre_sl(pid), nom_eq.get(g[1], ""), len(b), seg, g[0]])
            filas_p.sort(key=lambda r: (-r[3], -r[5]))
            # Posición más débil de cada equipo (titular de esta semana vs promedio de la liga)
            tit = {}
            for e in equipos:
                op = lb.lineup(plant[e], slots, w)
                d = defaultdict(float)
                for sl, x in zip(slots, op):
                    if sl not in sm.FLEX:
                        d[sl] += x["proy"] if x else 0.0
                tit[e] = d
            prom_pos = {p: sum(tit[e][p] for e in equipos) / len(equipos) for p in set().union(*[tit[e] for e in equipos])}
            usado = {nom_eq[r["roster_id"]]: int(num((r.get("settings") or {}).get("waiver_budget_used"))) for r in rosters}
            prom_usado = sum(usado.values()) / max(1, len(usado))
            mercado_rows = []
            for r in rosters:
                e = nom_eq[r["roster_id"]]
                st = r.get("settings") or {}
                q = per_eq[r["roster_id"]]
                u = usado[e]
                perfil = "Agresivo" if u > 1.25 * prom_usado else "Conservador" if u < 0.75 * prom_usado else "Normal"
                debil = min(prom_pos, key=lambda p: tit[e][p] - prom_pos[p]) if prom_pos else ""
                mercado_rows.append([e, f"{st.get('wins', 0)}-{st.get('losses', 0)}", perfil, debil, u, q["ganadas"],
                                     q["ofertas"], max(q["bids"] or [0]),
                                     round(sum(q["bids"]) / len(q["bids"]), 1) if q["bids"] else 0, presupuesto - u])
            mercado_rows.sort(key=lambda r: -r[4])
            if mercado_rows:
                k = len(mercado_rows)
                mercado_rows.append(["Promedio de la liga", "", "", "", round(prom_usado, 1),
                                     round(sum(r[5] for r in mercado_rows) / k, 1), round(sum(r[6] for r in mercado_rows) / k, 1),
                                     round(sum(r[7] for r in mercado_rows) / k, 1), round(sum(r[8] for r in mercado_rows) / k, 1),
                                     round(sum(r[9] for r in mercado_rows) / k, 1)])
            todas_g = [x[5] for x in filas_p]
            como = []
            if todas_g:
                como = [["Altas ganadas en la temporada", len(todas_g)],
                        ["Oferta ganadora promedio $", round(sum(todas_g) / len(todas_g), 1)],
                        ["Oferta ganadora mediana $", median(todas_g)],
                        ["% de altas ganadas con $0-$5", round(sum(1 for x in todas_g if x <= 5) / len(todas_g), 3)],
                        ["Margen promedio sobre la 2.ª oferta $",
                         round(sum(x[5] - x[4] for x in filas_p) / len(filas_p), 1)],
                        ["Pujas con 2 o más ofertas", sum(1 for x in filas_p if x[3] >= 2)]]

            # ---------------- Ofertas de waivers ajustadas al mercado de la liga
            p75 = {p: sorted(v)[int(0.75 * (len(v) - 1))] for p, v in ganadoras.items() if len(v) >= 3}
            wv = out.get("App_LibWaivers") or []
            if len(wv) > 1 and p75:
                hd = wv[0]
                io, im, ip, iq = hd.index("Oferta"), hd.index("Max"), hd.index("Pos"), hd.index("Por qué")
                for r in wv[1:]:
                    ref = p75.get(r[ip])
                    if ref is None:
                        continue
                    if r[im]:  # oferta = lo que se paga en la liga (+$1), sin pasar el máximo
                        r[io] = int(min(r[io], ref + 1)) if r[io] > ref + 1 else int(min(r[im], max(r[io], ref)))
                    r[iq] = f"{r[iq]} · en tu liga, 3 de cada 4 altas de {r[ip]} se ganaron con ${ref} o menos"

            out["App_TrTrades"] = [["Equipo", "Contraparte", "Doy", "Recibo", "Mi cambio ROS", "Su cambio ROS",
                                    "Mi cambio playoffs", "Evaluación"]] + trades
            cab = ["Para", "Jugador", "Pos", "Equipo", "PPG", "Señal", "ROS"]
            out["App_TrComprar"] = [cab + ["Por qué"]] + comp_rows
            out["App_TrVender"] = [cab + ["Veredicto"]] + vend_rows
            out["App_Riesgo"] = [["Jugador", "Pos", "Equipo", "PPG", "Señal", "ROS", "Por qué"]] + riesgo[:40]
            out["App_Mercado"] = [["Equipo", "Récord", "Perfil", "Más débil", "FAAB usado", "Ganadas", "Ofertas",
                                   "Oferta máx", "Oferta prom", "FAAB restante"]] + mercado_rows
            out["App_Pujas"] = [["Sem", "Jugador", "Ganador", "Ofertas", "Segunda", "Ganadora"]] + filas_p[:15]
            out["App_ComoOferta"] = [["Dato", "Valor"]] + como
            for e in equipos:
                n = sum(1 for t in trades if t[0] == e)
                out["App_LibResumen"] = (out.get("App_LibResumen") or [["Equipo", "clave", "valor"]]) + \
                    [[e, "estado_sugerencias", f"{out.get('generado', '')[:10]} · {n} trades sugeridos"]]
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, separators=(",", ":"), default=str)
            print(f"Trades {liga}: {len(trades)} trades, {len(comp_rows)} para comprar, {len(riesgo)} en riesgo, "
                  f"{len(filas_p)} altas por waiver en el historial")
        except Exception as ex:
            print(f"Trades {liga}: no pude armar trades/mercado ({ex}); la app usa lo anterior")


if __name__ == "__main__":
    main()
