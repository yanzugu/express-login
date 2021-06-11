var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodelogin'
});
console.log('connect to database.')

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    console.log('GET: /')
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/register', function (request, response) {
    console.log('GET: /register')
    response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/register', function (request, response, next) {
    console.log('POST: /register')
    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;
    var exist = true;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ?', [username], function (error, results, fields) {
            if (results.length > 0) {
                exist = false;
                response.send('Username has exist, please change one.') 
                response.end();            
            }
            else next();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
}, function(request, response) {
    console.log('Register Successful.')
    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;
    connection.query('INSERT INTO accounts (username, password, email) VALUES(?, ?, ?)', [username, password, email], function (error, results, fields) {
        console.log(username + '\n' + password + '\n' + email);
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
    });
});

app.post('/auth', function (request, response) {
    console.log('POST: /auth')
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/home', function (request, response) {
    console.log('GET: /home')
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(3000);