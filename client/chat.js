const ws = new WebSocket("ws://localhost:6789");

let username;

// Prompt loop ensures non-empty name
do {
    username = prompt("Enter your username:")?.trim();
} while (!username);

// WebSocket connection opened
ws.onopen = () => {
    console.log("Connected to the WebSocket server");

    // Tell server who we are
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
    if (!input.value.trim()) return; // ignore blank // TODO maybe send error instead (?)
    ws.send(JSON.stringify({ type: "message", message: input.value }));
    input.value = "";
}
