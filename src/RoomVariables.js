const { EMPTY } = require('./utils');

class RoomVariables
{
	constructor(board, firstPlayerID)
	{
		this.board = board;
		this.firstPlayerID = firstPlayerID;	
	}
}

module.exports.RoomVariables = RoomVariables;