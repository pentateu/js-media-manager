var Promisse = require('../promisse');

var tests = [];

//tests.push(require('./utilTest'));
//tests.push(require('./promisseTest'));
tests.push(require('./mediaFileTest'));

/*

var summary = {pass:0, fail:0};
for (var i = 0; i < tests.length; i++) {
	try{
		console.log('\nRunning tests on : ' + tests[i].name);
		tests[i].run(summary);
	}
	catch(err){
		console.log('Error executing test : ' + tests[i].name + '\n Error: ' + err);
	}
};
*/

var passTotal = 0;
var failTotal = 0;

var summary = {
	pass:function(){
		passTotal++;
	}, 
	fail:function(){
		failTotal++;
	}};

var p = new Promisse()
	.done(function(){
		console.log('\n *** Result summary: pass: ' + passTotal + ' fail: ' + failTotal);		
	});

for (var i = 0; i < tests.length; i++) {
	//try{
		//console.log('\nRunning tests on : ' + tests[i].name);
		p.chain(tests[i].run(summary));
	//}
	//catch(err){
	//	console.log('Error executing test : ' + tests[i].name + '\n Error: ' + err);
	//}
};
