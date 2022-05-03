var path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { isGameOver, EMPTY, RED, YELLOW } = require('./utils');

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) =>
{
	console.log('got GET /');
	res.sendFile(path.join(__dirname, 'index.html'));
});

let players = new Map();

let board = [
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
	[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
];

const clearBoard = () =>
{
	for (let col of board)
	{
		for (let i = 0; i < col.length; i++)
		{
			col[i] = EMPTY;
		}
	}
}

io.on('connection', (socket) =>
{
	if (players.size > 1)
	{
		socket.disconnect();
		console.log('refused connection');
	}
	else 
	{
		if (players.size == 0 || !(Array.from(players.values()).includes(RED)))
		{
			players.set(socket.id, RED);
			socket.emit('init', true);
		}
		else 
		{
			players.set(socket.id, YELLOW);
			socket.emit('init', false);
		}
		clearBoard();
		console.log('user connected', players);

		socket.on('move', (col) =>
		{
			let column = Number(col);
			let index = board[column].lastIndexOf(EMPTY);
			if (index > -1)
			{
				board[column][index] = players.get(socket.id);
				io.emit('update', board);
				if (isGameOver(board))
				{
					socket.broadcast.emit('lost');
					socket.emit('won');
				}
			}
		});

		socket.on('start-new-game', () =>
		{
			clearBoard();
			for (let items of players)
			{
				let [id, color] = items;
				if (color == RED)
				{
					players.set(id, YELLOW);
					io.to(id).emit('init', false);
				}
				else
				{
					players.set(id, RED);
					io.to(id).emit('init', true);
				}
			}
		});
	}

	socket.on('disconnect', () =>
	{
		players.delete(socket.id);
		console.log('user disconnected');
	})
});

server.listen(PORT, () =>
{
	console.log(`listening on localhost:${PORT}`);
});
