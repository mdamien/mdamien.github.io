from flask import Flask, render_template
from flask import Response
app = Flask(__name__)

from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

LANGUAGE = "french"
SENTENCES_COUNT = 20

def summary(text, summarizer_class):
    parser = PlaintextParser.from_string(text, Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)

    summarizer = summarizer_class(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    for sentence in summarizer(parser.document, SENTENCES_COUNT):
        print(sentence)
        yield sentence

def yield_me_some_courses(summarizer):
    import json

    ALL = json.load(open('all.json'))

    for key in sorted(ALL.keys(), key=lambda x:int(x)):
        el = ALL[key]
        el['sentences'] = []

        try:
            sugg = el.get("annotations",[])
            print("suggs",len(sugg))
            text = '\n\n'.join([s.get('content').get('description') for s in sugg])
            print("text",len(text))
            el['sentences'] = list(summary(text, summarizer))
        except Exception as e:
            print(e)
        yield (key, el)


def stream_template(template_name, **context):
    app.update_template_context(context)
    t = app.jinja_env.get_template(template_name)
    rv = t.stream(context)
    rv.enable_buffering(5)
    return rv

@app.route("/")
def hello():
    return Response(stream_template('index.html', courses=yield_me_some_courses(summarizer=LsaSummarizer)))

@app.route("/text")
def textrank():
    return Response(stream_template('index.html',
            courses=yield_me_some_courses(summarizer=TextRankSummarizer)))


@app.route("/lex")
def lexrank():
    return Response(stream_template('index.html', courses=yield_me_some_courses(summarizer=LexRankSummarizer)))


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


