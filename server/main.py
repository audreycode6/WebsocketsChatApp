import asyncio, json, websockets

'''to run client and server:
1. - open up 2 terminals for client anf server: 
    make sure venv is activated in both termnals: source chat_app/bin/activate
2 - run html file in client directory in terminal: python3 -m http.server 8000
3 - run main server in web_socket_app -> server  ditectory: python3 main.py
4. - open local host: http://localhost:8000/chat.html
5. - inspect /open dev tools -> console to see detailed exceptions
'''

connected_clients = set()
client_usernames = {}  # maps websocket -> username

async def handle_client(websocket): 
    ''' connection handler function:
    This function defines how to interact with that client '''
    # 1. Register the new client
    connected_clients.add(websocket)

    # 2. wait for the join packet
    raw = await websocket.recv()
    join = json.loads(raw)
    username = join.get("username", "Anonymous")
    client_usernames[websocket] = username

    # 3. Broacast "X has joined" + new user count
    await notify_system(f"{username} has joined the chat.")
    await broadcast_user_count()

    try:
        async for raw in websocket:
            data = json.loads(raw)
            if data.get("type") == "message":
                msg = f"{username}: {data['message']}"
                await broadcast_chat(msg)
    except Exception as e:
        print("Error:", e)

    finally:
        # Clean up on disconnect
        connected_clients.remove(websocket)
        client_usernames.pop(websocket, None)
        await notify_system(f"{username} has lef the chat.")
        await broadcast_user_count()

async def broadcast_chat(msg):
    packet = json.dumps({"type": "chat", "message": msg})
    await asyncio.gather(*(client.send(packet) for client in connected_clients))

async def notify_system(msg):
    packet = json.dumps({"type": "chat", "message": msg})
    await asyncio.gather(*(client.send(packet) for client in connected_clients))

async def broadcast_user_count():
    client_count = len(connected_clients)
    packet = json.dumps({"type": "userCount", "count": client_count})
    await asyncio.gather(*(client.send(packet) for client in connected_clients))

async def main():
    host = "localhost"
    port = 6789
    async with websockets.serve(handle_client, host, port):
        print(f"Server is online {host}:{port}")
        await asyncio.Future() # Run forever

if __name__ == "__main__":
    asyncio.run(main())
