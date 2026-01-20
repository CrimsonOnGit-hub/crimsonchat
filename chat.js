const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame"; 

var client;
var debugBox = document.getElementById("debug-log");
var chatBox = document.getElementById("chat-log");

function dbg(msg) { 
    debugBox.innerHTML += "<div>> " + msg + "</div>"; 
    debugBox.scrollTop = debugBox.scrollHeight; 
}

// Using window.onload ensures the scripts are fully parsed
window.onload = function() {
    dbg("Checking SDK...");
    
    if (typeof Photon === 'undefined') {
        dbg("FATAL: Photon is NOT defined. Ensure photon.js is in the same folder.");
        return;
    }

    try {
        dbg("Creating ChatClient...");
        // Protocol 1 = WSS (Secure WebSocket)
        client = new Photon.Chat.ChatClient(1, APP_ID, VERSION);

        // Handle State Changes using internal constants
        client.onStateChange = function(state) {
            dbg("State Change: " + state);
            
            // ConnectedToFrontEnd is the standard state for a ready chat connection
            if (state === Photon.Chat.ChatClient.ChatState.ConnectedToFrontEnd) { 
                chatBox.innerHTML = "<b>[CONNECTED]</b> Subscribing to: " + CHANNEL;
                client.subscribe([CHANNEL]);
                document.getElementById("msgInput").disabled = false;
                document.getElementById("sendBtn").disabled = false;
                document.getElementById("msgInput").placeholder = "Type a message...";
            }
        };

        // Handle incoming messages
        client.onChatMessages = function(channel, messages) {
            messages.forEach(msg => {
                chatBox.innerHTML += `<div><b>${msg.getSender()}:</b> ${msg.getContent()}</div>`;
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        // CRITICAL: The service loop must use lowercase .service() in JavaScript
        dbg("Starting Heartbeat...");
        setInterval(function() {
            if (client) {
                client.service(); 
            }
        }, 100);

        dbg("Connecting to US Region...");
        var name = "WebUser_" + Math.floor(Math.random() * 999);
        client.connectToRegionMaster("US", name);

    } catch (e) {
        dbg("CRASH: " + e.message);
    }
};

window.sendMsg = function() {
    var input = document.getElementById("msgInput");
    if (input.value && client) {
        client.publishMessage(CHANNEL, input.value);
        input.value = "";
    }
};
