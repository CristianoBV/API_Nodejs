import compression from 'compression';
import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import monggose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

//START
const app = express();

//AMBIENTE
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

//ARQUIVOS ESTATICOS
app.use('/public', express.static(__dirname + '/public'));
app.use('/public/images', express.static(__dirname + '/public/images'));

//ARQUIVOS ESTATICOS
const dbs = require('./config/database');
const dbURI = isProduction ? dbs.dbProduction : dbs.dbTest;
mongoose.connect(dbURI, {useNewUrlParser: true});

//SETUP EJS
app.set('view engine', 'ejs');

//SETUP EJS
if(!isProduction) app.use(morgan('dev'));
app.use(cors());
app.disable('x-powered-by');
app.use(compression());

//SETUP BODY PARSER
app.use(bodyParser.urlencoded({ extended: false, limit: 1.5*1024*1024}));
app.use(bodyParser.json({ limit:1.5*1024*1024}));

//MODELS
require('./models');

//ROUTES
app.use('/', require('./routes'));

//404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//422 - 500 - 401
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if(err.status !== 404) cpnsole.log('Error', err.message, new Date());
  res.json({ errors: { message: err.message, status: err.status}});
});

// START
app.listen(PORT, (err) => {
  if(err) throw err;
  console.log(`⚡️ Server started on port ${PORT}!`);
})