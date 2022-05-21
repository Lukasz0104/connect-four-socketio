const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { isGameOver, EMPTY, RED, YELLOW, clone2DArray } = require('./utils');
const { RoomVariables } = require('./RoomVariables');

/**
 * Maps room's ID to object containing room variables, such as connected players and board.
 * @type {Map<string, RoomVariables>}
 */
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
		let roomIDs = [];

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

			//  exclude user's private room and full rooms
			if (!clients.includes(room) && s < 2)
			{
				roomIDs.push(room);
			}
		}
		return roomIDs;
	}).catch(console.log);

/**
 *
 * @param socket {Socket} Socket that is disconnecting or emitted 'leave' event.
 */
const leaveRoom = async (socket) =>
{
	let socketRooms = Array.from(socket.rooms.values());
	let roomId = socketRooms.filter(r => r !== socket.id).shift();
	socket.leave(roomId);

	// check if room still exists
	if (io.of('/').adapter.rooms.get(roomId))
	{
		// room still exists, so notify other player that opponent has left
		socket.to(roomId).emit('opponent-left');

		let rV = roomVariables.get(roomId);

		// check which player left
		if (rV.firstPlayerID === socket.id)
		{
			// first player left, hence change color for the second player
			rV.firstPlayerID = rV.secondPlayerID;
			rV.secondPlayerID = undefined;
		}
	}
	else
	{
		// room was deleted, so remove entry from roomVariables
		roomVariables.delete(roomId);
	}

	// notify other sockets that room size has changed or was removed
	io.emit('available-rooms', (await getRooms()));
}

io.on('connection', async (socket) =>
{
	// notify newly connected user about available rooms
	socket.emit('available-rooms', (await getRooms()));

	socket.on('join-room', async (roomId) =>
	{
		let room = io.of('/').adapter.rooms.get(roomId);
		if (!room || room.size < 2)
		{
			socket.join(roomId);
			socket.emit('room-joined');

			let notFullRooms = await getRooms();
			io.except(roomId).emit('available-rooms', notFullRooms);

			if (!room) // first player
			{
				roomVariables.set(roomId, new RoomVariables(clone2DArray(board), socket.id));
			}
			else if (room.size === 2)
			{
				let rV = roomVariables.get(roomId);
				rV.secondPlayerID = socket.id;

				// check if board is even partially filled (meaning that user left mid-game)
				if (rV.board.some((row) => row.some(e => e !== EMPTY)))
				{
					rV.board = clone2DArray(board);
				}

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

	socket.on('move', c =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r !== socket.id)
			.shift();

		let column = Number(c);

		/**
		 * @type {RoomVariables}
		 */
		let rV = roomVariables.get(roomId);

		// find position to insert next piece
		let index = rV.board[column].lastIndexOf(EMPTY);

		if (index > -1)
		{
			// check which player did the move
			if (rV.firstPlayerID === socket.id)
			{
				rV.board[column][index] = RED;
			}
			else
			{
				rV.board[column][index] = YELLOW;
			}

			// send updated board to all players in the room
			io.to(roomId).emit('update', rV.board);

			// check if anyone did the winning move
			if (isGameOver(rV.board))
			{
				socket.emit('won');
				socket.to(roomId).emit('lost');
			}
			// TODO check draws
		}
	});

	socket.on('disconnecting', async () =>
	{
		await leaveRoom(socket);
	});

	socket.on('leave', async () =>
	{
		await leaveRoom(socket);
	});
});

module.exports.app = app;
module.exports.server = server;
