from flask import Flask, render_template, g, request
import sqlite3
import os
import click

# Database tutorial https://www.youtube.com/watch?v=tPxUSWTvZAs

application = Flask(__name__)
DATABASE = 'water_monitor.db'

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
    return render_template('homepage.html')

@application.route('/testpage')
def testpage():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM your_table")
    rows = cursor.fetchall()
    conn.close()
    return render_template('testpage.html', rows=rows)

@application.route('/testpage-copy')
def testpagecopy():
    return render_template('testpage-copy.html')

@application.cli.command('initdb')
def init_db_command():
    """Create the database tables."""
    with sqlite3.connect(DATABASE) as db:
        with open('schema.sql', 'r') as f:
            sql = f.read()
        db.executescript(sql)
    click.echo('Initialized the database.')

if __name__ == "__main__":
    application.run(host='0.0.0.0', port=80, debug=True)
