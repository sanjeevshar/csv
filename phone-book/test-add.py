import requests

data = {
    "name": "User1",
    "email": "test@example.com",
    "phone": "1234567890",
    "address": "123 Test St, Test City, TX"
}

response = requests.post('http://192.168.0.23:5050/submit', json=data)
print(response.json())