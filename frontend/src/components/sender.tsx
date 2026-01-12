import { useEffect, useState } from "react"

export default function SenderComponent(){

    const [socket, setSocket]=useState<WebSocket|null>(null);
  
    

    useEffect(()=>{
        const wss=new WebSocket("ws://localhost:8080");
        setSocket(wss)
        wss.onopen=()=>{
            wss.send(JSON.stringify({
                type:"sender"
            }))
        }
    },[])

    async function initiateConnection() {

    const pc1= new RTCPeerConnection();

    if(!socket){
        return;
    }

    socket.onmessage=async(message:any)=>{
        const parsedMessage=JSON.parse(message);
        if(parsedMessage.type=='createAnswer'){
            await pc1.setRemoteDescription(parsedMessage.sdp);
        }else if(parsedMessage.type=='iceCandidate'){
            pc1.addIceCandidate(parsedMessage.candidate)
        }
    }

    pc1.onicecandidate=(event)=>{
        if(event.candidate){
            socket?.send(JSON.stringify({
                type:"iceCandidate",
                candidate:event.candidate
            }))
        }
    }

    pc1.onnegotiationneeded=async()=>{
        const offer= await pc1.createOffer();
        pc1.setLocalDescription(offer);
        socket?.send(JSON.stringify({
            type:"createOffer",
            sdp:pc1.localDescription
        }))
    }

    getVoicestreamData(pc1)
        
    }

    const getVoicestreamData=async(pc:RTCPeerConnection)=>{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true, video:false});
        stream.getAudioTracks().forEach(track=>{
            pc.addTrack(track, stream)
        })
    

    }

    

    return <div>
        

        <button className="border rounded-xl p-3 bg-indigo-500 text-white font-xl font-bold hover:bg-indigo-700" onClick={initiateConnection}>click</button>
    </div>
}