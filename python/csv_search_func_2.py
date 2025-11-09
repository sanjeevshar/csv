import csv

def search_contact(filename, search_term):
    """
    Search for a contact in CSV file by name or phone number.
    Requires CSV file to have a header row.
    
    Args:
        filename (str): Path to the CSV file with header row
        search_term (str): Name or phone number to search for
    
    Returns:
        list: List of matching records as dictionaries, or empty list if no match found
    """
    results = []
    search_term = str(search_term).strip().lower()
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                name = row.get('name', '')
                phone = row.get('phone', '')
                
                # Check if search term matches name or phone
                if search_term in name.lower() or search_term in str(phone):
                    results.append(dict(row))
        
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
    print("Searching for 'Bill':")
    results = search_contact('phone_book2.csv', 'Bill')
    if results:
        for contact in results:
            print(f"Found: {contact}")
            print("-" * 40)
    else:
        print("No contacts found.")
    
    # Search by phone number
    print("\nSearching by phone number:")
    results = search_contact('phone_book2.csv', '1234567890')
    if results:
        for contact in results:
            print(f"Found: {contact}")
    else:
        print("No contacts found.")
