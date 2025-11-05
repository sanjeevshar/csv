// Configuration
const API_HOST = '127.0.0.1';
const API_PORT = '5050';
const API_URL = `http://${API_HOST}:${API_PORT}`;

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, age })
        });
        
        const data = await response.json();
        
        messageDiv.className = 'message ' + (data.success ? 'success' : 'error');
        messageDiv.textContent = data.message;
        messageDiv.style.display = 'block';
        
        if (data.success) {
            document.getElementById('userForm').reset();
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 4000);
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Connection error: ' + error.message;
        messageDiv.style.display = 'block';
    }
});