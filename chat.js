const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame"; 

var client;
var debugBox = document.getElementById("debug-log");
var chatBox = document.getElementById("chat-log");

function dbg(msg) { debugBox.innerHTML += "<div>> " + msg + "</div>"; debugBox.scrollTop = debugBox.scrollHeight; }

window.onload = function() {
    dbg("Checking SDK...");
    if (typeof Photon === 'undefined') {
        dbg("FATAL: Photon is NOT defined. Check photon.js!");
        return;
    }

    try {
        dbg("Creating ChatClient...");
        // Protocol 1 = WSS (Secure)
        client = new Photon.Chat.ChatClient(1, APP_ID, VERSION);

        client.onStateChange = function(state) {
            dbg("State Change: " + state);
            if (state === 10) { // Connected
                chatBox.innerHTML = "<b>[CONNECTED]</b> Joined: " + CHANNEL;
                client.subscribe([CHANNEL]);
                document.getElementById("msgInput").disabled = false;
                document.getElementById("sendBtn").disabled = false;
            }
        };

        dbg("Setting Heartbeat...");
        setInterval(function() {
            if (client) {
                if (client.Service) client.Service();
                else if (client.service) client.service();
            }
        }, 50);

        dbg("Connecting to Region US...");
        var name = "WebUser_" + Math.floor(Math.random() * 999);
        
        // This is the safest way to connect on GitHub Pages in 2026
        client.connectToRegionMaster("US", name);

    } catch (e) {
        dbg("CRASH: " + e.message);
    }
};

window.sendMsg = function() {
    var input = document.getElementById("msgInput");
    if (input.value && client) {
        client.publishMessage(CHANNEL, input.value);
        chatBox.innerHTML += "<div><b>Me:</b> " + input.value + "</div>";
        input.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;
    }
};

