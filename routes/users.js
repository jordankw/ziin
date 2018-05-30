var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//register
router.get('/register', function(req, res) {
    res.render('register');
});

//login
router.get('/login', function(req, res) {
    res.render('login');
});


//register
router.post('/register', function(req, res) {
    //var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.pass;
    var password2 = req.body.pass2;

    req.checkBody('username', 'username required').notEmpty();
    req.checkBody('email', 'email required').notEmpty();
    req.checkBody('email', 'email not valid').isEmail();
    req.checkBody('pass', 'password required').notEmpty();
    req.checkBody('pass2', 'password required').notEmpty();
    
    var errors = req.validationErrors();

    if (errors) {
        console.log("errors");
        res.render('register', {
            errors:errors
        });
        
    } else {
        console.log("passed validation");
        var newUser = new user({
            username: username, 
            email: email,
            password: password
        });

        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log(user.email);
        });

        req.flash('success_msg', 'You are registered and can login');

        res.redirect('/users/login');


    }

 
    console.log (username);
    //res.render('register');
 });

 passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err,user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
                    
            });
        })
    })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserByID(id, function(err, user) {
      done(err, user);
    });
  }); 

//login
router.post('/login',
 passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
 function(req, res) {
     console.log("login attempt");
    res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

module.exports = router;