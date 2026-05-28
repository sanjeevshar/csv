function toggleSubjectField() {
    const grade = document.getElementById('grade').value;
    const subjectGroup = document.getElementById('subjectGroup');
    
    if (grade === '11' || grade === '12') {
        subjectGroup.style.display = 'block';
    } else {
        subjectGroup.style.display = 'none';
        document.getElementById('subjectSelect').value = '';
    }
}
