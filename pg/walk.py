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
    print(filename)
    soup = BeautifulSoup(open(filename))
    soup.prettify()

    title = soup.title.text
    print("<h1>"+title+"</h1>")

    text = soup.find('table').find_all('td')[3].text
    print("<p>"+text.replace('\n','<br/>')+"<p>")
    print("<p class='breakhere'></p>")
    import pdb;pdb.set_trace()

files = list(glob.glob('articles/*'))
import random
random.shuffle(files)

files = ['articles/2b843b9c378e2195b23f37470ba7e9f4507daaec-http---www-paulgraham-com-indylangs-html']

for filename in files:
    parse(filename)
    break