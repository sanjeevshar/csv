function loadContactData() {
    fetch('admin-data')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('contactTableBody');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="no-data">No contact data available</td></tr>';
                return;
            }
            
            data.forEach(contact => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contact.timestamp || 'N/A'}</td>
                    <td>${contact.name || 'N/A'}</td>
                    <td>${contact.childName || 'N/A'}</td>
                    <td>${contact.grade || 'N/A'}</td>
                    <td>${contact.subjectSelect || 'N/A'}</td>
                    <td>${contact.email || 'N/A'}</td>
                    <td>${contact.phone || 'N/A'}</td>
                    <td>${contact.subject || 'N/A'}</td>
                    <td>${contact.message || 'N/A'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading contact data:', error);
            const tbody = document.getElementById('contactTableBody');
            tbody.innerHTML = '<tr><td colspan="9" class="no-data">Error loading data. Please try again.</td></tr>';
        });
}

// Load data on page load
loadContactData();
