module.exports.RoomVariables = class RoomVariables
{
	/**
	 * ID of the player (socket) with RED pieces.
	 * @type string
	 */
	firstPlayerID;

	/**
	 * ID of the player (socket) with YELLOW pieces.
	 * @type string
	 */
	secondPlayerID;

	/**
	 * @type Array<Array<number>>
	 */
	board;

	constructor(board, firstPlayerID)
	{
		this.board = board;
		this.firstPlayerID = firstPlayerID;
	}
}
