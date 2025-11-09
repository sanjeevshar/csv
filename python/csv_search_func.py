import csv

def search_contact(filename, search_term):
    """
    Search for a contact in CSV file by name or phone number.
    
    Args:
        filename (str): Path to the CSV file
        search_term (str): Name or phone number to search for
    
    Returns:
        list: List of matching records as dictionaries, or empty list if no match found
    """
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


# Example usage:
if __name__ == "__main__":
    # Search by name
    results = search_contact('nick.csv', 'Nikhil')
    if results:
        for contact in results:
            print(f"Name: {contact['name']}")
            print(f"Phone: {contact['phone']}")
            print(f"Email: {contact['email']}")
            print("-" * 40)
    else:
        print("No contacts found.")
    
    # Search by phone number
    print("\nSearching by phone number:")
    results = search_contact('nick.csv', '9534422311')
    if results:
        for contact in results:
            print(f"Name: {contact['name']}")
            print(f"Phone: {contact['phone']}")
            print(f"Email: {contact['email']}")
    else:
        print("No contacts found.")
