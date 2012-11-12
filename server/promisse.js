var Assert = require('./assert');

//promisse object definition
var Promisse = function(options){
	//instance of the object that has just being built
	var instance = this;

	/**
	 * 0 : pending
	 * 1 : done / resolved
	 * 2 : fail / rejected
	 */
	var state = 0;

	var args = null;//arguments sent when resolve was called

	var doneHandlers = new Array();
	var failHandlers = new Array();

	var chainCounter = 0;
	var chainArgsArray = new Array();
	var chainErrors = new Array();
	
	//passAny : even if there is a failed chained promisse it will still call
	//the done handlers
	//failAll : if at least one chained promiss object has failed the entire chain fail
	//and the fail handlers are called.
	var chainBehaviour = "failAll";

	//console.log('options : ' + JSON.stringify(options));

	if(options && options.chainBehaviour){
		setChainBehaviour(options.chainBehaviour);
	}

	function setChainBehaviour(value){
		Assert.assertParameter(value, ["failAll", "passAny"]);

		//console.log('chainBehaviour set to: ' + value);
		chainBehaviour = value;
	}
	this.setChainBehaviour = setChainBehaviour;
	

	//add a callback to be called when the promisse is 'done'
	this.done = function(handler){
		if(state === 1){
			handler.apply(instance, args);
		}
		else if(state === 0){
			//pending state.. add to the queue
			doneHandlers.push(handler);
		}
		return instance;
	};

	//add a callback to be called when the promisse has 'failed'
	this.fail = function(handler){
		if(state === 2){
			handler.apply(instance, args);
		}
		else if(state === 0){
			//pending state.. add to the queue
			failHandlers.push(handler);
		}
		return instance;
	};

	//resolve the promisse
	this.resolve = function(){
		args = arguments;
		if(state === 0){
			state = 1;
			//call the doneHandlers
			for (var i = 0; i < doneHandlers.length; i++) {
				doneHandlers[i].apply(instance, args);
			};

		}
		return instance;
	};

	//reject the promisse
	this.reject = function(){
		args = arguments;
		if(state === 0){
			state = 2;
			//call the doneHandlers
			for (var i = 0; i < failHandlers.length; i++) {
				failHandlers[i].apply(instance, args);
			};
		}
		return instance;
	};

	var filterChainFunc = null;
	this.filterChain = function(func){
		filterChainFunc = func;
		return instance;
	};

	function resolveChain(){
		//console.log('chainBehaviour is: ' + chainBehaviour);
		if(chainErrors.length > 0 && chainBehaviour === "failAll"){
			//when at least one error has occurred and the behaviour is failAll
			instance.reject.call(instance, chainErrors);
		}
		else{
			//when all chainned promisses has been finished, completes this promisse

			if(filterChainFunc){
				//console.log(' *** invoking a filterChain *** ');
				instance.resolve.call(instance, filterChainFunc(chainArgsArray));
			}
			else{
				instance.resolve.call(instance, chainArgsArray);
			}
		}
	}

	//chain another promisse
	this.chain = function(anotherPromisse){
		if(state === 0){ //can only chain promisses when is still at a pending state
			chainCounter++;
			anotherPromisse.done(function(){
				chainArgsArray.push(arguments);
				//when any event happes in the other promisse
				chainCounter--;
				if(chainCounter === 0){
					resolveChain();
				}
			});
			anotherPromisse.fail(function(err){
				chainErrors.push(err);
				//when any event happes in the other promisse
				chainCounter--;
				if(chainCounter === 0){
					resolveChain();
				}
			});
		}
		return instance;
	};
}


exports.newPromisse = function(options){return new Promisse(options)};