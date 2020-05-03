const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 3000;

// passport config
require('./src/config/passport')(passport);

// DB Config
const mongoose = require('mongoose');
const db = require('./src/config/keys').MongoURI;

const { ensureAuthenticated, forwardAuthenticated } = require('./src/config/auth');


// Connect to mongo
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.log(err));


// body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


const tempRouts = require('./src/routes/temprouts');
const users = require('./src/routes/users');


app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`);
});

// index Page
app.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// routes
app.use('/temp', tempRouts);
app.use('/', users);

// Dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', {
  user: req.user,
}));

// sample test
/*
  app.get('/',(req, res)=> {
     res.send('hello')
 })
*/
