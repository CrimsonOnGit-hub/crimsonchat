const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame"; 

var chatClient;
const logBox = document.getElementById("chat-log");

window.onload = function() {
    if (typeof Photon === 'undefined') {
        logBox.innerHTML = "<b style='color:red'>ERROR: photon.js failed to load. Check your GitHub file list!</b>";
        return;
    }

    // Initialize Client (Protocol 1 = WSS)
    chatClient = new Photon.Chat.ChatClient(1, APP_ID, VERSION);

    chatClient.onStateChange = function(state) {
        if (state === 10) { // Connected
            logBox.innerHTML += "<div style='color:green'>[CONNECTED] Joined " + CHANNEL + "</div>";
            chatClient.subscribe([CHANNEL]);
            document.getElementById("msgInput").disabled = false;
            document.getElementById("sendBtn").disabled = false;
        } else {
            logBox.innerHTML = "Status: State " + state;
        }
    };

    chatClient.onChatMessages = function(channel, senders, messages) {
        for (var i = 0; i < messages.length; i++) {
            logBox.innerHTML += "<div><b>" + senders[i] + ":</b> " + messages[i] + "</div>";
            logBox.scrollTop = logBox.scrollHeight;
        }
    };

    // Heartbeat loop
    setInterval(function() {
        if (chatClient) {
            if (chatClient.Service) chatClient.Service();
            else if (chatClient.service) chatClient.service();
        }
    }, 50);

    // Connect to US region
    chatClient.connectToRegionMaster("US", "WebAdmin_" + Math.floor(Math.random()*1000));
};

window.sendMsg = function() {
    var input = document.getElementById("msgInput");
    if (input.value && chatClient) {
        chatClient.publishMessage(CHANNEL, input.value);
        input.value = "";
    }
};
