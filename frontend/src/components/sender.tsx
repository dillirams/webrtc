export default function SenderComponent() {
  let pc: RTCPeerConnection;
  let iceQueue: RTCIceCandidateInit[] = [];

  const socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "sender" }));
  };

  async function start() {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.send(JSON.stringify({
          type: "iceCandidate",
          candidate: e.candidate
        }));
      }
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "createAnswer") {
        await pc.setRemoteDescription(msg.sdp);

        // Flush queued ICE
        iceQueue.forEach(c => pc.addIceCandidate(c));
        iceQueue = [];
      }

      if (msg.type === "iceCandidate") {
        if (pc.remoteDescription) {
          pc.addIceCandidate(msg.candidate);
        } else {
          iceQueue.push(msg.candidate);
        }
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.send(JSON.stringify({
      type: "createOffer",
      sdp: offer
    }));
  }

  return <button className="px-3 py-1 border rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-700" onClick={start}>Start Voice</button>;
}
