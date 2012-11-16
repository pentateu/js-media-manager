js-media-manager
================

Media Manager app with Win 8 metro style UI and NodeJS backend.

<h2>Product Backlog:</h2>

 - Test case for MediaFolder
 - Scan for new media on start-up
 - Save a database of the media to support search and other features


 <h2>How to run the server:</h2>
  - Go to the server folder : <code><YOUR_REPO_FOLDER>/js-media-manager/server/</code>
  	<br>
    and run:
    <br>
    <code>node main</code>

<h2>Unit Testing</h2>
 <h3>How to setup the unit testing on your machine:</h3>
  - Open the config file : <code><YOUR_REPO_FOLDER>/js-media-manager/server/UnitTest/testConfig.json</code>
  and adjust the location of the baseTestMediaFolder property.
  <br>
  My configuration is:
  <br>
  <code>
  	{
		"baseTestMediaFolder":"/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_unitTest_folders"
	}
  </code>

 <h3>How to run the test suite:</h3>
  - Go to the unit test folder : <code><YOUR_REPO_FOLDER>/js-media-manager/server/UnitTest/</code>
  	<br>
    and run:
    <br>
    <code>node testSuite</code>

 <h3>How to run a single test:</h3>
  - Go to the unit test folder : <code><YOUR_REPO_FOLDER>/js-media-manager/server/UnitTest/</code>
  	<br>
    and run:
    <br>
    <code>node <test file></code>
    <br>
    To run the mediaFileTest.js you do:
    <code>node mediaFileTest</code>

    