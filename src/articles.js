const mongoose = require('mongoose');
const authModule = require('./auth');
const isLoggedIn = authModule.isLoggedIn;
const uploadImage = require('./uploadCloudinary');
require('./profile');
const ProfileModel = mongoose.model('profile');

let articleSchema = new mongoose.Schema({
    id: Number,
    pid: Number,
    author: String,
    text: String,
    date: Date,
    comments: [{
        addrC: Number,
        author: String,
        text: String,
        date: Date
    }],
    img: String
});

let ArticleModel = mongoose.model('article', articleSchema);

function getArticles(req, res) {
    let username = req.username;
    let routeParam = req.params.id;
    if (routeParam) {
        let parsedId = Number(routeParam);
        if (!isNaN(parsedId)) {
            ArticleModel.find({ id: parsedId }).then(function (articles) {
                res.send({ articles: articles });
            });
            return;
        }
        ArticleModel.find({ author: routeParam }).then(function (articles) {
            res.send({ articles: articles });
        });
        return;
    }

    ProfileModel.findOne({ username: username }).then(function (profile) {
        let allowedAuthors = [username];
        if (profile) {
            if (profile.following) {
                let followerIndex = 0;
                while (followerIndex < profile.following.length) {
                    allowedAuthors.push(profile.following[followerIndex]);
                    followerIndex = followerIndex + 1;
                }
            }
        }

        ArticleModel.find({})
            .sort({ date: -1, id: -1 })
            .then(function (articles) {
                let filteredArticles = [];
                let articleIndex = 0;
                while (articleIndex < articles.length) {
                    let currentArticle = articles[articleIndex];
                    let isAllowedAuthor = false;
                    let authorIndex = 0;
                    while (authorIndex < allowedAuthors.length) {
                        if (allowedAuthors[authorIndex] === currentArticle.author) {
                            isAllowedAuthor = true;
                            break;
                        }
                        authorIndex = authorIndex + 1;
                    }
                    if (isAllowedAuthor) {
                        filteredArticles.push(currentArticle);
                    }
                    articleIndex = articleIndex + 1;
                }
                res.send({ articles: filteredArticles });
            });
    });
}

function addArticle(req, res) {
    let username = req.username;
    let articleText = req.body.text;
    if (!articleText) {
        return res.sendStatus(400);
    }
    ArticleModel.find({}).then(function (articles) {
        let maxArticleId = 0;
        let articleIndex = 0;
        while (articleIndex < articles.length) {
            let currentArticleId = articles[articleIndex].id;
            if (currentArticleId > maxArticleId) {
                maxArticleId = currentArticleId;
            }
            articleIndex++;
        }
        let newArticleId = maxArticleId + 1;
        let article = new ArticleModel({
            id: newArticleId,
            pid: newArticleId,
            author: username,
            text: articleText,
            date: new Date(),
            comments: [],
            img: ''
        });
        article.save().then(function () {
            res.send({ articles: [article] });
        });
    });
}

function addArticleImage(req, res) {
    let username = req.username;
    let articleText = req.body.text;
    let imageUrl = req.fileurl;
    if (!articleText) {
        articleText = '';
    }
    ArticleModel.find({}).then(function (articles) {
        let maxArticleId = 0;
        let articleIndex = 0;
        while (articleIndex < articles.length) {
            let currentArticleId = articles[articleIndex].id;
            if (currentArticleId > maxArticleId) {
                maxArticleId = currentArticleId;
            }
            articleIndex++;
        }
        let newArticleId = maxArticleId + 1;
        let article = new ArticleModel({
            id: newArticleId,
            pid: newArticleId,
            author: username,
            text: articleText,
            date: new Date(),
            comments: [],
            img: imageUrl
        });
        article.save().then(function () {
            res.send({ articles: [article] });
        });
    });
}

function updateArticle(req, res) {
    let routeParam = req.params.id;
    let updatedText = req.body.text;
    let commentIdValue = req.body.addrC;
    let username = req.username;
    let parsedArticleId = Number(routeParam);
    let hasInvalidRequest = false;
    if (isNaN(parsedArticleId)) {
        hasInvalidRequest = true;
    }
    if (!hasInvalidRequest) {
        if (!updatedText) {
            hasInvalidRequest = true;
        }
    }
    if (hasInvalidRequest) {
        return res.sendStatus(400);
    }

    ArticleModel.find({ id: parsedArticleId }).then(function (articles) {
        if (!articles) {
            return res.sendStatus(400);
        }
        if (articles.length === 0) {
            return res.sendStatus(400);
        }
        let article = articles[0];
        let isArticleEdit = false;
        if (commentIdValue === undefined) {
            isArticleEdit = true;
        }
        if (commentIdValue === null) {
            isArticleEdit = true;
        }

        if (isArticleEdit) {
            if (article.author !== username) {
                return res.sendStatus(401);
            }
            article.text = updatedText;
        } else {
            let commentId = Number(commentIdValue);

            let existingComments = article.comments;
            if (!existingComments) {
                existingComments = [];
            }
            let updatedComments = [];
            let copyIndex = 0;
            while (copyIndex < existingComments.length) {
                updatedComments.push(existingComments[copyIndex]);
                copyIndex = copyIndex + 1;
            }

            if (commentId === -1) {
                let nextCommentId = 0;
                let commentIndex = 0;
                while (commentIndex < updatedComments.length) {
                    let currentComment = updatedComments[commentIndex];
                    if (currentComment) {
                        let hasCommentId = true;
                        if (currentComment.addrC === undefined) {
                            hasCommentId = false;
                        }
                        if (hasCommentId) {
                            if (currentComment.addrC === null) {
                                hasCommentId = false;
                            }
                        }
                        if (hasCommentId) {
                            if (currentComment.addrC >= nextCommentId) {
                                nextCommentId = currentComment.addrC + 1;
                            }
                        }
                    }
                    commentIndex = commentIndex + 1;
                }
                let newComment = {
                    addrC: nextCommentId,
                    author: username,
                    text: updatedText,
                    date: new Date()
                };
                updatedComments.push(newComment);
            } else if (commentId >= 0) {
                let commentFound = false;
                let commentIndex = 0;
                while (commentIndex < updatedComments.length) {
                    let currentComment = updatedComments[commentIndex];
                    if (currentComment) {
                        if (currentComment.addrC === commentId) {
                            if (currentComment.author !== username) {
                                return res.sendStatus(401);
                            }
                            currentComment.text = updatedText;
                            commentFound = true;
                        }
                    }
                    commentIndex = commentIndex + 1;
                }
                if (!commentFound) {
                    return res.sendStatus(400);
                }
            }
            article.comments = updatedComments;
        }
        article.save().then(function () {
            res.send({ articles: [article] });
        });
    });
}

module.exports = (app) => {
    app.get('/articles/:id?', isLoggedIn, getArticles);
    app.post('/article', isLoggedIn, addArticle);
    app.post('/articleImg', isLoggedIn, uploadImage('text'), addArticleImage);
    app.put('/articles/:id', isLoggedIn, updateArticle);
};