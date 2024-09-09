from flask import Flask, request, render_template, redirect, url_for, session, g
import sqlite3
import os
import click
import csv

# Database tutorial https://www.youtube.com/watch?v=tPxUSWTvZAs

application = Flask(__name__)
DATABASE = 'water_monitor.db'

# Define your secret password
PASSWORD = 'Caffeine3'
# Necessary for session management
application.secret_key = 'your_secret_key'  

# The password page users get auto-redirected to without logging in with a password
@application.route('/password', methods=['GET', 'POST'])
def password():
    error = "Please enter the password to access the TP13 website"
    if request.method == 'POST':
        entered_password = request.form['password']
        if entered_password == PASSWORD:
            session['authenticated'] = True
            return redirect(session.get('next') or url_for('index'))
        else:
            error = "Incorrect password"
    return render_template('password.html', error=error)

# Before any GET request is processed, check if user is logged in
# If not, bring user to login page
@application.before_request
def require_password():
    if request.endpoint == 'static' or request.path == '/favicon.ico':
        return  # Allow requests for static files and favicon
    if not session.get('authenticated'): # If the user is not authenticated
        if request.endpoint != 'password' and request.endpoint != 'static':
            # Only store the 'next' URL if it's not '/favicon.ico'
            if request.path != '/favicon.ico':  # Avoid storing favicon requests
                session['next'] = request.url  # Store the URL the user was trying to access
            return redirect(url_for('password'))

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

@application.route('/learn-more')
def learnmore():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('education.html', event_schedule_data = event_schedule_data)

@application.route('/disposal-facilities')
def disposalfacility():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('disposalfacilitymap.html',event_schedule_data = event_schedule_data)

@application.route('/water-quality-map')
def waterqualitymap():
    return render_template('waterqualitymap.html')

@application.cli.command('initdb')
def init_db_command():
    """Create the database tables."""
    with sqlite3.connect(DATABASE) as db:
        with open('schema.sql', 'r') as f:
            sql = f.read()
        db.executescript(sql)
    click.echo('Initialized the database.')


# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 1 historic pages Routing and code
# ----- ----- ----- ----- ----- ----- ----- ----- 
@application.route('/iteration1/')
def index_it1():
    return render_template('iteration1/iteration1_homepage.html')

@application.route('/iteration1/learn-more')
def learnmore_it1():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('iteration1/iteration1_education.html', event_schedule_data = event_schedule_data)

@application.route('/iteration1/water-quality-map')
def waterqualitymap_it1():
    return render_template('iteration1/iteration1_waterqualitymap.html')
# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 1 historic pages Routing and code
# ----- ----- ----- ----- ----- ----- ----- ----- 



if __name__ == "__main__":
    application.run(host='0.0.0.0', port=80, debug=True)