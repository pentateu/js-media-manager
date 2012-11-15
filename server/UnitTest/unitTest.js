var Util = require("../util");

var Promisse = require('../promisse');

var TEST_FUNC_PATT = /test/;

/**
 * UnitTest object
 */
var UnitTest = module.exports = function(unitTest) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof UnitTest) ) {
		return new UnitTest();
	}

	if(typeof unitTest !== "function"){
		//not a constructor function
		throw "The parameter must be a constructor function and the testFunctions must be properties!";
	}
	//create unit test
	unitTest = new unitTest();

	var scenarioList = new Array();
	Util.asCollection(scenarioList);

	//run the test cases
	var run = this.run = function(summary){
		var p = new Promisse();

		//go throught each test function
		for(var testFunc in unitTest){
			//check if it is a test function
			if(TEST_FUNC_PATT.test(testFunc)){
				//check if it is a function
				if(typeof unitTest[testFunc] === "function"){
					//var testFuncName = testFunc;
					//var testFunc = ;

					//var params = {func:testFunc, testFuncName:testFuncName};

					//execute the test function
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

			fail:function(desc){
				cleanRun = false;
				fail(this.name, desc);
			},

			end:function(){
				//check if it was a clean run
				if(cleanRun){
					if(summary){
						summary.pass();
					}
					
					//call the elapsed time
					var endTime = new Date().getTime() - startTime;
					//print pass message
					pass(this.name, endTime);
				}
				else{
					if(summary){
						summary.fail();
					}
				}

				try{
					if(tearDownFunc){
						var scenarioName = this.name;
						tearDownFunc.call(testContext, function(msg){
							if(msg && typeof msg == "string"){
								console.log(" (TearDown)  - " + msg);
							}
						});
					}
				}
				catch(err){
					console.log('error trying to execute tearDown. err: ' + JSON.stringify(err));
				}
				finally{
					try{
						if(endCallBack){
							endCallBack();//ivoke the next callback
						}
					}
					catch(err){
						console.log('error trying to call the endCallBack. err: ' + JSON.stringify(err));
					}
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
				if(!value){
					cleanRun = false;
					this.fail(description +  " - Value should not be null.");
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
			}
		};

		try{
			console.log('\n (Start) test function : ' + testFunc);
			//invoke the test function
			unitTest[testFunc].call(testContext, testContext);
		}
		catch(err){
			cleanRun = false;
			testContext.fail(' Error: ' + err);
			throw err;
		}
	}

	function pass(scenarioName, time){
		var msg = ' (v) ' + scenarioName + '\n (Passed) ! ';

		if(time){
			msg += ' took ' + time + ' miliseconds.';
		}

		console.log(msg);
	}

	function fail(scenarioName, description){
		console.log(' (X) ' + scenarioName + '\n (Failed) :-(\n' + description);
	}

};

