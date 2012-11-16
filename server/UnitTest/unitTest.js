var fs = require('fs'); 
var Util = require("../util");

var Promisse = require('../promisse');

var TEST_FUNC_PATT = /test/;

var TEST_TIMEOUT = 1000 * 1; //5 seconds

/**
 * UnitTest object
 */
var UnitTest = module.exports = function(unitTest) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof UnitTest) ) {
		return new UnitTest(unitTest);
	}

	if(typeof unitTest !== "function"){
		//not a constructor function
		throw "The parameter must be a constructor function and the testFunctions must be properties!";
	}
	//create unit test
	unitTest = new unitTest();

	var scenarioList = new Array();
	Util.asCollection(scenarioList);

	var p = new Promisse();

	var getPromisse = this.getPromisse = function(){
		return p;
	};

	//run the test cases
	var run = this.run = function(summary){
		//go throught each test function
		for(var testFunc in unitTest){
			//check if it is a test function
			if(TEST_FUNC_PATT.test(testFunc)){
				//check if it is a function
				if(typeof unitTest[testFunc] === "function"){
					//add test function to the list
					scenarioList.add(testFunc);
				}	
			}
		}

		scenarioList.iterate(function(it, testFunc){
			invokeTest(testFunc, summary, function(){
				//only execute the next test case when the previous has finished.
				it.next();
			});
		},
		function(){
			//when finished, complete the promisse
			p.resolve();
		});
		return p;
	};


	function invokeTest(testFunc, summary, endCallBack){

		var cleanRun = true;
		var tearDownFunc = null;

		var startTime = new Date().getTime();

		var testContext = {
			name:"",

			newTimeOut:function(newValue){
				console.log(' Setting a new timeout for this test case : ' + newValue);
				//cancel previous timer
				clearTimeout(endCheckerTimer);
				//create a new one
				endCheckerTimer = setTimeout(cancelRunnintTestCase, newValue);
			},

			fail:function(desc){
				cleanRun = false;
				console.log('(FAIL) ' + this.name + ' XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
				console.log('        ' +  desc);
			},

			end:function(){
				//clear the timeout
				clearTimeout(endCheckerTimer);

				//check if it was a clean run
				if(cleanRun){
					if(summary){
						//notify summary
						summary.pass();
					}
					
					//call the elapsed time
					var totalTime = new Date().getTime() - startTime;
					//print pass message
					console.log('(PASS) ' + totalTime + ' milis. - ' + this.name);
				}
				else{
					if(summary){
						summary.fail();
					}
				}

				function callEndCallBack(){
					try{
						if(endCallBack){
							endCallBack();//ivoke the next callback
						}
					}
					catch(err){
						console.log('error trying to call the endCallBack. err: ' + JSON.stringify(err));
					}
				}

				try{
					if(tearDownFunc){
						//var scenarioName = this.name;
						var result = tearDownFunc.call(testContext, function(msg){
							if(msg && typeof msg == "string"){
								console.log("(TearDown) - " + testFunc + "() - " + msg);
							}
						});
						//check if the result is a promisse
						if(typeof(result) != 'undefined' && result.done){
							result.done(function(){
								callEndCallBack();
							});
						}
						else{
							callEndCallBack();
						}
					}
					else{
						callEndCallBack();
					}
				}
				catch(err){
					console.log('error trying to execute tearDown. err: ' + JSON.stringify(err));
				}
				
			},
			assertEqual:function(value, expected, description){
				if(value === expected){
					//great
				}
				else{
					cleanRun = false;
					this.fail(description +  " - Expected : '" + expected + "' , but value is: '" + value + "' ");
				}
			},
			assertNotNull:function(value, description){
				if(value === null || typeof(value) === 'undefined'){
					cleanRun = false;
					this.fail(description +  " - Value should not be null - value: " + value);
				}
			},
			assertNull:function(value, description){
				if(value === null || typeof(value) === 'undefined'){
					//all good
				}
				else{
					cleanRun = false;
					this.fail(description +  " - Value should be null - value: " + value);
				}
			},
			assertFalse:function(value, description){
				if(value === true){
					cleanRun = false;
					this.fail(description +  " - Value should not be false.");
				}
			},
			assertThrows:function(func, description){
				try{
					func();
					this.fail(description);
				}
				catch(err){
					//good
				}
			},
			assertNotThrows:function(func, description){
				try{
					func();
					//good
				}
				catch(err){
					this.fail(description);
				}
			},
			//executed when the test ends
			tearDown:function(func){
				tearDownFunc = func;
			},
			deleteFileTearDown:function(filePath){
				return function(log){
					var p = new Promisse();
					//delete the info file
					fs.unlink(filePath, function(err){
						if(err){
							log('could not delete file. err: ' + err);
						}
						else{
							log('File deleted : ' + filePath);
						}
						p.resolve();
					});
					return p;
				}
			}
		};

		var cancelRunnintTestCase = function(){
			//cancel/end the running test
			testContext.fail('Test Case timeout');
			testContext.end();
		};

		//timer that watch for tests that forget to call the end() function
		var endCheckerTimer = setTimeout(cancelRunnintTestCase, TEST_TIMEOUT);

		try{
			console.log('\n(Start) test function : ' + testFunc);
			//invoke the test function
			unitTest[testFunc].call(testContext, testContext);
		}
		catch(err){
			cleanRun = false;
			testContext.fail('Error: ' + err);
			//throw err;
		}
	}

};

