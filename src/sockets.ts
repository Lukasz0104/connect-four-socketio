import express from 'express';
import { createServer } from 'http';

export const app = express();
export const server = createServer(app);

import { Server, Socket } from "socket.io";
const io = new Server(server);

import { isGameOver, EMPTY, RED, YELLOW, isBoardFull, debug, info } from './utils';
import Game from './Game';

/**
 * Maps public room's ID to the game object.
 */
let publicGames: Map<string, Game> = new Map();

let privateGames: Map<string, [Game, string]> = new Map();

const getRooms = (): string[] =>
{
	let roomIDs: string[] = [];

	// list of clients' ids
	const clients = Array.from(io.of('/').sockets.keys());

	// collection of rooms
	const rooms = io.of('/').adapter.rooms;

	for (let [id, room] of rooms.entries())
	{
		if (!clients.includes(id) && room.size < 2 && !privateGames.has(id))
		{
			roomIDs.push(id);
		}
	}

	return roomIDs;
}

const leaveRoom = (socket: Socket) =>
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

			let game: Game = undefined!;
			if (publicGames.has(roomId))
			{
				game = publicGames.get(roomId)!;
			}
			else if (privateGames.has(roomId))
			{
				game = privateGames.get(roomId)![0];
			}

			if (game)
			{
				// check which player left
				if (game?.firstPlayerID === socket.id)
				{
					// first player left, hence change color for the second player
					game.firstPlayerID = game.secondPlayerID!;
					game.secondPlayerID = undefined;
					debug(`Assigning RED color to player '${game.firstPlayerID}'`);
				}
			}
		}
		else
		{
			// room was deleted, so remove entry from roomVariables
			if (publicGames.has(roomId))
			{
				publicGames.delete(roomId);
				info(`Deleting public room '${roomId}'`);
			}
			else if (privateGames.has(roomId))
			{
				privateGames.delete(roomId);
				info(`Deleting private room '${roomId}'`);
			}
		}
	}

	// notify other sockets that room size has changed or was removed
	io.emit('available-rooms', getRooms());
}

io.on('connection', (socket) =>
{
	info(`User '${socket.id}' connected`);

	// notify newly connected user about available rooms
	socket.emit('available-rooms', getRooms());

	socket.on('join-room', (roomId) =>
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
				publicGames.set(roomId, new Game(socket.id));
			}
			else if (room.size === 2)
			{
				let game = publicGames.get(roomId);
				game!.secondPlayerID = socket.id;

				// check if board is even partially filled (meaning that user left mid-game)
				if (game!.board.some((row) => row.some(e => e !== EMPTY)))
				{
					game!.clearBoard();
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

	socket.on('join-room-with-passowrd', (obj) =>
	{
		let id: string = obj.id;
		let password: string = obj.password;
		debug(`User '${socket.id}' attempts to join room '${id}'`);

		let room = io.of('/').adapter.rooms.get(id);
		if (!room || room.size < 2)
		{
			if (privateGames.has(id))
			{
				if (password === privateGames.get(id)![1])
				{
					socket.join(id);
					socket.emit('room-joined');
					debug(`User '${socket.id}' joined private room '${id}'`);
					io.except(id).emit('available-rooms', getRooms());

					let game = privateGames.get(id)!;
					game[0].secondPlayerID = socket.id;
					game[0].clearBoard();

					socket.to(id).emit('start-game', true);
					socket.emit('start-game', false);
					info(`Starting new game in room '${id}'`);
				}
				else
				{
					socket.emit('invalid-password');
					debug(`User '${socket.id} failed to join private room '${id}' (incorrect password)`);
				}
			}
			else
			{
				socket.join(id);
				privateGames.set(id, [new Game(socket.id), password]);
				socket.emit('room-joined');
				debug(`User '${socket.id}' joined private room '${id}'`);
			}
		}
		else
		{
			socket.emit('room-full');
			debug(`User '${socket.id}' was unable to join room '${id}', because room was full`);
		}
	})

	socket.on('move', c =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r !== socket.id)
			.shift()!;

		let column = Number(c);

		let game: Game;
		if (publicGames.has(roomId))
		{
			game = publicGames.get(roomId)!;
		}
		else if (privateGames.has(roomId))
		{
			game = privateGames.get(roomId)![0];
		}
		else return;

		// find position to insert next piece
		let index = game.board[column].lastIndexOf(EMPTY);

		if (index > -1)
		{
			// check which player did the move
			if (game.firstPlayerID === socket.id)
			{
				game.board[column][index] = RED;
			}
			else
			{
				game.board[column][index] = YELLOW;
			}

			// send updated board to all players in the room
			io.to(roomId).emit('update', game.board);

			// check if anyone did the winning move
			if (isGameOver(game.board))
			{
				debug(`User '${socket.id}' won the game in room '${roomId}'`);
				socket.emit('won');
				socket.to(roomId).emit('lost');
			}
			else if (isBoardFull(game.board))
			{
				debug(`The game in room '${roomId}' is a draw`)
				io.to(roomId).emit('draw');
			}
		}
	});

	socket.on('disconnecting', () =>
	{
		leaveRoom(socket);
		info(`User '${socket.id}' disconnected`);
	});

	socket.on('leave', () =>
	{
		leaveRoom(socket);
	});

	socket.on('restart', (callback) =>
	{
		const roomId = Array.from(socket.rooms.values())
			.filter(r => r !== socket.id)
			.shift()!;

		info(`Player ${socket.id} wants to restart the game in room ${roomId}`);

		let game: Game;
		if (publicGames.has(roomId))
		{
			game = publicGames.get(roomId)!;
		}
		else
		{
			game = privateGames.get(roomId)![0];
		}

		// determine id of the other player in the room
		let otherSocketID = game.firstPlayerID == socket.id ? game.secondPlayerID : game.firstPlayerID;

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
						game.clearBoard();

						// swap players
						[game.firstPlayerID, game.secondPlayerID] = [game.secondPlayerID!, game.firstPlayerID];

						info(`Restarting game in room ${roomId}`);
						io.to(game.firstPlayerID).emit('start-game', true);
						io.to(game.secondPlayerID).emit('start-game', false);
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
