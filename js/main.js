var inputContext = null;
var keyboardElement;
var indexString = "";
var enMod = 0;
var vibrate = true;
var selectKeys;
var partKeys;
var selectionMod = false;
var selections = "";
var selectionIndex = 0;
var buffer;
var bufferQuick;
var bufferIndex = 0;
var bufferKey = new ArrayBuffer(3);
var key_uint8view = new Uint8Array(bufferKey, 0, 3);

function init() {
  keyboardElement = document.getElementById('keyboard');
  selectKeys = document.querySelectorAll('.key-select');
  partKeys = document.querySelectorAll('.key-part');
  var xhtQuick = new XMLHttpRequest();
  xhtQuick.open('GET', '/ar30_quick.data', true);
  xhtQuick.responseType = 'arraybuffer';
  xhtQuick.onload = function(e){
    bufferQuick= xhtQuick.response;
  };
  xhtQuick.send();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/ar30.data', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e){
    buffer = xhr.response;
  };
  xhr.send();

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
      if(selectionMod){
        nextSelection();  
      }else{
        var result = searchWords( true );
        if (typeof result == "number"){
          sendKey( result );
          resetSelectKey();
          indexString = "";
          renewKeyGroup();  
        }else if(result == null){
          indexString = "";
          renewKeyGroup();  
          resetSelectKey();
        }
        else{
          selections = result;
          enterSelectionMode();
        }
      }
    }else{
      sendKey(32);  
    }
  });

  var enterKey = document.getElementById('enter');
  enterKey.addEventListener('click', function deleteKeyHandler(){
    sendKey(13);
  });

  function listenerForSelectKey( i ) {
    selectKeys[i].addEventListener('click', selectKeyHandler);
  }
  for ( i = 0; i< selectKeys.length; i++) {
    listenerForSelectKey(i);
  }

  var deleteKey = document.getElementById('delete');
  var deletePress= false;
  deleteKey.addEventListener('touchstart', function deleteLongHandler() {
    deletePress = true;
    var loop = setInterval( function loopDelete() {
      if(indexString) {
        indexString = "";
        renewKeyGroup();
        resetSelectKey();
        if(selectionMod) {
          exitSelectionMode();
        }
      }else{
        sendKey(8);
      }
      if( !deletePress) clearInterval( loop );
    }, 200);
  });
  
  deleteKey.addEventListener('touchend', function longHandler() {
    deletePress = false;
  });

  function listenerForPartKeys( i ) {
    partKeys[i].addEventListener('click', partKeyHandler );
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
function selectKeyHandler( e ) {
  if( e.target.innerHTML){
    if ( [ '，', '（', '＃', '＋', '♀', '＄', '▁', '①', 'Α', 'ㄅ'].indexOf(e.target.innerHTML) > -1 &&
         indexString == "w"){
      selections = symbolSelections(e.target.innerHTML);
      enterSelectionMode();
    }else{ 
      sendKey( e.target.innerHTML.charCodeAt(0) );
      indexString = "";
      renewKeyGroup();
      if (selectionMod){
        exitSelectionMode();    
      }else{
        resetSelectKey();
      }
    }
  }
}

function partKeyHandler(e) {
  if ( enMod ) {
    sendKey(e.target.innerHTML.charCodeAt(0));
  }else{
    if ( e.target.innerHTML == 'i' && indexString.length < 5 || indexString.length < 4 ) {
      indexString += e.target.innerHTML;
      renewKeyGroup();
      var words = searchWords( false );
      for ( var i = 0; i< selectKeys.length; i++) {
        selectKeys[i].innerHTML = words[i] || '';
      } 
    }else{
      indexString = "";
      resetSelectKey();
      renewKeyGroup();
    }
  }
}

function resizeWindow() {
  window.resizeTo(window.innerWidth, keyboardElement.clientHeight);
}

function renewKeyGroup(){
  i = indexString.length;
  var keyNum = "qwertyuiopasdfghjkl;zxcvbnm,./".indexOf(indexString[i-1]) + 1;
  var firstAndSecondBytes = new Uint16Array(bufferKey, 0, 1);
  switch(i){
    case 0:
      firstAndSecondBytes[0] = 0;
      key_uint8view[2] = 0;
      bufferIndex = 0;
      document.getElementById('sendKey').innerHTML = "";
      return;
    case 1:
      key_uint8view[0] = keyNum;
      break;
    case 2:
      firstAndSecondBytes[0] = (key_uint8view[0] + keyNum * 32);
      break;
    case 3:
      key_uint8view[1] = key_uint8view[1] | (keyNum * 8);
      break;
    case 4:
      key_uint8view[2] = keyNum;
      break;
    case 5:
      key_uint8view[2] += keyNum * 4;
       break; 
  }
  document.getElementById('sendKey').innerHTML += map(indexString[i-1]);
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
  var candidates = [];
  if (space){
    for(var i = bufferIndex; i < buffer.byteLength / 5; i++ ){
      var table_uint8view = new Uint8Array(buffer, i*5, 3);
      if( key_uint8view[0] == table_uint8view[0] &&
          key_uint8view[1] == table_uint8view[1] &&
          key_uint8view[2] == table_uint8view[2]){
        var uint16view = new Uint16Array(buffer.slice(i*5 + 3, i*5 + 5));
        candidates.push(uint16view[0]);
      }else{
        if(candidates.length > 0){
          break; 
        }
      }
    }
    if (candidates.length == 1){
      return candidates[0];
    }else if (candidates.length == 0){
      return null;
    }
    else{
      candidates = candidates.map(function(e){return String.fromCharCode(e);});
    }
  }else{
    switch(indexString.length){
      case 1:
        candidates = quickSearch(indexString);
        for(var i = bufferIndex; i < buffer.byteLength / 5; i++ ){
          var table_uint8view = new Uint8Array(buffer, i*5, 3);
          if( key_uint8view[0] == (table_uint8view[0] & 31)){
              bufferIndex = i;
              break;
          }
        }
        break;
      case 2:
        candidates = quickSearch(indexString);
        for(var i = bufferIndex; i < buffer.byteLength / 5; i++ ){
          var table_uint8view = new Uint8Array(buffer, i*5, 3);
          if( key_uint8view[0] == table_uint8view[0] &&
              key_uint8view[1] == (table_uint8view[1] & 3)){
              bufferIndex = i;
              break;
          }
        }
        break;
      case 3:
        for(var i = bufferIndex; i < buffer.byteLength / 5; i++ ){
          var table_uint8view = new Uint8Array(buffer, i*5, 3);
          if( key_uint8view[0] == table_uint8view[0] &&
              key_uint8view[1] == table_uint8view[1]){
            var col = table_uint8view[2] % 10;
            col = col == 0 ? 9 : col - 1;
            if(candidates[col] == undefined){
              var uint16view = new Uint16Array(buffer.slice(i*5 + 3, i*5 + 5));
              candidates[col] = String.fromCharCode(uint16view[0]);
            }
          }else{
            if(candidates.length > 0){
              break; 
            }
          }
        }
        break;
      default:
        for(var i = bufferIndex; i < buffer.byteLength / 5; i++ ){
          var table_uint8view = new Uint8Array(buffer, i*5, 3);
          if( key_uint8view[0] == table_uint8view[0] &&
              key_uint8view[1] == table_uint8view[1] &&
              key_uint8view[2] == (table_uint8view[2] & 31)){
              if(candidates.length < 10){
                var uint16view = new Uint16Array(buffer.slice(i*5 + 3, i*5 + 5));
                candidates.push(String.fromCharCode(uint16view[0]));
              }else{
                break;
              }
          }else{
            if(candidates.length > 0){
              break; 
            }
          }
        }
        break;
    }
  } 
  return candidates;
}

function enterSelectionMode(){
  selectionMod = true;
  selectKeys = document.querySelectorAll('.key-select, .key-part'); 
  selectionIndex = 0;
  for( var i = 0; i < partKeys.length; i++){
    partKeys[i].removeEventListener('click', partKeyHandler);
    partKeys[i].addEventListener('click', selectKeyHandler);
  }
  for( var i = 0; i < selectKeys.length; i++){ 
    selectKeys[i].innerHTML = selections[i] || "";
  }
  selectionIndex += 40;
  document.getElementById('sendKey').innerHTML = "▽";
}

function nextSelection(){
  if ( selectionIndex > selections.length) {
    selectionIndex = 0;
  }
  for( var i = 0; i < selectKeys.length; i++){ 
    selectKeys[i].innerHTML = selections[i + selectionIndex ] || "";
  }
  selectionIndex += 40;
}
function exitSelectionMode(){
  selectionMod = false;
  selectKeys = document.querySelectorAll('.key-select');
  for( var i = 0; i < partKeys.length; i++){
    partKeys[i].removeEventListener('click', selectKeyHandler);
    partKeys[i].addEventListener('click', partKeyHandler);
  }
  for ( var i = 0; i < partKeys.length; i++){
    partKeys[i].innerHTML = "qwertyuiopasdfghjkl;zxcvbnm,./"[i];
  }
  resetSelectKey();
  document.getElementById('sendKey').innerHTML =  '';
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

function quickSearch( ch ) {
  switch (ch) {
    case 'a':
      return ['一', '到', '聽', '現', '政', '弄', '兩', '而', '面', '要'];
    case 'b':
      return ['又', '力', '屬', '居', '發', '屋', '通', '習', '務', '局'];
    case 'c':
      return ['小', '卜', '水', '法', '決', '注', '當', '對', '省', '常'];
    case 'd':
      return ['山', '片', '！', '「', '」', '、', '“', '”', '（', '）'];
    case 'e':
      return ['門', '止', '鬥', '開', '關', '鬧', '些', '閱', '處', '桌'];
    case 'f':
      return ['十', '莊', '落', '著', '華', '萬', '真', '花', '敬', '故'];
    case 'g':
      return ['石', '戶', '也', '那', '破', '孩', '遍', '驗', '承', '啟'];
    case 'h':
      return ['方', '病', '施', '痛', '良', '遊', '族', '於', '為', '旗'];
    case 'i':
      return ['金', '半', '並', '鎮', '食', '拿', '前', '美', '道', '會'];
    case 'j':
      return ['目', '刀', '角', '周', '眼', '運', '解', '肉', '色', '免'];
    case 'k':
      return ['人', '入', '八', '做', '他', '進', '你', '坐', '作', '個'];
    case 'l':
      return ['竹', '看', '師', '和', '第', '種', '向', '答', '我', '的'];
    case 'm':
      return ['貝', '夕', '貼', '財', '夠', '賠', '體', '贈', '然', '過'];
    case 'n':
      return ['之', '心', '定', '麼', '字', '忙', '家', '應', '寫', '空'];
    case 'o':
      return ['手', '斤', '臼', '無', '把', '接', '興', '推', '學', '動'];
    case 'p':
      return ['日', '曰', '田', '時', '最', '是', '照', '點', '易', '國'];
    case 'q':
      return ['工', '七', '車', '哥', '事', '較', '敢', '頭', '或', '區'];
    case 'r':
      return ['土', '士', '廿', '起', '地', '老', '帶', '報', '都', '臺'];
    case 's':
      return ['乙', '鄉', '收', '跳', '跟', '響', '逃', '飛', '路', '踢'];
    case 't':
      return ['隨', '民', '巴', '書', '張', '院', '強', '除', '群', '陽'];
    case 'u':
      return ['月', '皿', '縣', '腦', '助', '臉', '服', '勝', '胞', '腳'];
    case 'v':
      return ['木', '機', '極', '村', '根', '校', '想', '來', '格', '查'];
    case 'w':
      return [ '，', '（', '＃', '＋', '♀', '＄', '▁', '①', 'Α', 'ㄅ' ];
    case 'x':
      return ['風', '幾', '經', '結', '級', '將', '能', '給', '總', '約'];
    case 'y':
      return ['立', '言', '裡', '新', '記', '該', '認', '說', '話', '就'];
    case 'z':
      return ['不', '大', '夫', '雨', '成', '在', '布', '願', '原', '電'];
    case '.':
      return ['。', '身', '行', '街', '很', '往', '愛', '從', '後', '得'];
    case '/':
      return ['四', '虫', '？', '『', '』', '．', '–', '＊', '／', '…'];
    case ';':
      return ['口', '：', '；', '叫', '呢', '嗎', '吹', '別', '吃', '號'];
    case ',':
      return ['，', '火', '米', '精', '燈', '料', '鄰', '勞', '類', '營'];
    default:
      for(var i = 0; i < bufferQuick.byteLength / 22; i++ ){
        var table_uint8view = new Uint8Array(bufferQuick, i*22, 2);
        if( key_uint8view[0] == table_uint8view[0] &&
            key_uint8view[1] == table_uint8view[1] ){
          var uint16view = new Uint16Array(bufferQuick.slice(i*22 + 2, i*22 + 24));
          var quick_words = [];
          uint16view.forEach(function(e){
            if(e==0){
              quick_words.push('');
            }else{
              quick_words.push(String.fromCharCode(e));
            }
          });
          return quick_words;
        }
      }
  }
}

function symbolSelections ( ch ){
  switch(ch){
    case '，':
      return "，、。．‧；：？！︰…‥﹐﹑﹒·﹔﹕﹖﹗｜–︱—︳╴︴﹏";
    case '（':
      return "（）︵︶｛｝︷︸〔〕︹︺【】︻︼《》︽︾〈〉︿﹀「」﹁﹂『』﹃﹄﹙﹚﹛﹜﹝﹞‘’“”〝〞‵′";
    case '＃': 
      return "＃＆＊※§〃○●△▲◎☆★◇◆□■▽▼㊣℅¯￣＿ˍ﹉﹊﹍﹎﹋﹌﹟﹠﹡";
    case '＋':
      return "＋－×÷±√＜＞＝≦≧≠∞≒≡﹢﹣﹤﹥﹦～∩∪⊥∠∟⊿㏒㏑∫∮∵∴";
    case '♀':
      return "♀♂⊕⊙↑↓←→↖↗↙↘∥∣／＼∕﹨";
    case '＄':
      return "＄￥〒￠￡％＠℃℉﹩﹪﹫㏕㎜㎝㎞㏎㎡㎎㎏㏄°兙兛兞兝兡兣嗧瓩糎";
    case '▁':
      return "▁▂▃▄▅▆▇█▏▎▍▌▋▊▉┼┴┬┤├▔─│▕┌┐└┘╭╮╰╯═╞╪╡◢◣◥◤╱╲╳╔╦╗╠╬╣╚╩╝╒╤╕╞╪╡╘╧╛╓╥╖╟╫╢╙╨╜║═╭╮╰╯￭";
    case '①':
      return "①②③④⑤⑥⑦⑧⑨⑩⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ〡〢〣〤〥〦〧〨〩十卄卅";
    case 'Α':
      return "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω";
    case 'ㄅ':
      return "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ˙ˉˊˇˋ";
  }
} 

window.addEventListener('load', init);
