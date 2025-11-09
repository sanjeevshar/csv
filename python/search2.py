import csv

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


# Example usage:
if __name__ == "__main__":
    while True:
        # Search by name
        name = input("Enter name or phone number to search: ")
        results = search_contact('phone_book2.csv', name)
        if results:
            for contact in results:
                    print(f"Name: {contact['name']}")
                    print(f"Phone: {contact['phone']}")
                    print(f"Email: {contact['email']}")
                    print("-" * 40)
        else:
            print("No contacts found.")