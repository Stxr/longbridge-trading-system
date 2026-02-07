import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupTradingWS } from './ws/trading';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

setupTradingWS(io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { server };
