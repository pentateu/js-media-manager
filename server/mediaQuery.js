var fs = require('fs'); 
var path = require('path');

var mediaFolders = [
	{path:'C:/Users/rafael/Documents/media_test_folders/My Movie Archive', type:'movies'},
	{path:'C:/Users/rafael/Documents/media_test_folders/New Movies', type:'movies'}
];

function readDir(list, item, callback){
	fs.readdir(item.path, function(err, files){
		//console.log('fs.readdir() callback for path: ' + item.path);

		if (err){
			console.log('error: ' + err);
			throw err;	
		} 

		var pending = 0;
		for (var j = 0; j < files.length; j++){
			var file = files[j];
			console.log('file: ' + file);

			var fullPath = path.resolve(item.path, file);

			console.log('fs.readdir() fullPath: ' + fullPath);

			//check if its a file or folder
			var stats = fs.statSync(fullPath);

			if(stats.isFile()){
				list.push({filePath:fullPath, type:item.type});
			}
			else if(stats.isDirectory()){
				pending++;
				readDir(list, {path:fullPath, type:item.type}, function(){
					pending--;
					if(pending === 0){
						console.log('all sub-folders processed!');
						callback();
					}
				});
			}
			else{
				//file type not supported
				console.log('file stat not supported: ' + fullPath);
			}
		}
		if(pending === 0){
			console.log('no folders found');
			callback();
		}
	});
}

function listDir(list, folders, callback){
	var pending = 0;
	for (var i = 0; i < folders.length; i++){
		var item = folders[i];

		pending++;

		readDir(list, item, function(){
			pending--;
			//check if there is no more pending actions
			if(pending === 0){
				callback();
			}
		});
	}


}

//list all media available in the server
function listAll(callback){
	console.log('method list all !');

	var list = [];

	listDir(list, mediaFolders, function(){
		
		callback(list);

	});

/*
	callback([{
		title:"Lord of The Rings",
		posterImage:'http://cdn1.hark.com/images/000/006/668/6668/original.0'
	}, 
	{
		title:"Fast and Furious 5",
		posterImage:'http://4.bp.blogspot.com/-yAaeY3Svm3g/T8DsgmgrJHI/AAAAAAAAJHg/jE8ya70bc8c/s1600/The+Fast+and+The+Furious.jpg'
	}]);
*/
}

exports.listAll = listAll;