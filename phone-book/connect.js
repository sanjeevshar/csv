// Configuration
const API_HOST = '127.0.0.1';
const API_PORT = '5050';
const API_URL = `http://${API_HOST}:${API_PORT}`;

// School options for dropdown
// NOT USED CURRENTLY

const schools = [
    { value: "sa", name: "School A" },
    { value: "sb", name: "School B" }
];

// Populate school dropdown
//const schoolSelect = document.getElementById('school');
//schools.forEach(school => {
  //  const option = document.createElement('option');
    //option.value = school.value;
    //option.textContent = school.name;
    //schoolSelect.appendChild(option);
//});

// Form submission handler

        document.getElementById('dataForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            const msgEl = document.getElementById('responseMessage');
            
            try {
                const response = await fetch(`${API_URL}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    msgEl.className = 'message success';
                    msgEl.textContent = 'Data saved 👍 successfully!';
                    this.reset();
                } else {
                    msgEl.className = 'message error ❌';
                    msgEl.textContent = 'Error❌: ' + result.message;
                }
                msgEl.style.display = 'block';
                
            } catch (error) {
                msgEl.className = 'message error';
                msgEl.textContent = 'Connection error: ' + error.message;
                msgEl.style.display = 'block';
            }
        });
      
