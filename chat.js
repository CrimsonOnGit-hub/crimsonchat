// ===== CONFIGURATION =====
const APP_ID = "512c0979-f7b9-496c-b07b-5d5f753ae9c9";
const VERSION = "1.0";
const CHANNEL = "ingame";

// ===== GLOBAL VARIABLES =====
var client = null;
var isConnected = false;

// ===== HELPER FUNCTIONS =====
function dbg(msg) {
    const debugBox = document.getElementById("debug-log");
    if (debugBox) {
        const timestamp = new Date().toLocaleTimeString();
        debugBox.innerHTML += `<div>[${timestamp}] ${msg}</div>`;
        debugBox.scrollTop = debugBox.scrollHeight;
    }
    console.log(msg);
}

function addChatMessage(sender, message) {
    const chatBox = document.getElementById("chat-log");
    if (chatBox) {
        chatBox.innerHTML += `<div><b>${sender}:</b> ${message}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function updateUI(connected) {
    const msgInput = document.getElementById("msgInput");
    const sendBtn = document.getElementById("sendBtn");
    
    if (msgInput && sendBtn) {
        msgInput.disabled = !connected;
        sendBtn.disabled = !connected;
        msgInput.placeholder = connected ? "Type a message..." : "Connecting...";
    }
}

// ===== PHOTON INITIALIZATION =====
window.onload = function() {
    dbg("🚀 Starting Photon Chat Bridge...");
    
    // Check if Photon SDK loaded
    if (typeof Photon === 'undefined') {
        dbg("❌ FATAL: Photon SDK not loaded!");
        dbg("Make sure the Photon script tag is in your HTML.");
        return;
    }
    
    dbg("✅ Photon SDK detected");
    
    try {
        // Create Chat Client
        dbg("Creating ChatClient...");
        client = new Photon.Chat.ChatClient(
            Photon.ConnectionProtocol.Wss,  // Use WSS protocol
            APP_ID, 
            VERSION
        );
        
        // ===== EVENT HANDLERS =====
        
        // State changes
        client.onStateChange = function(state) {
            dbg("State: " + state);
            
            // Check if connected to front end
            if (state === Photon.Chat.ChatClient.ChatState.ConnectedToFrontEnd) {
                dbg("✅ Connected to Photon!");
                dbg("Subscribing to channel: " + CHANNEL);
                
                // Subscribe to the channel
                client.subscribe([CHANNEL]);
                isConnected = true;
                updateUI(true);
                
                addChatMessage("SYSTEM", "Connected to " + CHANNEL);
            }
            
            // Handle disconnection
            if (state === Photon.Chat.ChatClient.ChatState.Disconnected) {
                dbg("⚠️ Disconnected from Photon");
                isConnected = false;
                updateUI(false);
                addChatMessage("SYSTEM", "Disconnected");
            }
        };
        
        // Incoming messages
        client.onChatMessages = function(channel, messages) {
            dbg("Received " + messages.length + " message(s) on " + channel);
            
            messages.forEach(function(msg) {
                const sender = msg.getSender();
                const content = msg.getContent();
                addChatMessage(sender, content);
            });
        };
        
        // Error handler
        client.onError = function(errorCode, errorMsg) {
            dbg("❌ ERROR " + errorCode + ": " + errorMsg);
            addChatMessage("ERROR", errorMsg);
        };
        
        // Subscription result
        client.onSubscribed = function(channels, results) {
            dbg("✅ Subscribed to channels: " + channels.join(", "));
        };
        
        // Unsubscribe result
        client.onUnsubscribed = function(channels) {
            dbg("Unsubscribed from: " + channels.join(", "));
        };
        
        // ===== START SERVICE LOOP =====
        dbg("Starting service loop (heartbeat)...");
        setInterval(function() {
            if (client) {
                client.service();
            }
        }, 50);  // Run every 50ms for better responsiveness
        
        // ===== CONNECT TO PHOTON =====
        const username = "WebUser_" + Math.floor(Math.random() * 9999);
        dbg("Connecting as: " + username);
        dbg("Region: US");
        
        client.connectToRegionMaster("us", username);  // lowercase "us"
        
    } catch (error) {
        dbg("💥 CRASH: " + error.message);
        dbg("Stack: " + error.stack);
    }
};

// ===== SEND MESSAGE FUNCTION =====
window.sendMsg = function() {
    const msgInput = document.getElementById("msgInput");
    
    if (!msgInput) {
        dbg("❌ Input field not found!");
        return;
    }
    
    const message = msgInput.value.trim();
    
    if (!message) {
        dbg("⚠️ Empty message");
        return;
    }
    
    if (!client) {
        dbg("❌ Client not initialized");
        return;
    }
    
    if (!isConnected) {
        dbg("❌ Not connected to Photon");
        addChatMessage("ERROR", "Not connected yet!");
        return;
    }
    
    try {
        dbg("Sending: " + message);
        client.publishMessage(CHANNEL, message);
        msgInput.value = "";
        
        // Show your own message immediately
        addChatMessage("You", message);
        
    } catch (error) {
        dbg("❌ Send failed: " + error.message);
        addChatMessage("ERROR", "Failed to send message");
    }
};

// ===== KEYBOARD SUPPORT =====
window.addEventListener('DOMContentLoaded', function() {
    const msgInput = document.getElementById("msgInput");
    if (msgInput) {
        msgInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.sendMsg();
            }
        });
    }
});

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', function() {
    if (client && isConnected) {
        dbg("Disconnecting...");
        client.disconnect();
    }
});
