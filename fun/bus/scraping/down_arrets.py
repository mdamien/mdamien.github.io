from helpt import *

URL = 'http://www.oise-mobilite.fr/horaires_ligne/index.asp?rub_code=6&date=02%2F10%2F2014&heure=21&minute=41&part_id=5&lign_id={ligne}'

reseaux = json.load(open('data/reseaux_with_lignes.json'))

for name, reseau in reseaux.items():
    print(name)
    for ligne in reseau['lignes']:
        print(ligne['name'], ligne)
        resp = down(URL.format(ligne=ligne['id']))
        soup = BeautifulSoup(resp.text)
        arrets = soup.find_all('td',attrs={'headers':'arret'})

        ligne['arrets'] = []
        for arret in arrets:
            ligne['arrets'].append({
                'name': arret.a.text,
                'id': arret.a.attrs['href'].split('pa_id=')[-1],
            })


store(reseaux, 'reseaux_with_arrets')
