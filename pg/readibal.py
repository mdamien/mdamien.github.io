from __future__ import unicode_literals, print_function
from readability.readability import Document

import re
from bs4 import BeautifulSoup
import glob

HTML_OUT = True

if HTML_OUT:
    print("""
        <style>
        body{
            font-family: arial;
            margin:40px auto; max-width:650px;
            line-height:1.6; font-size:18px;
            color:#222; padding:0 10px
        }
        h1,h2,h3{line-height:1.2}
        .breakhere {page-break-before: always}
        </style>
    """)

def parse(filename):
    html = open(filename, encoding="latin").read()
    doc = Document(html)
    summary = doc.summary()
    summary = re.sub('(<map.*?</map>)','', summary, re.M)
    summary = re.sub(r"<img.*?usemap=.*?>",'', summary, re.M)
    summary = re.sub(r'<a href="index.html"><img.*?/></a>','', summary, re.M)
    if 'href="index.html"' in summary:
        raise Exception("FAIIILEEED")

    print("<small>"+doc.short_title()+"</small>")
    print("<p>"+summary+"<p>")
    print("<p class='breakhere'></p>")

files = list(glob.glob('articles/*'))
import random
random.shuffle(files)

#files = ['articles/2b843b9c378e2195b23f37470ba7e9f4507daaec-http---www-paulgraham-com-indylangs-html']

for filename in files:
    parse(filename)