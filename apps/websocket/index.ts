import { WebSocket, WebSocketServer } from 'ws'

const server = new WebSocketServer();

const USERS : any = {

}


server.on("connection", (socket) => {
    let joinedRoom = null
    socket.on("message", (data) => {
        const parsedData = JSON.parse(data);
        joinedRoom
         

        if(parsedData.type == "join"){
            const boardId = parsedData.boardId;
            
            if(!boardId){
                USERS[boardId] = []
            }

            const newUserId = Math.random();

            USERS[boardId].forEach(({socket}: any) => socket.send(
                JSON.stringify({
                    type : "join",
                    userId : newUserId
                })
            ))

            USERS[boardId].push({userId: newUserId, socket : socket})

            socket.send(JSON.stringify({
                type : "initial_state",
                users : USERS.filter((x) => x != newUserId).map(u => u.id)
            }))
         }
    })

    socket.on("close" , () => {
        Object.entries(USERS).map(([roomId, users]) => {
            const userExists = users.find(u => u.socket == socket)

            if(userExists) {
                users = users.filter(x => x.socket == socket);

                users.forEach(({socket}) => socket.send(JSON.stringify({
                    type : "leave",
                    userId : userExists.id
                })))
            }
        })
    })
})