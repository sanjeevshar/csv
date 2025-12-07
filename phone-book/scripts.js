//
function choiceMade(choice){
	document.getElementById("courseName").value = choice;
}
//
function validate() {
	 if( (feedback.like[0].checked == false) && (feedback.like[1].checked == false) ) {
		 alert("You must check Yes or No");
	 }
}
var coursesArray = ["Angular", "React", "Vue", "JavaScript", "Python"];
var creams = ["ponds", "sun cream", "nivia","himani"];
