import requests
name = input("Enter name or phone number to search: ")
data = {
    "name": name,
    "email": "test@example.com",
    "phone": "1234567890",
    "address": "123 Test St, Test City, TX"
}

response = requests.get('http://localhost:5050/search', json=data)
#print(response.json())
print(response.status_code)
print(response.text)