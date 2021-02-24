const express = require('express');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

const getAnswers = require('./routes/getAnswers');
const getAnswer = require('./routes/getAnswer');
const addAnswer = require('./routes/addAnswer');
const deleteAnswer = require('./routes/deleteAnswer');

var cookieParser = require('cookie-parser');
const session = require('express-session');

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next(); 
    } else {
        res.writeHead(403);
        res.end('[]', 'utf8');
    }
};

var sessionCheckerAdmin = (req, res, next) => {
    //same as before plus a check for role - database could be compaired
    if (req.session.user && req.session.user.role == "admin" && req.cookies.user_sid) {
        next(); 
    } else {
        res.writeHead(403);
        res.end('[]', 'utf8');
    }
};

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

app.use(require('body-parser').json());
app.use(express.static(__dirname + '/static'));

app.get('/session', (req, res) => {
    var loggedin = (req.session.user && req.cookies.user_sid) ? true : false;

    if(loggedin) {
        res.send(req.session.user);
    }
    else {
        res.writeHead(403);
        res.end('[]', 'utf8');
    }
});

app.post('/session', (req, res) => {
    req.session.user = {'id':1,'name':'Matt A', 'role':'admin'};
    res.redirect('/');
});

app.post('/user_session', (req, res) => {
    req.session.user = {'id':2,'name':'Matt B', 'role':'user'};
    res.redirect('/');
});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    }
});

app.get('/Items', sessionChecker, getItems);
app.post('/Items', sessionCheckerAdmin, addItem);
app.put('/Items/:id', sessionCheckerAdmin, updateItem);
app.delete('/Items/:id', sessionCheckerAdmin, deleteItem);

app.get('/answers', sessionChecker, getAnswers);
app.get('/answers/:qid', sessionChecker, getAnswer);
app.post('/answers', sessionCheckerAdmin, addAnswer);
app.delete('/answers/:id', sessionCheckerAdmin, deleteAnswer);

db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
