js-media-manager
================

Media Manager app with Win 8 metro style UI and NodeJS backend.

<h2>Product Backlog:</h2>
- Test case for MediaFolder
- Scan for new media on start-up
- Save a database of the media to support search and other features

<br>
<h2>How to run the server:</h2>
- Go to the server folder : <code><YOUR_REPO_FOLDER>/js-media-manager/server/</code>
	<br>
and run:
<br>
<code>node main</code>

<h3>Queries samples to run on the browser</h3>
- Search by year: <code>http://localhost:9090/searchMedia?searchQuery=year:2012</code>
- Search by Title: <code>http://localhost:9090/searchMedia?searchQuery=expendables</code>

<b>NOTE</b> The query will be improved and the parameters format in the URL might change.

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

    