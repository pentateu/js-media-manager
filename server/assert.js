

function assertParameter(parameterValue, validValues, parameterName){

	var match = false;
	var validValuesMessage = "";

	for (var i = 0; i < validValues.length; i++) {
		if(validValues[i] === parameterValue){
			match = true;
		}
		validValuesMessage += " " + validValues[i];
	};

	if( ! match){
		var message = "";
		if(parameterName){
			message = "Invalid value for the " + parameterName + " parameter. The possible values are: " + validValuesMessage;
		}
		else{
			message = "Invalid parameter value . The possible values are: " + validValuesMessage;	
		}
		throw message; 
	}
}

exports.assertParameter = assertParameter;