import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
#import mysql.connector
#from mysql.connector import Error
from datetime import datetime
import os
import utils # Written by us
#from utils import DATA_FILE #name of the data file in csv format
DATA_FILE = 'phone_book2.csv'  # ← Change this to use a different table
PORT = 5050

app = Flask(__name__)
CORS(app)

# Table name configuration
CSV_FILE = DATA_FILE
# Initialize CSV file with headers if it doesn't exist
def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'phone', 'email','class','school'])  # Add more headers as needed
        print(f"Initialized new CSV file: {CSV_FILE}")
    else:
        print(f"CSV file already exists: {CSV_FILE}")

@app.route('/submit', methods=['POST'])
def submit_data():
    try:
        data = request.get_json()
        for key, value in data.items():
            data[key] = value.strip()
            #print(f"Key: {key}, Value: {value.strip()}")
            #print list values
        print(list(data.values()))
        #print(f"Received data: {data}") 
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        #timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        if (not phone) and (not email):
            return jsonify({
                'success': False,
                'message': 'phone or email are required Bhai!'
            }), 400
        with open(CSV_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(data.values())
            print(f"Appended data to CSV: {list(data.values())}")
        return jsonify({
            'success': True,
            'message': 'Data saved successfully'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/search', methods=['POST'])
def search_csv():
    print(f"Received POST search") 
    data = request.get_json()
    print(f"Received data for search: {data}") 
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    if (not phone) and (not email) and (not name):
        return jsonify({
        'success': False,
        'message': 'Name or phone or email is required Bhai!'
        }), 400
    if name:
         search_term = name
    elif phone:
         search_term = phone
    else:
         search_term = email
    results = utils.search_contact(CSV_FILE, search_term)
    if results:
        print(f"Received search results: {results}") 
        return jsonify({
        'success': True,
        'message': results
        }), 201
    else:
        return jsonify({
            'success': False,
            'message': f'No details found for {name} in file: {CSV_FILE}.'
        }), 404
    
if __name__ == '__main__':
    init_csv()
    #app.run(debug=True, port=5050)
    app.run(debug=True, host='0.0.0.0', port=PORT)