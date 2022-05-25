const { format } = require("fecha");

const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

/**
 * 
 * @param {String} message 
 * @returns Message preceded by current timestamp.
 */
const formattedMessage = (message, level) => `[${format(new Date(), 'HH:mm:ss:SSS DD-MM-YYYY')}] [${level}] ${message}`;

const info = (message) => console.info(formattedMessage(message, "INFO"));

const debug = (message) => console.debug(formattedMessage(message, "DEBUG"));

function clone2DArray(arr)
{
	return arr.map(a => a.slice());
}

function isGameOver(board)
{
	// check rows
	for (let r = 0; r < 6; r++)
	{
		for (let c = 0; c < 4; c++)
		{
			let prev = board[c][r];
			let flag = prev !== EMPTY;

			for (let i = 1; i < 4; i++)
			{
				flag &&= (board[c + i][r] === prev);
			}
			if (flag)
			{
				return true;
			}
		}
	}

	for (let c = 0; c < 7; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev = board[c][r];
			let flag = prev !== EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev === board[c][r + i]);
			}
			if (flag)
			{
				return true;
			}
		}
	}

	// check diagonal down
	for (let c = 0; c < 4; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev = board[c][r];
			let flag = prev !== EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev === board[c + i][r + i]);
			}
			if (flag) 
			{
				return true;
			}
		}
	}

	// diagonal up
	for (let c = 3; c < 7; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev = board[c][r];
			let flag = prev !== EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev === board[c - i][r + i]);
			}
			if (flag) 
			{
				return true;
			}
		}
	}

	return false;
}

/**
 * @param {number[][]} board 
 */
function isBoardFull(board)
{
	return board.every(col => col.every(i => i != EMPTY));
}

function clearBoard(board)
{
	for (let col in board)
	{
		for (let i = 0; i < col.length; i++)
		{
			col[i] = EMPTY;
		}
	}
}

module.exports = {
	EMPTY: EMPTY,
	RED: RED,
	YELLOW: YELLOW,
	info: info,
	debug: debug,
	clearBoard: clearBoard,
	clone2DArray: clone2DArray,
	isGameOver: isGameOver,
	isBoardFull: isBoardFull
}
