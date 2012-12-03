//Unit test for assert.js file
var util = require("../util");
var assert = require("assert");
var UnitTest = require('./unitTest');

var utilTest = module.exports = new UnitTest(function (){
	
	this.testExceptionCode = function (test){
		var excp = util.exception({message:'message test!'});

		var error = excp.error();

		test.assertEqual(error.message, 'message test!', 'message ok');

		test.assertNotNull(error.code, 'code is not null');

		test.end();
	};

	this.testMatch = function (test){
		var excp = util.exception({message:'message test!'});

		var error = excp.error();

		test.assertEqual(error.message, 'message test!', 'message ok');

		test.assertNotNull(error.code, 'code is not null');

		test.assertTrue(excp.match(error), 'match works');

		test.end();
	};

	this.testGetValue_Error = function (test){
		test.assertThrows(
			function (){
				util.getValue(null);
			}, 
			'should throw an exception',
			function (err){
				test.assertTrue(util.ERROR_INVALID_PROPERTY_PATH.match(err), 'match error and exception');
			});

		test.end();
	};

	this.testDoesNotThrow = function (test){
		//test scenario 1
		test.assertNotThrows(
			function (){
				util.validateParameter("failAll", ["failAll", "passAll"]);
				test.end();
			},
			'should not throw an exception.');	
	};

	this.testValidateParameter = function (test){
		//test scenario 2
		test.assertThrows(
			function (){
				util.validateParameter("other value", ["failAll", "passAll"]);
				//testutils.fail('test scenario 2');
			},
			'should throw an exception');
		test.end();
	};

	this.testAsCollectionForEach = function (test){

		var list = new Array();
		util.asCollection(list);

		list.add("teste 1");
		list.add("teste 2");
		list.add("teste 3");
		list.add("teste 4");

		var x = 1;
		list.forEach(function (item){
			var txt = "teste " + x;
			x++;
			test.assertEqual(item, txt, 'testing callback item');
		});

		test.end();
	};

	this.testAsCollectionIterateEmptyList = function (test){

		var list = new Array();
		util.asCollection(list);


		list.iterate(function (it, item){
			test.fail('list is empty, should not call the iterate function');
		}, 
		function (){
			test.end();
		});

	}

	this.testAsCollectionIterate = function (test){

		var list = new Array();
		util.asCollection(list);

		list.add("teste 1");
		list.add("teste 6");
		list.add("teste 11");
		list.add("teste 16");

		var list2 = new Array();
		util.asCollection(list2);

		list2.add("list2 1");
		list2.add("list2 2");
		list2.add("list2 3");
		list2.add("list2 4");

		var x = 1;
		list.iterate(function (it, item){

			//console.log('iterate callback list1. item: ' + item);

			var txt = "teste " + x;
			x++;
			test.assertEqual(item, txt, 'testing callback item');

			var y = 1;
			list2.iterate(function (it, item){
				//console.log('iterate callback list2. item: ' + item);

				x++;
				var txt = "list2 " + y;
				y++;
				test.assertEqual(item, txt, 'testing callback item');

				it.next();//move to next item
			},
			function (){
				//console.log('end callback list2.');
				//end of list2
				it.next();
			});
		},
		function (){
			//console.log('end callback list1.');
			//end of list
			test.end();
		});
	};
	
	this.testGetValue = function (test){
		var mockMediaFile = {
			path:'path/value',
			info:{
				title:'title value',
				imdb:{
					imdb_id:'tti4354543'
				}
			}};
		
		var value = util.getValue('path', mockMediaFile);
		test.assertEqual(value, 'path/value');
		util.debug(value);
		
		value = util.getValue('info.title', mockMediaFile);
		test.assertEqual(value, 'title value');
		util.debug(value);
		
		value = util.getValue('info.imdb.imdb_id', mockMediaFile);
		test.assertEqual(value, 'tti4354543');
		util.debug(value);
		
		test.end();
	};
	
});

utilTest.setup(module);