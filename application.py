from flask import Flask, request, render_template, redirect, url_for, session, g, jsonify
import sqlite3
import os
import click
import csv
import requests
import logging

# Database tutorial https://www.youtube.com/watch?v=tPxUSWTvZAs

application = Flask(__name__)
DATABASE = 'water_monitor.db'
DATABASE_IT3 = 'database.db'

# Define your secret password
PASSWORD = 'Caffeine3'
# Necessary for session management
application.secret_key = 'your_secret_key'  

# Set the logging level to DEBUG
logging.basicConfig(level=logging.DEBUG)

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
        db = g._database = sqlite3.connect(DATABASE_IT3)
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
#     cursor.execute("SELECT * FROM Phosphate_Free_Detergent_Register")
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

# Route to Education Hub
@application.route('/learn-more')
def learnmore():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('education.html', event_schedule_data = event_schedule_data)

# Unused page for Detox Your Home events on a map
@application.route('/disposal-facilities')
def disposalfacility():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('disposalfacilitymap.html',event_schedule_data = event_schedule_data)

# OLD WATER QUALITY MAP
@application.route('/water-quality-map-old')
def waterqualitymap_OLD():
    return render_template('waterqualitymap.html')
# NEW WATER QUALITY MAP
@application.route('/water-quality-map')
def waterqualitymap():
    return render_template('waterQuality.html')

# OLD FISH MAP
@application.route('/fish-explorer-old')
def fishexplorer_OLD():
    return render_template('fishexplorer.html')
# NEW FISH MAP
@application.route('/fish-explorer')
def fishexplorer():
    return render_template('fishMap.html')

# Route to Product Search Page (Keyword and barcode search)
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
            # logging.debug("Barcode Response: %s\nEnd of message", response.json())
        elif keyword:
            response = requests.get(keyword_url, headers={'User-Agent': userAgent})
            # logging.debug("Wordsearch Response: %s\nEnd of message", response.json())
        else:
            return jsonify({'message': 'No barcode or keyword provided'}), 400

        # Get the response data if request was successful
        if response.status_code == 200:
            external_data = response.json()  # Assuming the response is in JSON format
            if barcode:
                return jsonify({'message': 'Search successful', 'data': external_data, 'searchtype':'barcode'})
            elif keyword:
                return jsonify({'message': 'Search successful', 'data': external_data, 'searchtype':'keyword'})
            else:
                return jsonify({'message': 'No barcode or keyword provided'}), 400
        else:
            return jsonify({'message': 'Error fetching data from API', 'status_code': response.status_code}), 500

    return render_template('product_lookup.html')

# Route to NP Calculator
# POST requests will always return pfdr data of the laundry and dishwashing category
@application.route('/NP-Calculator', methods=['GET', 'POST'])
def npcalculator():
    if request.method == 'POST':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Phosphate_Free_Detergent_Register WHERE prod_cat = 'Dishwashing' ")
        rows_dishwashing = cursor.fetchall()
        resultrows_dishwashing = [dict(zip([column[0] for column in cursor.description], row)) for row in rows_dishwashing]
        cursor.execute("SELECT * FROM Phosphate_Free_Detergent_Register WHERE prod_cat = 'Laundry' ")
        rows_laundry = cursor.fetchall()
        resultrows_laundry = [dict(zip([column[0] for column in cursor.description], row)) for row in rows_laundry]
        return jsonify({'message': 'Search successful', 'data_dishwashing': resultrows_dishwashing, 'data_laundry': resultrows_laundry})
    return render_template('npcalculator.html')

# Route to Privacy Policy page
@application.route('/privacy-policy')
def privacypolicy():
    return render_template('privacypolicy.html')

