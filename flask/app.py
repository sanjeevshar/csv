from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import csv
import os
from datetime import datetime
PORT = 5060
app = Flask(__name__)
CORS(app)

# CSV file path
CSV_FILE = 'user_data.csv'

# Initialize CSV file with headers if it doesn't exist
def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Name', 'Age', 'Timestamp'])

#@app.route('/')
#def index():
#    return render_template('index.html')
#
@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        age = data.get('age', '')
        print(f"Received data: {data}")
        # Validate inputs
        if not name:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        
        if not age or int(age) < 1:
            return jsonify({'success': False, 'message': 'Valid age is required'}), 400
        
        # Save to CSV
        timestamp = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
        with open(CSV_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([name, age, timestamp])
            print(f"Wrote data : {name}, {age}, {timestamp} to {CSV_FILE}")
        return jsonify({
            'success': True, 
            'message': f'Data saved successfully! Name: {name}, Age: {age} to file {CSV_FILE}'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    #Create CSV file if it doesn't exist
    init_csv()
    #Listen on all interfaces and port 5060
    app.run(debug=True, host='0.0.0.0', port=PORT)