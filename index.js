'use strict';

const fs = require("fs");
const request = require("request");
const neeoapi = require('neeo-sdk');

var DEFAULT_REQUEST_TIMEOUT = 10000;

console.log('NEEO "http" buttons accessory');
console.log('------------------------------------------');

var configFileContent = fs.readFileSync("config.json");
var config = JSON.parse(configFileContent);

var brainIp = config.brainip;
var buttons = config.buttons || [];

var onButtonPressed = function onButtonPressed(name, deviceId) {
  console.log('[CONTROLLER] button pressed', name , deviceId);
  for(var i = 0; i < buttons.length; i++){
      var button = buttons[i];
      if(button.id === name) {
        console.log('[CONTROLLER] button with calling url', button.id, button.url);
        request.get({
          url: button.url,
          timeout: DEFAULT_REQUEST_TIMEOUT
        }, function(err, response, body) {
            var statusCode = response && response.statusCode ? response.statusCode: -1;
            //console.log("Request to '%s' finished with status code '%s' and body '%s'.", button.url, statusCode, body, err);
            if (!err && statusCode == 200) {
              console.log("Request was OK");
            }
            else {
              console.log(err || new Error("Request to '"+urlToCall+"' was not succesful."));
            }
        });
      }
  }
};

// first we set the device info, used to identify it on the Brain
const customHttpDevice = neeoapi.buildDevice('HTTP buttons')
  .setManufacturer('benzman81')
  .addAdditionalSearchToken('http')
  .setType('ACCESSORY');
  for(var i = 0; i < buttons.length; i++){
    customHttpDevice.addButton({ name: buttons[i].id, label: buttons[i].label })
    console.log('[CONTROLLER] button registerd', buttons[i].id);
  }
customHttpDevice.addButtonHandler(onButtonPressed);

function startAccessory(brain) {
  console.log('- Start server');
  neeoapi.startServer({
    brain,
    port: 6336,
    name: 'http-buttons',
    devices: [customHttpDevice]
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "http".');
  })
  .catch((error) => {
    console.error('ERROR!', error.message);
    process.exit(1);
  });
}

if (brainIp) {
  console.log('- use NEEO Brain IP from conf', brainIp);
  startAccessory(brainIp);
} else {
  console.log('- discover one NEEO Brain...');
  neeoapi.discoverOneBrain()
    .then((brain) => {
      console.log('- Brain discovered:', brain);
      startAccessory(brain);
    });
}