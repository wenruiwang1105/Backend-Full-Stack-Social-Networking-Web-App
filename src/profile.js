const mongoose = require('mongoose');
const authModule = require('./auth');
const isLoggedIn = authModule.isLoggedIn;
const uploadImage = require('./uploadCloudinary');

const profileSchema = new mongoose.Schema({
    username: String,
    display: String,
    headline: String,
    email: String,
    zipcode: String,
    phone: String,
    dob: String,
    avatar: String,
    following: [String]
});

const ProfileModel = mongoose.model('profile', profileSchema);

function getProfile(username) {
    return ProfileModel.find({ username: username }).then(function (profiles) {
        if (profiles.length === 0) {
            return null;
        }
        return profiles[0];
    });
}

function getHeadline(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let headlineValue = '';
        if (profile) {
            if (profile.headline) {
                headlineValue = profile.headline;
            }
        }
        res.send({ username: username, headline: headlineValue });
    });
}

function updateHeadline(req, res) {
    let username = req.username;
    let headline = req.body.headline;
    if (!headline) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.headline = headline;
        profile.save().then(function () {
            res.send({ username: username, headline: headline });
        });
    });
}

function getDisplay(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let displayValue = '';
        if (profile) {
            if (profile.display) {
                displayValue = profile.display;
            }
        }
        res.send({ username: username, display: displayValue });
    });
}

function updateDisplay(req, res) {
    let username = req.username;
    let display = req.body.display;
    if (!display) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.display = display;
        profile.save().then(function () {
            res.send({ username: username, display: display });
        });
    });
}

function getEmail(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let emailValue = '';
        if (profile) {
            if (profile.email) {
                emailValue = profile.email;
            }
        }
        res.send({ username: username, email: emailValue });
    });
}

function updateEmail(req, res) {
    let username = req.username;
    let email = req.body.email;
    if (!email) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.email = email;
        profile.save().then(function () {
            res.send({ username: username, email: email });
        });
    });
}

function getZipcode(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let zipcodeValue = '';
        if (profile) {
            if (profile.zipcode) {
                zipcodeValue = profile.zipcode;
            }
        }
        res.send({ username: username, zipcode: zipcodeValue });
    });
}

function updateZipcode(req, res) {
    let username = req.username;
    let zipcode = req.body.zipcode;
    if (!zipcode) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.zipcode = zipcode;
        profile.save().then(function () {
            res.send({ username: username, zipcode: zipcode });
        });
    });
}

function getPhone(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let phoneValue = '';
        if (profile) {
            if (profile.phone) {
                phoneValue = profile.phone;
            }
        }
        res.send({ username: username, phone: phoneValue });
    });
}

function updatePhone(req, res) {
    let username = req.username;
    let phone = req.body.phone;
    if (!phone) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.phone = phone;
        profile.save().then(function () {
            res.send({ username: username, phone: phone });
        });
    });
}

function getAvatar(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let avatarValue = '';
        if (profile) {
            if (profile.avatar) {
                avatarValue = profile.avatar;
            }
        }
        res.send({ username: username, avatar: avatarValue });
    });
}

function updateAvatar(req, res) {
    let username = req.username;
    let avatarUrl = req.fileurl;
    if (!avatarUrl) {
        return res.sendStatus(400);
    }
    getProfile(username).then(function (profile) {
        if (!profile) {
            profile = new ProfileModel({ username: username });
        }
        profile.avatar = avatarUrl;
        profile.save().then(function () {
            res.send({ username: username, avatar: avatarUrl });
        });
    });
}

function getDob(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    getProfile(username).then(function (profile) {
        let dobTimestamp = new Date().getTime();
        if (profile) {
            if (profile.dob) {
                dobTimestamp = new Date(profile.dob).getTime();
            }
        }
        res.send({ username: username, dob: dobTimestamp });
    });
}

module.exports = (app) => {
    app.get('/headline/:user?', isLoggedIn, getHeadline);
    app.put('/headline', isLoggedIn, updateHeadline);
    app.get('/display/:user?', isLoggedIn, getDisplay);
    app.put('/display', isLoggedIn, updateDisplay);
    app.get('/email/:user?', isLoggedIn, getEmail);
    app.put('/email', isLoggedIn, updateEmail);
    app.get('/zipcode/:user?', isLoggedIn, getZipcode);
    app.put('/zipcode', isLoggedIn, updateZipcode);
    app.get('/dob/:user?', isLoggedIn, getDob);
    app.get('/phone/:user?', isLoggedIn, getPhone);
    app.put('/phone', isLoggedIn, updatePhone);
    app.get('/avatar/:user?', isLoggedIn, getAvatar);
    app.put('/avatar', isLoggedIn, uploadImage('avatar'), updateAvatar);
};