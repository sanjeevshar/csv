import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
# from config import DB_CONFIG, TABLE_NAME  # Import from config if you have a separate config file
# We will use this method later to separate configuration from the main application code for better maintainability.
# Initialize Flask app and enable CORS to allow cross-origin requests from the frontend

app = Flask(__name__)
CORS(app)


PORT = 5050

# Table name configuration
CSV_FILE = 'phone_book2.csv'  # ← Change this to use a different table
# Initialize CSV file with headers if it doesn't exist
def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'phone', 'email','Timestamp'])

@app.route('/submit', methods=['POST'])
def submit_data():
    try:
        data = request.get_json()
        print(f"Received data: {data}") 
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        if (not phone) and (not email):
            return jsonify({
                'success': False,
                'message': 'phone or email are required Bhai!'
            }), 400
        with open(CSV_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([name, phone, email, timestamp])
            print(f"Wrote data : {name}, {phone}, {email}, {timestamp} to {CSV_FILE}")
        return jsonify({
            'success': True,
            'message': 'Data saved successfully'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    init_csv()
    #app.run(debug=True, port=5050)
    app.run(debug=True, host='0.0.0.0', port=PORT)