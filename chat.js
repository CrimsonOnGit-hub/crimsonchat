// --- CONFIGURATION ---
const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame"; 

var chatClient;
const logBox = document.getElementById("chat-log");
const inputField = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// 1. Initialize the Chat Client
// ConnectionProtocol.Wss (1) is mandatory for secure sites in 2026
chatClient = new Photon.Chat.ChatClient(1, APP_ID, VERSION);

// 2. Handle State Changes
chatClient.onStateChange = function(state) {
    if (state === 10) { // State 10 = Connected
        logBox.innerHTML += "<div>[SUCCESS] Connected! Joining " + CHANNEL + "...</div>";
        chatClient.subscribe([CHANNEL]);
        
        // Enable UI
        inputField.disabled = false;
        sendBtn.disabled = false;
    }
};

// 3. Handle Incoming Messages from VR/Web
chatClient.onChatMessages = function(channel, senders, messages) {
    for (var i = 0; i < messages.length; i++) {
        var div = document.createElement("div");
        div.innerHTML = "<b>" + senders[i] + ":</b> " + messages[i];
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
    }
};

// 4. Send Message Function (Called by Button)
window.sendMsg = function() {
    var text = inputField.value;
    if (!text) return;

    if (chatClient.publishMessage(CHANNEL, text)) {
        inputField.value = "";
    }
};

// 5. THE HEARTBEAT (CRUCIAL)
// This keeps the connection alive every 50ms
setInterval(function() {
    if (chatClient) {
        if (chatClient.Service) chatClient.Service();
        else if (chatClient.service) chatClient.service();
    }
}, 50);

// 6. Connect to US Region
var randomId = "WebAdmin_" + Math.floor(Math.random() * 1000);
chatClient.connectToRegionMaster("US", randomId);

// Handle Enter Key
inputField.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) window.sendMsg();
});
