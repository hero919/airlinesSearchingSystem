/**
 * Created by zeqingzhang on 3/9/16.
 */

module.exports = function(app, userModel){

    var passport      = require('passport');
    var auth = authorized;
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;


    var facebookConfig = {
        clientID        : "995413833874499",
        clientSecret    : "1df1486ed468e5790825a0436656258b",
        callbackURL     : "http://localhost:3000/auth/facebook/callback"
    };



    passport.use(new FacebookStrategy(facebookConfig, facebookStrategy));
    app.post("/api/project/airlines/login", passport.authenticate('airlinesSearchingSystem'),login);
    app.get("/api/project/airlines/loggedin", loggedin);
    app.post("/api/project/airlines/logout", logout);
    app.post("/api/project/airlines/register", register);
    app.get   ('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/#/profile',
            failureRedirect: '/#/login'
        }));




    //app.put("/api/project/airlines/setCurrentUser", setCurrentUser);

    function facebookStrategy(token, refreshToken, profile, done) {
        userModel
            .findUserByFacebookId(profile.id)
            .then(
            function(user) {
                if(user) {
                    return done(null, user);
                } else {
                    console.log(profile);
                    var names = profile.displayName.split(" ");
                    var username = profile.displayName.replace(/ /g,"");
                    var email = profile.emails ? profile.emails[0].value:"";
                    var newFacebookUser = {
                        username: username,
                        firstName: names[0],
                        lastName:  names[names.length - 1],
                        email:     email,
                        facebook: {
                            id:    profile.id,
                            token: token
                        }
                    };
                    return userModel.createUser(newFacebookUser);
                }
            },
            function(err) {
                if (err) { return done(err); }
            }
        )
            .then(
            function(user){
                return done(null, user);
            },
            function(err){
                if (err) { return done(err); }
            }
        );
    }





    passport.use("airlinesSearchingSystem",new LocalStrategy(localStrategy));




    //function setCurrentUser(req,res){
    //    req.session.currentUser = req.body;
    //    res.json(req.session.currentUser);
    //
    //}

    function register(req, res) {
        var user = req.body;
        userModel.createUser(user).then(function(response){
            req.session.currentUser = response;
            res.json(response);
        });



    }

    function localStrategy(username, password, done) {
        console.log("LocalStrategy");
        console.log(username);
        console.log(password);
        var credentials = {
            username : username,
            password : password
        };
        userModel
            .findUserByCredentials(credentials)
            .then(
            function(user) {
                if (!user) { return done(null, false); }
                return done(null, user);
            },
            function(err) {
                if (err) { return done(err); }
            }
        );
    }




    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    function serializeUser(user, done) {
        done(null, user);
    }

    function deserializeUser(user, done) {
        userModel
            .findUserById(user._id)
            .then(
            function(user){
                done(null, user);
            },
            function(err){
                done(err, null);
            }
        );
    }





    function login(req, res) {
       // var credentials = req.body;
       ////return userModel.findUserByCredentials(credentials);
       // userModel.findUserByCredentials(credentials).then(function(findUser){
       //     req.session.currentUser = findUser;
       //     res.json(findUser);
       // });
        var user = req.user;
        delete user.password;
        res.json(user);

    }

    function loggedin(req, res) {
        //res.json(req.session.currentUser);
        res.send(req.isAuthenticated() ? req.user : '0');
    }

    function logout(req, res) {
        //req.session.destroy();
        req.logOut();
        res.send(200);
    }



    app.put('/api/project/airlines/user/:id', function(req,res){
        userModel.Update(req.params.id, req.body).then(function(updatedUser){
            res.json(updatedUser);
        })
    });


    function authorized (req, res, next) {
        if (!req.isAuthenticated()) {
            res.send(401);
        } else {
            next();
        }
    };





};