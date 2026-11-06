"""
Simulación del resto de la temporada para cada liga (pestañas Partido > Semana, Temporada, Liga y Power).

Corre después de trades.py y agrega al archivo data/modelo_<liga>.json:
- App_SimResumen: Equipo, clave, valor (prob. de ganar por simulación, playoffs si gano / si pierdo,
  % playoffs, % top 2, % final, % campeón, victorias esperadas, pts ROS, calendario).
- App_Posiciones, App_DistVict, App_Partidos, App_Power: tablas de la liga (iguales para todos).
- App_SimCal, App_SimFuerza, App_SimHallazgos: por equipo (calendario semana a semana, fuerza por posición
  y hallazgos).
Cada equipo juega con su alineación óptima de cada semana (proyecciones del modelo). Los puntos de cada
equipo en cada semana se simulan con una normal (desviación SD_EQUIPO). Temporada regular hasta la semana
anterior a playoffs; playoffs de 4 o 6 equipos (con 6, los 2 primeros descansan la 1.ª semana).
Desempate por puntos a favor. Si algo falla, el archivo queda como estaba.
"""
import json, os, re, sys
from math import erf, sqrt
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelo as m  # noqa: E402
import semana as sm  # noqa: E402
import libres as lb  # noqa: E402

N_SIM = 10000
SD_EQUIPO = 25.0     # desviación de los puntos de un equipo en una semana (35 / raíz de 2)
SEMILLA = 7


def num(x):
    return float(x) if isinstance(x, (int, float)) else 0.0


