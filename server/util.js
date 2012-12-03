/*jslint bitwise: true, white: true */
"use strict";

var nodeUtil = require("util");

var util;

//Definition of the Exception object
var Exception = function (options) {
	//make sure it behaves as a constructor
	if (!(this instanceof Exception)) {
		return new Exception(options);
	}

	//make sure there is a code, if non is provided
	if (!options) {
		options = {};
	}
	if (!options.code) {
		options.code = util.createUUID();
	}

	var causeErr, that, moreInfo;

	that = this;
	moreInfo = [];

	that.cause = function (val) {
		causeErr = val;
		return that;
	};

	that.match = function (err) {
		//check that the error code is the same as the options for this exception object
		return options.code === err.code;
	};

	that.add = function (info) {
		moreInfo.push(info);
		return that;
	};

	that.error = function () {
		//creates an Error object
		var error = new Error();
		if (options) {
			error.code = options.code;
			error.message = options.message;
		}
		if (causeErr) {
			error.cause = causeErr;
		}
		if (moreInfo) {
			error.moreInfo = moreInfo;
		}
		return error;
	};
	return that;
};

var Util = function () {
	//make sure it behaves as a constructor
	if (!(this instanceof Util)) {
		return new Util();
	}

	//copy some nodeJS util functions
	this.inherits = nodeUtil.inherits;

	this.inspect = nodeUtil.inspect;

	this.warn = nodeUtil.debug;
	this.debug = nodeUtil.debug;
	this.error = nodeUtil.error;

	this.isArray = nodeUtil.isArray;

	/**
     * Generates a UUID according to http://www.ietf.org/rfc/rfc4122.txt
     */
    this.createUUID = function () {
		var s, hexDigits, i, uuid;
		s = [];
		hexDigits = "0123456789ABCDEF";
		for (i = 0; i < 32; i += 1) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[12] = "4";
		s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);
		uuid = s.join("");
		return uuid;
    };

	this.validateParameter = function (parameterValue, validValues, parameterName) {

		var match, validValuesMessage, i, message;

		match = false;
		validValuesMessage = "";

		for (i = 0; i < validValues.length; i += 1) {
			if (validValues[i] === parameterValue) {
				match = true;
			}
			validValuesMessage += " " + validValues[i];
		}

		if (!match) {
			message = "";
			if (parameterName) {
				message = "Invalid value for the " + parameterName + " parameter. The possible values are: " + validValuesMessage;
			}
			else {
				message = "Invalid parameter value . The possible values are: " + validValuesMessage;	
			}
			throw message; 
		}
	};

	this.exception = function (options) {
		return new Exception(options);
	};

	//extend the object with collection methods
	//forEach, iterate and etc
	this.collection = function (array) {
		//check/validate for a valid array
		if (!nodeUtil.isArray(array)) {
			throw "[util.collection] Not a valid array object!";
		}

		//add a mediaInfo to the list
		array.add = function (item) {
			array.push(item);
		};

		//return the size of the media list
		array.size = function () {
			return array.length;
		};

		array.copy = function (other, handler) {
			util.collection(other);
			other.forEach(function (item) {
				if (handler) {
					item = handler.call(item, item);
				}
				array.add(item);
			});
		};

		//for each
		array.forEach = function (fn) {
			var i, item;
			for (i = 0; i < array.length; i += 1) {
				item = array[i];
				if (fn(item, i) === false) {
					break;
				}
			}
		};

		array.iterate = function (fn, endFn) {
			//stop the loop
			var idx, item, it;

			idx = 0;
			item = array[idx];
			
			it = {
				next: function () {
					if (idx < (array.length -1)) {
						//keep going
						idx += 1;
						item = array[idx];
						//call for subsequente items,
						fn(it, item);
					}
					else {
						//end of list
						it.end();
					}
				},
				end: function () {
					if (endFn) {
						endFn();
					}
				}
			};

			//call for first item
			if (array.length > 0) {
				fn(it, item);
			}
			else {
				if (endFn) {
					endFn();
				}
			}
		};
		return array;
	};
	this.asCollection = this.collection;
	
	this.getValue = function (propertyPath, obj) {
		if (!propertyPath || typeof propertyPath !== 'string' || propertyPath.length === 0) {
			throw util.ERROR_INVALID_PROPERTY_PATH.error();
		}

		var props, cv;
		//split the property parts
		props = propertyPath.split('.');
		util.asCollection(props);
		
		cv = obj;//current value
		props.forEach(function (item) {
			cv = cv[item];
		});
		return cv;
	};
};

//export a singleton of the Util object
util = module.exports = new Util();

util.ERROR_INVALID_PROPERTY_PATH = util.exception({message:"Invalid property path."});

