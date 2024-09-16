from flask import Flask, request, render_template, redirect, url_for, session, g, jsonify
import sqlite3
import os
import click
import csv
import requests

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
# This login page is also shared with iteration snapshots.
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

# OLD CODE FOR TESTING FLASK AND DATABASE CONNECTIONS
#
# @application.route('/testpage')
# def testpage():
#     conn = get_db()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM your_table")
#     rows = cursor.fetchall()
#     conn.close()
#     return render_template('testpage.html', rows=rows)
#
# @application.route('/testpage-copy')
# def testpagecopy():
#     return render_template('testpage-copy.html')

# Route as placeholder, changed the name so its easier for programmers to understand
@application.route('/placeholder')
def placeholder():
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

@application.route('/fish-explorer')
def fishexplorer():
    return render_template('fishexplorer.html')

@application.route('/product-search', methods=['GET', 'POST'])
def productsearch():
    if request.method == 'POST':
        data_from_client = request.get_json()
        barcode = data_from_client.get('barcode')
        keyword = data_from_client.get('keyword')
        barcode_url = data_from_client.get('barcode_url')
        keyword_url = data_from_client.get('keyword_url')
        userAgent = data_from_client.get('userAgent')

        # Flask make the request to OpenFoodFacts on behalf of client
        if barcode:
            response = requests.get(barcode_url, headers={'User-Agent': userAgent})
        elif keyword:
            response = requests.get(keyword_url, headers={'User-Agent': userAgent})
        else:
            return jsonify({'message': 'No barcode or keyword provided'}), 400

        # Get the response data if request was successful
        if response.status_code == 200:
            external_data = response.json()  # Assuming the response is in JSON format
            return jsonify({'message': 'Search successful', 'data': external_data})
        else:
            return jsonify({'message': 'Error fetching data from API', 'status_code': response.status_code}), 500

    return render_template('product_lookup.html')

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

# @application.route('/iteration1/product_lookup')
# def product_lookup():
#     return render_template('iteration1/iteration1_product_lookup.html')

# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 1 historic pages Routing and code
# ----- ----- ----- ----- ----- ----- ----- ----- 



if __name__ == "__main__":
    application.run(host='0.0.0.0', port=80, debug=True)