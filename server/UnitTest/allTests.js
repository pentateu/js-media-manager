var Promisse = require('../promisse');
var Util = require('../util');

var tests = new Array();
Util.asCollection(tests);
//add tests
tests.push(require('./utilTest'));
tests.push(require('./promisseTest'));
tests.push(require('./mediaFileTest'));
tests.push(require('./imdbScraperTest'));
tests.push(require('./imdbOrgScraperTest'));
tests.push(require('./imgDownloaderTest'));

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


tests.iterate(
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
		console.log('\n------------------------------------------------------------------------------------------------------------');
		console.log(' -> Result Summary: UnitTest files: ' + tests.size() + ' | Test Cases PASS: ' + passTotal + ' FAIL: ' + failTotal);	
		console.log('------------------------------------------------------------------------------------------------------------');
	});

/*
//get the promisse for each UnitTest
for (var i = 0; i < tests.length; i++) {
	p.chain(tests[i].getPromisse());

};

//run tests
for (var i = 0; i < tests.length; i++) {
	console.log('\n------------------------------------------------------------------------------------------------------------');
	console.log('Running tests on : ' + tests[i].filename);
	tests[i].run(summary);
};
*/
