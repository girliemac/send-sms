(function() {
  'use strict';

  // DOM
  var numberField = document.querySelector('input[name=number]');
  var textField = document.querySelector('input[name=text]');
  var button = document.querySelector('input[type=button]');
  var msg = document.querySelector('.response');

  // Web Notification permission
  var permission = 'denied';

  try {
    Notification.requestPermission().then(function(status) {
      permission = status;
      console.log('Web notification status: '+ permission);
    });
  } catch (error) { // Safari 9 doesn't return a promise for requestPermissions
    Notification.requestPermission(function(status) {
      permission = status;
      console.log('Web notification status: '+ permission);
    });
  }

  // socket.io
  var socket = io();
  socket.on('connect', function() {
    console.log('Socket connected');
  });
  socket.on('smsStatus', function(data) {
    console.log(data);
    if(!data) return;
    if(data.error){
      displayStatus('Error: ' + data.error, permission);
    } else {
      displayStatus('Message ID ' + data.id + ' successfully sent to ' + data.number, permission);
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

    if(!self.fetch) {
      alert("Bummer, your browser doesn't support Fetch API!");
      return;
      // Ideally, use XHR as the fallback for fetch.
    }

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
      var notification = new Notification('Nexmo', {
        body: message,
        icon: 'images/icon-nexmo.png'
      });
    } else { // Notification is denied by a user. just show text
      msg.classList.add('poof');
      msg.textContent = message;
      msg.addEventListener('animationend', function(){
        msg.textContent = '';
        msg.classList.remove('poof');
      }, false);
    }
  }

})();
