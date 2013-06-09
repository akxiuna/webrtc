webrtc
======
This repository contains two projects which makes use of the latest WebRTC technology in the market. Both projects have only
been tested on Google Chrome 27+. Future commits will include support for Firefox and Opera, the two other browsers which have
extensive WebRTC support. 

1. akxiuna chat
  * Simple private web chat application that adopts most of the code from [Muaz Khan's](https://webrtc-experiment.appspot.com/websocket/) demonstration. The signalling mechanism used
    here is HTML5 Websockets and Muaz Khan's pubnub Websocket server is also used.
2. akxiuna cam
  * Simple photobooth application that utilizes getUserMedia and the Mediastream API combined with HTML5's canvas element and 
    other interesting technologies in javascript (face detection, ascii pictures etc.)

Both projects are distributed under the [MIT license](http://opensource.org/licenses/MIT)
