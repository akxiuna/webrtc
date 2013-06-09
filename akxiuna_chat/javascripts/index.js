/* This source is distributed under the MIT License: Copyright © 2013 Alvin Khoo<akxiuna>.*/
window.onload = function(){
    var uniqueToken = document.getElementById('unique-token');
	var token = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
    uniqueToken.innerHTML = token;	
}
function redirect(){
	window.location="webchat.html"+document.getElementById('unique-token').innerHTML;
}