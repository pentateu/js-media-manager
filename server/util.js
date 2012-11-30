var nodeUtil = require("util");

//Definition of the Exception object
var Exception = function(options){
	
	var causeErr = null;

	this.cause = function(val){
		causeErr = val;
		return this;
	};

	var moreInfo = [];
	this.add = function(info){
		moreInfo.push(info);
	};

	this.error = function(){
		//creates an Error object
		var error = new Error();

		if(options){
			error.code 		= options.code;
			error.message 	= options.message;
		}
		if(causeErr){
			error.cause 	= causeErr;
		}
		if(moreInfo){
			error.moreInfo 	= moreInfo;
		}
		return error;
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
	
	this.isArray = nodeUtil.isArray;

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
	this.collection = function(array){
		//check/validate for a valid array
		if(! nodeUtil.isArray(array)){
			throw "[util.collection] Not a valid array object!";
		}

		//add a mediaInfo to the list
		array.add = function(item){
			array.push(item);
		};

		//return the size of the media list
		array.size = function(){
			return array.length;
		};

		array.copy = function(other, handler){
			util.collection(other);
			other.forEach(function(item){
				if(handler){
					item = handler.call(item, item);
				}
				array.add(item);
			});
		};

		//for each
		array.forEach = function(fn) {
			for (var i = 0; i < array.length; i++) {
				var item = array[i];
				if (fn(item, i) === false) {
					break;
				}
			}
		};

		array.iterate = function(fn, endFn){
					//stop the loop
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
	this.asCollection = this.collection;
	
	this.getValue = function(propertyPath, obj){
		if(!propertyPath || typeof(propertyPath) != 'string' || propertyPath.length == 0){
			throw ERROR_INVALID_PROPERTY_PATH;
		}
		//split the property parts
		var props = propertyPath.split('.');
		util.asCollection(props);
		
		var cv = obj;//current value
		props.forEach(function(item){
			cv = cv[item];
		});
		return cv;
	};
};

//export a singleton of the Util object
var util = module.exports = new Util();

Util.ERROR_INVALID_PROPERTY_PATH = util.exception({message:"Invalid property path."});

