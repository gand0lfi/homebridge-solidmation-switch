/*
{
    "accessories": [
      {
        "accessory": "Solidmation-Switch",
        "name": "Accesory Name",
        "email": "email@domain.com",
        "password": "password",
        "deviceName": "Device name in Solidmation",
        "homeId": "12345",
        "deviceId": "12345"
      }
    ],
}

*/


var Service, Characteristic;
var request = require("request");
const lib = require('./lib/switch');

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-solidmation-switch", "Solidmation-Switch", SolidmationSwitch);
};


function SolidmationSwitch(log, config) {
  this.log = log;

  this.name = config.name;
  this.log(this.name);

  this.device = new lib.Device()
  this.characteristicManufacturer = this.device.getDeviceManufacturer()
  this.characteristicModel = this.device.getDeviceModel()
  this.characteristicSerialNumber = this.device.getSerialNumber()
  this.device.setHomeId(config.homeId)
  this.device.setDeviceId(config.deviceId)
  var _this = this
  this.device.login(config.email, config.password)
    .then(() => {
      this.device.getStatus()
        .then(data => {
          _this.characteristicManufacturer = _this.device.getDeviceManufacturer()
          _this.characteristicModel = _this.device.getDeviceModel()
          _this.characteristicSerialNumber = _this.device.getSerialNumber()
        })
        .catch(err => {

        })
    })
    .catch((err) => {
    })

  
  
}

SolidmationSwitch.prototype = {

  //Start
  identify: function(callback) {
    this.log("Identify requested!");

    callback(null);
  },
  // Required
  getEstado: function(callback) {
    this.log("getStatus ")
	
	this.device.getStatus()
      .then(data => {
        //console.log(data)
		callback(null, data.encendido)
      })
      .catch(err => {
        callback(err);
      })
	
  },
  setEstado: function(value, callback) {
    this.log("setStatus: "+value);

	this.device.switchSetStatus({ isOn: value })
    var error = null;
    callback(error);
  },
  getName: function(callback) {
    this.log("getName :", this.name);
    var error = null;
    callback(error, this.name);
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, this.characteristicManufacturer)
      .setCharacteristic(Characteristic.Model, this.characteristicModel)
      .setCharacteristic(Characteristic.SerialNumber, this.characteristicSerialNumber);

    var switchService = new Service.Switch(this.name);

    // Required Characteristics
	switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getEstado.bind(this))
      .on('set', this.setEstado.bind(this));

    return [informationService, switchService];
  }
};