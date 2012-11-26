var UnitTest = require('./unitTest');

var IndexMatrix = require('../indexMatrix');

var IndexMatrixTest = module.exports = new UnitTest(function(){
	
	
	var mockMediaFile = {
		path:'path/value',
		info:{
			title:'title value',
			imdb:{
				imdb_id:'tti4354543'
			}
		}};
	
	this.testAdd_andFind = function(test){
		var mediaIndex = IndexMatrix.define('MediaStore', {
			index:[{
				name:'imdbId',
				property:'info.imdb.imdb_id'
			}]
		});
		
		mediaIndex.add(mockMediaFile);
		
		mediaIndex.find('imdbId', 'tti4354543')
			.done(function(obj){
				test.assertNotNull(obj, 'obj not null');
				test.assertEqual(obj.path, 'path/value', 'verify obj path property value.');
				test.assertEqual(obj.info.title, 'title value', 'verify obj info.title property value.');
				test.end();
			})
			.fail(function(err){
				test.fail('no error expected');
			});
	};
	
	//test the update feature of the index matrix 
	this.testAdd_andFind_2 = function(test){
		var mediaIndex = IndexMatrix.define('MediaStore', {
			index:[{
				name:'imdbId',
				property:'info.imdb.imdb_id'
			},
			{
				name:'title',
				property:'info.title'
			}]
		});
		
		mediaIndex.add(mockMediaFile);
		
		mediaIndex.find('title', 'title value')
			.done(function(obj){
				test.assertNotNull(obj, 'obj not null');
				test.assertEqual(obj.path, 'path/value', 'verify obj path property value.');
				test.assertEqual(obj.info.title, 'title value', 'verify obj info.title property value.');
				test.end();
			})
			.fail(function(err){
				test.fail('no error expected');
			});
	};
});

IndexMatrixTest.setup(module);
