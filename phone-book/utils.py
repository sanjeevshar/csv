#Collections of functions used by quiz program
import csv
import time
import sys
import os

DATA_FILE = "phone_book2.csv"

def search_contact(filename, search_term):
    results = []
    search_term = str(search_term).strip().lower()
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            
            for row in csv_reader:
                if len(row) >= 4:  # Ensure row has enough columns
                    name, phone, email  = row[0], row[1], row[2]
                    
                    # Check if search term matches name or phone
                    if (search_term in name.lower() or 
                        search_term in phone):
                        
                        results.append({
                            'name': name,
                            'phone': phone,
                            'email': email
                        })
        return results
    
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        return []
    except Exception as e:
        print(f"Error reading file: {e}")
        return []