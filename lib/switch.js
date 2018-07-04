const request = require('request')
const baseUrl = 'https://myhabeetat.solidmation.com'
const apiUrl = 'https://myhabeetatcloud-services.solidmation.com/1.0'

const enumHomes = function() {
  return new Promise((resolve, reject) => {
    authReq('/HomeCloudService.svc/EnumHomes', {})
      .then((data) => {
        const { Homes } = data.EnumHomesResult
        resolve(Homes)
      })
      .catch((err) => {
        reject(err)
      })
  })
}


class Device {
  constructor() {
    this.token = ''
    this.homeId = ''
    this.deviceId = '' // On API it's called endpointID
    this.deviceModel = 'Unknown'
    this.deviceManufacturer = 'Solidmation'
    this.deviceSerialNumber = 'FFFFFFFFFFFF'
    this.status = {}
    this.lastStatus = 0
  }

  setHomeId(homeId) {
    this.homeId = homeId
  }

  setDeviceId(deviceId) {
    this.deviceId = deviceId
  }

  setDeviceModel(deviceModel) {
    this.deviceModel = deviceModel
  }

  setSerialNumber(serialNumber) {
    this.deviceSerialNumber = serialNumber
  }

  getDeviceModel() {
    return this.deviceModel
  }

  getSerialNumber() {
    return this.deviceSerialNumber
  }

  getDeviceManufacturer() {
    return this.deviceManufacturer
  }

  login(email, password) {
    var _this = this
    return new Promise((resolve, reject) => {
      request.post({
        url: `${baseUrl}/accounts/login.aspx`,
        json: true,
        body: {
          AccountEmail: email,
          Password: password
        }
      }, function(err, response) {
        if (err) {
          reject(err)
          return
        }

        if (response.body.AccessToken === "") {
          reject('Invalid Credentials')
          return
        }
        var token = response.body.AccessToken
        _this.token = token
        resolve(token)
      })
    })
  }

  authReq(endpoint, body) {

    body.token = {
      Token: this.token
    }

    return new Promise((resolve, reject) => {
      request.post({
        url: `${apiUrl}${endpoint}`,
        json: true,
        body: body
      }, function(err, response) {
        if (err) {
          reject(err);
          return;
        }
        //console.log('pedido --------------')
        //console.log(endpoint)
        //console.log('detalle --------------')
	/*//console.log(response.body)*/
        //console.log('fin --------------')
        resolve(response.body)
      });
    });
  }

  switchSetStatus(mode) {
    mode.endpointID = this.deviceId
    return new Promise((resolve, reject) => {
      this.lastStatus = 0
      this.authReq('/HomeCloudCommandService.svc/OnOffSwitch', mode)
        .then((data) => {
          // TODO: When remote is off or no batteries Result: false
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }


  GetDataPacket() {
    var _this = this
    return new Promise((resolve, reject) => {
      this.authReq('/HomeCloudService.svc/GetDataPacket', {
        homeID: _this.homeId,
        serials: {
          Home: 0,
          Groups: 0,
          Devices: 0,
          Endpoints: 0,
          EndpointValues: 0,
          Scenes: 0,
          Macros: 0,
          Alarms: 0
        },
        timeOut: 10000
      })
        .then((data) => {
          resolve(data.GetDataPacketResult)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  parseDevices(data) {
    //console.log('arranca parseo')
    const { Devices, EndpointValues, Endpoints, Groups, Home, Macros, NewSerials, ResponseStatus, Scenes } = data
    var devices = {}
    //console.log(EndpointValues.length)
    for (var i = 0;i < EndpointValues.length; i++) {
      //console.log('renglon '+i) 
      var device = {
        deviceId: Endpoints[i].EndpointID,
        deviceName: Endpoints[i].Description,
        //deviceData: Devices[i],
        rawData: EndpointValues[i].Values,
        data: this.parseRawData(EndpointValues[i].Values),
        endpointsData: Endpoints[i]
      }

      ////console.log(Endpoints[i].Description)
      /*//console.log(Devices[i].DeviceModel)
      if (Endpoints[i].Capabilities==='9') {
        device.data = this.parseRawData(EndpointValues[i].Values)
      }
     
      device.data.deviceModel = device.deviceData.DeviceModel
      device.data.deviceSerialNumber = device.deviceData.Address*/
      //console.log(device)
      
      devices[device.deviceId] = device
      
    }
    
    return devices
  }

  parseRawData(data) {
    
    var encendido = data.find(s => s.ValueType === 1) || null;
    if (encendido !== null) {
	encendido = parseInt(encendido.Value)
    } else {
	encendido = null
    }

    //console.log('retorna')
    return {
      encendido
    }
  }

  refreshStatus() {
   //console.log('refresco')
    var _this = this
    return new Promise((resolve, reject) => {
      this.GetDataPacket()
        .then((data) => {
          //console.log('hay datos')
          // //console.log(data)
          //console.log('fin datos')
          var devices = _this.parseDevices(data)
          this.status = devices[_this.deviceId]
          // //console.log(_this.deviceId)
          // //console.log(this.status)
          this.lastStatus = Math.floor(Date.now() / 1000)
          resolve(devices[_this.deviceId])
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  getStatus() {
    var _this = this

    return new Promise((resolve, reject) => {

      if (this.token === '') {
        reject()
        return
      }

      var diff = Math.floor(Date.now() / 1000) - this.lastStatus;
      if (diff < 10) {
        resolve(_this.status.data)
        return
      }

      _this.refreshStatus()
        .then(status => {
          _this.deviceModel = _this.status.data.deviceModel
          _this.deviceSerialNumber = _this.status.data.deviceSerialNumber
          resolve(_this.status.data)
        })
        .catch(() => {
          reject()
        })

    })
  }

  
}

module.exports = {
  Device
}
