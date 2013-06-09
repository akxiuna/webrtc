/* This source is distributed under the MIT License: Copyright © 2013 Alvin Khoo<akxiuna>
	DISCLAIMER:
	Part of the code used in this file has been adopted from the sources indicated in index.html
*/

// requestAnimationFrame shim
(function() {
	var i = 0,
		lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'];

	while (i < vendors.length && !window.requestAnimationFrame) {
		window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
		i++;
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 1000 / 60 - currTime + lastTime),
				id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

			lastTime = currTime + timeToCall;
			return id;
		};
	}
}());

var App = {
	start: function(stream) {
	
		App.video.addEventListener('canplay', function() {
			App.setupEffectsButtons();
			App.video.removeEventListener('canplay');
			setTimeout(function() {
				App.video.play();
				App.canvas.style.display = 'inline';
				App.canvas.width = App.video.videoWidth;
				App.canvas.height = App.video.videoHeight;
				App.backCanvas.width = App.video.videoWidth / 4; //reduce backcanvas size by 4
				App.backCanvas.height = App.video.videoHeight / 4;
				App.backContext = App.backCanvas.getContext('2d');

				var w = 300 / 4 * 0.8, //60 this is the size of the glasses object, it is scaled down by 4 and 80%
					h = 270 / 4 * 0.8; //54 to fit the face

				App.comp = [{ //position of object, initially centre of screen
					x: (App.video.videoWidth / 4 - w) / 2, //reduce backcanvas size by 4
					y: (App.video.videoHeight / 4 - h) / 2,
					width: w, 
					height: h,
				}];

				App.drawToCanvas();
			}, 500);		//wrapping requestanimationframe in 500ms timeout
		}, true);

		var domURL = window.URL || window.webkitURL;
		App.video.src = domURL ? domURL.createObjectURL(stream) : stream;
	},
	denied: function() {
		alert("Why deny us????");
	},
	error: function(e) {
		if (e) {
			console.error(e);
		}
		alert("There was an error, try again later");
	},
	drawToCanvas: function() {
		requestAnimationFrame(App.drawToCanvas);

		var video = App.video,
			ctx = App.context,
			backCtx = App.backContext,
			m = 4,
			w = 2, // a scaling factor for the glasses to get the best fit on the face
			c = 22,
			i,
			j,
			k,
			imageData,
			comp;

		//filters	
		ctx.drawImage(video, 0, 0, App.canvas.width, App.canvas.height);
		imageData = ctx.getImageData(0, 0, App.canvas.width, App.canvas.height);							
		imageData = App.addFilters(imageData);
		ctx.putImageData(imageData, 0, 0);
		
		//objects
		backCtx.drawImage(video, 0, 0, App.backCanvas.width, App.backCanvas.height);

		comp = ccv.detect_objects(App.ccv = App.ccv || {
			canvas: App.backCanvas,
			cascade: cascade,
			interval: 0,
			min_neighbors: 1
		});

		if (comp.length) {
			App.comp = comp;
		}
		
		if(App.glasses_on){
		for (i = App.comp.length; i--; ) {
			ctx.drawImage(App.glasses, (App.comp[i].x - w / 2) * m, (App.comp[i].y - w / 2) * m, (App.comp[i].width + w) * m, (App.comp[i].height + w) * m);
		}	//times 4 to get back actual position of original image
		}
		if(App.headwear_on){
		for (j = App.comp.length; j--; ) {
			ctx.drawImage(App.headwear, (App.comp[j].x - 10 ) * m, (App.comp[j].y - 50) * m , (App.comp[j].width + 25) * m, (App.comp[j].height + 25) * m);
		}	//times 4 to get back actual position of original image
		}
		if(App.mouthpiece_on){
		for (k = App.comp.length; k--; ) {
			ctx.drawImage(App.mouthpiece, (App.comp[k].x) * m, (App.comp[k].y + c ) * m , (App.comp[k].width) * m, (App.comp[k].height) * m);
		}	//times 4 to get back actual position of original image
		}
	},
	setupEffectsButtons: function(){
	var effects = ["invert","red","blue","green","grayscale","sepia","bright","dark","noise","threshold"];
	var effectButton;
	for (var i=0; i < 10; i++) {
		effectButton = document.getElementById(effects[i]);
		effectButton.addEventListener('click', App.toggleEffect, false);
	}
	},
	toggleEffect: function(){
	var effect = this.id;
	if ($('#'+effect).hasClass("pressed")) 
		$('#'+effect).removeClass("pressed");
	else
		$('#'+effect).addClass("pressed");
	
	if (App.options.indexOf(effect) > -1) {
		App.options.splice(App.options.indexOf(effect), 1);
	} else {
     App.options.push(effect);
	}
	},
	
	addFilters: function(imageData){
	var data = imageData.data;

	for (var i = 0; i < App.options.length; i++) {
    var type = App.options[i];

    for (var j = 0; j < data.length; j += 4) {
      switch (type) {
        case "invert":
          data[j] = 255 - data[j];         // r
		  data[j + 1] = 255 - data[j + 1]; // g
		  data[j + 2] = 255 - data[j + 2]; // b
          break;
        case "red":
          data[j] = Math.min(255,data[j] * 2); // r
		  data[j + 1] = data[j + 1] / 2; // g
		  data[j + 2] = data[j + 2] / 2; // b
          break;
        case "blue":
          data[j] = data[j] / 2; // r
		  data[j + 1] = data[j + 1] / 2; // g
		  data[j + 2] = Math.min(255,data[j+2] * 2); // b
          break;
        case "green":
          data[j] = data[j] / 2; // r
		  data[j + 1] = Math.min(255,data[j+1] * 2); // g
		  data[j + 2] = data[j+2] / 2;  // b
          break;
		 case "grayscale":
		  var average = (data[j] + data[j+1] + data[j+2])/3;
		  data[j]=data[j+1]=data[j+2]=average;
		  break;
		 case "sepia":
		  var r = data[j];
		  var g = data[j + 1];
		  var b = data[j + 2];
		  data[j]     = (r * 0.393)+(g * 0.769)+(b * 0.189); // red
          data[j + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168); // green
          data[j + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131); // blue
		  break;
		 case "bright":
		  data[j] += 50;
		  data[j+1] += 50;
		  data[j+2] += 50;
		  break; 
		 case "dark":
		  data[j] -= 50;
		  data[j+1] -= 50;
		  data[j+2] -= 50;
		 break; 
		 case "noise":
		 var rand =  (0.5 - Math.random()) * 100;
		  data[j] += rand;
		  data[j+1] += rand;
		  data[j+2] += rand;
		 break;
		 case "threshold":
		 var v=0;
		 if((data[j]+data[j+1]+data[j+2])>200)
		 v=255;
		 data[j]=data[j+1]=data[j+2]=v;
		 break;
        default:
          break;
      }
    }
  }
  return imageData;
}
};

