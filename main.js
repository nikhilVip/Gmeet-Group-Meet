let client = AgoraRTC.createClient({mode:'rtc',codec:"vp8"})

let config ={
    appid:'null',
token:'null',

uid:null,
channel:'streamDUo',
}
let localTracks = {
    audioTrack:null,
    videoTrack:null
}


let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false
}



let remoteTracks = {}


document.getElementById('join-btn').addEventListener('click',async  () => {
    console.log('User joined stream')
    await joinStreams()
    document.getElementById('join-btn').style.display='none'
    document.getElementById('footer').style.display='flex'
  
}) 
     document.getElementById('mic-btn').addEventListener('click',async () => {
           //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.audioTrackMuted){
        //Mute your audio
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor ='#1f1f1f8e'

    }
     })

      
     document.getElementById('camera-btn').addEventListener('click', async () => {
        //Check if what the state of muted currently is
        //Disable button
        if(!localTrackState.videoTrackMuted){
            //Mute your audio
            await localTracks.videoTrack.setMuted(true);
            localTrackState.videoTrackMuted = true
            document.getElementById('camera-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
        }else{
            await localTracks.videoTrack.setMuted(false)
            localTrackState.videoTrackMuted = false
            document.getElementById('camera-btn').style.backgroundColor ='#1f1f1f8e'
    
        }
    
    })


 
document.getElementById('leave-btn').addEventListener('click' , async () =>{
    for(trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            //stop camera and mic
            track.stop()
            //disconnects from your camera and mic
            track.close()
            localTracks[trackName]=null
        }
    }
    await client.leave()
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('footer').style.display='none'
    document.getElementById('join-btn').style.display='block'
})

let joinStreams = async () => {

    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    [config.uid, localTracks.audioTrack,localTracks.videoTrack] = await Promise.all([ client.join(config.appid,config.channel,config.token,config.uid ||null ),
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
    
    ])
    let  videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid} " >
    <p  class ="user-uid">${config.uid}</p>
    <div class="video-player player" id="stream-${config.uid}"></div>
    </div>` 
    
    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
    localTracks.videoTrack.play(`stream-${config.uid}`)

    await client.publish([localTracks.audioTrack, localTracks.videoTrack])
    client.on("user-published",handleUserJoined)
}

let handleUserJoined = async (user,mediaType) =>{
    console.log('User has join our stream')
    remoteTracks[user.uid] = user

    await client.subscribe(user,mediaType)

    let videoPlayer = document.getElementById(`video-weapper-${user.uid}`)
     if(videoPlayer != null){
         videoPlayer.remove()
     }
    if(mediaType === 'video'){
                 let  videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid} " >
                 <p  class ="user-uid">${user.uid}</p>
                 <div class="video-player player" id="stream-${user.uid}"></div>
             </div>`
             document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
              user.videoTrack.play(`stream-${user.uid}`) 

    }

    if(mediaType === 'audio'){
        user.audioTrack.play();
    }
    
     
}
let handleUserLeft = (user) => {
    console.log('Handle user left')
   
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}
 
