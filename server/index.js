'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');
const Nexmo = require('nexmo');

const app = express();
const server = app.listen(4000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// Nexmo init

var nexmo = new Nexmo({
  apiKey: config.api_key,
  apiSecret: config.api_secret,
},{debug: true});

// socket.io

const io = socketio(server);
let socket;
io.on('connection', (s) => {
  console.log('Connected');
  socket = s;
  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

// Configure Express

app.set('views', __dirname + '/../views');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express routes

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send(req.body);
//return;
  let toNumber = req.body.number;
  let text = req.body.text;
  // Sending SMS via Nexmo
  nexmo.message.sendSms(
    config.number, toNumber, text, {type: 'unicode'},
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
        socket.emit('responseData', responseData);
      }
    }
  );

  // Basic Number Insight
  nexmo.numberInsight.get({level:'basic', number: toNumber}, (err, responseData) => {
    if (err) console.log(err);
    else {
      console.dir(responseData);
    }
  });

});