//objects initialization
App.glasses = new Image();
App.glasses.src = 'images/glasses1.png';

App.headwear = new Image();
App.headwear.src = 'images/headwear1.png';

App.mouthpiece = new Image();
App.mouthpiece.src = 'images/mouthpiece1.png';

App.options = [];

App.init = function() {
	App.video = document.querySelector('#video');
	App.backCanvas = document.createElement('canvas');
	App.canvas = document.querySelector('#output');
	App.canvas.style.display = 'none';
	App.context = App.canvas.getContext('2d');
	App.image = document.getElementById('image');
	
	//snapshot
	
	App.snapshot = document.getElementById('snapshot');
	App.snapshot.addEventListener('click',function(){
	App.image.src = App.canvas.toDataURL('image/jpeg');
	App.image.style.display = "";
	},false);
	
	// register objects
	/*glasses*/
	App.glasses_on = false;
    App.glassesbutton1 = document.getElementById('glasses1');
	App.glassesbutton2 = document.getElementById('glasses2');
	App.glassesbutton3 = document.getElementById('glasses3');
	App.noglasses = document.getElementById('noglasses');
	App.glassesbutton1.addEventListener('click', function(){App.glasses_on = true;App.glasses.src = 'images/glasses1.png';},false);
	App.glassesbutton2.addEventListener('click', function(){App.glasses_on = true;App.glasses.src = 'images/glasses2.png';},false);
	App.glassesbutton3.addEventListener('click', function(){App.glasses_on = true;App.glasses.src = 'images/glasses3.png';},false);
	App.noglasses.addEventListener('click', function(){App.glasses_on = false;},false);
	
	/*headwear*/
	App.headwear_on = false;
	App.headwearbutton1 = document.getElementById('headwear1');
	App.headwearbutton2 = document.getElementById('headwear2');
	App.headwearbutton3 = document.getElementById('headwear3');
	App.noheadwear = document.getElementById('noheadwear');
	App.headwearbutton1.addEventListener('click', function(){App.headwear_on = true;App.headwear.src = 'images/headwear1.png';},false);
	App.headwearbutton2.addEventListener('click', function(){App.headwear_on = true;App.headwear.src = 'images/headwear2.png';},false);
	App.headwearbutton3.addEventListener('click', function(){App.headwear_on = true;App.headwear.src = 'images/headwear3.png';},false);
	App.noheadwear.addEventListener('click', function(){App.headwear_on = false;},false);
	
	/*mouthpiece*/
	App.mouthpiece_on = false;
	App.mouthpiecebutton1 = document.getElementById('mouthpiece1');
	App.mouthpiecebutton2 = document.getElementById('mouthpiece2');
	App.mouthpiecebutton3 = document.getElementById('mouthpiece3');
	App.nomouthpiece = document.getElementById('nomouthpiece');
	App.mouthpiecebutton1.addEventListener('click', function(){App.mouthpiece_on = true;App.mouthpiece.src = 'images/mouthpiece1.png';},false);
	App.mouthpiecebutton2.addEventListener('click', function(){App.mouthpiece_on = true;App.mouthpiece.src = 'images/mouthpiece2.png';},false);
	App.mouthpiecebutton3.addEventListener('click', function(){App.mouthpiece_on = true;App.mouthpiece.src = 'images/mouthpiece3.png';},false);
	App.nomouthpiece.addEventListener('click', function(){App.mouthpiece_on = false;},false);
	
	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	
	try {
		navigator.getUserMedia_({
			video: true,
			audio: false
		}, App.start, App.denied);
	} catch (e) {
		try {
			navigator.getUserMedia_('video', App.start, App.denied);
		} catch (e) {
			App.error(e);
		}
	}

	App.video.loop = App.video.muted = true;
	App.video.load();
};

App.init();