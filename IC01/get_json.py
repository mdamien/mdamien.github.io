import requests

ALL = {}

for line in open('urls_json'):
    n, url = line.strip().split(":",1)
    r = requests.get(url.strip())
    print(n,len(r.text))
    ALL[n] = r.json()

import json
json.dump(ALL, open('all.json','w'),indent=2)