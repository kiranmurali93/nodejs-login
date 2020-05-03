/* eslint-disable no-console */
/* eslint-disable no-shadow */
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const router = express.Router();

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');


// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  // eslint-disable-next-line object-curly-newline
  const { name, designation, username, password, password2 } = req.body;
  console.log(req.body);

  const errors = [];
  // all fields required
  if (!name || !designation || !username || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  // eslint-disable-next-line eqeqeq
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  console.log(errors.length);

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      username,
      designation,
      password,
      password2,
    });
  } else {
    User.findOne({ username }).then((user) => {
      if (user) {
        // if user pre-exists
        errors.push({ msg: 'username already exists' });
        res.render('register', {
          errors,
          name,
          username,
          designation,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          designation,
          username,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(() => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in',
                );
                res.redirect('login');
              })
              // eslint-disable-next-line arrow-parens
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('login');
});

module.exports = router;
