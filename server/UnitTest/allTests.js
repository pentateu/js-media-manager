
var tests = [];

tests.push(require('./utilTest'));
tests.push(require('./promisseTest'));
tests.push(require('./mediaFileTest'));


for (var i = 0; i < tests.length; i++) {
	try{
		console.log('\nRunning tests on : ' + tests[i].name + '\n');
		tests[i].run();
	}
	catch(err){
		console.log('Error executing test : ' + tests[i].name + '\n Error: ' + err);
	}
};
