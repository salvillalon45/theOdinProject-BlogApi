const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const cors = require('cors');

// Use dotenv files
require('dotenv').config();

// Import Strategies
require('./strategies/passportJWT');

// Import routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

// Allow all clients (Will change later)
app.use(cors());

// Use Compression
app.use(compression()); //Compress all routes

// Use Helmet
app.use(helmet());

// Favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'sal.png')));

// Set up mongoose connection
const mongoDB = process.env.DEV_MONGODB_URI || process.env.MONGODB_URI;
console.log('What is mongoDB');
console.log({ mongoDB });
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
	sassMiddleware({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
		indentedSyntax: false, // true = .sass and false = .scss
		sourceMap: true
	})
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
