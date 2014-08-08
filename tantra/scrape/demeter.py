import glob, json
from bs4 import BeautifulSoup

def to_int(x, nothing=0):
    if '-' in x:
        return nothing
    return int(x)

f = None
uvs = {}
for filename in glob.glob('scrapa/demeter/*.html'):
    cat = filename.replace('scrapa/demeter/','').replace('.html','')
    print(cat)
    f = open(filename)
    soup = BeautifulSoup(f.read())
    trs = soup.find_all('tr')
    for tr in trs[1:]:
        try:
            tds = tr.find_all('td')
            uv = {
                'name': tds[0].get_text(),
                'places': to_int(tds[1].get_text(), None),
                'title': tds[2].get_text(),
                'credits': to_int(tds[3].get_text()),
                'hours': to_int(tds[4].get_text().strip()),
                'hours_td': to_int(tds[5].get_text().strip()),
                'hours_tp': to_int(tds[6].get_text().strip()),
                'have_final': tds[7].get_text().strip() == 'Oui',
                'type': tds[8].get_text().strip(),
                'resp': tds[9].get_text().strip(),
                }
            if uv['name'] in uvs:
                uv = uvs[uv['name']]
            cats = uv.get('categories', [])
            cats.append(cat)
            uv['categories'] = cats
            uvs[uv['name']] = uv
        except Exception as e:
            print(e)

with open('data/uvs_demeter.json','w') as f:
    json.dump(uvs, f, indent=2)


