var UnitTest = require('./unitTest');

var tests = new Array();
//add tests
tests.push(require('./utilTest'));
tests.push(require('./promisseTest'));
tests.push(require('./mediaFileTest'));
tests.push(require('./imdbScraperTest'));
tests.push(require('./imdbOrgScraperTest'));
tests.push(require('./imgDownloaderTest'));
tests.push(require('./mediaFolderTest'));

UnitTest.runAll(tests);