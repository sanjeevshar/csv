import csv
import utils # Ours
from utils import DATA_FILE1
from utils import DATA_FILE2

# Main program, run search until user exits
if __name__ == "__main__":
    name = ""
    while name != "x":
        # Search by name
        name = input("Enter name or phone number to search in (x to exit): ")
        if name == "x":
            break
        print("=" * 40)
        results = utils.search_contact(DATA_FILE1, name)
        if results:
            print(f"Contacts found for '{name}' in file: {DATA_FILE1}.")
            for contact in results:
                    print(f"Name: {contact['name']}")
                    print(f"Phone: {contact['phone']}")
                    print(f"Email: {contact['email']}")
                    print("=" * 40)
        else:
            print(f"No contacts found for '{name}' in file: {phone_book}.")
        
        results = utils.search_contact(DATA_FILE2, name)
        if results:
            print(f"Contacts found for '{name}' in file: {DATA_FILE2}.")
            for contact in results:
                    print(f"Name: {contact['name']}")
                    print(f"Phone: {contact['phone']}")
                    print(f"Email: {contact['email']}")
                    print("-" * 40)
        else:
            print(f"No contacts found for '{name}' in file: {phone_book}.")
            