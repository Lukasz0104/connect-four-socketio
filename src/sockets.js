const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { isGameOver, EMPTY, RED, YELLOW, clone2DArray } = require('./utils');
const { RoomVariables } = require('./RoomVariables');

let roomVariables = new Map();

const board = [
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
];

const getRooms = async () => io.fetchSockets()
	.then((sockets) =>
	{
		// map room id to its size
		let m = new Map();

		// list of clients' ids
		const clients = sockets.map(s => s.id);

		// room list
		const rooms = io.of('/').adapter.rooms;

		// rooms' ids
		const keys = rooms.keys();

		for (let room of keys)
		{
			// size of current room
			let s = rooms.get(room).size;

			//?  
			if (!clients.includes(room) && s < 2)
			{
				m.set(room, s);
			}
		}
		return m;
	}).catch(console.log);

io.on('connection', async (socket) =>
{
	socket.emit('available-rooms', Array.from((await getRooms()).keys()));

	socket.on('join-room', async (roomId) =>
	{
		let room = io.of('/').adapter.rooms.get(roomId);
		if (!room || room.size < 2)
		{
			socket.join(roomId);
			socket.emit('room-joined');

			let notFullRooms = await getRooms();
			io.except(roomId).emit('available-rooms', Array.from(notFullRooms.keys()));

			if (!room) // first player
			{
				roomVariables.set(roomId, new RoomVariables(clone2DArray(board), socket.id));
			}
			else if (room.size == 2)
			{
				// TODO clear board before starting new game
				// emit to all clients in this room
				socket.to(roomId).emit('start-game', true);
				socket.emit('start-game', false);
			}
		}
		else
		{
			socket.emit('room-full');
		}
	});

	socket.on('leave-room', async () =>
	{
		let socketRooms = Array.from(socket.rooms.values());
		let roomId = socketRooms.filter(r => r != socket.id).shift();
		socket.leave(roomId);

		if (io.of('/').adapter.rooms.get(roomId))
		{
			socket.to(roomId).emit('opponent-left');
		}

		// notify other sockets that room size has changed or was removed
		io.emit('available-rooms', Array.from((await getRooms()).keys()));
	});

	socket.on('move', c =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r != socket.id)
			.shift();

		let column = Number(c);
		let index = roomVariables.get(roomId).board[column].lastIndexOf(EMPTY);

		if (index > -1)
		{
			const color = (roomVariables.get(roomId).firstPlayerID == socket.id) ? RED : YELLOW;
			roomVariables.get(roomId).board[column][index] = color;
			io.to(roomId).emit('update', roomVariables.get(roomId).board);

			if (isGameOver(roomVariables.get(roomId).board))
			{
				socket.emit('won');
				socket.to(roomId).emit('lost');
			}
		}
	});

	socket.on('disconnecting', async () =>
	{
		let socketRooms = Array.from(socket.rooms.values());
		let roomId = socketRooms.filter(r => r != socket.id).shift();
		socket.leave(roomId);

		if (!io.of('/').adapter.rooms.get(roomId))
		{
			roomVariables.delete(roomId);
		}
		else
		{
			socket.to(roomId).emit('opponent-left');
		}

		// notify other sockets that room size has changed or was removed
		io.emit('available-rooms', Array.from((await getRooms()).keys()));
	});
});

module.exports.app = app;
module.exports.server = server;