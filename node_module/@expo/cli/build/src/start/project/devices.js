"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DevicesFile: function() {
        return DevicesFile;
    },
    getDevicesInfoAsync: function() {
        return getDevicesInfoAsync;
    },
    readDevicesInfoAsync: function() {
        return readDevicesInfoAsync;
    },
    saveDevicesAsync: function() {
        return saveDevicesAsync;
    },
    setDevicesInfoAsync: function() {
        return setDevicesInfoAsync;
    }
});
const _dotExpo = require("./dotExpo");
const debug = require('debug')('expo:start:project:devices');
const DEVICES_FILE_NAME = 'devices.json';
const MILLISECONDS_IN_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const DevicesFile = (0, _dotExpo.createTemporaryProjectFile)(DEVICES_FILE_NAME, {
    devices: []
});
let devicesInfo = null;
async function getDevicesInfoAsync(projectRoot) {
    if (devicesInfo) {
        return devicesInfo;
    }
    return readDevicesInfoAsync(projectRoot);
}
async function readDevicesInfoAsync(projectRoot) {
    try {
        devicesInfo = await DevicesFile.readAsync(projectRoot);
        // if the file on disk has old devices, filter them out here before we use them
        const filteredDevices = filterOldDevices(devicesInfo.devices);
        if (filteredDevices.length < devicesInfo.devices.length) {
            devicesInfo = {
                ...devicesInfo,
                devices: filteredDevices
            };
            // save the newly filtered list for consistency
            try {
                await setDevicesInfoAsync(projectRoot, devicesInfo);
            } catch  {
            // do nothing here, we'll just keep using the filtered list in memory for now
            }
        }
        return devicesInfo;
    } catch  {
        return await DevicesFile.setAsync(projectRoot, {
            devices: []
        });
    }
}
async function setDevicesInfoAsync(projectRoot, json) {
    devicesInfo = json;
    return await DevicesFile.setAsync(projectRoot, json);
}
async function saveDevicesAsync(projectRoot, deviceIds) {
    const currentTime = Date.now();
    const newDeviceIds = typeof deviceIds === 'string' ? [
        deviceIds
    ] : deviceIds;
    debug(`Saving devices: ${newDeviceIds}`);
    const { devices } = await getDevicesInfoAsync(projectRoot);
    const newDevicesJson = devices.filter((device)=>!newDeviceIds.includes(device.installationId)).concat(newDeviceIds.map((deviceId)=>({
            installationId: deviceId,
            lastUsed: currentTime
        })));
    await setDevicesInfoAsync(projectRoot, {
        devices: filterOldDevices(newDevicesJson)
    });
}
function filterOldDevices(devices) {
    const currentTime = Date.now();
    return devices// filter out any devices that haven't been used to open this project in 30 days
    .filter((device)=>currentTime - device.lastUsed <= MILLISECONDS_IN_30_DAYS)// keep only the 10 most recently used devices
    .sort((a, b)=>b.lastUsed - a.lastUsed).slice(0, 10);
}

//# sourceMappingURL=devices.js.map