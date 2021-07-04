var showJoystick = function() {

    var X_POWER = 0
    var Y_POWER = 0
    var H = 0
    var THETA_RAD = 0
    var IS_DOWN = true;

    window.setInterval(() => {

        if (!IS_DOWN) {
            // navigator.vibrate(0);
        } else {

            let X_POWERClamp = Math.abs(X_POWER) > 1 ? Math.abs(X_POWER)/X_POWER : X_POWER
            let Y_POWERClamp = Math.abs(Y_POWER) > 1 ? Math.abs(Y_POWER)/Y_POWER : Y_POWER
            let HClamp = Math.round(Math.abs(H) > 1 ? Math.abs(H)/H : H)*8000
            
            let thetaDeg = (THETA_RAD/Math.PI * 180)
            let x = thetaDeg < 0 ? 360+thetaDeg: thetaDeg
            
            let yr = -0.000000002540*Math.pow(x, 4) + 0.000002286237*Math.pow(x, 3) - 0.000596707819*Math.pow(x, 2) + 0.037037037037*x + 1.000000000002
            let yl = 0.000000002540*Math.pow(x, 4) - 0.000001371742*Math.pow(x, 3) + 0.000102880658*Math.pow(x, 2) + 0.022222222222*x- 1.000000000005

            if (H < 0.35) {
                yr = 0
                yl = 0
            } else {
                yr = Math.abs(yr) < 0.6 ? 0 : yr
                yl = Math.abs(yl) < 0.6 ? 0 : yl

                yr = -1.0175 * Math.pow(yr, 2) + 2.0602*yr - 0.044
                yl = -1.0175 * Math.pow(yl, 2) + 2.0602*yl - 0.044
            }

            yl = (yl > 0 ? 'A' : 'a') + Math.abs(Math.round((Math.abs(yl) > 1 ? 1 : yl) * 8000))
            yr = (yr > 0 ? 'B' : 'b') + Math.abs(Math.round((Math.abs(yr) > 1 ? 1 : yr) * 8000))

            // yr = (yr > 0 ? 'A' : 'a') + Math.abs(Math.round(8000))
            // yl = (yl > 0 ? 'B' : 'b') + Math.abs(Math.round(8000))

            // console.log(yr, yl)
            // navigator.vibrate([100, H*20, 100, H*20]);

            if (window.cordova) {
                bluetoothSerial.write(yr+'\n');
                bluetoothSerial.read();
                bluetoothSerial.write(yl+'\n');
                bluetoothSerial.read();
                bluetoothSerial.write(yl+'\n');
                bluetoothSerial.read();
            }
        }

    }, 200)

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 270;

    const drawMainCircle = () => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#260339BB';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#260339';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius/1.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#9775AA';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#9775AA22';
        ctx.stroke();

        ctx.font = "60px Arial";
        ctx.fillText("Turn left", 50, canvas.height/2);
        ctx.fillText("Turn right", canvas.width-290, canvas.height/2);
        ctx.fillText("Back", canvas.width/2-70, canvas.height-170);
        ctx.fillText("Forward", canvas.width/2-100, 200);

        ctx.fillStyle = 'black';
        ctx.fillText("Stop", canvas.width/2-60, canvas.height/2);
    }
    drawMainCircle();

    'touchstart mousedown'.split(' ').forEach(e => {
        canvas.addEventListener(e, () => {
            IS_DOWN = true;
        }, false);
    });
    'mousemove touchmove'.split(' ').forEach(e => {
        canvas.addEventListener(e, (evt) => {
            navigator.vibrate((H*2)*(H*2));
            if (IS_DOWN) {
                
                var rect = evt.target.getBoundingClientRect();

                clientX = evt.clientX || evt.touches[0].clientX;
                clientY = evt.clientY || evt.touches[0].clientY;

                const coords = {
                    x: (clientX - rect.left) / (rect.right - rect.left) * evt.target.width,
                    y: (clientY - rect.top) / (rect.bottom - rect.top) * evt.target.height,
                };

                const innerRadius = 150;
                
                X_POWER = (coords.x - evt.target.width/2)/(innerRadius - radius)
                Y_POWER = (coords.y - evt.target.height/2)/(innerRadius - radius)
                H = Math.sqrt(X_POWER*X_POWER+Y_POWER*Y_POWER)
                THETA_RAD = Math.atan2(Y_POWER, X_POWER)
                thetaDeg = THETA_RAD / Math.PI * 360
                // console.log(thetaDeg)
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMainCircle();
                ctx.beginPath();
                ctx.arc(
                    // evt.target.width/2,
                    // evt.target.height/2,
                    coords.x,
                    coords.y,
                    innerRadius, 0, 2 * Math.PI, false)
                ;
                
                ctx.fillStyle = '#303C7455';
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        }, false);
    });
    'touchend mouseup touchcancel'.split(' ').forEach(e => {
        canvas.addEventListener(e, () => {
            IS_DOWN = false;
        }, false);
    });

}


var app = {
    macAddress: "00:20:04:32:0B:5A",  // get your mac address from bluetoothSerial.list
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
        document.getElementById('deviceready').classList.add('ready');
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );

            showJoystick();
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        // bluetoothSerial.subscribe('\n', function (data) {
        //     app.clear();
        //     app.display(data);
        // });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app

if (window.cordova) {
    app.initialize();
} else {
    showJoystick();
}
