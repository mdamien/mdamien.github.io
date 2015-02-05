from helpt import *

URL = 'http://www.oise-mobilite.fr/horaires_arret/?rub_code=28&thm_id=0&gpl_id=&lign_id={ligne}&sens={sens}&date={date}&pa_id={arret}'

reseaux = json.load(open('data/reseaux_with_arrets.json'))

for name, reseau in reseaux.items():
    if 'Comp' in name:
        print(name)
        for ligne in reseau['lignes']:
            print('-',ligne['name'])
            for arret in ligne['arrets']:
                print('--',arret['name'])

                resp = down(URL.format(ligne=ligne['id'], arret=arret['id'], sens=1, date='29%2F09%2F2014'))
                soup = BeautifulSoup(resp.text)

                hours = soup.find_all('td',attrs={'class':'hour'})
                formatted_hours = []
                for hour in hours:
                    h = hour.attrs['headers'][0].replace('hour','')
                    mins = hour.find_all('div')
                    for min in mins:
                        min, dir = [x.strip() for x in min.text.split('\n')]
                        form = h+'h'+min
                        print(form,' ',end='')
                        formatted_hours.append([form, dir])
                print()
                arret['hours'] = formatted_hours
                store(reseaux, 'reseaux_with_horaires')
            import pdb;pdb.set_trace()

store(reseaux, 'reseaux_with_horaires')


