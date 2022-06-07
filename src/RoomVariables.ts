export default class RoomVariables
{
	/**
	 * ID of the player (socket) with RED pieces.
	 */
	firstPlayerID: string;

	/**
	 * ID of the player (socket) with YELLOW pieces.
	 */
	secondPlayerID?: string;

	board: Array<Array<number>>;

	constructor(board: number[][], firstPlayerID: string)
	{
		this.board = board;
		this.firstPlayerID = firstPlayerID;
	}
}
