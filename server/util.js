

var validateParameter = exports.validateParameter = function(parameterValue, validValues, parameterName){

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
};


//extend the object with collection methods
//forEach, iterate and etc
var asCollection = exports.asCollection = function(array){
	//add a mediaInfo to the list
	array.add = function(item){
		array.push(item);
	};

	//return the size of the media list
	array.size = function(){
		return array.length;
	};

	//for each
	array.forEach = function(fn) {
		for (var i = 0; i < array.length; i++) {
			var item = array[i];
			if (fn(item) === false) {
				//stop the loop
				break;
			}
		}
	};

	array.iterate = function(fn, endFn){
		var idx = 0;
		var item = array[idx];
		
		var it = {
			next:function(){
				if(idx < (array.length -1)){
					//keep going
					idx++;
					item = array[idx];
					//call for subsequente items,
					fn(it, item);
				}
				else{
					//end of list
					it.end();
				}
			},
			end:function(){
				if(endFn){
					endFn();
				}
			}
		};

		//call for first item
		fn(it, item);
	};
};