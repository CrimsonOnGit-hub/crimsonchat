// --- CONFIGURATION ---
const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame"; // Must match Unity exactly

var chatClient;
const logBox = document.getElementById("chat-log");
const inputField = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// 1. Initialize Client (1 = Wss Protocol for Secure GitHub Pages)
chatClient = new Photon.Chat.ChatClient(1, APP_ID, VERSION);

// 2. Handle Connection State
chatClient.onStateChange = function(state) {
    console.log("State Change:", state);
    if (state === 10) { // 10 = ConnectedToFrontEnd
        addLog("<span style='color:#4caf50'>[SUCCESS] Connected! Joined '" + CHANNEL + "'</span>");
        chatClient.subscribe([CHANNEL]);
        
        // Enable the UI
        inputField.disabled = false;
        sendBtn.disabled = false;
        inputField.placeholder = "Type a message to VR players...";
        inputField.focus();
    } else {
        document.getElementById("header").innerText = "STATUS: " + state;
    }
};

// 3. Handle Messages from Unity or other Web users
chatClient.onChatMessages = function(channel, senders, messages) {
    for (var i = 0; i < messages.length; i++) {
        addLog("<b>" + senders[i] + ":</b> " + messages[i]);
    }
};

// 4. Send Message Function
window.sendMsg = function() {
    var text = inputField.value.trim();
    if (!text) return;

    if (chatClient && chatClient.publishMessage(CHANNEL, text)) {
        addLog("<span style='color:#aaa'>Me (Web): " + text + "</span>");
        inputField.value = "";
    }
};

// 5. THE SERVICE LOOP (Heartbeat) - MANDATORY
setInterval(function() {
    if (chatClient) {
        if (chatClient.Service) chatClient.Service();
        else if (chatClient.service) chatClient.service();
    }
}, 50);

// 6. Connect to Region (Matches Unity default)
var userId = "WebAdmin_" + Math.floor(Math.random() * 1000);
console.log("Connecting as:", userId);
chatClient.connectToRegionMaster("US", userId);

// Enter Key Listener
inputField.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) window.sendMsg();
});

function addLog(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
}
