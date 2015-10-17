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
        if ( [ '，', '（', '＃', '＋', '♀', '＄', '▁', '①', 'Α', 'ㄅ'].indexOf(e.target.innerHTML) > -1){
          // go into symbol mode
          sendKey( 'Ω'.charCodeAt(0) );
          
        }else{ 
          sendKey( e.target.innerHTML.charCodeAt(0) );
          resetSelectKey();
          indexString = "";
        }
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
      mock = quickSearch(indexString);
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

function quickSearch( ch ) {
  switch (ch) {
    case 'a':
      return ['一', '到', '聽', '現', '政', '弄', '兩', '而', '面', '要']
      break;
    case 'b':
      return ['又', '力', '屬', '居', '發', '屋', '通', '習', '務', '局']
      break;
    case 'c':
      return ['小', '卜', '水', '法', '決', '注', '當', '對', '省', '常']
      break;
    case 'd':
      return ['山', '片', '！', '「', '」', '、', '“', '”', '（', '）']
      break;
    case 'e':
      return ['門', '止', '鬥', '開', '關', '鬧', '些', '閱', '處', '桌']
      break;
    case 'f':
      return ['十', '莊', '落', '著', '華', '萬', '真', '花', '敬', '故']
      break;
    case 'g':
      return ['石', '戶', '也', '那', '破', '孩', '遍', '驗', '承', '啟']
      break;
    case 'h':
      return ['方', '病', '施', '痛', '良', '遊', '族', '於', '為', '旗']
      break;
    case 'i':
      return ['金', '半', '並', '鎮', '食', '拿', '前', '美', '道', '會']
      break;
    case 'j':
      return ['目', '刀', '角', '周', '眼', '運', '解', '肉', '色', '免']
      break;
    case 'k':
      return ['人', '入', '八', '做', '他', '進', '你', '坐', '作', '個']
      break;
    case 'l':
      return ['竹', '看', '師', '和', '第', '種', '向', '答', '我', '的']
      break;
    case 'm':
      return ['貝', '夕', '貼', '財', '夠', '賠', '體', '贈', '然', '過']
      break;
    case 'n':
      return ['之', '心', '定', '麼', '字', '忙', '家', '應', '寫', '空']
      break;
    case 'o':
      return ['手', '斤', '臼', '無', '把', '接', '興', '推', '學', '動']
      break;
    case 'p':
      return ['日', '曰', '田', '時', '最', '是', '照', '點', '易', '國']
      break;
    case 'q':
      return ['工', '七', '車', '哥', '事', '較', '敢', '頭', '或', '區']
      break;
    case 'r':
      return ['土', '士', '廿', '起', '地', '老', '帶', '報', '都', '臺']
      break;
    case 's':
      return ['乙', '鄉', '收', '跳', '跟', '響', '逃', '飛', '路', '踢']
      break;
    case 't':
      return ['隨', '民', '巴', '書', '張', '院', '強', '除', '群', '陽']
      break;
    case 'u':
      return ['月', '皿', '縣', '腦', '助', '臉', '服', '勝', '胞', '腳']
      break;
    case 'v':
      return ['木', '機', '極', '村', '根', '校', '想', '來', '格', '查']
      break;
    case 'w':
      return [ '，', '（', '＃', '＋', '♀', '＄', '▁', '①', 'Α', 'ㄅ' ]
      break;
    case 'x':
      return ['風', '幾', '經', '結', '級', '將', '能', '給', '總', '約']
      break;
    case 'y':
      return ['立', '言', '裡', '新', '記', '該', '認', '說', '話', '就']
      break;
    case 'z':
      return ['不', '大', '夫', '雨', '成', '在', '布', '願', '原', '電']
      break;
    case '.':
      return ['。', '身', '行', '街', '很', '往', '愛', '從', '後', '得']
      break;
    case '/':
      return ['四', '虫', '？', '『', '』', '．', '–', '＊', '／', '…']
      break;
    case ';':
      return ['口', '：', '；', '叫', '呢', '嗎', '吹', '別', '吃', '號']
      break;
    case ',':
      return ['，', '火', '米', '精', '燈', '料', '鄰', '勞', '類', '營']
      break;
  }
}

window.addEventListener('load', init);
