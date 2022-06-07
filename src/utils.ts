import { format } from "fecha";

export const EMPTY: number = 0;
export const RED: number = 1;
export const YELLOW: number = 2;

/**
 * 
 * @param {String} message 
 * @returns Message preceded by current timestamp.
 */
export const formattedMessage = (message: string, level: string) => `[${format(new Date(), 'HH:mm:ss:SSS DD-MM-YYYY')}] [${level}] ${message}`;

export const info = (message: string) => console.info(formattedMessage(message, "INFO"));

export const debug = (message: string) => console.debug(formattedMessage(message, "DEBUG"));

export function clone2DArray(arr: number[][]): number[][]
{
	return arr.map(a => a.slice());
}

export function isGameOver(board: number[][]): boolean
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

export function isBoardFull(board: number[][]): boolean
{
	return board.every(col => col.every(i => i != EMPTY));
}

export function clearBoard(board: number[][])
{
	for (let col of board)
	{
		for (let i = 0; i < col.length; i++)
		{
			col[i] = EMPTY;
		}
	}
}
