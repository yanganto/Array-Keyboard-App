var inputContext = null;
var keyboardElement;
var indexString = "";
var enMod = 0;
var selectKeys;
var vibrate = true;

function init() {
  keyboardElement = document.getElementById('keyboard');
	selectKeys = document.querySelectorAll('.key-select');

  window.navigator.mozInputMethod.oninputcontextchange = function() {
    inputContext = navigator.mozInputMethod.inputcontext;
    resizeWindow();
  };

  window.addEventListener('resize', resizeWindow);

	var keys = document.querySelectorAll('.key');
	function vibrateAsClick(i){
		keys[i].addEventListener( 'click', function keyHandler() {
		  window.navigator.vibrate(50);
		});
	}

	for (var i = 0; i < keys.length; i++) {
		if ( vibrate ) {
			vibrateAsClick(i);	
		}
	}

  keyboardElement.addEventListener('mousedown', function onMouseDown(evt) {
  // Prevent loosing focus to the currently focused app
  // Otherwise, right after mousedown event, the app will receive a focus event.
    evt.preventDefault();
  });

	var modKey = document.getElementById('enMod');
	modKey.addEventListener('click', function modKeyHandler() {
		enMod += 1;
		var partKeys = document.querySelectorAll('.key-part');
		switch (enMod){
			case 1:
				modKey.innerHTML = 'en';
				break;
			case 2:
				modKey.innerHTML = 'EN';
				for(var i = 0; i < partKeys.length; i++){
					partKeys[i].innerHTML = partKeys[i].innerHTML.toUpperCase();
				}
				break;
			case 0: 
			default:
				for(var i = 0; i < partKeys.length; i++){
					partKeys[i].innerHTML = partKeys[i].innerHTML.toLowerCase();
				}
			  modKey.innerHTML = '中';
				enMod = 0;
			break;
		}
		indexString = "";
		resetSelectKey();
		renewKeyGroup();
	});

  var sendKeyElement = document.getElementById('sendKey');
  sendKeyElement.addEventListener('click', function sendKeyHandler() {
		if (indexString){
			var word = searchWords( true );
			sendKey( word.charCodeAt(0) );
			resetSelectKey();
			indexString = "";
			renewKeyGroup();	
		}else{
			sendKey(32);	
		}
  });

	var enterKey = document.getElementById('enter');
	enterKey.addEventListener('click', function deleteKeyHandler(){
	  sendKey(13);
	});

	var deleteKey = document.getElementById('delete');
	deleteKey.addEventListener('click', function deleteKeyHandler(){
		if(indexString) {
			indexString = "";
			renewKeyGroup();
			resetSelectKey();
		}else{
			sendKey(8);
		}
	});

	function listenerForSelectKey( i ) {
	  selectKeys[i].addEventListener('click', function selectKeyHandler( e ) {
			if( e.target.innerHTML){
		    sendKey( e.target.innerHTML.charCodeAt(0) );
			  resetSelectKey();
				indexString = "";
				renewKeyGroup();
			}
	  });
	}
	for ( i = 0; i< selectKeys.length; i++) {
		listenerForSelectKey(i);
	}
  var deletePress= false;
  deleteKey.addEventListener('touchstart', function deleteLongHandler() {
		deletePress = true;
		var loop = setInterval( function loopDelete() {
			sendKey(8);
		    window.navigator.vibrate(50);
			if( !deletePress) clearInterval( loop );
		}, 200);
  });
  
  deleteKey.addEventListener('touchend', function longHandler() {
		deletePress = false
  });

  var partKeys = document.querySelectorAll('.key-part');
	function arrayInput(c ) { 
		if ( c == 'i' && indexString.length < 5 || indexString.length < 4 ) {
			indexString += c;
		  var words = searchWords( false );
		  for ( i = 0; i< selectKeys.length; i++) {
			  selectKeys[i].innerHTML = words[i];
		  }	
		}else{
			indexString = "";
			resetSelectKey();
		}
	}
  function listenerForPartKeys( i ) {
		partKeys[i].addEventListener('click', function partKeyHangler(e) {
				if ( enMod ) {
					sendKey(e.target.innerHTML.charCodeAt(0));
				}else{
				  arrayInput( e.target.innerHTML );
				  renewKeyGroup();
				}
		});
  }
	for (i = 0; i < partKeys.length; i++) {
      listenerForPartKeys(i);
	}

  var switchElement = document.getElementById('switchLayout');
  switchElement.addEventListener('click', function switchHandler() {
    var mgmt = navigator.mozInputMethod.mgmt;
    mgmt.next();
  });

  // long press to trigger IME menu
  var menuTimeout = 0;
  switchElement.addEventListener('touchstart', function longHandler() {
    menuTimeout = window.setTimeout(function menuTimeout() {
      var mgmt = navigator.mozInputMethod.mgmt;
      mgmt.showAll();
    }, 700);
  });

  switchElement.addEventListener('touchend', function longHandler() {
    clearTimeout(menuTimeout);
  });
}

function resizeWindow() {
  window.resizeTo(window.innerWidth, keyboardElement.clientHeight);
}

function renewKeyGroup(){
	var showKeyGroup = "";
	for ( i = 0; i < indexString.length; i++) {
    showKeyGroup += map( indexString[i] );
	}
	document.getElementById('sendKey').innerHTML = showKeyGroup;
}

function map( enChar ){
	var arrayKey="";
	switch ( enChar ){
		case 'a':
			return "1-";
		case 's':
			return "2-";
		case 'd':
			return "3-";
		case 'f':
			return "4-";
		case 'g':
			return "5-";
		case 'h':
			return "6-";
		case 'j':
			return "7-";
		case 'k':
			return "8-";
		case 'l':
			return "9-";
		case ';':
			return "0-";
		case 'q':
			return "1^";
		case 'w':
			return "2^";
		case 'e':
			return "3^";
		case 'r':
			return "4^";
		case 't':
			return "5^";
		case 'y':
			return "6^";
		case 'u':
			return "7^";
		case 'i':
			return "8^";
		case 'o':
			return "9^";
		case 'p':
			return "0^";
		case 'z':
			return "1v";
		case 'x':
			return "2v";
		case 'c':
			return "3v";
		case 'v':
			return "4v";
		case 'b':
			return "5v";
		case 'n':
			return "6v";
		case 'm':
			return "7v";
		case ',':
			return "8v";
		case '.':
			return "9v";
		case '/':
			return "0v";
	}
}

function sendKey(keyCode) {
  switch (keyCode) {
  case KeyEvent.DOM_VK_BACK_SPACE:
  case KeyEvent.DOM_VK_RETURN:
    if (inputContext) {
      inputContext.sendKey(keyCode, 0, 0);
    }
    break;

  default:
    if (inputContext) {
      inputContext.sendKey(0, keyCode, 0);
    }
    break;
  }
}

function resetSelectKey() {
	for ( i = 0; i< selectKeys.length; i++) {
		selectKeys[i].innerHTML = i + 1;
	}	
	selectKeys[9].innerHTML = 0;
}

function searchWords( space ){
	if (space) return '榮';
	var mock =[]
	switch( indexString.length){
		case 1:
			mock = ['，','火','米','精','燈','料','鄰','勞','類','營'];
			break;
		case 2:
			mock = ['炎','','米','','','','榮','','',''];
			break;
		case 3:
			mock = ['','','米','','','','榮','','',''];
			break;
		default:
			mock = ['','','','','','','榮','','',''];
			break;
	}
	return mock
}

window.addEventListener('load', init);
