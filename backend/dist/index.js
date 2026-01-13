import { WebSocketServer, WebSocket } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'sender') {
            senderSocket = ws;
            return;
        }
        if (msg.type === 'receiver') {
            receiverSocket = ws;
            return;
        }
        if (msg.type === 'createOffer' && ws === senderSocket) {
            receiverSocket?.send(JSON.stringify(msg));
        }
        if (msg.type === 'createAnswer' && ws === receiverSocket) {
            senderSocket?.send(JSON.stringify(msg));
        }
        if (msg.type === 'iceCandidate') {
            if (ws === senderSocket) {
                receiverSocket?.send(JSON.stringify(msg));
            }
            else if (ws === receiverSocket) {
                senderSocket?.send(JSON.stringify(msg));
            }
        }
    });
});
//# sourceMappingURL=index.js.map