const mongoose = require('mongoose');
const authModule = require('./auth');
const isLoggedIn = authModule.isLoggedIn;

require('./profile');
const ProfileModel = mongoose.model('profile');

function getFollowing(req, res) {
    let username = req.username;
    if (req.params.user) {
        username = req.params.user;
    }
    ProfileModel.find({ username: username }).then(function (profiles) {
        if (!profiles) {
            return res.send({ username: username, following: [] });
        }
        if (profiles.length === 0) {
            return res.send({ username: username, following: [] });
        }
        let profile = profiles[0];
        let following = profile.following;
        if (!following) {
            following = [];
        }
        res.send({ username: username, following: following });
    });
}

function addFollowing(req, res) {
    let username = req.username;
    let followerUsername = req.params.user;
    if (!followerUsername) {
        return res.sendStatus(400);
    }
    ProfileModel.find({ username: username }).then(function (profiles) {
        if (!profiles) {
            return res.sendStatus(400);
        }
        if (profiles.length === 0) {
            return res.sendStatus(400);
        }
        let profile = profiles[0];
        if (!profile.following) {
            profile.following = [];
        }
        let alreadyFollowing = false;
        let followIndex = 0;
        while (followIndex < profile.following.length) {
            if (profile.following[followIndex] === followerUsername) {
                alreadyFollowing = true;
            }
            followIndex = followIndex + 1;
        }
        if (!alreadyFollowing) {
            profile.following.push(followerUsername);
        }
        profile.save().then(function () {
            res.send({ username: username, following: profile.following });
        });
    });
}

function removeFollowing(req, res) {
    let username = req.username;
    let followerUsername = req.params.user;
    if (!followerUsername) {
        return res.sendStatus(400);
    }
    ProfileModel.find({ username: username }).then(function (profiles) {
        if (!profiles) {
            return res.sendStatus(400);
        }
        if (profiles.length === 0) {
            return res.sendStatus(400);
        }
        let profile = profiles[0];
        if (!profile.following) {
            profile.following = [];
        }
        let originalFollowing = profile.following;
        let updatedFollowing = [];
        let followIndex = 0;
        while (followIndex < originalFollowing.length) {
            if (originalFollowing[followIndex] !== followerUsername) {
                updatedFollowing.push(originalFollowing[followIndex]);
            }
            followIndex = followIndex + 1;
        }
        profile.following = updatedFollowing;
        profile.save().then(function () {
            res.send({ username: username, following: profile.following });
        });
    });
}

module.exports = (app) => {
    app.get('/following/:user?', isLoggedIn, getFollowing);
    app.put('/following/:user', isLoggedIn, addFollowing);
    app.delete('/following/:user', isLoggedIn, removeFollowing);
};