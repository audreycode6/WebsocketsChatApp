import asyncio
import websockets

'''to run client and server:
1. - open up 2 terminals for client anf server: 
    make sure venv is activated in both termnals: source chat_app/bin/activate
2 - run html file in client directory in terminal: python3 -m http.server 8000
3 - run main server in web_socket_app -> server  ditectory: python3 main.py
4. - open local host: http://localhost:8000/chat.html
5. - inspect /open dev tools -> console to see detailed exceptions
'''

connected_clients = set()

async def handle_client(websocket): 
    ''' connection handler function:
    This function defines how to interact with that client '''
    # Register the new client
    connected_clients.add(websocket)
    # await notify_users(f"A user has joined the chat. Total users: {len(connected_clients)} ") # TODO
    await notify_users(f"A user has joined the chat.") # TODO
    try:
        async for message in websocket:
            # Broadcast the message to all connected clients
            for client in connected_clients:
                 await client.send(message)
    except Exception as e:
        print(f"Error encountered: {e}")
    finally:
        # Unregister the client
        connected_clients.remove(websocket) # TODO?
        # await notify_users(f"A user has left the chat. Total users: {len(connected_clients)}") # TODO
        await notify_users(f"A user has left the chat.") # TODO
       

async def notify_users(message):
    if connected_clients:   # asyncio.wait doesn't accept an empty list
        await asyncio.gather(*[client.send(message) for client in connected_clients])
# TODO update so that you can just say client username

    
async def main():
    host = "localhost"
    port = 6789
    server = await websockets.serve(handle_client, host, port)
    print(f"Server is online {host}:{port}")
    await server.wait_closed() # waits for server to be explicitely closed

if __name__ == "__main__":
    asyncio.run(main())
