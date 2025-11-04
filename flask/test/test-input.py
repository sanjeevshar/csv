import requests
import json

# Flask server URL
SERVER_URL = "http://127.0.0.1:5000/submit"

def test_app():
    """
    Test script to send data to Flask app.
    Continues in loop until user enters 'x' for name.
    """
    print("=" * 50)
    print("User Input Test for Flask App")
    print("=" * 50)
    print("Enter 'x' for name to exit\n")
    
    while True:
        # Get name input
        name = input("Enter name: ").strip()
        
        # Check for exit condition
        if name.lower() == 'x':
            print("\nExiting... Goodbye!")
            break
        
        # Get age input
        try:
            age = input("Enter age: ").strip()
            age = int(age)
            
            if age < 1:
                print("❌ Age must be positive. Try again.\n")
                continue
                
        except ValueError:
            print("❌ Invalid age. Please enter a number.\n")
            continue
        
        # Prepare data
        data = {
            "name": name,
            "age": age
        }
        
        # Send POST request
        try:
            print(f"\nSending data: {data}")
            response = requests.post(
                SERVER_URL,
                headers={'Content-Type': 'application/json'},
                json=data,
                timeout=5
            )
            
            # Parse response
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                print(f"✅ {result.get('message')}")
            else:
                print(f"❌ Error: {result.get('message')}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Could not connect to Flask server.")
            print("   Make sure the Flask app is running on http://127.0.0.1:5000")
        except requests.exceptions.Timeout:
            print("❌ Request Timeout: Server took too long to respond.")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {str(e)}")
        except json.JSONDecodeError:
            print("❌ Invalid response from server.")
        
        print("-" * 50 + "\n")

if __name__ == "__main__":

    test_app()