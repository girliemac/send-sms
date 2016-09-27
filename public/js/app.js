(function() {
  'use strict';

  // DOM
  var numberField = document.querySelector('input[name=number]');
  var textField = document.querySelector('input[name=text]');
  var button = document.querySelector('input[type=button]');
  var msg = document.querySelector('.response');

  // Web Notification permission
  var notification = 'denied';
  Notification.requestPermission(function() {
    Notification.requestPermission().then(function(status) {
      notification = status;
      console.log('Web notification status: '+ notification);
    });
  });

  // socket.io
  var socket = io();
  socket.on('connect', function() {
    console.log('Socket connected');
  });
  socket.on('responseData', function(data) {
    console.log(data);
    if(!data.messages) return;
    if(data.messages[0]['error-text']){
      displayStatus('Error: ' + data.messages[0]['error-text'], notification);
    } else {
      displayStatus('Message ID ' + data.messages[0]['message-id'] + ' successfully sent to ' + data.messages[0]['to'], notification);
    }
  });

  var lastNumber = localStorage.getItem('number');
  if(lastNumber) {
    numberField.value = lastNumber;
  }

  // UI Events
  textField.addEventListener('keyup', function(e) {
    (e.keyCode || e.charCode) === 13 && send()
  }, false);
  button.addEventListener('click', send, false);

  // Send data to server to send a SMS via Nexmo
  function send() {
    var number = numberField.value.replace(/\D/g,''); // Remove all non-numeric chars
    if (!number) return;

    var text = textField.value || 'Hello!';

    localStorage.setItem('number', number);

    fetch('/', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: number,
        text: text
      })
    }).then(function(response) {
      if(response.status !== 200) {
        displayStatus(statusText, notification);
      }
      textField.value = '';
    }).catch(function(e) {
      displayStatus(e, notification);
    });
  }

  function displayStatus(message, notification) {
    console.log(notification);

    if(notification === 'granted') { // web notification
      var ms = 30000; // close notification after 30sec
        var notification = new Notification('Nexmo', {
          body: message,
          icon: 'images/icon-nexmo.png'
        });
        notification.onshow = function() {
            setTimeout(notification.close, ms);
        };
    } else { // just show text
      msg.classList.add('poof');
      msg.textContent = m;
      msg.addEventListener('animationend', function(){
        msg.textContent = '';
        msg.classList.remove('poof');
      }, false);
    }
  }

})();
