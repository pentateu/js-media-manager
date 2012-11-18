var nodeUtil = require("util");

//Definition of the Exception object
var Exception = function(options){
	this.code 		= null;
	this.message 	= null;
	this.cause 		= null;

	if(options){
		this.code 		= options.code;
		this.message 	= options.message;
		this.cause 		= options.cause;
	}

	this.setCause = function(val){
		this.cause = val;
		return this;
	};
	return this;
};

var Util = function() {
	//make sure it behaves as a constructor
	if ( ! (this instanceof Util) ) {
		return new Util();
	}

	//copy some nodeJS util functions
	this.inherits = nodeUtil.inherits;

	this.inspect = nodeUtil.inspect;

	this.warn = nodeUtil.debug;
	this.debug = nodeUtil.debug;
	this.error = nodeUtil.error;

	this.validateParameter = function(parameterValue, validValues, parameterName){

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

	this.exception = function(options){
		return new Exception(options);
	};

	//extend the object with collection methods
	//forEach, iterate and etc
	this.asCollection = function(array){
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
				if (fn(item, i) === false) {
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
			if(array.length > 0){
				fn(it, item);
			}
			else{
				if(endFn){
					endFn();
				}
			}
		};
		return array;
	};
};

//export a singleton of the Util object
module.exports = new Util();