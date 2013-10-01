$(document).ready(function() {

});

var authenticateUser = function() { // sends user to Instagram for authentication
	var userId = $('#lookup').val();
	var clientId = "a5f8092dddf4464b823580e2fc13d197";
	var url = "https://instagram.com/oauth/authorize/?client_id=" + clientId + "&redirect_uri=" + redirectUri + "&response_type=token";
	window.location = url;
}

var getAccessCode = function() { // retrieve accessCode from redirected URL after accepted authentication
	var accessUrl = $(location).attr('href');
	// http://your-redirect-uri#access_token=ACCESS-TOKEN
	// http://wainetam.github.io/#access_token=ACCESS-TOKEN
	var charCount = redirectUri.length + "#access_token=".length;
	return accessUrl.substring(charCount); //start at index at charCount, inclusive; string.substring(from, to)
}
var redirectUri = "https://dl.dropboxusercontent.com/u/4806320/goldenGrams/index.html"; // needs to match in my Instagram dev profile
// var redirectUri = "http://wainetam.github.io/"; // needs to match in my Instagram dev profile

var accessCode = getAccessCode();
var userId = accessCode.substring(0, accessCode.indexOf('.'));

$('#authenticateButton').on('click', function() {
	authenticateUser();
	$('#loadingImage').show();
});

if ($(location).attr('href') == redirectUri + "#access_token=" + accessCode) { // successful authentication
	$('#loginSuccess').show().fadeOut(3500); // show "login success", then fade
	$('#loadingImage').hide(); // hide spinning loader image
	$('#getGramsButton').show(); // show 'get grams' button	
	$('#authenticateButton').hide(); // hide instagram login button
}

var maxTimestamp = ""; // timestamp of latest taken pic in data array
var displayedPicCount = "10";

$('#getGramsButton').on('click', function() {
	var picCount = "-1"; // set to -1 to get all pics from feed, not 33 at a time
	// 	$.getJSON("https://api.instagram.com/v1/users/" + userId + "/media/recent?count=" + picCount + "&access_token=" + accessCode + "&callback=?", function(result) {
	$('#loadingImage').show();
	$.getJSON("https://api.instagram.com/v1/users/" + userId + "/media/recent?count=" + picCount + "&access_token=" + accessCode + "&callback=?", function(result) {
		// if (result.pagination.next_url) { // if next_url exists, then more images exist
		paginate(result);
		// } else {
		// 	 // no more pics!

		// need to save maxTimestamp as variable and use as input in API call; loop through
		// maxTimestamp = result.data[result.data.length-1].created_time;
		// console.log(maxTimestamp);
	});
});

var paginate = function(json) {
	var sortedLiked = [];
	$.getJSON(json.pagination.next_url + "&callback=?", function(result) { // result is array of objects
		console.log("---result.data pre-merge---");
		console.log(result.data);
		console.log('-----');
		console.log("---response.data---");
		console.log(result.data);
		console.log('-----');
		var mergedArray = $.merge(json.data, result.data);
		console.log('length of dataArray + response.data: ' + mergedArray.length);

		$.each(mergedArray, function(index, object) { 
			sortedLiked = mergedArray.sort(sortByLikes); 
			console.log("sorted" + index + ": " + object.likes.count);
		});

		$('#loadingImage').hide(); // hides spinning loader upon successful picture display
		displayPics(displayedPicCount, sortedLiked); // Q: needs to be inside innermost JSON request
	});
}	

var displayPics = function (picNum, pictureArray) {
	for (var i = 0; i < picNum; i++) {
		$('#photo_container').append('<div class="photo">' + '<img src=' + pictureArray[i].images.standard_resolution.url + '>' + '<br>' + 'Likes: ' + pictureArray[i].likes.count + '<br>' + convertUnixTime(pictureArray[i].created_time));
		console.log(pictureArray[i].likes.count);
	}
}

var sortByLikes = function (objectA, objectB) {
	return objectB.likes.count - objectA.likes.count;
}

var convertUnixTime = function(unixTime) { // convert to JS Date object
	var date = new Date(unixTime * 1000);
	var day = date.getDate();
	var month = date.getMonth() + 1; // add 1 b/c months in javascript go from 0 to 11
	var year = date.getFullYear();
	return month + '.' + day + '.' + year;
}