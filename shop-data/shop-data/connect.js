// Configuration
const API_HOST = '127.0.0.1';
const API_PORT = '5050';
const API_URL = `http://${API_HOST}:${API_PORT}`;

// Saree types for dropdown
// add more saree types as needed
const sareeTypes = [
    { value: "cotton", name: "Cotton Saree" },
    { value: "silk", name: "Silk Saree" },
    { value: "chiffon", name: "Chiffon Saree" },
    { value: "georgette", name: "Georgette Saree" },
    { value: "mysoresilk", name: "mysoresilk Saree" }
];  
  //  Populate Saree dropdown
const sareeSelect = document.getElementById('saree-type');
sareeTypes.forEach(sareeType => {
  const option = document.createElement('option');
  option.value = sareeType.value;
  option.textContent = sareeType.name;
  sareeSelect.appendChild(option);
});

//example for using variable in header
const hdr = "Meenakshi Store sale data";
document.getElementById("page-header").textContent = hdr;

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
      
