'use strict';

/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Player {
	constructor(color) {
		this.color = color;
	}
}

class Game {
	constructor(height, width, player1, player2) {
		this.height = height;
		this.width = width;
		this.board = []; // array of rows, each row is array of cells  (board[y][x])
		this.player1 = player1;
		this.player2 = player2;
		this.currPlayer = this.player1;
		this.gameOver = false;
		this.makeBoard();
		this.makeHtmlBoard();
	}

	/** findSpotForCol: given column x, return top empty y (null if filled) */

	findSpotForCol = (x) => {
		for (let y = this.height - 1; y >= 0; y--) {
			if (!this.board[y][x]) {
				return y;
			}
		}
		return null;
	};

	/** placeInTable: update DOM to place piece into HTML table of board */

	placeInTable = (y, x) => {
		const piece = document.createElement('div');
		piece.classList.add('piece');
		piece.style.backgroundColor = this.currPlayer.color;
		piece.style.top = -50 * (y + 2);

		const spot = document.getElementById(`${y}-${x}`);
		spot.append(piece);
	};

	/** endGame: announce game end */

	endGame = (msg) => alert(msg);

	/** checkForWin: check board cell-by-cell for "does a win start here?" */

	checkForWin = () => {
		const _win = (cells) => {
			// Check four cells to see if they're all color of current player
			//  - cells: list of four (y, x) cells
			//  - returns true if all are legal coordinates & all match currPlayer

			return cells.every(
				([y, x]) =>
					y >= 0 &&
					y < this.height &&
					x >= 0 &&
					x < this.width &&
					this.board[y][x] === this.currPlayer.color
			);
		};

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				// get "check list" of 4 cells (starting here) for each of the different
				// ways to win
				const horiz = [
					[y, x],
					[y, x + 1],
					[y, x + 2],
					[y, x + 3],
				];
				const vert = [
					[y, x],
					[y + 1, x],
					[y + 2, x],
					[y + 3, x],
				];
				const diagDR = [
					[y, x],
					[y + 1, x + 1],
					[y + 2, x + 2],
					[y + 3, x + 3],
				];
				const diagDL = [
					[y, x],
					[y + 1, x - 1],
					[y + 2, x - 2],
					[y + 3, x - 3],
				];

				// find winner (only checking each win-possibility as needed)
				if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
					return true;
				}
			}
		}
	};

	/** handleClick: handle click of column top to play piece */

	handleClick = (evt) => {
		if (!this.gameOver) {
			// get x from ID of clicked cell
			const x = +evt.target.id;

			// get next spot in column (if none, ignore click)
			const y = this.findSpotForCol(x);
			if (y === null) {
				return;
			}

			// place piece in board and add to HTML table
			this.board[y][x] = this.currPlayer.color;
			this.placeInTable(y, x);

			// check for win
			if (this.checkForWin()) {
				this.gameOver = true;
				return this.endGame(`Player ${this.currPlayer.color} won!`);
			}

			// check for tie
			if (this.board.every((row) => row.every((cell) => cell))) {
				this.gameOver = true;
				return this.endGame('Tie!');
			}

			// switch players
			this.currPlayer =
				this.currPlayer === this.player1 ? this.player2 : this.player1;
		}
	};

	/** makeBoard: create in-JS board structure:
	 *   board = array of rows, each row is array of cells  (board[y][x])
	 */

	makeBoard = () => {
		for (let y = 0; y < this.height; y++) {
			this.board.push(Array.from({ length: this.width }));
		}
	};

	/** makeHtmlBoard: make HTML table and row of column tops. */

	makeHtmlBoard = () => {
		const board = document.getElementById('board');

		// make column tops (clickable area for adding a piece to that column)
		const top = document.createElement('tr');
		top.setAttribute('id', 'column-top');
		top.addEventListener('click', this.handleClick);

		for (let x = 0; x < this.width; x++) {
			const headCell = document.createElement('td');
			headCell.setAttribute('id', x);
			top.append(headCell);
		}

		board.append(top);

		// make main part of board
		for (let y = 0; y < this.height; y++) {
			const row = document.createElement('tr');

			for (let x = 0; x < this.width; x++) {
				const cell = document.createElement('td');
				cell.setAttribute('id', `${y}-${x}`);
				row.append(cell);
			}

			board.append(row);
		}

		// set background color to the current player color on mouse hover
		document.querySelectorAll('#column-top td').forEach((td) => {
			td.addEventListener(
				'mouseenter',
				() => (td.style.backgroundColor = this.currPlayer.color)
			);

			td.addEventListener(
				'mouseleave',
				() => (td.style.backgroundColor = '#f9f5ea')
			);
		});
	};
}

// check if user provided color is valid
const isColorValid = (color1, color2) =>
	CSS.supports('color', color1) && CSS.supports('color', color2);

// create players with their respective colors
// provided by the user in the game-start-form
const getPlayers = (player1Color, player2Color) => {
	const player1 = new Player(player1Color);
	const player2 = new Player(player2Color);

	return [player1, player2];
};

// creates a new game
const startNewGame = () => {
	// get player colors from user input
	const player1Color = document
		.querySelector('#player1-color')
		.value.toLowerCase();

	const player2Color = document
		.querySelector('#player2-color')
		.value.toLowerCase();

	// proceed only if color names are valid css colors
	if (isColorValid(player1Color, player2Color)) {
		// remove old board and reset the color input field
		document.querySelector('#board').innerHTML = '';
		document.querySelector('#player1-color').value = '';
		document.querySelector('#player2-color').value = '';

		const [player1, player2] = getPlayers(player1Color, player2Color);

		document.querySelector('.player1').style.color = player1Color;
		document.querySelector('.player2').style.color = player2Color;

		new Game(6, 8, player1, player2);
	} else {
		alert('Please provide valid color name for both players');
	}
};

// start the game whenever start-game-btn is clicked
document
	.querySelector('#start-game-btn')
	.addEventListener('click', startNewGame);
