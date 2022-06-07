import express from 'express';
import http from 'http';

export const app = express();
export const server = http.createServer(app);

import { Server, Socket } from "socket.io";
const io = new Server(server);

import { isGameOver, EMPTY, RED, YELLOW, clone2DArray, isBoardFull, debug, info } from './utils';
import RoomVariables from './RoomVariables';

/**
 * Maps room's ID to object containing room variables, such as connected players and board.
 */
let roomVariables: Map<string, RoomVariables> = new Map();

const board: number[][] = [
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
];

const getRooms = (): string[] =>
{
	let roomIDs: string[] = [];

	// list of clients' ids
	const clients = Array.from(io.of('/').sockets.keys());

	// collection of rooms
	const rooms = io.of('/').adapter.rooms;

	for (let [id, room] of rooms.entries())
	{
		if (!clients.includes(id) && room.size < 2)
		{
			roomIDs.push(id);
		}
	}

	return roomIDs;
}

const leaveRoom = async (socket: Socket) =>
{
	let socketRooms = Array.from(socket.rooms.values());
	let roomId = socketRooms.filter(r => r !== socket.id).shift()!;
	socket.leave(roomId);

	if (roomId)
	{
		info(`User '${socket.id}' left room '${roomId}'`);

		// check if room still exists
		if (io.of('/').adapter.rooms.get(roomId))
		{
			// room still exists, so notify other player that opponent has left
			socket.to(roomId).emit('opponent-left');

			let rV = roomVariables.get(roomId)!;

			// check which player left
			if (rV?.firstPlayerID === socket.id)
			{
				// first player left, hence change color for the second player
				rV.firstPlayerID = rV.secondPlayerID!;
				rV.secondPlayerID = undefined;
				debug(`Assigning RED color to player '${rV.firstPlayerID}'`);
			}
		}
		else
		{
			// room was deleted, so remove entry from roomVariables
			roomVariables.delete(roomId);
			info(`Deleting room '${roomId}'`);
		}
	}

	// notify other sockets that room size has changed or was removed
	io.emit('available-rooms', getRooms());
}

io.on('connection', async (socket) =>
{
	info(`User '${socket.id}' connected`);

	// notify newly connected user about available rooms
	socket.emit('available-rooms', getRooms());

	socket.on('join-room', async (roomId) =>
	{
		debug(`User '${socket.id}' attempts to join room '${roomId}'`);
		let room = io.of('/').adapter.rooms.get(roomId);
		if (!room || room.size < 2)
		{
			socket.join(roomId);
			socket.emit('room-joined');
			debug(`User '${socket.id}' joined room '${roomId}'`);

			let notFullRooms = getRooms();
			io.except(roomId).emit('available-rooms', notFullRooms);

			if (!room) // first player
			{
				roomVariables.set(roomId, new RoomVariables(clone2DArray(board), socket.id));
			}
			else if (room.size === 2)
			{
				let rV = roomVariables.get(roomId);
				rV!.secondPlayerID = socket.id;

				// check if board is even partially filled (meaning that user left mid-game)
				if (rV!.board.some((row) => row.some(e => e !== EMPTY)))
				{
					rV!.board = clone2DArray(board);
				}

				// emit to all clients in this room
				socket.to(roomId).emit('start-game', true);
				socket.emit('start-game', false);
				info(`Starting new game in room '${roomId}'`);
			}
		}
		else
		{
			socket.emit('room-full');
			debug(`User '${socket.id}' was unable to join room '${roomId}', because room was full`);
		}
	});

	socket.on('move', c =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r !== socket.id)
			.shift()!;

		let column = Number(c);

		let rV: RoomVariables = roomVariables.get(roomId)!;

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
				debug(`User '${socket.id}' won the game in room '${roomId}'`);
				socket.emit('won');
				socket.to(roomId).emit('lost');
			}
			else if (isBoardFull(rV.board))
			{
				debug(`The game in room '${roomId}' is a draw`)
				io.to(roomId).emit('draw');
			}
		}
	});

	socket.on('disconnecting', async () =>
	{
		await leaveRoom(socket);
		info(`User '${socket.id}' disconnected`);
	});

	socket.on('leave', async () =>
	{
		await leaveRoom(socket);
	});

	socket.on('restart', (callback) =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r !== socket.id)
			.shift()!;

		info(`Player ${socket.id} wants to restart the game in room ${roomId}`);

		let rV = roomVariables.get(roomId)!;

		// determine id of the other player in the room
		let otherSocketID = rV.firstPlayerID == socket.id ? rV.secondPlayerID : rV.firstPlayerID;

		// ask the other player, whether they want to restart the game
		io.timeout(3000).to(otherSocketID!).emit('prompt-new-game', (err: any, response: { answer: boolean; }[]) =>
		{
			if (err) // opponent didn't answer in time
			{
				callback({ response: false });
				info(`Player ${otherSocketID} did not respond in time`);
			}
			else
			{
				if (response[0].answer)
				{
					callback({ response: true });
					if (response[0].answer)
					{
						info(`Player ${otherSocketID} agreed to restart the game in room ${roomId}`);

						// clear the board
						rV.board = clone2DArray(board);

						// swap players
						[rV.firstPlayerID, rV.secondPlayerID] = [rV.secondPlayerID!, rV.firstPlayerID];

						info(`Restarting game in room ${roomId}`);
						io.to(rV.firstPlayerID).emit('start-game', true);
						io.to(rV.secondPlayerID).emit('start-game', false);
					}
				}
				else 
				{
					callback({ response: false });
					info(`Player ${socket.id} did not want to restart the game in room ${roomId}`);
				}
			}
		});
	});
});
