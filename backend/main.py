import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)


@sio.event
async def connect(sid, *args, **kwargs):
    print(sid, 'connected')


@sio.event
async def disconnect(sid, *args, **kwargs):
    print(sid, 'disconnected')


if __name__ == '__main__':
    import logging
    import sys

    logging.basicConfig(level=logging.DEBUG,
                        stream=sys.stdout)

    import uvicorn

    uvicorn.run("main:app", host='0.0.0.0', port=8000, reload=True)
