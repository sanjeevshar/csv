    fetch('./result-0.csv')
      .then(response => response.text())
      .then(data => {
        const rows = data.trim().split('\n').map(row => row.split(','));
        let html = '<table>';
        rows.forEach((row, i) => {
          html += '<tr>';
          row.forEach(cell => {
            <!-- Print first row as table headers -->
            html += i === 0 ? `<th>${cell.trim()}</th>` : `<td>${cell.trim()}</td>`;
          });
          html += '</tr>';
        });
        html += '</table>';
        document.getElementById('output').innerHTML = html;
      })
      .catch(error => {
        document.getElementById('output').innerHTML = `<p>Error loading CSV: ${error}</p>`;
      });
