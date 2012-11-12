var mediaFolder = require('./mediaFolder');
var promisse = require("./promisse");

var searchFolders = [
	{path:'/Volumes/BOOTCAMP/Users/rafael/Documents/media_test_folders/My Movie Archive', type:'movies'},
	{path:'/Volumes/BOOTCAMP/Users/rafael/Documents/media_test_folders/New Movies', type:'movies'}
];

//Media List object
var MediaList = function(){
	var mediaItems = new Array();

	//add a mediaInfo to the list
	this.add = function(mediaInfo){
		mediaItems.push(mediaInfo);
	};

	//return the size of the media list
	this.size = function(){
		return mediaItems.length;
	};

	this.mediaItems = mediaItems;
};

function listDir(mediaList, folders){

	var myPromisse = promisse.newPromisse();

	//var pending = folders.length;
	for (var i = 0; i < folders.length; i++){
		var folderInfo = folders[i];

		myPromisse.chain(
			mediaFolder.readDir(mediaList, folderInfo)
		);

		/*
		mediaFolder.readDir(mediaList, folderInfo, function(err, mediaList){
			console.log('\n## callback readDir pending : ' + pending + 'mediaList: ' + JSON.stringify(mediaList));
			pending--;
			//check if there is no more pending actions
			if(pending === 0){
				callback(err, mediaList);
				pending = -1;
			}
		});
		*/
	}

	return myPromisse;
}

//list all media available in the server
function listAll(){

	var myPromisse = promisse.newPromisse();

	var mediaList = new MediaList();

	//invoke the listDir method which returns a promisse object
	listDir(mediaList, searchFolders)
		//when done
		.done(function(){
			console.log('\n*** Search Finished -> mediaList : ' + JSON.stringify( mediaList ));
			console.log('\n** Search Finished ** mediaList.size() : ' + mediaList.size());
			
			myPromisse.resolve(mediaList);//complete the promisse
			//callback(mediaList);
		})
		//if fail
		.fail(function(err){
			console.log('Error trying to listAll() media : ' + err.description);
			
			myPromisse.reject(err);//reject the promisse
			//throw err;
		});


	return myPromisse;
/*
	listDir(mediaList, searchFolders, function(err, mediaList){
		//check fo errors
		if(err){
			console.log('Error trying to listAll() media : ' + err.description);
			throw err;
		}

		console.log('\n** Search Finished ** mediaList.size() : ' + mediaList.size());

		callback(mediaList);
	});
*/
}

exports.listAll = listAll;