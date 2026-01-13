export default function ReceiverComponent() {
  let pc: RTCPeerConnection;
  let iceQueue: RTCIceCandidateInit[] = [];

  const socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "receiver" }));
  };

  async function receive() {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      document.body.appendChild(audio);
    };

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

      if (msg.type === "createOffer") {
        await pc.setRemoteDescription(msg.sdp);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(JSON.stringify({
          type: "createAnswer",
          sdp: answer
        }));

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
  }

  return <button  className="px-3 py-1 border rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-700" onClick={receive}>Receive Voice</button>;
}
