import json

uvs_rentree = json.load(open('data/uvs_rentree.json'))
uvs_ratings_uvweb = json.load(open('data/uvs_ratings_uvweb.json'))
uvs_demeter = json.load(open('data/uvs_demeter.json'))
uvs_schedules = json.load(open('data/uvs_schedules.json'))

UVs = uvs_rentree
for uv in UVs:
    uv['times'] = uvs_schedules[uv['name']]

    rating = None
    for uvweb_uv in uvs_ratings_uvweb:
        if uvweb_uv['uv'] == uv['name']:
            rating = float(uvweb_uv['note'].replace(',','.'))
    uv['uvweb_rating'] = rating

    uv.update(uvs_demeter.get(uv['name'], {}))

cats = set()
for uv in UVs:
    for cat in uv.get('categories',[]):
        cats.add(cat)

with open('data/uvs.json','w') as f:
    json.dump(UVs, f, indent=2)

with open('data/uvs.js','w') as f:
    f.write('__UVS__ = '+json.dumps(UVs, indent=2))
    f.write('\n\n')
    f.write('__CATEGORIES__ ='+json.dumps(list(sorted(list(cats)))))
