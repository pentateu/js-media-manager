//Unit test for assert.js file
var Util = require("../util");

var assert = require("assert");

var testUtils = require("./testUtils");

function scenario1(test){
	//test scenario 1
	assert.doesNotThrow(
		function(){
			Util.validateParameter("failAll", ["failAll", "passAll"]);
			test.end();
		},
		null,
		'should not throw an exception.');	
}

function scenario2(test){
	//test scenario 2
	assert.throws(
		function(){
			Util.validateParameter("other value", ["failAll", "passAll"]);
			//testUtils.fail('test scenario 2');
		}, 
		null, 
		'should throw an exception');
	test.end();
}

function scenario3(test){

	var list = new Array();
	Util.asCollection(list);

	list.add("teste 1");
	list.add("teste 2");
	list.add("teste 3");
	list.add("teste 4");

	var x = 1;
	list.forEach(function(item){
		var txt = "teste " + x;
		x++;
		test.assertEqual(item, txt, 'testing callback item');
	});

	test.end();
}

function scenario4(test){

	var list = new Array();
	Util.asCollection(list);

	list.add("teste 1");
	list.add("teste 6");
	list.add("teste 11");
	list.add("teste 16");

	var list2 = new Array();
	Util.asCollection(list2);

	list2.add("list2 1");
	list2.add("list2 2");
	list2.add("list2 3");
	list2.add("list2 4");

	var x = 1;
	list.iterate(function(it, item){

		//console.log('iterate callback list1. item: ' + item);

		var txt = "teste " + x;
		x++;
		test.assertEqual(item, txt, 'testing callback item');

		var y = 1;
		list2.iterate(function(it, item){
			//console.log('iterate callback list2. item: ' + item);

			x++;
			var txt = "list2 " + y;
			y++;
			test.assertEqual(item, txt, 'testing callback item');

			it.next();//move to next item
		},
		function(){
			//console.log('end callback list2.');
			//end of list2
			it.next();
		});
	},
	function(){
		//console.log('end callback list1.');
		//end of list
		test.end();
	});
}

exports.name = module.filename;

exports.run = function(summary){
	testUtils.summary = summary;
	testUtils.run(scenario1, "Scenario 1");
	testUtils.run(scenario2, "Scenario 2");

	testUtils.run(scenario3, "Scenario 3");
	testUtils.run(scenario4, "Scenario 4");
};