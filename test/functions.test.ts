import Game from '../src/Game';
import { RED, YELLOW } from '../src/utils';

let game = new Game('');
test('should find a sequence of 4 in a column', () =>
{
	for (let r = 0; r < 6; r++)
	{
		for (let c = 0; c < 4; c++)
		{
			for (let i = 0; i < 4; i++)
			{
				game.board[c + i][r] = RED;
			}
			expect(game.isGameOver()).toBe(true);
		}
	}
});

test('should find a sequence of 4 in a row', () =>
{
	for (let c = 0; c < 6; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			for (let i = 0; i < 4; i++)
			{
				game.board[c][r + i] = YELLOW;
			}
			expect(game.isGameOver()).toBe(true);
		}
	}
});

test('should find a sequence of 4 going diagonally up', () =>
{

	for (let c = 0; c < 3; c++)
	{
		for (let r = 3; r < 6; r++)
		{
			for (let i = 0; i < 4; i++)
			{
				game.board[c + i][r - i] = RED;
			}
			expect(game.isGameOver()).toBe(true);
		}
	}
});

test('should find a sequence of 4 going diagonally down', () =>
{

	for (let c = 0; c < 3; c++)
	{
		for (let r = 0; r < 3; r++)
		{
			for (let i = 0; i < 4; i++)
			{
				game.board[c + i][r + i] = RED;
			}
			expect(game.isGameOver()).toBe(true);
		}
	}
});
