/**
 * AULA SC900 Pro Local WebSocket Daemon
 * Allows real-time telemetry streaming and cross-browser mouse management.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = 8080;
const server = createServer();
const wss = new WebSocketServer({ server });

console.log('====================================================');
console.log('⚡ AULA SC900 Pro WebSocket Real-Time Daemon');
console.log(`📡 WebSocket Endpoint: ws://localhost:${PORT}`);
console.log('====================================================');

// Broadcast helper to all connected clients
function broadcast(data) {
  const json = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected.');

  // Send initial welcome message
  ws.send(JSON.stringify({
    type: 'WELCOME',
    message: 'Connected to AULA SC900 Pro Local Daemon',
    timestamp: Date.now()
  }));

  ws.on('message', (message) => {
    try {
      const packet = JSON.parse(message.toString());
      console.log('[WebSocket] Received packet:', packet);

      // Handle client command packets or relay to other clients
      if (packet.type === 'SET_STAGE' || packet.type === 'SET_POLLING_RATE') {
        broadcast({
          type: 'TELEMETRY',
          data: packet.data,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('[WebSocket] Invalid JSON message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected.');
  });
});

server.listen(PORT, () => {
  console.log(`[Daemon] Ready and listening on port ${PORT}`);
});
