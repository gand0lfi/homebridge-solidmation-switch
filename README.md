# Solidmation Switch Plugin for Homebridge

A [Homebridge](https://github.com/nfarina/homebridge) plugin for WIFI Switch made by Solidmation

Based on this plugin https://github.com/sbehrends/homebridge-bgh-smart

It uses https://myhabeetatcloud-services.solidmation.com/1.0 API to interact with your registered devices

### Installation

```
npm install homebridge-solidmation-switch -g
```

Add to your configuration

```
{
  "accessory": "Solidmation-Switch",
  "name": "Accesory Name",
  "email": "email@domain.com",
  "password": "password",
  "deviceName": "Device name in Solidmation",
  "homeId": "12345",
  "deviceId": "12345"
},
{
  "accessory": "Solidmation-Switch",
  "name": "Accesory Name 2",
  "email": "email@domain.com",
  "password": "password",
  "deviceName": "Device name in Solidmation 2",
  "homeId": "12345",
  "deviceId": "12346"
}
```
(every switch has two outputs, so two devices must be added, one with each deviceId)

You need the homeId and deviceId from the console while logged in at the [MyHabeetat](https://myhabeetat.solidmation.com/Panel.aspx) 

