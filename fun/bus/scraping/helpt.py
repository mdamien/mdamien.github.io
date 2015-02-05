import json
import time
import requests
from bs4 import BeautifulSoup

PROXY = False

def down(url):
    global PROXY
    proxies = None
    if PROXY:
        proxies = {
            "http": "http://proxyweb.utc.fr:3128",
            "https": "http://proxyweb.utc.fr:3128",
        }
    r = requests.get(url, proxies=proxies, headers={'referer': 'http://localhost:8000/ic05_is_fun'})
    return r

def store(x,loc):
    open('data/'+loc+'.json','w').write(json.dumps(x, indent=4))
