const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
//mute our own video
myVideo.muted = true
const peers = {}
//connect our video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    //get video of the other connected user
    myPeer.on('call', call => {
        call.answer(stream)
    })

    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    //allow us to be connecte to other users
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    // console.log(userId)
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

//send current stream to new user connecting
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

//function to add video stream
function addVideoStream(video, stream) {
    //allow us to play our video
    video.srcObject = stream
    //add event listener to our video
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    //append video to the video grid
    videoGrid.append(video)
}