# Route to PFDR
@application.route('/p-free-detergent-register', methods=['GET', 'POST'])
def p_free_detergent_register():
    rows = []
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Phosphate_Free_Detergent_Register")
    rows = cursor.fetchall()
    resultrows = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
    
    if request.method == 'POST':
        data = request.json
        categories = data.get('categories',[])
        if categories:
            query_placeholder = ', '.join('?' for _ in categories)
            cursor.execute(f"SELECT * FROM Phosphate_Free_Detergent_Register WHERE prod_cat IN ({query_placeholder})", categories)
            rows = cursor.fetchall()
            resultrows = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

            return jsonify({'message': 'Search successful', 'data': resultrows})
    # Render the template and pass rows as a variable to the frontend
    return render_template('p-free-detergent-register.html', rows=resultrows)

# Route to quiz page
@application.route('/quiz')
def takeAQuiz():
    return render_template('quiz.html')

# OLD TEST CODE
#Create the test database table
@application.cli.command('initdb')
def init_db_command():
    with sqlite3.connect(DATABASE) as db:
        with open('datasets/schema.sql', 'r') as f:
            sql = f.read()
        db.executescript(sql)
    click.echo('Initialized the database.')

# Create the Phosphate Free Detergent Register Table in database.db
@application.cli.command('initdb_it3')
def init_db_it3_command():
    with sqlite3.connect(DATABASE_IT3) as db:
        with open('datasets/IT3_pfree_detergent_register.sql','r') as file:
            sql = file.read()
        db.executescript(sql)
    click.echo('Initialized the database with P-Free Detergent Register')



# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 1 historic pages Routing and code
# *** DO NOT TOUCH THIS CODE ***
# ----- ----- ----- ----- ----- ----- ----- ----- 
@application.route('/iteration1/')
def index_it1():
    return render_template('iteration1/iteration1_homepage.html')
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration1/learn-more')
def learnmore_it1():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('iteration1/iteration1_education.html', event_schedule_data = event_schedule_data)
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration1/water-quality-map')
def waterqualitymap_it1():
    return render_template('iteration1/iteration1_waterqualitymap.html')
# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 1 historic pages Routing and code
# *** DO NOT TOUCH THIS CODE ***
# ----- ----- ----- ----- ----- ----- ----- ----- 

# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 2 historic pages Routing and code
# *** DO NOT TOUCH THIS CODE ***
# ----- ----- ----- ----- ----- ----- ----- ----- 
@application.route('/iteration2/')
def index_it2():
    return render_template('iteration2/iteration2_homepage.html')
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration2/learn-more')
def learnmore_it2():
    event_schedule_data = []
    with open('datasets/Detox_Your_Home_event_schedule.csv', 'r') as event_schedule:
        csv_reader = csv.reader(event_schedule)
        for row in csv_reader:
            event_schedule_data.append(row)
    return render_template('iteration2/iteration2_education.html', event_schedule_data = event_schedule_data)
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration2/water-quality-map')
def waterqualitymap_it2():
    return render_template('iteration2/iteration2_waterqualitymap.html')
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration2/fish-explorer')
def fishexplorer_it2():
    return render_template('iteration2/iteration2_fishexplorer.html')
# *** DO NOT TOUCH THIS CODE ***
@application.route('/iteration2/product-search', methods=['GET', 'POST'])
def productsearch_it2():
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
            logging.debug("Barcode Response: %s\nEnd of message", response.json())
        elif keyword:
            response = requests.get(keyword_url, headers={'User-Agent': userAgent})
            logging.debug("Wordsearch Response: %s\nEnd of message", response.json())
        else:
            return jsonify({'message': 'No barcode or keyword provided'}), 400

        # Get the response data if request was successful
        if response.status_code == 200:
            external_data = response.json()  # Assuming the response is in JSON format
            return jsonify({'message': 'Search successful', 'data': external_data})
        else:
            return jsonify({'message': 'Error fetching data from API', 'status_code': response.status_code}), 500

    return render_template('iteration2/iteration2_product_lookup.html')
# *** DO NOT TOUCH THIS CODE ***

# ----- ----- ----- ----- ----- ----- ----- ----- 
# Iteration 2 historic pages Routing and code
# *** DO NOT TOUCH THIS CODE ***
# ----- ----- ----- ----- ----- ----- ----- ----- 



if __name__ == "__main__":
    application.run(host='0.0.0.0', port=80, debug=True)