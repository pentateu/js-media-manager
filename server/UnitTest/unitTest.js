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

	//run this test case as a stand alone and create it's own summary and print the summary at the end
	this.runStandAlone = function(){
		UnitTest.runAll([this]);
	};

	this.setup = function(testClassModule){
		//set name
		this.filename = testClassModule.filename;

		if( ! testClassModule.parent){
			this.runStandAlone();
		}
	};

	//run the test cases
	this.run = function(summary){
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
				console.log('(FAIL) ' + this.name + ' XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
				console.log('   --> ' +  desc);
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

				if(tearDownFunc){
					//check if it is an array
					if(tearDownFunc instanceof Array){
						Util.asCollection(tearDownFunc);
					}
					else{
						tearDownFunc = [tearDownFunc];
						Util.asCollection(tearDownFunc);
					}

					tearDownFunc.iterate(function(it, func){
						try{
							var result = func.call(testContext, function(msg){
								if(msg && typeof msg == "string"){
									console.log("(TearDown OK) - " + testFunc + "() - " + msg);
								}
							});
						}
						catch(err){
							console.log('(TearDown ERROR) - Problem trying to execute TearDown function err: ' + JSON.stringify(err) + ' message: ' + err);
						}

						//check if the result is a promisse
						if(typeof(result) != 'undefined' && result.done){
							result.done(function(){
								it.next();
							});
						}
						else{
							it.next();
						}
					},
					function(){
						//end of list
						callEndCallBack();
					});
				}
				else{
					callEndCallBack();
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
					//delete the info file
					fs.unlinkSync(filePath);
					log('File deleted : ' + filePath);
				};
			},
			assertFileDoesNotExist:function(filePath, description){
				if(fs.existsSync(filePath)){
					this.fail(description);
				}
			},
			assertFileExist:function(filePath, description){
				if( ! fs.existsSync(filePath)){
					this.fail(description);
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

UnitTest.runAll = function(list){
	//make sure it is a collection
	Util.asCollection(list);

	var passTotal = 0;
	var failTotal = 0;

	//summary object
	var summary = {
		pass:function(){
			passTotal++;
		}, 
		fail:function(){
			failTotal++;
		}
	};


	list.iterate(
		function(it, testObject){
			//on each item 
			testObject.getPromisse().done(function(){
				it.next();
			});

			console.log('\n------------------------------------------------------------------------------------------------------------');
			console.log('Running tests on : ' + testObject.filename);
			testObject.run(summary);
		}, 
		function(){
			//at the end of the 
			console.log('\n***************************************************************************************************************');
			console.log('* -> Result Summary: UnitTest files: ' + list.size() + ' | Test Cases PASS: ' + passTotal + ' FAIL: ' + failTotal);	
			console.log('***************************************************************************************************************');
		});

};

