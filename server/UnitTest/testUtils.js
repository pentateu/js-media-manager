function pass(scenarioName){
	console.log(' (v) ' + scenarioName + ' - passed ! ');
}

function fail(scenarioName, description){
	console.log(' (X) ' + scenarioName + ' - failed :-(  -> ' + description);
}


function run(func, scenarioName){
	var cleanRun = true;
	var testContext = {
		fail:function(desc){
			cleanRun = false;
			fail(scenarioName, desc);
		},
		end:function(){
			//check if it was a clean run
			if(cleanRun){
				pass(scenarioName);
			}
		},
		assertEqual:function(value, expected, description){
			if(value === expected){
				//great
			}
			else{
				cleanRun = false;
				fail(scenarioName, description +  " - Expected : '" + expected + "' , but value is: '" + value + "' ");
			}
		},
		assertNotNull:function(value, description){
			if(!value){
				cleanRun = false;
				fail(scenarioName, description +  " - Value should not be null.");
			}
		},
		assertFalse:function(value, description){
			if(value === true){
				cleanRun = false;
				fail(scenarioName, description +  " - Value should not be false.");
			}
		}
	};
	try{
		//invoke the test function
		func.call(testContext, testContext);
	}
	catch(err){
		cleanRun = false;
		fail(scenarioName, ' Error: ' + err);
		throw err;
	}
}

exports.pass = pass;
exports.fail = fail;

exports.run = run;