import csv
import utils # Ours

data_files = ['phone_book1.csv', 'phone_book2.csv']

# Main program, run search until user exits
def search():
    name = ""
    while name != "x":
        # Search by name
        found = False
        print("\n")
        name = input("Enter name or phone number to search in (x to exit): ")
        if name == "x":
            break
        print("=" * 40)
        for data_file in data_files:
            results = utils.search_contact(data_file, name)
            if results:
                found = True
                print(f"Contacts found for '{name}' in file: {data_file}.")
                for contact in results:
                    print(f"Name: {contact['name']}")
                    print(f"Phone: {contact['phone']}")
                    print(f"Email: {contact['email']}")
                    print("=" * 40)
        
    if not found:
        print(f"No contacts found for '{name}' in any file.")
        found = False
if __name__ == "__main__":
    search()        