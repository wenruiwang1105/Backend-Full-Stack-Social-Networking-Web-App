const md5 = require('md5');
const mongoose = require('mongoose');

let sessionUsers = {};
let sessionCookieKey = 'sid';

let userSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String,
    email: String,
    dob: String,
    phone: String,
    zipcode: String,
    gg: String
});

const User = mongoose.model('user', userSchema);

function generateTimestampSalt(username) {
    let timestamp = new Date().getTime().toString();
    let combinedValue = username + timestamp;
    let salt = md5(combinedValue);
    return salt;
}

function generatePasswordHash(password, salt) {
    let combinedValue = salt + password;
    let hash = md5(combinedValue);
    return hash;
}

function createProfileDocument(username, email, dob, phone, zipcode) {
    let ProfileModel = mongoose.model('profile');
    let profile = new ProfileModel({
        username: username,
        display: username,
        headline: 'I am soooooo good!',
        email: email,
        zipcode: zipcode,
        phone: phone,
        dob: dob,
        avatar: 'https://hips.hearstapps.com/ghk.h-cdn.co/assets/17/30/dachshund.jpg?crop=1.00xw:0.668xh;0,0.260xh',
        following: []
    });
    profile.save();
}

function register(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let dob = req.body.dob;
    let phone = req.body.phone;
    let zipcode = req.body.zipcode;
    let password = req.body.password;
    if (!username || !email || !dob || !phone || !zipcode || !password) {
        return res.sendStatus(400);
    }
    let salt = username + new Date().getTime();
    let hash = md5(salt + password);
    let user = new User({
        username: username,
        salt: salt,
        hash: hash
    });
    user.save().then(function () {
        createProfileDocument(username, email, dob, phone, zipcode);
        res.send({ result: 'success', username: username });
    });
}

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
        return res.sendStatus(400);
    }
    User.find({ username: username }).then(function (users) {
        if (users.length == 0) {
            return res.sendStatus(401);
        }
        let user = users[0];
        let hash = generatePasswordHash(password, user.salt);
        if (hash === user.hash) {
            let combinedValue = username + new Date().getTime().toString();
            let sessionKey = md5(combinedValue);
            sessionUsers[sessionKey] = username;
            res.cookie(sessionCookieKey, sessionKey, {
                maxAge: 3600 * 1000,
                httpOnly: true,
                sameSite: 'None',
                secure: true
            });
            res.send({ username: username, result: 'success' });
        } else {
            return res.sendStatus(401);
        }
    });
}

function logout(req, res) {
    let sessionId = req.cookies[sessionCookieKey];
    if (sessionId) {
        sessionUsers[sessionId] = undefined;
        res.clearCookie(sessionCookieKey);
    }
    res.send('out');
}

function updatePassword(req, res) {
    let username = req.username;
    let updatedPassword = req.body.password;
    if (!updatedPassword) {
        return res.sendStatus(400);
    }
    User.find({ username: username }).then(function (users) {
        if (!users) {
            return res.sendStatus(400);
        }
        if (users.length === 0) {
            return res.sendStatus(400);
        }
        let user = users[0];
        let newSalt = username + new Date().getTime();
        let newHash = md5(newSalt + updatedPassword);
        user.salt = newSalt;
        user.hash = newHash;

        user.save().then(function () {
            res.send({ username: username, result: 'success' });
        });
    });
}

function isLoggedIn(req, res, next) {
    let sessionId = req.cookies[sessionCookieKey];
    if (!sessionId) {
        return res.sendStatus(401);
    }
    let username = sessionUsers[sessionId];
    if (username) {
        req.username = username;
        next();
    } else {
        return res.sendStatus(401);
    }
}

module.exports = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.put('/logout', isLoggedIn, logout);
    app.put('/password', isLoggedIn, updatePassword);
};

module.exports.isLoggedIn = isLoggedIn;
module.exports.cookieKey = sessionCookieKey;
module.exports.sessionUser = sessionUsers;
module.exports.User = User;
module.exports.newDoc = createProfileDocument;