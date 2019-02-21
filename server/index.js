import express from 'express';
import socketIO from "socket.io";

export default (app, http) => {
  app.use(express.json());

  app.get('/foo', (req, res) => {
    res.json({msg: 'foo'});
  });

  app.post('/bar', (req, res) => {
    res.json(req.body);
  });


  let io = socketIO(http);
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
      console.log(`message: ${msg}`);
      io.emit('chat message', msg);
    });

    socket.on('get', () => {

    });
  });
}
