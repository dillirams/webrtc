import { useEffect, useState } from "react"


export default function ReceiverComponent(){

    const [socket, setSocket]=useState<WebSocket|null>(null);

    useEffect(()=>{
        const wss= new WebSocket("ws://localhost:8080");
        setSocket(wss);
       
        wss.onopen=()=>{
        console.log("hello from inside") 
            wss.send(JSON.stringify({
                type:"receiver"
            }))
        }

       
    },[])

    async function  initiateReceive() {
        
        const pc=new RTCPeerConnection();

        console.log(pc)

       
        console.log("from initiate function")
        if(!socket){
            return;
        }

        pc.ontrack = (event) => {
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
        };

        socket.onmessage=async(message:any)=>{
            console.log(message);
        
            const parsedMessage=JSON.parse(message.data);
            console.log(parsedMessage);
    
            if(parsedMessage.type=='createOffer'){
               await pc.setRemoteDescription(parsedMessage.sdp);
               const answer= await pc.createAnswer();
               await pc.setLocalDescription(answer);
               socket.send(JSON.stringify({
                type:"createAnswer",
                sdp:pc.localDescription
               }))
            }else if(parsedMessage.type=="iceCandidate"){
                pc.addIceCandidate(parsedMessage.candidate);
            }
        }

        console.log("after message")


    }

    return <div>
        "this is receiver"

        <button className="border rounded-xl p-3 bg-indigo-500 text-white font-xl font-bold hover:bg-indigo-700" onClick={()=>{initiateReceive()}}>receive</button>
    </div>
}