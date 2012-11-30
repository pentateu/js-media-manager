var UnitTest = require('./unitTest');

var tests = new Array();

var online = false;

//add tests

tests.push(require('./utilTest'));
tests.push(require('./promisseTest'));

//media related
tests.push(require('./mediaFileTest'));
tests.push(require('./mediaFolderTest'));
tests.push(require('./mediaStoreTest'));

if(online){
	//on-line - require internet connection
	tests.push(require('./mediaScraperTest'));
	tests.push(require('./imdbOrgScraperTest'));
	tests.push(require('./imgDownloaderTest'));	
}



UnitTest.runAll(tests);