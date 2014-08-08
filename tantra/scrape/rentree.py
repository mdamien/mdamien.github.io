import json

uvs = []
for line in open('scrapa/fra1.html'):
    if "Javascript:setButton" in line:
        yellow = 'yellow' in line
        i = line.find('_') 
        j = line.find('_', i+1)
        uv = line[i+1:j] 
        if uv:
            print(yellow, uv)
            uvs.append({
                'name':uv,
                'restricted': yellow
            })

with open('data/uvs_rentree.json','w') as f:
    json.dump(uvs, f, indent=2)
