const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.use('/public', express.static('public'));       // 정적파일 설정

app.set('view engine', 'ejs');


//Mongo DB 연결
var db;
MongoClient.connect('mongodb+srv://admin:admin@cluster0.64sx3yx.mongodb.net/test', function(에러, client){
    if (에러) return console.log(에러);
    
    db = client.db('LOA');
    app.listen('8080', function(){
      console.log('listening on 8080')
    });
  })

//회원 가입기능
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { vary } = require('express/lib/response');
const { render } = require('ejs');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 


passport.use(new LocalStrategy({                    //로그인 검증 기능
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디입니다.' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));
passport.serializeUser(function(user, done){                // 세션에 로그인 정보 저장
    done(null, user.id)                                     // user.id란 이름으로 세션데이터 생성,저장 후 쿠키로 보냄
});

passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); 
/*
passport.deserializeUser(function(user, done){
    done(null, {})
})
*/

app.get('/test', function(요청, 응답){
  응답.render('test.ejs')
});

app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
});
app.post('/login', passport.authenticate('local', {failureRedirect: '/fail'}) , function(요청, 응답){

  응답.redirect('/main')
});

app.get('/logout', function(요청, 응답){
  요청.session.destroy();
  응답.redirect('/')
});

app.get('/register', function(요청, 응답){
  응답.render('register.ejs')
});
app.post('/register', function(요청, 응답){
  
  db.collection('login').findOne({id: 요청.body.id}, function(에러, 결과){
    console.log(결과)
    console.log(에러)
    if(결과 == null) {
      db.collection('login').insertOne({id: 요청.body.id, pw: 요청.body.pw, role: "member"}, function(에러, 결과){
        console.log(결과)
        })
    }
    else{
      응답.send('중복된 아이디 입니다.')
    }
  })
  응답.redirect('/login')
});

app.get('/fail', function(요청, 응답){
    응답.render('fail.ejs')
});


app.get('/dbtest', function(요청, 응답){
    db.collection('login').find().toArray(function(에러, 결과){
      console.log(결과)
      응답.render('dbtest.ejs')
    })
  });

app.get('/main', 로그인했니, function(요청, 응답){
    console.log(요청.user)
    응답.render('main.ejs', { 사용자 : 요청.user})
});

function 로그인했니(요청, 응답, next){
  if(요청.user){
    next()
  }
  else{
    응답.send('로그인이 필요한 서비스입니다.')
  }
}

// 스케줄러 기능

app.get('/sheduler', function(요청, 응답){
  응답.render('schedueler.ejs')
});

app.post('/scheduler', function(요청,응답){

});













app.get('/', function(요청, 응답){
    응답.render('index.ejs')
});