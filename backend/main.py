import socketio

from backend.services.images_service import get_images

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)


# Define a Socket.IO event handler for when clients connect
@sio.on('connect')
async def connect(sid, environ):
    print('Client connected:', sid)


# Define a Socket.IO event handler for when clients disconnect
@sio.on('disconnect')
async def disconnect(sid):
    print('Client disconnected:', sid)


# Define a Socket.IO event handler for when clients send a "start" event
@sio.on('start')
async def start(sid):
    print('Starting image stream for client:', sid)
    await sio.emit('images', get_images(), room=sid)


if __name__ == '__main__':
    import logging
    import sys

    logging.basicConfig(level=logging.DEBUG,
                        stream=sys.stdout)

    import uvicorn

    uvicorn.run("main:app", host='0.0.0.0', port=8000, reload=True)
