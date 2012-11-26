// 
// DEV STOPED in favor of using jsii
// 

var Util = require('./util');
var Promisse = require('./promisse');

//check if the global cache exists
if( ! global.__IndexMatrixCache){
	global.__IndexMatrixCache = {};
}
var cache = global.__IndexMatrixCache;


//exposed only the factory object
module.exports = {
	define:function(name, opts){
		var matrix = cache[name];
		if(matrix){
			//existing matrix
			matrix.update(opts);
		}
		else{
			matrix = new IndexMatrix(opts);
			cache[name] = matrix;
		}
		return matrix;
	}
};



var IndexStore = function(propertyPath){
	//make sure it behaves as a constructor
	if ( ! (this instanceof IndexStore) ) {
		return new IndexStore(propertyPath);
	}
	
	var store = {};
	
	this.add = function(obj){
		var p = new Promisse();
		//extract the value from the obj using the propertyPath
		var value = Util.getValue(propertyPath, obj);
		store[value] = obj;
		return p.resolve(obj);
	};
	
	this.find = function(value){
		var p = new Promisse();
		return p.resolve(store[value]);
	};
	
};

//IndexMatrix object is hidden and not exposed to outside the module
var IndexMatrix = function(opts) {
	
	//make sure it behaves as a constructor
	if ( ! (this instanceof IndexMatrix) ) {
		return new IndexMatrix(opts);
	}
	
	function validateOptions(opts){
		//validate the options
		if(! opts){
			throw ERROR_NO_OPTIONS;
		}
		if(! opts.index || ! Util.isArray(opts.index)){
			throw ERROR_INVALID_INDEX_LIST;
		}
	}
	
	validateOptions(opts);
	
	var matrix = this;
	
	//map of indexes
	var indexMap  = {};
	var indexList = Util.asCollection([]);
	
	function addNewIndex(indexDef){
		var indexStore = new IndexStore(indexDef.property);
		indexMap[indexDef.name] = indexStore;
		indexList.add(indexStore);
	}
	
	function updateIndex(indexDef, indexStore, opts){
		//there is nothing that can be changed for a index at this stage
	}
	
	//build the matrix
	Util.asCollection(opts.index);
	opts.index.forEach(function(indexDef){
		addNewIndex(indexDef);
	});
	
	//update the index matrix with new/modified indexes
	this.update = function(opts){
		validateOptions(opts);
		
		//update the matrix
		Util.asCollection(opts.index);
		opts.index.forEach(function(indexDef){
			//check if already exists in the indexMap
			if(indexMap[indexDef.name]){
				updateIndex(indexDef, indexMap[indexDef.name], opts);
			}
			else{
				addNewIndex(indexDef);
			}
		});
	};
	
	this.add = function(obj){
		var p = new Promisse();
		//1: go through the list of indexes
		indexList.forEach(function(indexStore){
			p.chain(indexStore.add(obj));
		});
		return p.resolve();
	};
	
	this.find = function(indexName, value){
		var indexStore = indexMap[indexName];
		if( ! indexStore){
			throw ERROR_INVALID_INDEX_NAME;
		}
		return indexStore.find(value);
	};
};

//error codes
IndexMatrix.ERROR_NO_OPTIONS = Util.exception({message:"No options/parameters provided."});
IndexMatrix.ERROR_INVALID_INDEX_LIST = Util.exception({message:"Invalid index list provided."});
IndexMatrix.ERROR_INVALID_INDEX_NAME = Util.exception({message:"Invalid index name."});