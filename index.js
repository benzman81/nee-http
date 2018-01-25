'use strict';

const fs = require("fs");
const request = require("request");
const neeoapi = require('neeo-sdk');

console.log('NEEO "http" buttons accessory');
console.log('------------------------------------------');

var configFileContent = fs.readFileSync("config.json");
var config = JSON.parse(configFileContent);

var buttons = config.buttons || [];

var onButtonPressed = function onButtonPressed(name, deviceId) {
  console.log('[CONTROLLER] button pressed', name , deviceId);
  for(var i = 0; i < buttons.length; i++){
      if(buttons[i].id === name) {
        console.log('[CONTROLLER] calling url', buttons[i].url);
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
    console.log('# READY! use the NEEO app to search for "NEEO Accessory".');
  })
  .catch((error) => {
    console.error('ERROR!', error.message);
    process.exit(1);
  });
}

const brainIp = null;
if (brainIp) {
  console.log('- use NEEO Brain IP from env variable', brainIp);
  startAccessory(brainIp);
} else {
  console.log('- discover one NEEO Brain...');
  neeoapi.discoverOneBrain()
    .then((brain) => {
      console.log('- Brain discovered:', brain);
      startAccessory(brain);
    });
}