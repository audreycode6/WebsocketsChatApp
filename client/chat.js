const ws = new WebSocket("ws://localhost:6789");

let username;
do {
    username = prompt("Enter your username:");
    if (username === null) {
        alert("You must enter a username to join the chat.")
        // Optionally, handle the cancellation (e.g., redirect or close the page)
        // For example: window.location.href = 'about:blank'; // Redirect to a blank page
    }
    username = username.trim(); // remove any surrounding whitespace
} while (!username);

// WebSocket connection opened
ws.onopen = () => {
    console.log("Connected to the WebSocket server");
};

// Listen for messages from the server
ws.onmessage = (event) => {
    const chatbox = document.getElementById("chatbox");
    const message = document.createElement("div");
    message.textContent = event.data;
    chatbox.appendChild(message);
};

// Send message to the server
function sendMessage() {
    const input = document.getElementById("message");
    const message = `${username}: ${input.value}`;
    ws.send(message);
    input.value = "";
}


