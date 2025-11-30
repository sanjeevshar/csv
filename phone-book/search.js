// Configuration
const API_HOST = '127.0.0.1';
const API_PORT = '5050';
const API_URL = `http://${API_HOST}:${API_PORT}`;

// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const searchName = document.getElementById('searchName').value.trim();
    const resultsDiv = document.getElementById('results');
                
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    const msgEl = document.getElementById('responseMessage');


    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: searchName })
        });
        
        const data = await response.json(); 
        
        if (data.success) {
                msgEl.className = 'message success';
                const jsonText = JSON.stringify(data.message, null, 2);
                msgEl.textContent = 'Found: ' + jsonText;
                this.reset();
      
        } else {
            msgEl.className = 'message error';
            msgEl.textContent = data.message;
        }
        msgEl.style.display = 'block';
    } catch (error) {
        resultsDiv.innerHTML = '<div class="message error">Connection error: ' + escapeHtml(error.message) + '</div>';
    }
});

// Helper function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}