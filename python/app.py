from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
# from config import DB_CONFIG, TABLE_NAME  # Import from config if you have a separate config file
# We will use this method later to separate configuration from the main application code for better maintainability.
# Initialize Flask app and enable CORS to allow cross-origin requests from the frontend

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': '192.168.0.23',
    'database': 'village_database',
    'user': 'sanjeev',
    'password': 'Password123!'
}

# Table name configuration
TABLE_NAME = 'phone_book'  # ← Change this to use a different table

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        print(f"Check MySQL server status and credentials. Ensure that the MySQL server is running and accessible at {DB_CONFIG['host']} with the provided username and password.")
        return None

@app.route('/submit', methods=['POST'])
def submit_data():
    try:
        data = request.get_json()
        print(f"Received data: {data}") 
        if not data.get('name') or not data.get('email'):
            return jsonify({
                'success': False,
                'message': 'Name and email are required'
            }), 400
        
        connection = get_db_connection()
        if connection is None:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        cursor = connection.cursor()
        query = f"""
            INSERT INTO {TABLE_NAME} (name, email, phone)
            VALUES (%s, %s, %s)
        """
        values = (
            data.get('name'),
            data.get('email'),
            data.get('phone', '')
        )
        
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': 'Data saved successfully'
        }), 201
        
    except Error as e:
        return jsonify({
            'success': False,
            'message': f'Database error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    #app.run(debug=True, port=5050)
    app.run(debug=True, host='0.0.0.0', port=5050)