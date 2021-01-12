
var firebaseConfig = {
  apiKey: "AIzaSyAmIRvMh7LECi_eoRrzpa6rN3n92c2PeuU",
  authDomain: "mikamisotsuken.firebaseapp.com",
  projectId: "mikamisotsuken",
  storageBucket: "mikamisotsuken.appspot.com",
  messagingSenderId: "413021034693",
  appId: "1:413021034693:web:9faa29d36c9d2a8a96b8ac"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Vueの処理 


var db = firebase.firestore();
/*
db.collection('nod')
  .get()
  .then((querySnapshot)=>{
    querySnapshot.forEach((doc)=>{
      console.log(doc.data().nodclass); // textに先ほど追加したデータが入っています。
    })
  });
*/
// Page init event
var username;   // ユーザー名
var classname;  //授業名


// Page init event
document.addEventListener('init', function (event) {
  var page = event.target;

  if (page.matches('#first-page')) {

    page.querySelector('#push-button').onclick = function () {
      username = $('#username').val();
      classname = $('#classname').val();

      if ($('#classname').val() == '') {
        ons.notification.alert('授業名を入力してください');
        return;
      }
      if ($('#username').val() === '') {
        ons.notification.alert('学籍番号を入力してください');
        return;
      }
      
      document.querySelector('#navigator').pushPage('page2.html');
    };
  } else if (page.matches('#second-page')) {
    page.querySelector('#pop-button').onclick = function () {
      document.querySelector('#navigator').popPage();
    };

  }
});

class Nod {
  constructor(time) {
    this.time = time;
  }
}

var username;   //ユーザ名
var classname;  //授業名

function addNod() {
  let now = new Date();
  nods.push(new Nod(now));
  $("#nod-list").append("<p>" + now.getMonth() + "/" + now.getDate() + ":" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "</p></li>")

  //DB上に登録
  db.collection("nod").add({
    noduser: username,
    nodclass: classname,
    nodtime: now
  })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });

};

let nods = []; //クライアント表示用うなずき配列
let nodsLifeCount = 0; //うなずき配列探索開始地点
let start = new Date(); //入室時間
var myClock; //入室中のタイマー


function clock() { //1秒ごとに連続授業時間とうなずき表示を更新する関数

  let now = new Date();
  let date = document.getElementById('date');
  let timer = document.getElementById('timer');
  let message =document.getElementById('message');
  let elapse = (now.getTime() - start.getTime()) / 1000; 
  var m = parseInt((elapse / 60));
  var s = parseInt(elapse % 60);
  timer.textContent = "在室時間  " + m + "分" + parseInt(elapse % 60)+"秒";
  var list = 0; //表示するうなずき数
  var pCount = 0; //今回の実行で新たに除外されるうなずき数


  if (nods.length > 0) {
    for (var i = nodsLifeCount; i < nods.length; i++) {
      if (nods[i].time.getTime() + 20000 > now.getTime()) {//探索中のうなずきが現在時刻から20秒以内の場合
        list += 1; //表示するうなずきを追加(20秒以内のうなずきである) 
      } else {
        pCount += 1;//除外するうなずきを追加
      }
    }
  }
  nodsLifeCount += pCount; //次回の探索開始地点を更新
  document.getElementById("nods-view").style.setProperty('--zoom', Math.log(list + 1.0) * 0.4 + 1);

  if(m>85){message.innerText = "おめでとう！\n最後まで他のアプリを開かず受講できました！";
  }else if(m>45&&list>3){message.innerText = "授業の半分以上を共にしています．あとひと頑張り！";
  }else if(m>15&&list>3){message.innerText = "素晴らしい集中力です．その調子！";
  }else if(m>3&&list>1){message.innerText = "誘惑に耐えて受講できています！";
  }else if(m<1&&list<1){message.innerText = "今日もがんばりましょう！\nうなずきはボタンタップ！";
  }else{message.innerText ="";}
}

function startClock() {

  var myclass = document.getElementById('myclass');
  var myname = document.getElementById('myname');
  myclass.textContent= classname;
  myname.textContent= username + "で入室中";
  start = new Date();
  nods = [];
  nodsLifeCount = 0;
  clock();
  myClock = setInterval(clock, 1000);
}

function endClock() {
  clearInterval(myClock);
}


document.addEventListener('show', function (event) {
  var page = event.target;
  if (page.id === "second-page") {
    startClock();
    console.log("clockstart")
  }
  if (page.id === "first-page") {
    endClock();
    console.log("clockstop")
  }
}, false);

document.addEventListener('deviceready', () => {
  // アプリがバックグラウンドに移行した時に処理を行う
  document.addEventListener('pause', () => {
    endClock();
    console.log('Pause!');
  });
});
document.addEventListener('resume', () => {
  setTimeout(() => {
    startClock();
    console.log('Resume!');
  }, 0);
});

/*
window.addEventListener("load", function(){
    clock();
});
*/

/* //質問
function addTodo(camera_url) {
    var body = $("#todo-body").val();

    $.mobile.changePage($("#list-page"));
    $("#todo-list").append("<p>" + body + "</p></li>")
    $("#todo-list").listview('refresh');
};
*/

/* //疑問
let moveY =0; 
window.addEventListener("touchstart", function(event) {
  var touchObject = event.changedTouches[0] ;
  moveY = touchObject.pageY ;	
});
window.addEventListener("touchend", function(event) {
  var touchObject = event.changedTouches[0] ;
  var y = touchObject.pageY ;	
  if(moveY > y+200){

    addQ();
  }
});

function addQ() {
   let now = new Date();
       document.getElementById("questions-view").style.setProperty('--move',1000);
   questions.push(new Question(now));
    $("#Q-list").append("<p> 疑問が発生！" +now.getMonth() + "/" + now.getDate() + ":" +now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()+"</p></li>")
    $("#Q-list").listview('refresh');
};

class Question {
 constructor(time) {
  this.time = time;
 }
}
let questions =[];
let questionsLifeCount = 0;
*/