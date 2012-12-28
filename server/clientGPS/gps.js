
    // Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    var watchID = null;

    // Cordova is ready
    //
    function onDeviceReady() {
        // Throw an error if no update is received every 30 seconds
        var options = { timeout: 300 };
        watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
    }

    // onSuccess Geolocation
    //
    var oldvalue = null;
    function isSameAsOldValue(newval) {
        var ret=true;
        if (oldvalue == null) {
            ret=false;
            oldvalue = newval;
        } else {
            for (c in newval) {
                if (oldvalue[c] != newval[c]) {
                    ret = false;
                    oldvalue = newval;
                    return ret;
                }
            }
        }
        return ret;
    }
    
    function onSuccess(position) {
        if (isSameAsOldValue(oldvalue, position.coords)) return;
        var element = document.getElementById('geolocation');
        element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                            'Longitude: ' + position.coords.longitude     + '<br />' +
                            '<hr />' ;//     + element.innerHTML;
        console.log(position.coords);
        for(c in extStoragesList.getStorageList()) {
                extStoragesList[c].set('gps',position.coords);
        }
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

