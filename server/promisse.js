var util = require('./util');

//promisse object definition
var Promisse = module.exports = function (options) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof Promisse) ) {
		return new Promisse(options);
	}

	//instance of the object that has just being built
	var instance = this;

	/**
	 * 0 : pending
	 * 1 : done / resolved
	 * 2 : fail / rejected
	 */
	instance.state = PENDING;

	var args = null;//arguments sent when resolve was called

	var doneHandlers = new Array();
	var failHandlers = new Array();

	var chainArgsArray = new Array();
	var chainList = util.asCollection(new Array());
	var chainErrors = new Array();
	
	//passAny : even if there is a failed chained promisse it will still call
	//the done handlers
	//failAll : if at least one chained promiss object has failed the entire chain fail
	//and the fail handlers are called.
	var chainBehaviour = FAIL_ALL;
	
	instance.setChainBehaviour = function (value){
		util.validateParameter(value, [FAIL_ALL, PASS_ANY]);
		//console.log('chainBehaviour set to: ' + value);
		chainBehaviour = value;
	}
	
	if(options && options.chainBehaviour){
		instance.setChainBehaviour(options.chainBehaviour);
	}

	//add a callback to be called when the promisse is 'done'
	this.done = function (handler){
		if(instance.state === RESOLVED){//invoke now !
			handler.apply(instance, args);
		}
		else if(instance.state === PENDING){
			//pending instance.state.. add to the queue
			doneHandlers.push(handler);
		}
		return instance;
	};

	//add a callback to be called when the promisse has 'failed'
	this.fail = function (handler){
		if(instance.state === REJECTED){//invoke now
			handler.apply(instance, args);
		}
		else if(instance.state === PENDING){
			//pending instance.state.. add to the queue
			failHandlers.push(handler);
		}
		return instance;
	};

	//resolve the promisse
	this.resolve = function (){
		if(chainList.size() > 0){
			resolveChain();
		}
		else{
			args = arguments;
			if(instance.state === PENDING){
				instance.state = RESOLVED;
				//call the doneHandlers
				for (var i = 0; i < doneHandlers.length; i++) {
					doneHandlers[i].apply(instance, args);
				};
			}
		}
		return instance;
	};
	
	//reject the promisse
	this.reject = function (){
		args = arguments;
		if(instance.state === PENDING){
			instance.state = REJECTED;
			//call the doneHandlers
			for (var i = 0; i < failHandlers.length; i++) {
				failHandlers[i].apply(instance, args);
			};
		}
		return instance;
	};

	var filterChainFunc = null;
	this.filterChain = function (func){
		filterChainFunc = func;
		return instance;
	};
	
	function resolveChain(){
		
		function chainResolved(){
			//console.log('chainBehaviour is: ' + chainBehaviour);
			if(chainErrors.length > 0 && chainBehaviour === "failAll"){
				//when at least one error has occurred and the behaviour is failAll
				instance.reject.call(instance, chainErrors);
			}
			else{
				//when all chainned promisses has been finished, completes this promisse
				//reset the chain
				chainList = util.asCollection(new Array());
				
				if(filterChainFunc){
					//console.log(' *** invoking a filterChain *** ');
					instance.resolve.call(instance, filterChainFunc(chainArgsArray));
				}
				else{
					instance.resolve.call(instance, chainArgsArray);
				}
			}
		}
		
		var count = 0;
		chainList.forEach(function (anotherPromisse){
			anotherPromisse.done(function (){
				chainArgsArray.push(arguments);
				//when any event happens in the other promisse
				count++;
				if(count === chainList.size()){
					chainResolved();
				}
			})
			.fail(function (err){
				chainErrors.push(err);
				//when any event happes in the other promisse
				count++;
				if(count === chainList.size()){
					chainResolved();
				}
			});
		});
	};

	//chain another promisse
	this.chain = function (anotherPromisse){
		if(instance.state === PENDING){ //can only chain promisses when is still at a pending instance.state
			chainList.add(anotherPromisse);
		}
		else{
			util.debug("[Promisse] (WARNING) cannot chain any more primisses, state is now: " + instance.state);
		}
		return instance;
	};
};

//states
var PENDING 	= Promisse.PENDING 	= "pending";
var RESOLVED 	= Promisse.RESOLVED = "resolved";
var REJECTED 	= Promisse.REJECTED = "rejected";

var PASS_ANY 	= Promisse.PASS_ANY = "passAny";
var FAIL_ALL 	= Promisse.FAIL_ALL = "failAll";