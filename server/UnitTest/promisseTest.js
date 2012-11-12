//Unit test for promisse.js file
var promisse = require("../promisse");

var testUtils = require("./testUtils");

//Test Scenario 1 - resolved
function scenario1(test){
	var counter = 0;
	//1 - create the 2 handlers
	var p = promisse.newPromisse();
	p.done(function(value){
		counter += value;
	});
	p.done(function(value){
		counter += value;
	});
	p.fail(function(err){
		test.fail('fail called when the promisse is resolved.');
	});

	p.resolve(5);

	//timer to make sure the done handlers are invoked
	setTimeout(function(){
		//check the total
		if(counter != 10){
			test.fail('counter != 10');
		}

		p.done(function(value){
			counter += (value * 2);
		});

		if(counter != 20){
			test.fail('counter != 20');
		}

		//end of the test
		test.end();
	}, 100);
}

//Test Scenario 2 - rejected
function scenario2(test){
	var p = promisse.newPromisse();

	var failCount = 0;

	p.done(function(value){
		test.fail('done called when the promisse is rejected.');
	});
	var failHandler = function(err){
		if(err !== "error for rejecting"){
			test.fail('error description not passed properly to the fail handler.');
		}
		failCount++;
	};

	//add 3 handlers
	p.fail(failHandler);
	
	p.fail(failHandler);

	p.fail(failHandler);

	p.reject("error for rejecting");

	p.fail(function(err){
		
		test.assertEqual(err, "error for rejecting", 'error description not passed properly to the fail handler.');
		
		test.assertEqual(failCount, 3, 'not all fail handlers have been called.');
		
		test.end();
	});
}


//Test Scenario 3 - chaining multiple promisse objects
function scenario3(test){
	var p = promisse.newPromisse();

	p.done(function(result){
		//check if the resuls is a array with 2 items
		test.assertEqual(result.length, 2, 'there should be 2 result items from the chain');

		test.assertEqual(result[0][0], "first result", 'first result is incorrect.');
		test.assertEqual(result[1][0], "second result", 'second result is incorrect.');

		test.end();
	});

	p.fail(function(listOfErrors){
		test.fail('there is no errors in the chain');
	});

	var child1 = promisse.newPromisse();
	var child2 = promisse.newPromisse();

	p.chain(child1);
	p.chain(child2);

	child1.resolve('first result');
	child2.resolve('second result');

}

//Test Scenario 4 - chaining multiple promisse objects and failing one child with default behaviour
function scenario4(test){
	var p = promisse.newPromisse();

	p.done(function(result){
		test.fail('the whole chain should fail');
	})
	.fail(function(listOfErrors){
		test.assertEqual(listOfErrors.length, 1, 'there should be 1 error in the chain');

		test.assertEqual(listOfErrors[0], "some error", 'not the expected error');
		
		test.end();
	});

	var child1 = promisse.newPromisse();
	var child2 = promisse.newPromisse();
	var child3 = promisse.newPromisse();

	p.chain(child1);
	p.chain(child2);
	p.chain(child3);

	child1.resolve('first result');
	child2.resolve('second result');
	child3.reject('some error');

}

//Test Scenario 5 - chaining multiple promisse objects and failing one child with behaviour set to 
function scenario5(test){
	var p = promisse.newPromisse();

	p.setChainBehaviour("passAny");

	p.done(function(result){
		//check if the resuls is a array with 2 items
		test.assertEqual(result.length, 3, 'there should be 2 result items from the chain');

		test.assertEqual(result[0][0], "first result", 'first result is incorrect.');
		test.assertEqual(result[1][0], "second result", 'second result is incorrect.');
		test.assertEqual(result[2][0], "forth result", 'second result is incorrect.');

		test.end();
	})
	.fail(function(listOfErrors){
		test.fail('chain should not fail');

	});

	var child1 = promisse.newPromisse();
	var child2 = promisse.newPromisse();
	var child3 = promisse.newPromisse();
	var child4 = promisse.newPromisse();

	p.chain(child1).chain(child2).chain(child3).chain(child4);

	child1.resolve('first result');
	child2.resolve('second result');
	child3.reject('some error');
	child4.resolve('forth result');

}

//Test Scenario 6 - same as 5, but using options to set the behaviour
function scenario6(test){
	var p = promisse.newPromisse({chainBehaviour:"passAny"});

	p.done(function(result){
		//check if the resuls is a array with 2 items
		test.assertEqual(result.length, 3, 'there should be 2 result items from the chain');

		test.assertEqual(result[0][0], "first result", 'first result is incorrect.');
		test.assertEqual(result[1][0], "second result", 'second result is incorrect.');
		test.assertEqual(result[2][0], "forth result", 'second result is incorrect.');

		test.end();
	})
	.fail(function(listOfErrors){
		test.fail('chain should not fail');
	});

	var child1 = promisse.newPromisse();
	var child2 = promisse.newPromisse();
	var child3 = promisse.newPromisse();
	var child4 = promisse.newPromisse();

	p.chain(child1).chain(child2).chain(child3).chain(child4);

	child1.resolve('first result');
	child2.resolve('second result');
	child3.reject('some error');
	child4.resolve('forth result');

}

//Test Scenario 7 - chaining with filter
function scenario7(test){
	var p = promisse.newPromisse().filterChain(function(listOfResults){
			return listOfResults[0][0];//always return the first item of the list of results
		});

	p.done(function(result){
		//check if the resuls is a array with 2 items
		test.assertEqual(result, "first result", 'only the first result should be passed here.');

		test.end();
	})
	.fail(function(listOfErrors){
		test.fail('there is no errors in the chain');
	});

	var child1 = promisse.newPromisse();
	var child2 = promisse.newPromisse();

	p.chain(child1);
	p.chain(child2);

	child1.resolve('first result');
	child2.resolve('second result');

}

//running the tests

testUtils.run(scenario1, "Scenario 1");
testUtils.run(scenario2, "Scenario 2");
testUtils.run(scenario3, "Scenario 3");
testUtils.run(scenario4, "Scenario 4");
testUtils.run(scenario5, "Scenario 5");
testUtils.run(scenario6, "Scenario 6");
testUtils.run(scenario7, "Scenario 7");