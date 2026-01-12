import { WebSocketServer, WebSocket } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const parsedMessage = JSON.parse(data);
        if (parsedMessage.type == 'sender') {
            senderSocket = ws;
        }
        else if (parsedMessage.type == 'receiver') {
            receiverSocket = ws;
        }
        else if (parsedMessage.type == 'createOffer') {
            if (ws != senderSocket) {
                return;
            }
            receiverSocket?.send(JSON.stringify({
                type: "createOffer",
                sdp: parsedMessage.sdp
            }));
        }
        else if (parsedMessage.type == 'createAnswer') {
            if (ws != receiverSocket) {
                return;
            }
            ;
            senderSocket?.send(JSON.stringify({
                type: "createAnswer",
                sdp: parsedMessage.sdp
            }));
        }
        else if (parsedMessage.type == 'iceCandidate') {
            if (ws === senderSocket) {
                receiverSocket?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: parsedMessage.candidate
                }));
            }
            else if (ws === receiverSocket) {
                senderSocket?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: parsedMessage.candidate
                }));
            }
        }
    });
});
//# sourceMappingURL=index.js.map