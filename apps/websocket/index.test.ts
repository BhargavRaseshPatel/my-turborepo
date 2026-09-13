import { test } from 'node:test'
import assert from 'node:assert'
import jwt from 'jsonwebtoken'
import WebSocket from 'ws'

process.env.PORT = '3106'
process.env.JWT_SECRET = 'test-secret'

const connect = () => new Promise<WebSocket>((resolve) => {
    const ws = new WebSocket('ws://localhost:3106')
    ws.once('open', () => resolve(ws))
})

test('bad messages do not crash the server; unauthenticated broadcasts are dropped', async () => {
    const { server } = await import('./index')

    const attacker = await connect()
    attacker.send('not json')
    attacker.send(JSON.stringify({ type: 'join', token: 'bad', boardId: 'b1' }))

    const user = await connect()
    const first = new Promise<any>((r) => user.once('message', (d) => r(JSON.parse(d.toString()))))
    user.send(JSON.stringify({ type: 'join', token: jwt.sign({ userId: 'u1' }, 'test-secret'), boardId: 'b1' }))
    assert.equal((await first).type, 'initial_state') // server survived the bad messages

    const later: any[] = []
    user.on('message', (d) => later.push(JSON.parse(d.toString())))
    attacker.send(JSON.stringify({ type: 'issue_move', boardId: 'b1', issueId: 'i1', status: 'UPCOMING', direction: 'right' }))
    await new Promise((r) => setTimeout(r, 200))
    assert.deepEqual(later, []) // attacker never joined, so nothing is broadcast

    attacker.close()
    user.close()
    server.close()
})
