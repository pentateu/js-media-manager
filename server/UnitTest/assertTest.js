//Unit test for assert.js file
var Assert = require("../assert");

var testUtils = require("./testUtils");

//test scenario 1
try{
	Assert.testParameter("failAll", ["failAll", "passAll"]);
	testUtils.pass('test scenario 1');
}
catch(err){
	testUtils.fail('test scenario 1');
	console.log(err);
}

//test scenario 2
try{
	Assert.testParameter("other value", ["failAll", "passAll"]);
	testUtils.fail('test scenario 2');
}
catch(err){
	testUtils.pass('test scenario 2');
}