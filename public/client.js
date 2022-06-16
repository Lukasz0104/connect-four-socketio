const EMPTY = 0;
const RED = 1;
const YELLOW = 2;
const container = document.querySelector('#boardContainer');
const message = document.querySelector('p#message');
const checkbox = document.querySelector('#privateRoomCheckbox');
const availableRooms = document.querySelector('ul#rooms');
const columns = [];

window.onload = () =>
{
	let socket = io();
	let canMove = false;
	document.querySelector('button#new-game').addEventListener('click', newGame);
	document.querySelector('button#joinRoomButton').addEventListener('click', joinRoomViaInput);
	document.querySelector('#disconnect').addEventListener('click', leaveRoom);

	checkbox.addEventListener('change', () =>
	{
		document.querySelector('#passwordInput').style.display = checkbox.checked ? "block" : "none";
	});

	function joinRoomViaInput()
	{
		let roomID = document.querySelector('input[type=text]').value;
		if (roomID)
		{
			if (!checkbox.checked)
			{
				socket.emit('join-room', roomID);
			}
			else
			{
				let pass = document.querySelector('#passwordInput').value;
				socket.emit('join-room-with-passowrd', {id: roomID, password: pass});
			}
		}
	}

	function joinRoomViaClick()
	{
		let room = this.innerText;
		if (room)
		{
			socket.emit('join-room', room);
		}
	}

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
		if (canMove)
		{
			socket.emit('move', this.firstChild.getAttribute('data-column'));
		}
	}

	function newGame()
	{
		socket.timeout(10000).emit('restart', (err, resp) =>
		{
			if (err || !resp.response)
			{
				alert('Opponent did not want to restart the game');
			}
		});
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
		manageEventListeners();
	}

	function manageEventListeners()
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

	function switchView()
	{
		document.querySelector('div#controls').classList.toggle('hidden');
		document.querySelector('div#game').classList.toggle('hidden');
	}

	function leaveRoom()
	{
		socket.emit('leave');
		switchView();
	}

	socket.on('start-game', (flag) =>
	{
		canMove = flag;
		initBoard();
		manageEventListeners();

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

	socket.on('room-full', () =>
	{
		alert("room was full");
	});

	socket.on('available-rooms', (rooms) =>
	{
		availableRooms.replaceChildren();
		for (let room of rooms)
		{
			let listItem = document.createElement('li');
			listItem.innerText = room;
			listItem.addEventListener('click', joinRoomViaClick);
			availableRooms.appendChild(listItem);
		}
	});

	socket.on('room-joined', () =>
	{
		switchView();
	});

	socket.on('opponent-left', () =>
	{
		message.innerText = "User left, waiting for new opponent...";
		canMove = false;
	});

	socket.on('draw', () => 
	{
		alert('The game is a draw!');
		message.innerText = 'Click `start new game` to play again.';
	});

	socket.on('prompt-new-game', (callback) =>
	{
		callback({
			answer: confirm('Opponent wants to start a new game. Do you agree?')
		});
	})
}
