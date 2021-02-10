var firebaseConfig = {
  apiKey: "AIzaSyAmIRvMh7LECi_eoRrzpa6rN3n92c2PeuU",
  authDomain: "mikamisotsuken.firebaseapp.com",
  projectId: "mikamisotsuken",
  storageBucket: "mikamisotsuken.appspot.com",
  messagingSenderId: "413021034693",
  appId: "1:413021034693:web:9faa29d36c9d2a8a96b8ac"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

class Nod { //クライアント表示用うなずきクラス
  constructor(time) {
    this.time = time;
  }
}
var username;   // ユーザー名
var classname;  //授業名
let nods = []; //クライアント表示用うなずき配列
let searchNods = 0; //うなずき配列探索開始地点
let start = new Date(); //入室時刻
var myClock; //在室時間
var room; //入室フラグ


document.addEventListener('init', function (event) { // 入室とページ遷移
  var page = event.target;
  if (page.matches('#first-page')) {//入室処理
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
      let now = firebase.firestore.Timestamp.now();
      db.collection("classes").doc(classname).collection("members").doc(username).set({//学籍番号コレクションにユーザと最終入力時刻を更新
        noduser: username,
        finalaction: now
      })
      document.querySelector('#navigator').pushPage('page2.html');
    };
  } else if (page.matches('#second-page')) { 
    page.querySelector('#pop-button').onclick = function () {
      let _now = firebase.firestore.Timestamp.now();
      /* うなずきアプリ評価実験時に使用
      db.collection("classes").doc(classname).collection("members").doc(username).collection("accesses").add({  //入退室コレクションに追加
        entrance: false,
        breaktime: _now
      })
      */
      document.querySelector('#navigator').popPage();
    };
  }
});

document.addEventListener('show', function (event) {
  //入室時，退室時のタイマー処理
  var page = event.target;
  if (page.id === "second-page") {
    room = true;
    startClock();
  }
  if (page.id === "first-page") {
    endClock();
  }
}, false);

document.addEventListener('deviceready', () => {
  // アプリがバックグラウンドに移行した時のタイマー処理
  document.addEventListener('pause', () => {
    if (room == true) {
      let _now = firebase.firestore.Timestamp.now();
      /*うなずきアプリ評価実験時に使用
      db.collection("classes").doc(classname).collection("members").doc(username).collection("accesses").add({  //入退室コレクションに追加
        entrance: false,
        breaktime: _now
      })
      */
      endClock();
    }
  });
  document.addEventListener('resume', () => {
    setTimeout(() => {
      startClock();
      room = true;
    }, 0);
  });
});

function addNod() { //うなずき追加
  let now = new Date();
  let _now = firebase.firestore.Timestamp.now();
  nods.push(new Nod(now));   //クライアント表示用うなずき配列に追加
  $("#nod-list").append("<p>" + now.getMonth() + "/" + now.getDate() + ":" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "</p></li>")
  db.collection("classes").doc(classname).collection("nods").add({  //うなずきコレクションに追加
    noduser: username,
    nodtime: _now
  })
  db.collection("classes").doc(classname).collection("members").doc(username).set({ //ユーザの最終入力時刻更新
    noduser: username,
    finalaction: _now
  })
};

function clock() { //1秒ごとに連続授業時間とうなずき表示を更新する関数
  let now = new Date();
  let date = document.getElementById('date');
  var list = 0; //表示するうなずき数
  var pCount = 0; //今回の実行で新たに除外されるうなずき数
  if (nods.length > 0) {
    for (var i = searchNods; i < nods.length; i++) {
      if (nods[i].time.getTime() + 300000 > now.getTime()) {//探索中のうなずきが現在時刻から5分以内の場合
        list += 1; //表示するうなずきを追加(5分以内のうなずきである) 
      } else {
        pCount += 1;//除外するうなずきを追加
      }
    }
  }
  searchNods += pCount; //次回の探索開始地点を更新
  document.getElementById("nods-view").style.setProperty('--zoom', (list + 1) ** 0.25);
}

function startClock() { //タイマー開始
  var myclass = document.getElementById('myclass');
  var myname = document.getElementById('myname');
  myclass.textContent = classname;
  myname.textContent = username + "で入室中";
  start = new Date();
  nods = [];
  searchNods = 0;
  clock();
  myClock = setInterval(clock, 1000);
  let _now = firebase.firestore.Timestamp.now();
  db.collection("classes").doc(classname).collection("members").doc(username).collection("accesses").add({  //入退室DBに追加
    entrance: true,
    breaktime: _now
  })
  //  db.collection("classes").doc(classname).collection("members").doc(username).collection("zikkenstart").orderBy("viewStart", "desc").limit(1)
}

function endClock() {  //タイマー終了
  clearInterval(myClock);
  room = false;
}

/* うなずきアプリ評価実験時に使用
function zikkenStart() {
  let now = new Date();
  let _now = firebase.firestore.Timestamp.now();
  db.collection("classes").doc(classname).collection("members").doc(username).collection("zikkenstart").add({
    viewStart: now
  })
  document.getElementById('menu-open').style.display = "none";
  //idのmenu-open部分を非表示に設定
  document.getElementById('menu-close').style.display = "block";
}
*/