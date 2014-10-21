from helpt import *

URL = 'http://www.oise-mobilite.fr/horaires_ligne/index.asp?rub_code=6&keywordsHoraire=&date=29%2F09%2F2014&part_id={reseau}&actionButton=SearchByLocalityAndLineHiddenField'

reseaux = [x.strip().split(';') for x in open('data/reseaux')]
all_lignes = {}
for reseau, name in reseaux:
    url = URL.format(reseau=reseau)
    print(name)
    resp = down(url)
    soup = BeautifulSoup(resp.text)
    lignes = soup.find_all('td', attrs={'headers':'name'})
    lignes_det = []
    for ligne in lignes:
        lignes_det.append({
            'id':ligne.a.attrs['href'].split('lign_id=')[-1],
            'name':ligne.a.text,
        })
    all_lignes[name] = {
            'lignes': lignes_det,
            'id':reseau,
    }

store(all_lignes, 'reseaux_with_lignes')
