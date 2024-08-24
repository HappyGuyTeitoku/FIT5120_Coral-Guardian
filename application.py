from flask import Flask, render_template # type: ignore
import sqlite3

application = Flask(__name__)
DATABASE = 'database.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@application.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@application.route('/')
def index():
    return 'Welcome to flask app'

@application.route('/testpage')
def testpage():
    return render_template('testpage.html')

def init_db():
    with sqlite3.connect(DATABASE) as db:
        with open('schema.sql', 'r') as f:
            sql = f.read()
        db.executescript(sql)

if __name__ == "__main__":
    application.run(host='0.0.0.0',port=80)
