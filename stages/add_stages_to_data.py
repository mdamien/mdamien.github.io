import json, html

stages = json.load(open('stages.json'))
data = json.load(open('data.json'))

stages = list(stages.items())

for id, stage in stages:
    stage['branche'] = stage['branche'].replace('\n','')

companies = {}
for id, stage in stages:
    name = stage['company']
    if name not in companies:
        companies[name] = []
    companies[name].append(stage)

for node in data['nodes']:
    node['attributes']['stages'] = ''.join('<div class="stage"><h3>' \
        +stage['sujet']+'</h3>' \
        +html.escape(stage['description'][:300])+'...' \
        +'</div>' \
        for stage in companies.get(node['label'],[]))

json.dump(data, open('data2.json','w'), indent=2)