def main():
    rng = np.random.default_rng(SEMILLA)
    for liga, lg in m.LIGAS.items():
        nombre = re.sub(r"[^a-z0-9]+", "_", m.norm(liga))
        ruta = os.path.join(m.RAIZ, "data", f"modelo_{nombre}.json")
        try:
            out = json.load(open(ruta, encoding="utf-8"))
            w = int(out["semana"])
            info = sm.json_url(f"sl_league_{lg}", sm.URL_LIGA.format(lg=lg)) or {}
            st_l = info.get("settings") or {}
            slots = [("DST" if s == "DEF" else s) for s in info.get("roster_positions", []) if s not in sm.NO_TITULAR]
            ini_po = int(st_l.get("playoff_week_start") or m.PLAYOFF)
            n_po = int(st_l.get("playoff_teams") or 6)
            n_po = 4 if n_po < 6 else 6
            fin_reg = ini_po - 1
            rosters = m.bajar("sl_rosters", "json", lg=lg) or []
            users = {u["user_id"]: (u.get("metadata", {}) or {}).get("team_name") or u.get("display_name")
                     for u in (m.bajar("sl_users", "json", lg=lg) or [])}
            if not slots or not rosters:
                print(f"Simulación {liga}: faltan datos de Sleeper; no cambio nada")
                continue
            rids = [r["roster_id"] for r in rosters]
            T = len(rids)
            idx = {rid: i for i, rid in enumerate(rids)}
            eq = [users.get(r.get("owner_id"), f"Equipo {r['roster_id']}") for r in rosters]
            st = [r.get("settings") or {} for r in rosters]
            wins0 = np.array([num(s.get("wins")) + 0.5 * num(s.get("ties")) for s in st])
            loss0 = np.array([num(s.get("losses")) for s in st])
            pf0 = np.array([num(s.get("fpts")) + num(s.get("fpts_decimal")) / 100 for s in st])

            semanas = list(range(w, m.ULT_SEM + 1))
            ps = sm.tabla_obj(out.get("App_ProySem"))
            for r in ps:
                r["S"] = {s: r.get(f"S{s}") for s in semanas}
                r["pos"] = r["Pos"]
            plant = [[x for x in ps if x.get("Dueño") == e] for e in eq]
            mu = {s: np.array([lb.pts(lb.lineup(plant[i], slots, s)) for i in range(T)]) for s in semanas}

            # Calendario de la temporada regular que falta (matchups de Sleeper)
            cal = {}
            for s in range(w, fin_reg + 1):
                mt = sm.json_url(f"sl_matchups_{lg}_{s}", sm.URL_MATCH.format(lg=lg, w=s)) or []
                by = {}
                for x in mt:
                    if x.get("matchup_id") is not None and x.get("roster_id") in idx:
                        by.setdefault(x["matchup_id"], []).append(idx[x["roster_id"]])
                cal[s] = [tuple(v) for v in by.values() if len(v) == 2]

            # ---------------- Temporada regular
            wins = np.tile(wins0, (N_SIM, 1))
            pf = np.tile(pf0, (N_SIM, 1))
            gana_w = np.zeros((N_SIM, T), dtype=bool)
            for s, pares in cal.items():
                sc = mu[s][None, :] + SD_EQUIPO * rng.standard_normal((N_SIM, T))
                sc = np.maximum(sc, 0)
                pf += sc
                for a, b in pares:
                    g = sc[:, a] > sc[:, b]
                    wins[:, a] += g
                    wins[:, b] += ~g
                    if s == w:
                        gana_w[:, a], gana_w[:, b] = g, ~g
            orden = np.argsort(-(wins * 1e5 + pf), axis=1)          # orden[sim, lugar] = equipo
            lugar = np.empty_like(orden)
            lugar[np.arange(N_SIM)[:, None], orden] = np.arange(T)[None, :]

            # ---------------- Playoffs
            def puntos(s):
                if s not in mu:
                    return np.zeros((N_SIM, T))
                return np.maximum(mu[s][None, :] + SD_EQUIPO * rng.standard_normal((N_SIM, T)), 0)

            ar = np.arange(N_SIM)

            def duelo(a, b, sc):
                g = sc[ar, a] > sc[ar, b]
                return np.where(g, a, b)

            seed = [orden[:, k] for k in range(min(n_po, T))]
            s1, s2, s3 = puntos(ini_po), puntos(ini_po + 1), puntos(ini_po + 2)
            if n_po == 6 and T >= 6:
                w36, w45 = duelo(seed[2], seed[5], s1), duelo(seed[3], seed[4], s1)
                lw = np.where(lugar[ar, w36] > lugar[ar, w45], w36, w45)   # peor sembrado sobreviviente
                hw = np.where(lw == w36, w45, w36)
                f1, f2 = duelo(seed[0], lw, s2), duelo(seed[1], hw, s2)
                camp = duelo(f1, f2, s3)
            else:
                f1, f2 = duelo(seed[0], seed[3], s1), duelo(seed[1], seed[2], s1)
                camp = duelo(f1, f2, s2)
            en_po = lugar < n_po
            final = np.zeros((N_SIM, T), dtype=bool)
            final[ar, f1] = True
            final[ar, f2] = True
            campeon = np.zeros((N_SIM, T), dtype=bool)
            campeon[ar, camp] = True

            # ---------------- Métricas por equipo
            jugados = wins0 + loss0
            total_reg = jugados + np.array([sum(1 for s in cal for p in cal[s] if i in p) for i in range(T)])
            v_esp = wins.mean(0)
            ros = np.array([sum(mu[s][i] for s in semanas) for i in range(T)])
            po_pts = np.array([sum(mu[s][i] for s in semanas if s >= ini_po) for i in range(T)])
            fuerza = ros / max(1, len(semanas))
            dif_cal = np.zeros(T)
            for s, pares in cal.items():
                for a, b in pares:
                    dif_cal[a] += mu[s][b]
                    dif_cal[b] += mu[s][a]
            rank_cal = (-dif_cal).argsort().argsort() + 1          # 1 = calendario más difícil
            rank_f = (-fuerza).argsort().argsort() + 1
            rank_ros = (-ros).argsort().argsort() + 1
            pos_esp = lugar.mean(0)
            orden_eq = np.argsort(pos_esp)
            dist = np.zeros((T, 15))
            for i in range(T):
                c = np.bincount(np.clip(np.round(wins[:, i]).astype(int), 0, 14), minlength=15)
                dist[i] = c / N_SIM
            pos_rows = []
            for k, i in enumerate(orden_eq):
                wf = int(np.argmax(dist[i]))
                pos_rows.append([k + 1, eq[i], f"{int(wins0[i])}-{int(loss0[i])}", round(pf0[i], 2), round(fuerza[i], 3),
                                 round(v_esp[i], 3), f"{wf}-{int(total_reg[i]) - wf}", round(en_po[:, i].mean(), 3),
                                 round((lugar[:, i] < 2).mean(), 3), round((lugar[:, i] == 0).mean(), 3),
                                 round((lugar[:, i] == T - 1).mean(), 3), round(final[:, i].mean(), 3),
                                 round(campeon[:, i].mean(), 3), int(rank_cal[i]), int(rank_f[i])])
            lugar_de = {pos_rows[k][1]: k + 1 for k in range(T)}

            # Partidos de esta semana
            part = []
            for a, b in cal.get(w, []):
                pa = gana_w[:, a].mean()
                def cond(i, g):
                    msk = gana_w[:, i] == g
                    return float(en_po[msk, i].mean()) if msk.any() else float(en_po[:, i].mean())
                c1 = cond(a, True) - cond(a, False)
                c2 = cond(b, True) - cond(b, False)
                p_an = 0.5 * (1 + erf((mu[w][a] - mu[w][b]) / (SD_EQUIPO * sqrt(2)) / sqrt(2)))
                part.append([f"{eq[a]} vs {eq[b]}", round(pa, 3), round(1 - pa, 3), round(cond(a, True), 3),
                             round(cond(a, False), 3), round(c1, 3), round(cond(b, True), 3), round(cond(b, False), 3),
                             round(c2, 3), round(max(c1, c2), 3), round(mu[w][a], 2), round(mu[w][b], 2), round(p_an, 3)])
            part.sort(key=lambda r: -r[9])

            # Power y fuerza por posición (VOR de titulares contra el mejor libre de esa posición)
            libres = [x for x in ps if x.get("Dueño") == "Libre"]
            pos6 = ["QB", "RB", "WR", "TE", "K", "DST"]
            vor = np.zeros((T, 6))
            for k, p in enumerate(pos6):
                n_sl = sum(1 for s in slots if s == p)
                fl = sorted([sum(num(x["S"].get(s)) for s in semanas) for x in libres if x["Pos"] == p], reverse=True)
                rep = (fl[0] if fl else 0.0) * max(1, n_sl)
                for i in range(T):
                    tot = 0.0
                    for s in semanas:
                        for sl, x in zip(slots, lb.lineup(plant[i], slots, s)):
                            if x and x["j"]["Pos"] == p:
                                tot += x["proy"]
                    vor[i, k] = tot - rep
            rank_pos = (-vor).argsort(0).argsort(0) + 1
            power = []
            for i in range(T):
                debil = pos6[int(np.argmax(rank_pos[i]))]
                power.append([eq[i], round(mu[w][i], 2), round(ros[i], 1), round(po_pts[i], 1), int(rank_ros[i])]
                             + [round(v, 1) for v in vor[i]] + [debil])

            # Por equipo: resumen, calendario, fuerza y hallazgos
            res, calrows, fz, hall = [], [], [], []
            por_1 = sorted(pos_rows, key=lambda r: -r[9])
            fav = por_1[0]
            seg_ = por_1[1] if T > 1 else None
            for i in range(T):
                e = eq[i]
                msk_g, msk_p = gana_w[:, i], ~gana_w[:, i]
                tiene = any(i in p for p in cal.get(w, []))
                vals = dict(prob_ganar_sim=round(float(gana_w[:, i].mean()), 4) if tiene else "",
                            playoffs_hoy=round(float(en_po[:, i].mean()), 3),
                            playoffs_si_gano=round(float(en_po[msk_g, i].mean()), 3) if tiene and msk_g.any() else "",
                            playoffs_si_pierdo=round(float(en_po[msk_p, i].mean()), 3) if tiene and msk_p.any() else "",
                            pct_playoffs=round(float(en_po[:, i].mean()), 3), pct_top2=round(float((lugar[:, i] < 2).mean()), 3),
                            pct_final=round(float(final[:, i].mean()), 3), pct_campeon=round(float(campeon[:, i].mean()), 3),
                            victorias_esperadas=round(float(v_esp[i]), 2), ros_pts=round(float(ros[i]), 1),
                            ros_rank=int(rank_ros[i]), playoffs_pts=round(float(po_pts[i]), 1),
                            rank_calendario=int(rank_cal[i]))
                res += [[e, k, v] for k, v in vals.items()]
                # Calendario semana a semana
                base_tit = {}
                for s in semanas:
                    for sl, x in zip(slots, lb.lineup(plant[i], slots, s)):
                        if x:
                            base_tit[x["j"]["Jugador"]] = base_tit.get(x["j"]["Jugador"], 0) + 1
                tit = {j for j, c in base_tit.items() if c >= len(semanas) / 2}
                for s in semanas:
                    sin = [x["Jugador"] for x in plant[i] if num(x["S"].get(s)) == 0]
                    t_out = [j for j in sin if j in tit]
                    o_out = [j for j in sin if j not in tit]
                    riv = next((b if a == i else a for a, b in cal.get(s, []) if i in (a, b)), None)
                    if s >= ini_po:
                        fila = [s, "Playoffs", "", "", ""]
                    elif riv is None:
                        fila = [s, "—", "", "", ""]
                    else:
                        pg = 0.5 * (1 + erf((mu[s][i] - mu[s][riv]) / (SD_EQUIPO * sqrt(2)) / sqrt(2)))
                        rr = int((-mu[s]).argsort().argsort()[riv] + 1)
                        fila = [s, eq[riv], round(float(mu[s][riv]), 1), rr, round(pg, 3)]
                    alerta = f"{len(t_out)} titulares sin jugar: busca reemplazos antes de la semana {s}" if len(t_out) >= 2 else ""
                    calrows.append([e] + fila + [", ".join(t_out) or "—", ", ".join(o_out) or "—", alerta])
                for k, p in enumerate(pos6):
                    rp = int(rank_pos[i, k])
                    lec = ("Fuerte: puedes ofrecer en trades" if rp <= 3 else
                           "Débil: busca refuerzos" if rp >= T - 2 else "Media")
                    fz.append([e, p, round(float(vor[i, k]), 1), rp, lec])
                hall.append([e, f"Favorito a terminar primero: {fav[1]} ({fav[9]:.0%})."
                             + (f" Segundo favorito: {seg_[1]} ({seg_[9]:.0%})." if seg_ else "")])
                hall.append([e, f"Tu equipo: {en_po[:, i].mean():.0%} de clasificar, {v_esp[i]:.1f} victorias esperadas "
                                f"y lugar proyectado #{lugar_de[e]} de {T}."])
                dp = power[i][-1]
                hall.append([e, f"Tu posición más débil es {dp}; tu calendario restante es el #{int(rank_cal[i])} "
                                f"más difícil de la liga."])
                if part:
                    hall.append([e, f"Partido que más mueve los playoffs esta semana: {part[0][0]} "
                                    f"(cambia hasta {part[0][9]:.0%} las chances)."])

            out["App_SimResumen"] = [["Equipo", "clave", "valor"]] + res
            out["App_Posiciones"] = [["Pos", "Equipo", "Récord", "PF", "Fuerza", "Vict esp", "Récord final", "% Playoffs",
                                      "% Top 2", "% Primero", "% Último", "% Final", "% Campeón", "Calendario",
                                      "Rank fuerza"]] + pos_rows
            out["App_DistVict"] = [["Equipo"] + [str(k) for k in range(15)]] + \
                [[eq[i]] + [round(float(v), 3) or 1e-6 for v in dist[i]] for i in orden_eq]  # 1e-6: la app ignora filas con 0 en la 1.ª columna
            out["App_Partidos"] = [["Partido", "P1", "P2", "PO1 gana", "PO1 pierde", "Cambio1", "PO2 gana", "PO2 pierde",
                                    "Cambio2", "Peso", "Proy1", "Proy2", "P1 proy"]] + part
            out["App_Power"] = [["Equipo", "Proy semana", "ROS", "Playoffs", "Rank ROS"] + pos6 + ["Más débil"]] + power
            out["App_SimCal"] = [["Equipo", "Semana", "Rival", "Fuerza rival", "Rank rival", "Prob ganar",
                                  "Titulares en bye", "Otros en bye", "Alerta"]] + calrows
            out["App_SimFuerza"] = [["Equipo", "Pos", "Fuerza", "Rank", "Lectura"]] + fz
            out["App_SimHallazgos"] = [["Equipo", "Texto"]] + hall
            with open(ruta, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, separators=(",", ":"), default=str)
            print(f"Simulación {liga}: {N_SIM} temporadas, {len(cal)} semanas regulares por jugar, "
                  f"playoffs de {n_po} desde la semana {ini_po}; más probable 1.º: {fav[1]} ({fav[9]:.0%})")
        except Exception as ex:
            print(f"Simulación {liga}: no pude simular ({ex}); la app usa lo anterior")


if __name__ == "__main__":
    main()
