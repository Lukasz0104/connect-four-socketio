const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

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
			let flag = prev != EMPTY;

			for (let i = 1; i < 4; i++)
			{
				flag &&= (board[c + i][r] == prev);
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

	// check diagonal down
	for (let c = 0; c < 4; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let prev = board[c][r];
			let flag = prev != EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev == board[c + i][r + i]);
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
			let flag = prev != EMPTY;
			for (let i = 1; i < 4; i++)
			{
				flag &&= (prev == board[c - i][r + i]);
			}
			if (flag) 
			{
				return true;
			}
		}
	}

	return false;
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

module.exports.clearBoard = clearBoard;
module.exports.clone2DArray = clone2DArray;
module.exports.EMPTY = EMPTY;
module.exports.RED = RED;
module.exports.YELLOW = YELLOW;
module.exports.isGameOver = isGameOver;