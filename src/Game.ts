import { EMPTY } from "./utils";

export default class Game
{
	/**
	 * ID of the player (socket) with RED pieces.
	 */
	firstPlayerID: string;

	/**
	 * ID of the player (socket) with YELLOW pieces.
	 */
	secondPlayerID?: string;

	board: Array<Array<number>> = [
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
		[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
	];

	constructor(firstPlayerID: string)
	{
		this.firstPlayerID = firstPlayerID;
	}

	clearBoard(): void
	{
		for (let col of this.board)
		{
			for (let i = 0; i < col.length; i++)
			{
				col[i] = EMPTY;
			}
		}
	}

	isGameOver(): boolean
	{
		// check rows
		for (let r = 0; r < 6; r++)
		{
			for (let c = 0; c < 4; c++)
			{
				let prev = this.board[c][r];
				let flag = prev !== EMPTY;

				for (let i = 1; i < 4; i++)
				{
					flag &&= (this.board[c + i][r] === prev);
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
				let prev = this.board[c][r];
				let flag = prev !== EMPTY;
				for (let i = 1; i < 4; i++)
				{
					flag &&= (prev === this.board[c][r + i]);
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
				let prev = this.board[c][r];
				let flag = prev !== EMPTY;
				for (let i = 1; i < 4; i++)
				{
					flag &&= (prev === this.board[c + i][r + i]);
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
				let prev = this.board[c][r];
				let flag = prev !== EMPTY;
				for (let i = 1; i < 4; i++)
				{
					flag &&= (prev === this.board[c - i][r + i]);
				}
				if (flag) 
				{
					return true;
				}
			}
		}

		return false;
	}

	isBoardFull(): boolean
	{
		return this.board.every(col => col.every(i => i != EMPTY));
	}
}
