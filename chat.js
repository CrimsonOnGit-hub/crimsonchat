const APP_ID = "18ee95c7-0614-483c-86bb-669960d9fe87";
const CHANNEL = "ingame";

const log = document.getElementById("log");
const chat = document.getElementById("chat");
const progress = document.getElementById("progress");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

function time() {
  return new Date().toLocaleTimeString();
}

function addLog(msg) {
  log.innerHTML += `[${time()}] ${msg}<br>`;
  log.scrollTop = log.scrollHeight;
}

function addChat(msg) {
  chat.innerHTML += msg + "<br>";
  chat.scrollTop = chat.scrollHeight;
}

let load = 0;
const loader = setInterval(() => {
  load++;
  progress.style.width = `${load * 2.5}%`;
  if (load >= 40) clearInterval(loader);
}, 50);

class ChatClient extends Photon.Chat.ChatClient {

  constructor() {
    super(Photon.ConnectionProtocol.Wss, APP_ID);
    this.setLogLevel(Exitgames.Common.Logger.Level.INFO);
  }

  onConnected() {
    addLog("✅ Connected to Photon Chat");
    statusText.textContent = "CONNECTED";
    statusDot.style.background = "#00ff88";
    statusDot.style.boxShadow = "0 0 12px #00ff88";

    this.subscribe([CHANNEL]);
  }

  onSubscribed(channels, results) {
    addLog(`📡 Joined channel: ${CHANNEL}`);
    enableChat();
  }

  onUnsubscribed(channels) {
    addLog(`❌ Left channel: ${channels.join(", ")}`);
  }

  onChatMessages(chann
