
import csv
pass_marks = 40
passed = 0
failed = 0
total_marks = 0
student_data = []
data_file = 'voter_list_csv.csv'


    

def print_menu():
    print("\n")
    print("Welcome to Naichana Information System")
    print("=====================================\n")
    print("Please select an option:")
    print("1. Get list of Passed Students")
    print("2. Get list of Failed Students")
    print("3. Get Topper's Name")
    print("4. Get Average Marks")

    print("\n0. Exit")
    #print("\n")
    print("=====================================")
    choice = input("Enter your choice (0-4): ")
    print("\n")
    return choice

def read_csv_file(file_name):
    student_data = []
    try:
        with open(file_name, 'r') as csvfile:
            # Create a reader object
            csv_reader = csv.reader(csvfile)
            for row in csv_reader:
                student_data.append(row)
    except Exception as e:
        print(f"Error reading {file_name}: {e}")
    
    return student_data


def get_passed(student_data):
    global passed_students
    passed_students = []
    for row in student_data:
        # Access each element in the row
        marks = int(row[2])
        if marks >= pass_marks:
            #print(f"Student {row[0]} with marks {marks} has passed.")
            passed_students.append(row)
    return passed_students

def get_failed(student_data):
    global failed_students
    failed_students = []
    for row in student_data:
        # Access each element in the row
        marks = int(row[2])
        if marks < pass_marks:
            print(f"Student {row[0]} with marks {marks} has failed.")
            failed_students.append(row)
    return failed_students

def write_to_file(file_name, data):
    with open(file_name, 'w') as file:
        writer = csv.writer(file)
        for row in data:
            writer.writerow(row)

################################################################################

#Main program
## Read the CSV file
student_data = read_csv_file(marks_file)
print(f"Total Students: {len(student_data)}")

#Print Menu and process options
while True:
    choice = print_menu()
        
    if choice == "1":
        pass_list = get_passed(student_data)
        print(f"Total Passed Students: {len(pass_list)}")
        write_to_file('passed_students.csv', pass_list)
        print(f"Passed students have been written to 'passed_students.csv'.")
    elif choice == "2":
        failed_list = get_failed(student_data)
        print(f"Total Passed Students: {len(failed_list)}")
        write_to_file('failed_students.csv', failed_list)
        print(f"Failed students have been written to 'failed_students.csv'.")


    elif choice == "0":
        print("Goodbye!")
        break
    else:
        print(f"Invalid choice: {choice}  Please try again with valid choices 0 to 4.\n")