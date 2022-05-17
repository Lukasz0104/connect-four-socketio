const { isGameOver, EMPTY, RED, YELLOW } = require('../src/utils');

test('should find a sequence of 4 in a column', () => {
	for (let r = 0; r < 6; r++)
	{
		for (let c = 0; c < 4; c++)
		{
			let board = [
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
			];

			for (let i = 0; i < 4; i++)
			{
				board[c + i][r] = RED;
			}
			expect(isGameOver(board)).toBe(true);
		}
	}
});

test('should find a sequence of 4 in a row', () => {
	for (let c = 0; c < 6; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let board = [
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
			];

			for (let i = 0; i < 4; i++)
			{
				board[c][r + i] = YELLOW;
			}
			expect(isGameOver(board)).toBe(true);
		}
	}
});

test('should find a sequence of 4 going diagonally up', () => {
	
	for (let c = 0; c < 3; c++)
	{
		for (let r = 3; r < 6; r++)
		{
			let board = [
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
			];
			
			for (let i = 0; i < 4; i++)
			{
				board[c + i][r - i] = RED;
			}

			expect(isGameOver(board)).toBe(true);
		}
	}
});

test('should find a sequence of 4 going diagonally down', () => {
	
	for (let c = 0; c < 3; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			let board = [
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
				[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
			];
			
			for (let i = 0; i < 4; i++)
			{
				board[c + i][r + i] = RED;
			}

			expect(isGameOver(board)).toBe(true);
		}
	}
});

