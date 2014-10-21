from helpt import *
from bs4 import BeautifulSoup
from pprint import pprint as pp

URL = "http://www.oise-mobilite.fr/horaires_ligne/index.asp?rub_code=6&lign_id={ligne}&sens={sens}&date={date}&heure={hour}&minute=0"

MIN_HOUR = 4

LIGNES = (
    ('Ligne 1',256),
    ('Ligne 2',255),
    ('Ligne 3',1620),
    ('Ligne 4',1618),
    ('Ligne 5',252),
    ('Dimanche 1',1619),
    ('Dimanche 2',1621),
)

lignes = []
stops = set()

for ligne_name, ligne_id in LIGNES:
    print(ligne_name)
    ligne = {'name':ligne_name, 'id':ligne_id, 'directions':[]}
    for sens in (1,2):
        print('sens=', sens)
        hour = MIN_HOUR
        times = []
        stops_names = []
        while hour < 24:
            print('h=',hour)
            date = '20%2F10%2F2014'
            if 'Dimanche' in ligne_name:
                date = '26%2F10%2F2014'
            resp = down(URL.format(ligne=ligne_id, sens=sens, hour=hour, date=date))
            soup = BeautifulSoup(resp.text)
            rows = [row for row in soup.select('tr') if 'row' in ''.join(row.attrs.get('class',[]))]

            parcours = []
            for i, row in enumerate(rows):
                arret_name = row.select('td > a')[0].text
                arret_id = row.select('td')[1].attrs['id'].replace('arret','')
                horaires = [h.text for h in row.select('.horaire')]
                parcours.append(horaires)
                if hour == MIN_HOUR:
                    stops_names.append(arret_name)
                    stops.add(arret_name)

            parcours = list(zip(*parcours[::1]))
            for parcour in parcours:
                if ','.join(parcour) not in times:
                    times.append(','.join(parcour))
            hour = hour + 2
        times = [','.join(stops_names)] + times
        pp(times)
        ligne['directions'].append(times)
    lignes.append(ligne)

    with open('data/data.js','w') as f:
        f.write('var DATA =')
        f.write(json.dumps({
            'stops':list(sorted(list(stops))),
            'lines':lignes,
            },indent=2))
