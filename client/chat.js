let ws;
let username;

// Grab dialog elements
const usernameDialog = document.getElementById("usernameDialog");
const usernameForm   = document.getElementById("usernameForm");
const usernameInput  = document.getElementById("usernameInput");

// 1) Show the modal on load, focus the input
window.addEventListener("DOMContentLoaded", () => {
    usernameDialog.showModal();    // opens as a true modal :contentReference[oaicite:0]{index=0}
    usernameInput.focus();         // autofocus inside the dialog :contentReference[oaicite:1]{index=1}
  });

// 2) Clear custom validity on input
usernameInput.addEventListener("input", () => {
    usernameInput.setCustomValidity(""); // clear previous error :contentReference[oaicite:0]{index=0}
  });
  
// 3) Handle form submission & validation
usernameForm.addEventListener("submit", e => {
    e.preventDefault();
  
    const val = usernameInput.value.trim();
    if (!val) {
      // set your own message and show the native bubble :contentReference[oaicite:1]{index=1}
      usernameInput.setCustomValidity(
        "Username cannot be blank. Please input a username to join the chat."
      );
      usernameInput.reportValidity();
      return;
    }
  
    // clear any custom error
    usernameInput.setCustomValidity("");
  
    // proceed
    username = val;
    usernameDialog.close();
    connectWebSocket();
  });
  
// Encapsulate WebSocket logic
function connectWebSocket() {
    ws = new WebSocket("ws://localhost:6789");  // now assigns to the outer `ws`

    ws.onopen = () => {
        console.log("WS open as", username);
        ws.send(JSON.stringify({ type: "join", username }));
    };

    // Listen for messages from the server
    ws.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch {
            return; // ignore non-JSON messages
        }

        const chatbox = document.getElementById("chatbox");
        switch (data.type) {
            case "chat":
                chatbox.appendChild(createDiv(data.message));
                break;

            case "notification":
                chatbox.appendChild(createEm(data.message));
                break;

            case "userCount":
                document.getElementById("userCount").textContent = data.count;
                break;
        }
        chatbox.scrollTop = chatbox.scrollHeight;
    };
    ws.onerror = err => console.error("!! WS error", err);
    ws.onclose = () => console.log(" WS closed");
}

function createDiv(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d; // TODO maybe name d to better descriptor once i understand usage
}

function createEm(text) {
    const e = document.createElement("em");
    e.textContent = text;
    return e; // TODO maybe name e to better descriptor once i understand usage
}

// Send message to the server
function sendMessage() {
    const input = document.getElementById("message");
    const msg   = input.value.trim();
    if (!msg) return;

    // Guard against undefined or not‑open
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn("Websocket not open:", ws?.readyState);
        return;
    }

    ws.send(JSON.stringify({type: "message", message:msg}));
    input.value = "";
}
