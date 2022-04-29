const EMPTY = 0;
const RED = 1;
const YELLOW = 2;
const container = document.querySelector('#boardContainer');
const message = document.querySelector('p#message');
const columns = [];

window.onload = () =>
{
	let socket = io();
	let canMove = false;
	document.querySelector('button#new-game').addEventListener('click', newGame);

	const initBoard = () =>
	{
		columns.length = 0;
		container.replaceChildren();
		const cellTemplate = document.createElement('div');
		for (let col = 0; col < 7; col++)
		{
			let column = document.createElement('div');
			column.className = 'column';
			for (let row = 0; row < 6; row++)
			{
				let node = document.createElement("div");
				node.className = "cell";
				node.appendChild(cellTemplate.cloneNode());
				node.dataset.column = col;
				node.dataset.row = row;
				column.appendChild(node);
			}
			columns.push(column);
			container.appendChild(column);
		}
	}

	function clickHandler()
	{
		// console.log("emitting 'move' event...");
		socket.emit('move', this.firstChild.getAttribute('data-column'));
	}

	function newGame()
	{
		socket.emit('start-new-game');
	}

	function updateBoard(board)
	{
		canMove = !canMove;
		for (let c = 0; c < 7; c++)
		{
			let col = columns[c];
			for (let r = 0; r < 6; r++)
			{
				col.children[r].firstChild.classList.remove('yellow');
				col.children[r].firstChild.classList.remove('red');
				switch (board[c][r])
				{
					case RED:
						col.children[r].firstChild.classList.add('red');
						break;
					case YELLOW:
						col.children[r].firstChild.classList.add('yellow');
						break;
				}
			}
		}
		managageEventListeners();
	}

	function managageEventListeners()
	{
		for (let column of columns)
		{
			if (canMove && !(column.firstChild.firstChild.className))
			{
				column.addEventListener('click', clickHandler);
			}
			else 
			{
				column.removeEventListener('click', clickHandler);
			}
		}
	}

	socket.on('init', (flag) =>
	{
		// console.log(`received 'init' event: ${flag}`);
		canMove = flag;
		initBoard();
		managageEventListeners();

		if (canMove)
		{
			message.innerText = "Your turn";
			document.querySelector('span#yourColor + div').className = "cell red";
		}
		else
		{
			message.innerText = "Waiting for opponent's move...";
			document.querySelector('span#yourColor + div').className = "cell yellow";
		}
	});

	socket.on('update', (board) =>
	{
		// console.log('received `update` event');
		updateBoard(board);
		message.innerText = canMove ? "Your turn" : "Waiting for opponent's move...";
	});

	socket.on('won', () =>
	{
		alert("you won!");
	});

	socket.on('lost', () =>
	{
		alert('you lost! better luck next time!');
	});

	initBoard();
}
