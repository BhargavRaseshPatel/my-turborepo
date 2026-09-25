import { WebSocketServer } from 'ws'
import 'dotenv/config';
import { authMiddleware } from './authMiddleware';
import { Request } from 'express';

const server = new WebSocketServer({ port: 3006 });


const USERS: any = {

}

// Broadcast the live headcount (distinct users) of a board to everyone in it.
const broadcastPresence = (boardId: string) => {
    const room = USERS[boardId] ?? []
    const count = new Set(room.map((u: any) => u.userId)).size
    room.forEach(({ socket }: any) => socket.send(JSON.stringify({
        type: "presence",
        boardId,
        count
    })))
}


server.on("connection", (socket,) => {
    console.log("client connected")
    let joinedRoom: string = ''
    let userId = ''

    socket.on("message", (data: any) => {
        const parsedData = JSON.parse(data);
        const boardId = parsedData.boardId;
        joinedRoom = boardId

        if (parsedData.type == "join") {
            userId = authMiddleware(parsedData.token)

            if (!USERS[boardId]) {
                USERS[boardId] = []
            }
            
            USERS[boardId].forEach(({ socket }: any) => socket.send(
                JSON.stringify({
                    type: "join",
                    userId: userId
                })
            ))

            USERS[boardId].push({ userId: userId, socket: socket })

            socket.send(JSON.stringify({
                type: "initial_state",
                users: USERS[boardId].filter((x: any) => x.userId != userId).map((u: any) => u.userId)
            }))

            broadcastPresence(boardId)
        }

        if(parsedData.type == "add_issue"){
            const {boardId, issueId, createdIssue} = parsedData;
            const {name, description, status, tag} =  createdIssue

            USERS[parsedData.createdIssue.boardId]?.forEach(({socket} : any) => socket.send(
                JSON.stringify({
                    type : 'add_issue',
                     issueId,
                    name : name,
                    description : description,
                    status: status,
                    tag: tag,
                    boardId
                })
            ))
        }

        if (parsedData.type == "issue_move") {

            const { status, direction, boardId, issueId } = parsedData;

            if (status == 'UPCOMING' && direction == 'right') {
                USERS[boardId]?.forEach(({ socket }: any) => socket.send(
                    JSON.stringify({
                        type: 'issue_move',
                        issueId,
                        status: 'IN_PROGRESS'
                    })
                ))
            }

            else if (status == 'IN_PROGRESS') {
                if (direction == 'right') {
                    USERS[boardId]?.forEach(({ socket }: any) => socket.send(
                        JSON.stringify({
                            type: 'issue_move',
                            issueId,
                            status: 'DONE'
                        })
                    ))
                } else if (direction == 'left') {
                    USERS[boardId]?.forEach(({ socket }: any) => socket.send(
                        JSON.stringify({
                            type: 'issue_move',
                            issueId,
                            status: "UPCOMING"
                        })
                    ))
                }
            }
            else if (status == 'DONE' && direction == 'left') {
                USERS[boardId]?.forEach(({ socket }: any) => socket.send(
                    JSON.stringify({
                        type: 'issue_move',
                        issueId,
                        status: "IN_PROGRESS"
                    })
                ))
            };
        }

        console.log(USERS)
    })

    socket.on("close", () => {
        Object.entries(USERS).forEach(([roomId, users]: [any, any]) => {
            if (roomId == joinedRoom) {
                const userExists = users.find((u: any) => u.socket == socket)

                if (userExists) {
                    users = users.filter((x: any) => x.socket != socket);
                    USERS[roomId] = users.filter((x: any) => x.socket !== socket);

                    users.forEach(({ socket }: { socket: any }) => socket.send(JSON.stringify({
                        type: "leave",
                        userId: userExists.userId
                    })))

                    broadcastPresence(roomId)
                }

            }
        })
    })
})