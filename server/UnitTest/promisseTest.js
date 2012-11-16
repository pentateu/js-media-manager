//Unit test for promisse.js file
var Promisse = require("../promisse");

var UnitTest = require('./unitTest');

var PromisseTest = module.exports = new UnitTest(function(){

	//Test Scenario 1 - resolved
	this.testResolved = function(test){
		var counter = 0;
		//1 - create the 2 handlers
		var p = new Promisse();
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
	};

	//Test Scenario 2 - rejected
	this.testRejected = function(test){
		var p = new Promisse();

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
	};


	//Test Scenario 3 - chaining multiple promisse objects
	this.testChain = function(test){
		var p = new Promisse();

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

		var child1 = new Promisse();
		var child2 = new Promisse();

		p.chain(child1);
		p.chain(child2);

		child1.resolve('first result');
		child2.resolve('second result');
	};

	//Test Scenario 4 - chaining multiple promisse objects and failing one child with default behaviour
	this.testChainFail = function(test){
		var p = new Promisse();

		p.done(function(result){
			test.fail('the whole chain should fail');
		})
		.fail(function(listOfErrors){
			test.assertEqual(listOfErrors.length, 1, 'there should be 1 error in the chain');

			test.assertEqual(listOfErrors[0], "some error", 'not the expected error');
			
			test.end();
		});

		var child1 = new Promisse();
		var child2 = new Promisse();
		var child3 = new Promisse();

		p.chain(child1);
		p.chain(child2);
		p.chain(child3);

		child1.resolve('first result');
		child2.resolve('second result');
		child3.reject('some error');
	};

	//Test Scenario 5 - chaining multiple promisse objects and failing one child with behaviour set to 
	this.testChainFailPassAny = function(test){
		var p = new Promisse();

		p.setChainBehaviour(Promisse.PASS_ANY);

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

		var child1 = new Promisse();
		var child2 = new Promisse();
		var child3 = new Promisse();
		var child4 = new Promisse();

		p.chain(child1).chain(child2).chain(child3).chain(child4);

		child1.resolve('first result');
		child2.resolve('second result');
		child3.reject('some error');
		child4.resolve('forth result');
	};

	this.testChainFailPassAnyOnConstructor = function(test){
		var p = new Promisse({chainBehaviour:Promisse.PASS_ANY});

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

		var child1 = new Promisse();
		var child2 = new Promisse();
		var child3 = new Promisse();
		var child4 = new Promisse();

		p.chain(child1).chain(child2).chain(child3).chain(child4);

		child1.resolve('first result');
		child2.resolve('second result');
		child3.reject('some error');
		child4.resolve('forth result');

	};

	//Test Scenario 7 - chaining with filter
	this.testFilterChain = function(test){
		var p = new Promisse().filterChain(function(listOfResults){
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

		var child1 = new Promisse();
		var child2 = new Promisse();

		p.chain(child1);
		p.chain(child2);

		child1.resolve('first result');
		child2.resolve('second result');
	};

});//end of UnitTest

PromisseTest.filename = module.filename;