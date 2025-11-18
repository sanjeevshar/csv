import csv
import utils # Ours
from utils import DATA_FILE

phone_book = DATA_FILE

# Main program, run search until user exits
if __name__ == "__main__":
    name = ""
    while name != "x":
        # Search by name
        name = input("Enter name or phone number to search in (x to exit): ")
        if name == "x":
            break
        results = utils.search_contact(phone_book, name)
        if results:
            for contact in results:
                    print(f"Name: {contact['name']}")
                    print(f"Phone: {contact['phone']}")
                    print(f"Email: {contact['email']}")
                    print("-" * 40)
        else:
            print(f"No contacts found for '{name}' in file: {phone_book}.")