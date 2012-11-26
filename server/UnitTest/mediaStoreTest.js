var UnitTest = require('./unitTest');

var MediaStore = require('../mediaStore');

var JSii = require('../jsii/JSii');	

var MediaStoreTest = module.exports = new UnitTest(function(){
	
	this.stopAtError = true;
	
	
	//add an item to the store
	MediaStore.add({
		title:'The Expendables',
		year:2012,
		path:'/path/Expendables.mkv',
		info:{
			watched:'true',
			imdb:{
				title:'The Expendables',
				imdb_id:'tt987238744'
			}
		}
	});
	MediaStore.add({
		title:'The Expendables 2',
		year:2012,
		path:'/path/Expendables2.mkv',
		info:{
			watched:'true',
			imdb:{
				title:'The Expendables 2',
				imdb_id:'tt9879869'
			}
		}
	});
	MediaStore.add({
		title:'Rock 5',
		year:2012,
		path:'/path/Rock5.mkv',
		info:{
			watched:'true',
			imdb:{
				title:'Rock 5',
				imdb_id:'tt876337634'
			}
		}
	});
	
	this.testJSiiSearch = function(test){
		
		var jsii = new JSii();        
        jsii.feedDocs([{
            id : 1,
            text : "blup"
        },
        {
            id : 2,
            text : "blup blap"
        }]);

        var resp = jsii.search('blup');
        
        test.assertEqual(resp.total, 2, 'total');
        test.assertEqual(resp.docs.length, 2, 'total');
        
		test.end();
	};
	
	
	this.testSearchByTitle = function(test){
		//search item from the store
		var result = MediaStore.search('Expendables');
		test.assertEqual(result.total, 2, 'two items returned');
		test.assertEqual(result.docs.length, 2, 'two item sreturned');
		
		result = MediaStore.search('rock');
		test.assertEqual(result.total, 1, 'one item returned');
		test.assertEqual(result.docs.length, 1, 'one item returned');
		
		test.end();
	};
	
	this.testSearchByYear = function(test){
		
		MediaStore.clear();
		
		//add an item to the store
		MediaStore.add({
			title:'The Expendables',
			year:2011,
			info:{
				watched:'true',
				imdb:{
					title:'The Expendables',
					imdb_id:'tt987238744'
				}
			}
		});
		MediaStore.add({
			title:'The Expendables 2',
			year:2012,
			info:{
				watched:'true',
				imdb:{
					title:'The Expendables 2',
					imdb_id:'tt9879869'
				}
			}
		});
		MediaStore.add({
			title:'Rock 5',
			year:2010,
			info:{
				watched:'true',
				imdb:{
					title:'Rock 5',
					imdb_id:'tt876337634'
				}
			}
		});
		
		//search item from the store
		var result = MediaStore.search('year:2010');
		test.assertEqual(result.total, 1, 'one item returned');
		test.assertEqual(result.docs.length, 1, 'one item returned');
		test.assertEqual(result.docs[0].title, 'Rock 5', 'title match');
		
		result = MediaStore.search('year:2011');
		test.assertEqual(result.total, 1, 'one item returned');
		test.assertEqual(result.docs.length, 1, 'one item returned');
		test.assertEqual(result.docs[0].title, 'The Expendables', 'title match');
		
		test.end();
	};
	
	
});

MediaStoreTest.setup(module);