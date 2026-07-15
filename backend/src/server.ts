import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WEB_URL?.split(',') ?? ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('order:subscribe', (orderId: string) => {
    console.log(`Socket ${socket.id} subscribed to order:${orderId}`);
    socket.join(`order:${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(Number(process.env.PORT ?? 4000), () => {
  console.log('CityBites API listening on :4000');
});

