import socketio

from backend.services.websocket_service import get_images

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)


# Define a Socket.IO event handler for when clients connect
@sio.on('connect')
async def connect(sid, *args, **kwargs):
    print('Client connected:', sid)


# Define a Socket.IO event handler for when clients disconnect
@sio.on('disconnect')
async def disconnect(sid, *args, **kwargs):
    print('Client disconnected:', sid)


# Define a Socket.IO event handler for when clients send a "start" event
@sio.on('generate')
async def start(sid, data):
    print('Starting image stream for client:', sid)
    slice_index = data.get('slice_index', None)  # default to None if not provided
    alpha = data.get('alpha', 0.5)  # default to 0.5 if not provided
    await sio.emit('images', get_images(slice_index=slice_index, alpha=alpha), room=sid)


if __name__ == '__main__':
    import logging
    import sys

    logging.basicConfig(level=logging.DEBUG,
                        stream=sys.stdout)

    import uvicorn

    uvicorn.run("main:app", host='0.0.0.0', port=8000, reload=True)
