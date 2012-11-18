//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var MediaFolder = require('../mediaFolder');
var MediaFile = require('../mediaFile');
//UnitTest object
var UnitTest = require('./unitTest');

var ImgDownloader = require('../imgDownloader');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));

var newMoviesFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/New Movies', type:'movies'});

//Object Definition
var ImgDownloaderTest = module.exports = new UnitTest(function(){

	this.testDownload = function(test){
		test.newTimeOut(2 * 1000);//2 seconds

		var imgPath = pathLib.resolve(newMoviesFolder.path, 'Expendables 2 (2012).jpg');
		var url = 'http://ia.media-imdb.com/images/M/MV5BMTQzODkwNDQxNV5BMl5BanBnXkFtZTcwNTQ1ODAxOA@@._V1._SY317_.jpg';

		test.tearDown(test.deleteFileTearDown(imgPath));

		var imgD = new ImgDownloader(url, imgPath);
		imgD.download()
			.done(function(){
				test.end();
			})
			.fail(function(e){
				test.fail('Exception not expected. : ' + JSON.stringify(e));
			});
	};

});

ImgDownloaderTest.setup(module);