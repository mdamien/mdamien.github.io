from flask import Flask, render_template
app = Flask(__name__)

from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

LANGUAGE = "french"
SENTENCES_COUNT = 20

def summary(text):
    parser = PlaintextParser.from_string(text, Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)

    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    for sentence in summarizer(parser.document, SENTENCES_COUNT):
        print(sentence)
        yield sentence

@app.route("/")
def hello():
    import json

    ALL = json.load(open('all.json'))

    courses = []
    for key in sorted(ALL.keys(), key=lambda x:int(x)):
        el = ALL[key]
        courses.append((key, el))
        el['sentences'] = []

        try:
            sugg = el.get("annotations",[])
            print("suggs",len(sugg))
            text = '\n\n'.join([s.get('content').get('description') for s in sugg])
            print("text",len(text))
            el['sentences'] = list(summary(text))
        except Exception as e:
            print(e)
    return render_template("index.html", courses=courses)

@app.route("/all/")
def all():
    import json

    ALL = json.load(open('all.json'))

    courses = []
    for key in sorted(ALL.keys(), key=lambda x:int(x)):
        el = ALL[key]
        courses.append((key, el))

        try:
            sugg = el.get("annotations",[])
            print("suggs",len(sugg))
        except Exception as e:
            el['annotations'] = []
    return render_template("all.html", courses=courses)

if __name__ == "__main__":
    app.run(debug=True,port=8000)


