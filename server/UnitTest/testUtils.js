var Util = require("../util");

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


var scenarioList = new Array();
Util.asCollection(scenarioList);

function add(func, scenarioName){
	scenarioList.push({func:func, scenarioName:scenarioName});
}

function runList(){
	scenarioList.iterate(function(it, item){
		run(item.func, item.scenarioName, function(){
			//only execute the next test case when the previous has finished.
			it.next();
		});
	});
}

function run(func, scenarioName, nextCallBack){

	if(!func && !scenarioName && scenarioList.length > 0){
		runList();
		return;
	}

	var cleanRun = true;
	var tearDownFunc = null;

	var startTime = new Date().getTime();

	var testContext = {
		name:scenarioName,
		fail:function(desc){
			cleanRun = false;
			fail(this.name, desc);
		},
		end:function(){
			//check if it was a clean run
			if(cleanRun){
				var endTime = new Date().getTime() - startTime;
				pass(this.name, endTime);
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
					if(nextCallBack){
						nextCallBack();//ivoke the next callback
					}
				}
				catch(err){
					console.log('error trying to call the nextCallBack. err: ' + JSON.stringify(err));
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
		console.log('\n (Start) ');

		//invoke the test function
		func.call(testContext, testContext);
	}
	catch(err){
		cleanRun = false;
		testContext.fail(' Error: ' + err);
		throw err;
	}
}

exports.pass = pass;
exports.fail = fail;

exports.run = run;
exports.add = add;