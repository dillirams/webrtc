import { useEffect, useState } from "react"

export default function ReceiverComponent(){

    const [socket, setSocket]=useState<WebSocket|null>(null);

    useEffect(()=>{
        const wss= new WebSocket("ws://localhost:8080");
        setSocket(wss);
        wss.onopen=()=>{
            wss.send(JSON.stringify({
                type:"receiver"
            }))
        }
    })

    async function  initiateReceive() {
        
        const pc=new RTCPeerConnection();

        if(!socket){
            return;
        }

        pc.ontrack = (event) => {
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
        };

        socket.onmessage=(message:any)=>{
            const parsedMessage=JSON.parse(message);
            if(parsedMessage.type=='createOffer'){
                pc.setRemoteDescription(parsedMessage.sdp);
            }else if(parsedMessage.type=="iceCandidate"){
                pc.addIceCandidate(parsedMessage.candidate);
            }
        }


        pc.onicecandidate=(event)=>{
            if(event.candidate){
                 socket.send(JSON.stringify({
                type:"iceCandidate",
                candidate:event.candidate
            }))
            }
           
        }

        pc.onnegotiationneeded=async()=>{
            const answer= await pc.createAnswer();
            pc.setLocalDescription(answer);
            socket.send(JSON.stringify({
                type:"createAnswer",
                sdp:pc.localDescription
            }))
        }

    }

    return <div>
        "this is receiver"

        <button className="border rounded-xl p-3 bg-indigo-500 text-white font-xl font-bold hover:bg-indigo-700" onClick={initiateReceive}>receive</button>
    </div>
}