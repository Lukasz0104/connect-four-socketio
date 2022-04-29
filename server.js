var path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);

const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () =>
{
	console.log('listening on localhost:3000');
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

function isGameOver()
{
	for (let c = 0; c < 4; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev1 = board[c][r];
			let prev2 = board[c][r];
			let prev3 = board[c][r];
			let prev4 = board[c + 3][r + 3];

			let flag1 = prev1 != EMPTY; // checking horizontally
			let flag2 = prev2 != EMPTY; // checking vertically
			let flag3 = prev3 != EMPTY; // checking diagonal going down
			let flag4 = prev4 != EMPTY; // checking diagonal going up

			for (let i = 1; i < 4; i++)
			{
				flag1 &&= (prev1 == board[c + i][r]);
				flag2 &&= (prev2 == board[c][r + i]);
				flag3 &&= (prev3 == board[c + i][r + i]);
				flag4 &&= (prev4 == board[c + 3 - i][r + 3 - i]);
			}

			if (flag1 || flag2 || flag3 || flag4)
			{
				return true;
			}
		}
	}

	// check remaining columns
	for (let c = 4; c < 7; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev = board[c][r];
			let flag = prev != EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev == board[c][r + i]);
			}
			if (flag)
			{
				return true;
			}
		}
	}

	//check remaining rows
	for (let c = 0; c < 4; c++)
	{
		for (let r = 3; r < 6; r++)
		{
			let prev = board[c][r];
			let flag = prev != EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev == board[c + i][r]);
			}
			if (flag)
			{
				return true;
			}
		}
	}

	return false;
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
				if (isGameOver())
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
