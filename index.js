const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const authRoutes = require('./src/auth')
const profileRoutes = require('./src/profile')
const articleRoutes = require('./src/articles')
const followingRoutes = require('./src/following')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const md5 = require('md5')
const cors = require('cors')

const GOOGLE_CLIENT_ID = '170083680840-7jtegsm7p7jgk9a6qk3g3nv5odf9shdl.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

const UserModel = authRoutes.User
const sessionCookieKey = authRoutes.cookieKey
const sessionUsers = authRoutes.sessionUser
const createProfileDocument = authRoutes.newDoc

const app = express()

const helloHandler = function (req, res) {
    res.send({ hello: 'world' })
}

app.use(bodyParser.json())
app.use(cookieParser())

const corsConfiguration = {
    origin: 'https://final1105.surge.sh',
    credentials: true
}
app.use(cors(corsConfiguration))

app.use(session({
    secret: 'doNotGuessTheSecret',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, done) {
    done(null, user)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
})

passport.use(new GoogleStrategy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://finalw-98c0f897f482.herokuapp.com/auth/google/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        let email = ''
        if (profile.emails) {
            if (profile.emails.length > 0) {
                email = profile.emails[0].value
            }
        }
        let googleUser = {
            gg: profile.id,
            email: email
        }
        return done(null, googleUser)
    }
))

app.get('/', helloHandler)

const mongoConnectionString = 'mongodb+srv://new-user1:ssE5rrqpNIo3dAzc@final.opho5oq.mongodb.net/?appName=final'
mongoose.connect(mongoConnectionString)

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }))

app.get(
    '/link/google',
    authRoutes.isLoggedIn,
    function (req, res, next) {
        const username = req.username
        if (req.session) {
            req.session.linkUser = username
        }
        res.cookie('linkUser', username, {
            maxAge: 7 * 60 * 1000,
            httpOnly: true,
            sameSite: 'None',
            secure: true
        })
        next()
    },
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
)

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'https://final1105.surge.sh/#/' }),
    function (req, res) {
        const googleId = req.user.gg
        const email = req.user.email

        let sessionLinkUser = null
        if (req.session) {
            sessionLinkUser = req.session.linkUser
        }

        let cookieLinkUser = null
        if (req.cookies) {
            cookieLinkUser = req.cookies.linkUser
        }

        let linkedUsername = null
        if (sessionLinkUser) {
            linkedUsername = sessionLinkUser
        } else {
            linkedUsername = cookieLinkUser
        }

        if (linkedUsername) {
            if (req.session) {
                req.session.linkUser = null
            }
            if (cookieLinkUser) {
                res.clearCookie('linkUser')
            }

            UserModel.find({ username: linkedUsername }).then(function (users) {
                if (users.length === 0) {
                    return res.redirect('https://final1105.surge.sh/#/')
                }

                let user = users[0]
                user.gg = googleId
                user.save().then(function () {
                    const sessionSeed = linkedUsername + new Date().getTime().toString()
                    const sessionKey = md5(sessionSeed)
                    sessionUsers[sessionKey] = linkedUsername
                    res.cookie(sessionCookieKey, sessionKey, {
                        maxAge: 3600 * 1000,
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true
                    })
                    res.redirect('https://final1105.surge.sh/#/')
                })
            })
        } else {
            UserModel.find({ gg: googleId }).then(function (users) {
                if (users.length === 0) {
                    let username = ''
                    if (email) {
                        username = email
                    } else {
                        username = googleId
                    }

                    let user = new UserModel({
                        username: username,
                        salt: '',
                        hash: '',
                        email: email,
                        dob: '',
                        phone: '',
                        zipcode: '',
                        gg: googleId
                    })

                    user.save().then(function () {
                        createProfileDocument(username, email, '', '', '')
                        const sessionSeed = username + new Date().getTime().toString()
                        const sessionKey = md5(sessionSeed)
                        sessionUsers[sessionKey] = username
                        res.cookie(sessionCookieKey, sessionKey, {
                            maxAge: 3600 * 1000,
                            httpOnly: true,
                            sameSite: 'None',
                            secure: true
                        })
                        res.redirect('https://final1105.surge.sh/#/')
                    })
                } else {
                    let selectedUser = users[0]
                    let userIndex = 0
                    while (userIndex < users.length) {
                        if (users[userIndex].salt) {
                            if (users[userIndex].salt !== '') {
                                selectedUser = users[userIndex]
                            }
                        }
                        userIndex = userIndex + 1
                    }

                    const username = selectedUser.username
                    const sessionSeed = username + new Date().getTime().toString()
                    const sessionKey = md5(sessionSeed)
                    sessionUsers[sessionKey] = username
                    res.cookie(sessionCookieKey, sessionKey, {
                        maxAge: 3600 * 1000,
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true
                    })
                    res.redirect('https://final1105.surge.sh/#/')
                }
            })
        }
    }
)

app.put('/unlink/google', authRoutes.isLoggedIn, function (req, res) {
    const username = req.username
    UserModel.find({ username: username }).then(function (users) {
        if (users.length === 0) {
            return res.sendStatus(400)
        }
        let user = users[0]
        user.gg = ''
        user.save().then(function () {
            res.send({ username: username, result: 'unlinked' })
        })
    })
})

authRoutes(app)
profileRoutes(app)
articleRoutes(app)
followingRoutes(app)

const port = process.env.PORT || 3000
app.listen(port)