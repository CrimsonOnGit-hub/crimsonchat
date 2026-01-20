// --- SETTINGS ---
// IMPORTANT: Double check this ID. Is it your CHAT App ID? (Not PUN App ID)
const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9"; 
const APP_VER = "1.0";
const CHANNEL = "ingame";

var client;

window.onload = function() {
    log("Page Loaded. Checking for Photon...", "info");

    if (typeof Photon === 'undefined') {
        log("ERROR: Photon Variable is 'undefined'. The SDK script failed to run.", "err");
        return;
    }

    log("SDK Found! initializing Client...", "success");
    
    // Protocol 1 = WSS (Secure)
    client = new Photon.Chat.ChatClient(1, APP_ID, APP_VER);

    // STATE HANDLER
    client.onStateChange = function(state) {
        var stateText = "Unknown (" + state + ")";
        // Map common states for readability
        if(state === 11) stateText = "ConnectedToNameServer";
        if(state === 13) stateText = "Disconnected";
        if(state === 10) stateText = "ConnectedToFrontEnd";
        
        log("State Changed: " + stateText, "info");
        document.getElementById("status").innerText = "Status: " + stateText;

        if (state === 13) {
            log("DISCONNECTED. Check App ID or Region.", "err");
        }

        if (state === 10) {
            log("SUCCESS: Connected to Chat Server!", "success");
            client.subscribe([CHANNEL]);
            document.getElementById("msgInput").disabled = false;
            document.getElementById("sendBtn").disabled = false;
            document.getElementById("sendBtn").style.background = "#00cc00";
        }
    };

    // LOG MESSAGES
    client.onChatMessages = function(channel, senders, messages) {
        for (var i = 0; i < messages.length; i++) {
            log("MSG from " + senders[i] + ": " + messages[i]);
        }
    };

    // START CONNECTION
    log("Connecting to US Region...", "info");
    // Try generic connect first (safest)
    client.connectToRegionMaster("US", "WebDebug_" + Math.floor(Math.random()*100));

    // HEARTBEAT LOOP
    setInterval(function() {
        if (client) {
            if (client.Service) client.Service();
            else if (client.service) client.service();
        }
    }, 50);
};

window.sendMsg = function() {
    var inp = document.getElementById("msgInput");
    if(client && inp.value) {
        client.publishMessage(CHANNEL, inp.value);
        log("Sent: " + inp.value);
        inp.value = "";
    }
};
