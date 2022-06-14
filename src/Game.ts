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
}
