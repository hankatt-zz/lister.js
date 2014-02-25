$(document).ready(function() {
	rows = document.querySelectorAll('.swipe div.row');

	for(var i = 0; i < rows.length; i++) {
		rows[i].addEventListener("touchstart",	function() { $(this).addClass("touched");		});
		rows[i].addEventListener("touchend",	function() { $(this).removeClass("touched");	});
	}

	$(".option.increment, .option.decrement").on("touchend", function() {
		// Get button related to this option
		triggeredOption = $(this);
		valueButton = triggeredOption.parent().siblings('.row').children('button');

		// Get value of the button and parse it and increment
		if(triggeredOption.hasClass('increment'))
			newValue = parseInt(valueButton.html()) + 1;
		else
			newValue = parseInt(valueButton.html()) - 1;

		// Update the new value in the UI
		valueButton.html(newValue);
	});

});