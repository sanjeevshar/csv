import mysql.connector
from mysql.connector import Error

DB_HOST = "localhost" # Or the IP address of your MySQL server
DB_PORT = 3306
DB_USER = "sanjeev"
DB_PASSWORD = "Password123!"
DB_NAME = "village_database"
query_file = 'query1.sql'

# Example query (not used since we read from file)
# Use query below for testing without file
SELECT_QUERY = "SELECT name, father_name, husband_name, age FROM voter_list_24 WHERE age > 90;"

def query_mysql_database(host_name, user_name, user_password, db_name, query):
    """Connects to MySQL and executes a query."""
    connection = None
    try:
        # 1. Establish the Connection
        connection = mysql.connector.connect(
            host=host_name,
            database=db_name,
            user=user_name,
            password=user_password
        )

        if connection.is_connected():
            # 2. Create a Cursor
            cursor = connection.cursor()

            # 3. Execute the Query
            cursor.execute(query)

            # 4. Fetch the Results
            # For SELECT queries, use fetchall(), fetchone(), or fetchmany()
            records = cursor.fetchall()
            print(f"Query executed successfully, results type: {type(records)}")
            print(f"Query: {query}")
            print(f"Total number of rows returned: {cursor.rowcount}")

            # Print column names (optional)
            column_names = [i[0] for i in cursor.description]
            print(column_names)

            # Print the data
            for row in records:
                print(row)

            # For INSERT, UPDATE, DELETE queries, commit changes
            # if not query.strip().upper().startswith("SELECT"):
            #     connection.commit()
            #     print(f"{cursor.rowcount} records affected.")


    except Error as e:
        print(f"Error while connecting to MySQL or executing query: {e}")

    finally:
        if connection is not None and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed.")

    return(records)
def fetch_query_from_file():
    """Reads a SQL query from a file."""
    with open(query_file, 'r') as file:
        query_list = file.readlines() 
    return query_list

query_mysql_database(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SELECT_QUERY)
# Call the function to run the querys from the file
query_list = fetch_query_from_file()
for query in query_list:
    #print(f"Executing query: {query}")
    res_records = query_mysql_database(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, query)