"""Sunday Locker · app.py
Arma data/app.json para que la app arranque aunque Apps Script no responda.
Busca tus ligas y tu equipo en Sleeper por tu usuario (no por el nombre del equipo),
y usa los nombres del modelo (data/modelo_<liga>.json) para que fotos y proyecciones coincidan.
"""
import datetime
import glob
import json
import os
import re
import unicodedata
import urllib.request

USUARIO = 'joseandres87'
TEMPORADA = '2026'
API = 'https://api.sleeper.app/v1/'
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
SLOTS = {'QB': 'QB', 'RB': 'RB', 'WR': 'WR', 'TE': 'TE', 'FLEX': 'FLEX', 'K': 'K', 'DEF': 'DST',
         'SUPER_FLEX': 'SFLEX', 'REC_FLEX': 'FLEX', 'WRRB_FLEX': 'FLEX'}


def get(ruta):
    req = urllib.request.Request(API + ruta, headers={'User-Agent': 'sunday-locker'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def slug(s):
    s = unicodedata.normalize('NFKD', str(s))
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[.'\u2019]", '', s)
    return re.sub(r'[^a-z0-9]+', '_', s).strip('_')


def clave(s):
    s = unicodedata.normalize('NFKD', str(s or ''))
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[.'\u2019,-]", '', s)
    s = re.sub(r'\b(jr|sr|ii|iii|iv|v)\b', '', s)
    return re.sub(r'\s+', '', s)


def objetos(t):
    if not isinstance(t, list) or len(t) < 2:
        return []
    h = t[0]
    return [dict(zip(h, r)) for r in t[1:]]


def leer_modelo(liga):
    ruta = os.path.join(DATA, 'modelo_' + slug(liga) + '.json')
    if not os.path.exists(ruta):
        return None
    with open(ruta, encoding='utf-8') as f:
        return json.load(f)


def num(v):
    return v if isinstance(v, (int, float)) and not isinstance(v, bool) else ''


def armar_liga(lg, uid, players, semana):
    lid = lg['league_id']
    rosters = get('league/%s/rosters' % lid)
    users = {u['user_id']: u for u in get('league/%s/users' % lid)}

    def nombre_equipo(r):
        u = users.get(r.get('owner_id')) or {}
        return (u.get('metadata') or {}).get('team_name') or ('Team ' + u['display_name'] if u.get('display_name') else 'Equipo %s' % r['roster_id'])

    mio = next((r for r in rosters if r.get('owner_id') == uid or uid in (r.get('co_owners') or [])), None)
    if not mio:
        return None
    eq = nombre_equipo(mio)

    # nombres y proyecciones del modelo (con sufijos: James Cook III, etc.)
    m = leer_modelo(lg['name']) or {}
    nom, proy, ros = {}, {}, {}
    for t in ('App_RankSemana', 'App_RankROS', 'App_Valor', 'App_ProySem'):
        for r in objetos(m.get(t)):
            j = r.get('Jugador')
            if not isinstance(j, str):
                continue
            nom.setdefault(clave(j), j)
            if t == 'App_RankSemana' and num(r.get('Proy')) != '':
                proy[j] = r['Proy']
            if t == 'App_RankROS' and num(r.get('ROS')) != '':
                ros[j] = r['ROS']

    def jugador(pid):
        pid = str(pid)
        if re.fullmatch(r'[A-Z]{2,3}', pid):
            return {'nm': pid + ' DST', 'pos': 'DST', 'nfl': pid, 'inj': ''}
        p = players.get(pid) or {}
        sl = p.get('full_name') or ((p.get('first_name') or '') + ' ' + (p.get('last_name') or '')).strip() or 'Jugador ' + pid
        return {'nm': nom.get(clave(sl), sl), 'pos': p.get('position') or '', 'nfl': p.get('team') or '',
                'inj': p.get('injury_status') or ''}

    # rival de la semana
    rival, rec_rival = '—', ''
    try:
        mt = get('league/%s/matchups/%s' % (lid, semana))
        yo = next((x for x in mt if x['roster_id'] == mio['roster_id']), None)
        if yo and yo.get('matchup_id'):
            otro = next((x for x in mt if x.get('matchup_id') == yo['matchup_id'] and x['roster_id'] != mio['roster_id']), None)
            if otro:
                ro = next(r for r in rosters if r['roster_id'] == otro['roster_id'])
                rival = nombre_equipo(ro)
                s = ro.get('settings') or {}
                rec_rival = '%s-%s' % (s.get('wins', 0), s.get('losses', 0))
    except Exception as e:
        print('app.py: sin matchups de la semana', semana, e)

    st = mio.get('settings') or {}
    tit = set(str(x) for x in (mio.get('starters') or []))
    res = set(str(x) for x in (mio.get('reserve') or []))
    roster, fotos, dst, k = [], [], '—', '—'
    for pid in mio.get('players') or []:
        x = jugador(pid)
        fotos.append({'Jugador': x['nm'], 'ID Sleeper': str(pid)})
        if x['pos'] in ('DEF', 'DST'):
            dst = x['nm']
        if x['pos'] == 'K':
            k = x['nm']
        roster.append({'Jugador': x['nm'], 'Pos': 'DST' if x['pos'] == 'DEF' else x['pos'], 'NFL': x['nfl'],
                       'En Sleeper': 'IR' if str(pid) in res else 'Titular' if str(pid) in tit else 'Banca',
                       'Rival': '', 'Estado': x['inj'] or 'OK', 'Prob': '', 'Proy': proy.get(x['nm'], ''),
                       'ROS': ros.get(x['nm'], ''), 'Recomendación': ''})
    roster.sort(key=lambda r: ({'Titular': 0, 'Banca': 1, 'IR': 2}[r['En Sleeper']], -(r['Proy'] or 0)))
    for r in rosters:  # fotos de toda la liga
        for pid in r.get('players') or []:
            fotos.append({'Jugador': jugador(pid)['nm'], 'ID Sleeper': str(pid)})

    slots = [SLOTS[s] for s in lg.get('roster_positions') or [] if s in SLOTS]
    budget = (lg.get('settings') or {}).get('waiver_budget') or 100
    resumen = {'equipo': eq, 'liga': lg['name'], 'liga_id': lid, 'semana': semana, 'rival': rival,
               'record_yo': '%s-%s' % (st.get('wins', 0), st.get('losses', 0)), 'record_rival': rec_rival,
               'faab_restante': budget - (st.get('waiver_budget_used') or 0), 'slots': ','.join(slots),
               'mi_dst': dst, 'mi_k': k, 'actualizado_semana': 'Semana %s' % semana}
    datos = {'App_Resumen': [{'clave': c, 'valor': v} for c, v in resumen.items()], 'App_Roster': roster}
    return datos, fotos, bool(m)


def main():
    try:
        uid = get('user/' + USUARIO)['user_id']
        semana = int((get('state/nfl') or {}).get('display_week') or 1)
        ligas = get('user/%s/leagues/nfl/%s' % (uid, TEMPORADA)) or []
        con_modelo = {os.path.basename(p)[7:-5] for p in glob.glob(os.path.join(DATA, 'modelo_*.json'))}
        if con_modelo:
            ligas = [lg for lg in ligas if slug(lg['name']) in con_modelo] or ligas
        players = get('players/nfl')
        ahora = (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).strftime('%Y-%m-%d %H:%M')
        out = {'actualizado': ahora, 'activa': '', 'ligas': {}, 'comunes': {'App_Fotos': []}, 'respaldo': True}
        vistos = set()
        for lg in ligas:
            r = armar_liga(lg, uid, players, semana)
            if not r:
                continue
            datos, fotos, hay_modelo = r
            out['ligas'][lg['name']] = {'fecha': ahora, 'vivo': True, 'datos': datos}
            for f in fotos:
                if f['Jugador'] not in vistos:
                    vistos.add(f['Jugador'])
                    out['comunes']['App_Fotos'].append(f)
            print('app.py: %s · %s%s' % (lg['name'], datos['App_Resumen'][0]['valor'],
                                         '' if hay_modelo else ' (sin modelo_*.json)'))
        if not out['ligas']:
            print('app.py: no encontré ligas para', USUARIO)
            return
        out['activa'] = next(iter(out['ligas']))
        os.makedirs(DATA, exist_ok=True)
        with open(os.path.join(DATA, 'app.json'), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
        print('app.py: data/app.json listo ·', len(out['ligas']), 'ligas')
    except Exception as e:  # nunca detiene el resto del modelo
        print('app.py: error, no se generó app.json:', e)


if __name__ == '__main__':
    main()
