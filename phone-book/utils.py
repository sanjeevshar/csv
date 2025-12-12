#Collections of functions used by quiz program
import csv
import time
import sys
import os

def search_contact(filename, search_term):
    results = []
    search_term = str(search_term).strip().lower()
    success = False
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            print(f"Reading file: {filename} for search term: {search_term}")
            csv_reader = csv.reader(file)
            
            for row in csv_reader:
                if len(row) >= 3:  # Ensure row has enough columns
                    name, phone, email  = row[0], row[1], row[2]
            
                    # Check if search term matches name or phone
                    if (search_term in name.lower()) or (search_term in phone) or (search_term in email.lower()):
                        print(f"Found match: {name}, {phone}, {email}")
                        results.append({
                            'name': name,
                            'phone': phone,
                            'email': email
                        })
                        success = True
        if not success:
            return []
        else:
            return results
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        return []
    except Exception as e:
        print(f"Error reading file: {e}")
        return []