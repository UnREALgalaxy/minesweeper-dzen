class Cell {
	isOpen = false;
	isMined = false;
	isFlagged = false;
	minesAround = 0;
}

class Game {
	cells = [];
	cellsAmount;
	rowsAmount;
	difficulty;
	minesQuantity;
	coordinatesBindingsByIndex = [];
	DOMcells = [];

	#aCrutch() {

		document.querySelectorAll('.cell').forEach((cellOfAll, index) => {
			let coorX = index % this.cellsAmount;
			let coorY = Math.floor(index / this.cellsAmount);
			if (this.cells[coorX][coorY].isMined) {
				cellOfAll.className = 'mine';
			}
		})
	}

	init() {
		document.querySelector('.menu').addEventListener('submit', (mainFormEvent) => {
			mainFormEvent.preventDefault();
			const formData = new FormData(document.querySelector('.menu'));
			const entriesArray = [];

			for (let [, value] of formData.entries()) {
				entriesArray.push(value);
			}

			this.cellsAmount = entriesArray[0];
			this.rowsAmount = entriesArray[1];
			this.difficulty = Number(entriesArray[2]);

			this.#iniArray();
			this.#draw();
			this.#initEventListeners();
			// this.#aCrutch();

		});
	}

	#iniArray() {
		for (let cell = 0; cell < this.cellsAmount; cell++) {
			this.cells[cell] = [];
			for (let row = 0; row < this.rowsAmount; row++) {
				this.cells[cell][row] = new Cell();
			}
		}

		this.#setCoordinatesBindings();
		this.#getMinesQuantity();
		this.#setMinesToTheField();
	}

	#setCoordinatesBindings() {
		for (let index = 0; index < this.cellsAmount * this.rowsAmount; index++) {
			this.coordinatesBindingsByIndex[index] = [index % this.cellsAmount, Math.floor(index / this.cellsAmount)];
		}
	}



	#getMinesQuantity() {
		switch (this.difficulty) {
			case 1:
				this.minesQuantity = Math.round(this.rowsAmount * this.cellsAmount * 0.16);
				break;

			case 2:
				this.minesQuantity = Math.round(this.rowsAmount * this.cellsAmount * 0.19);
				break;

			case 3:
				this.minesQuantity = Math.round(this.rowsAmount * this.cellsAmount * 0.26);
				break;

			default:
				this.minesQuantity = Math.round(this.rowsAmount * this.cellsAmount * 0.19);
				break;
		}
	}

	#getRandom(cellsOrRows) {
		return Math.floor(Math.random() * cellsOrRows);
	}

	#setMinesToTheField() {
		let coordinateX = this.#getRandom(this.cellsAmount);
		let coordinateY = this.#getRandom(this.rowsAmount);

		for (let i = 0; i < this.minesQuantity; i++) {
			while (this.cells[coordinateX][coordinateY].isMined == true) {
				coordinateX = this.#getRandom(this.cellsAmount);
				coordinateY = this.#getRandom(this.rowsAmount);
			}

			this.cells[coordinateX][coordinateY].isMined = true;

			coordinateX = this.#getRandom(this.cellsAmount);
			coordinateY = this.#getRandom(this.rowsAmount);
		}
	}

	#clearAndPrepareField() {
		const wrapper = document.createElement('div');
		const frame = document.querySelector('.frame');
		const secondFrame = document.querySelector('.second-frame');

		document.querySelector('.wrapper').remove();

		wrapper.classList.add('wrapper');
		secondFrame.insertAdjacentHTML("afterbegin", wrapper.outerHTML);
		frame.setAttribute('style', 'display: block;');
		document.querySelector('.frame__game-over').classList.add('frame__game-over_disabled');

	}

	#draw() {
		this.#clearAndPrepareField();

		const wrapper = document.querySelector('.wrapper');
		const row = document.createElement('div');
		const cell = document.createElement('div');
		const rowsAmount = document.querySelector('.menu__rows').value;
		const cellsAmount = document.querySelector('.menu__cells').value;

		row.classList.add('row');
		cell.classList.add('cell');

		for (let i = 0; i < cellsAmount; i++) {
			row.insertAdjacentHTML("beforeend", cell.outerHTML);
		}

		for (let j = 0; j < rowsAmount; j++) {
			wrapper.insertAdjacentHTML("beforeend", row.outerHTML);
		}
	}

	#initEventListeners() {
		const cells = document.querySelectorAll('.cell');
		cells.forEach((cell, index) => {
			cell.addEventListener('click', () => {
				this.#onClick(cell, index);
			});

			cell.addEventListener('contextmenu', () => {
				this.#onContextMenu(cell, index);
			});
		})
	}

	#onClick(cell, index) {
		const coorX = this.coordinatesBindingsByIndex[index][0];
		const coorY = this.coordinatesBindingsByIndex[index][1];
		if (this.cells[coorX][coorY].isMined && !this.cells[coorX][coorY].isFlagged) {
			this.#gameOver();
		} else {
			if (!this.cells[coorX][coorY].isOpen && !this.cells[coorX][coorY].isFlagged) {
				this.#calculateMinesAround(coorX, coorY);
				this.#showMinesAround(cell, coorX, coorY);

				if (!this.cells[coorX][coorY].minesAround) {
					this.#openNear(cell, coorX, coorY);
				}
			} else {
				if (this.cells[coorX][coorY].minesAround) {
					this.#onClickOnNumber(coorX, coorY);
				}
			}
		}
	}

	#onContextMenu(cell, index) {
		const coorX = this.coordinatesBindingsByIndex[index][0];
		const coorY = this.coordinatesBindingsByIndex[index][1];

		if (!this.cells[coorX][coorY].isOpen) {
			if (this.cells[coorX][coorY].isFlagged) {
				this.cells[coorX][coorY].isFlagged = false;
				cell.className = 'cell';
			} else {
				this.cells[coorX][coorY].isFlagged = true;
				cell.className = 'flagged';
			}
		} else {
			if (this.cells[coorX][coorY].minesAround) {
				this.#onContextMenuOnNumber(coorX, coorY)
			}
		}
	}

	#onClickOnNumber(coorX, coorY) {
		let topLeft = [coorX - 1, coorY - 1];
		let top = [coorX, coorY - 1];
		let topRight = [coorX + 1, coorY - 1];
		let left = [coorX - 1, coorY];
		let right = [coorX + 1, coorY];
		let bottomLeft = [coorX - 1, coorY + 1];
		let bottom = [coorX, coorY + 1];
		let bottomRight = [coorX + 1, coorY + 1];
		let flagsCount = 0;

		// Не вылезаем за пределы массива
		if (coorX - 1 < 0) {
			topLeft = [coorX, coorY];
			left = [coorX, coorY];
			bottomLeft = [coorX, coorY];
		}

		if (coorX + 1 >= this.cellsAmount) {
			topRight = [coorX, coorY];
			right = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (coorY - 1 < 0) {
			topLeft = [coorX, coorY];
			top = [coorX, coorY];
			topRight = [coorX, coorY];
		}

		if (coorY + 1 >= this.rowsAmount) {
			bottomLeft = [coorX, coorY];
			bottom = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		// Считаем флаги
		if (this.cells[topLeft[0]][topLeft[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[top[0]][top[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[topRight[0]][topRight[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[left[0]][left[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[right[0]][right[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[bottomLeft[0]][bottomLeft[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[bottom[0]][bottom[1]].isFlagged) {
			flagsCount++;
		}

		if (this.cells[bottomRight[0]][bottomRight[1]].isFlagged) {
			flagsCount++;
		}

		if (flagsCount === this.cells[coorX][coorY].minesAround) {
			const allCells = document.querySelectorAll('.row > div');

			if (this.cells[topLeft[0]][topLeft[1]].isMined && !this.cells[topLeft[0]][topLeft[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[topLeft[0]][topLeft[1]].isOpen && !this.cells[topLeft[0]][topLeft[1]].isFlagged) {
					this.cells[topLeft[0]][topLeft[1]].isOpen = true;
					this.#calculateMinesAround(topLeft[0], topLeft[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(topLeft[0], topLeft[1])], topLeft[0], topLeft[1]);

					if (!this.cells[topLeft[0]][topLeft[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(topLeft[0], topLeft[1])], topLeft[0], topLeft[1]);
					}
				}
			}

			if (this.cells[top[0]][top[1]].isMined && !this.cells[top[0]][top[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[top[0]][top[1]].isOpen && !this.cells[top[0]][top[1]].isFlagged) {
					this.cells[top[0]][top[1]].isOpen = true;
					this.#calculateMinesAround(top[0], top[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(top[0], top[1])], top[0], top[1]);

					if (!this.cells[top[0]][top[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(top[0], top[1])], top[0], top[1]);
					}
				}
			}

			if (this.cells[topRight[0]][topRight[1]].isMined && !this.cells[topRight[0]][topRight[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[topRight[0]][topRight[1]].isOpen && !this.cells[topRight[0]][topRight[1]].isFlagged) {
					this.cells[topRight[0]][topRight[1]].isOpen = true;
					this.#calculateMinesAround(topRight[0], topRight[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])], topRight[0], topRight[1]);

					if (!this.cells[topRight[0]][topRight[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])], topRight[0], topRight[1]);
					}
				}
			}

			if (this.cells[left[0]][left[1]].isMined && !this.cells[left[0]][left[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[left[0]][left[1]].isOpen && !this.cells[left[0]][left[1]].isFlagged) {
					this.cells[left[0]][left[1]].isOpen = true;
					this.#calculateMinesAround(left[0], left[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(left[0], left[1])], left[0], left[1]);

					if (!this.cells[left[0]][left[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(left[0], left[1])], left[0], left[1]);
					}
				}
			}

			if (this.cells[right[0]][right[1]].isMined && !this.cells[right[0]][right[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[right[0]][right[1]].isOpen && !this.cells[right[0]][right[1]].isFlagged) {
					this.cells[right[0]][right[1]].isOpen = true;
					this.#calculateMinesAround(right[0], right[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(right[0], right[1])], right[0], right[1]);

					if (!this.cells[right[0]][right[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(right[0], right[1])], right[0], right[1]);
					}
				}
			}

			if (this.cells[bottomLeft[0]][bottomLeft[1]].isMined && !this.cells[bottomLeft[0]][bottomLeft[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[bottomLeft[0]][bottomLeft[1]].isOpen && !this.cells[bottomLeft[0]][bottomLeft[1]].isFlagged) {
					this.cells[bottomLeft[0]][bottomLeft[1]].isOpen = true;
					this.#calculateMinesAround(bottomLeft[0], bottomLeft[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])], bottomLeft[0], bottomLeft[1]);

					if (!this.cells[bottomLeft[0]][bottomLeft[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])], bottomLeft[0], bottomLeft[1]);
					}
				}
			}

			if (this.cells[bottom[0]][bottom[1]].isMined && !this.cells[bottom[0]][bottom[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[bottom[0]][bottom[1]].isOpen && !this.cells[bottom[0]][bottom[1]].isFlagged) {
					this.cells[bottom[0]][bottom[1]].isOpen = true;
					this.#calculateMinesAround(bottom[0], bottom[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])], bottom[0], bottom[1]);

					if (!this.cells[bottom[0]][bottom[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])], bottom[0], bottom[1]);
					}
				}
			}

			if (this.cells[bottomRight[0]][bottomRight[1]].isMined && !this.cells[bottomRight[0]][bottomRight[1]].isFlagged) {
				this.#gameOver();
				return;
			}
			else {
				if (!this.cells[bottomRight[0]][bottomRight[1]].isOpen && !this.cells[bottomRight[0]][bottomRight[1]].isFlagged) {
					this.cells[bottomRight[0]][bottomRight[1]].isOpen = true;
					this.#calculateMinesAround(bottomRight[0], bottomRight[1]);
					this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])], bottomRight[0], bottomRight[1]);

					if (!this.cells[bottomRight[0]][bottomRight[1]].minesAround) {
						this.#openNear(allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])], bottomRight[0], bottomRight[1]);
					}
				}
			}
		}
	}

	#onContextMenuOnNumber(coorX, coorY) {
		let topLeft = [coorX - 1, coorY - 1];
		let top = [coorX, coorY - 1];
		let topRight = [coorX + 1, coorY - 1];
		let left = [coorX - 1, coorY];
		let right = [coorX + 1, coorY];
		let bottomLeft = [coorX - 1, coorY + 1];
		let bottom = [coorX, coorY + 1];
		let bottomRight = [coorX + 1, coorY + 1];
		let closeCells = 0;

		if (coorX - 1 < 0) {
			topLeft = [coorX, coorY];
			left = [coorX, coorY];
			bottomLeft = [coorX, coorY];
		}

		if (coorX + 1 >= this.cellsAmount) {
			topRight = [coorX, coorY];
			right = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (coorY - 1 < 0) {
			topLeft = [coorX, coorY];
			top = [coorX, coorY];
			topRight = [coorX, coorY];
		}

		if (coorY + 1 >= this.rowsAmount) {
			bottomLeft = [coorX, coorY];
			bottom = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}


		if (!this.cells[topLeft[0]][topLeft[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[top[0]][top[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[topRight[0]][topRight[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[left[0]][left[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[right[0]][right[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[bottomLeft[0]][bottomLeft[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[bottom[0]][bottom[1]].isOpen) {
			closeCells++;
		}

		if (!this.cells[bottomRight[0]][bottomRight[1]].isOpen) {
			closeCells++;
		}

		if (this.cells[coorX][coorY].minesAround === closeCells) {
			const allCells = document.querySelectorAll('.row > div');

			if (!this.cells[topLeft[0]][topLeft[1]].isOpen) {
				this.cells[topLeft[0]][topLeft[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(topLeft[0], topLeft[1])].className = 'flagged';
			}

			if (!this.cells[top[0]][top[1]].isOpen) {
				this.cells[top[0]][top[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(top[0], top[1])].className = 'flagged';
			}

			if (!this.cells[topRight[0]][topRight[1]].isOpen) {
				this.cells[topRight[0]][topRight[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])].className = 'flagged';
			}

			if (!this.cells[left[0]][left[1]].isOpen) {
				this.cells[left[0]][left[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(left[0], left[1])].className = 'flagged';
			}

			if (!this.cells[right[0]][right[1]].isOpen) {
				this.cells[right[0]][right[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(right[0], right[1])].className = 'flagged';
			}

			if (!this.cells[bottomLeft[0]][bottomLeft[1]].isOpen) {
				this.cells[bottomLeft[0]][bottomLeft[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])].className = 'flagged';
			}

			if (!this.cells[bottom[0]][bottom[1]].isOpen) {
				this.cells[bottom[0]][bottom[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])].className = 'flagged';
			}

			if (!this.cells[bottomRight[0]][bottomRight[1]].isOpen) {
				this.cells[bottomRight[0]][bottomRight[1]].isFlagged = true;
				allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])].className = 'flagged';
			}
		}
	}

	#calculateMinesAround(coorX, coorY) { // Выполняется во время игры
		let topLeft = [coorX - 1, coorY - 1];
		let top = [coorX, coorY - 1];
		let topRight = [coorX + 1, coorY - 1];
		let left = [coorX - 1, coorY];
		let right = [coorX + 1, coorY];
		let bottomLeft = [coorX - 1, coorY + 1];
		let bottom = [coorX, coorY + 1];
		let bottomRight = [coorX + 1, coorY + 1];
		let minesNearTheCell = 0;

		if (coorX - 1 < 0) {
			topLeft = [coorX, coorY];
			left = [coorX, coorY];
			bottomLeft = [coorX, coorY];
		}

		if (coorX + 1 >= this.cellsAmount) {
			topRight = [coorX, coorY];
			right = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (coorY - 1 < 0) {
			topLeft = [coorX, coorY];
			top = [coorX, coorY];
			topRight = [coorX, coorY];
		}

		if (coorY + 1 >= this.rowsAmount) {
			bottomLeft = [coorX, coorY];
			bottom = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (this.cells[topLeft[0]][topLeft[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[top[0]][top[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[topRight[0]][topRight[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[left[0]][left[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[right[0]][right[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[bottomLeft[0]][bottomLeft[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[bottom[0]][bottom[1]].isMined) {
			minesNearTheCell++;
		}

		if (this.cells[bottomRight[0]][bottomRight[1]].isMined) {
			minesNearTheCell++;
		}

		this.cells[coorX][coorY].minesAround = minesNearTheCell;
	}

	#showMinesAround(cell, coorX, coorY) {
		switch (this.cells[coorX][coorY].minesAround) {
			case 1:
				cell.className = 'one';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 2:
				cell.className = 'two';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 3:
				cell.className = 'three';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 4:
				cell.className = 'four';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 5:
				cell.className = 'five';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 6:
				cell.className = 'six';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 7:
				cell.className = 'seven';
				this.cells[coorX][coorY].isOpen = true;
				break;
			case 8:
				cell.className = 'eight';
				this.cells[coorX][coorY].isOpen = true;
				break;
			default:
				cell.className = 'opened';
				this.cells[coorX][coorY].isOpen = true;
				break;
		}
	}

	#calculateIndexByCoordinates(coorX, coorY) {
		return coorY * this.cellsAmount + coorX;
	}

	#openNear(cell, coorX, coorY) {
		let topLeft = [coorX - 1, coorY - 1];
		let top = [coorX, coorY - 1];
		let topRight = [coorX + 1, coorY - 1];
		let left = [coorX - 1, coorY];
		let right = [coorX + 1, coorY];
		let bottomLeft = [coorX - 1, coorY + 1];
		let bottom = [coorX, coorY + 1];
		let bottomRight = [coorX + 1, coorY + 1];
		let allCells = document.querySelectorAll('.row > div');

		if (coorX - 1 < 0) {
			topLeft = [coorX, coorY];
			left = [coorX, coorY];
			bottomLeft = [coorX, coorY];
		}

		if (coorX + 1 >= this.cellsAmount) {
			topRight = [coorX, coorY];
			right = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (coorY - 1 < 0) {
			topLeft = [coorX, coorY];
			top = [coorX, coorY];
			topRight = [coorX, coorY];
		}

		if (coorY + 1 >= this.rowsAmount) {
			bottomLeft = [coorX, coorY];
			bottom = [coorX, coorY];
			bottomRight = [coorX, coorY];
		}

		if (!this.cells[topLeft[0]][topLeft[1]].isOpen) {
			this.#calculateMinesAround(topLeft[0], topLeft[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(topLeft[0], topLeft[1])], topLeft[0], topLeft[1]);

			if (!this.cells[topLeft[0]][topLeft[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(topLeft[0], topLeft[1])], topLeft[0], topLeft[1]);
			}
		}

		if (!this.cells[top[0]][top[1]].isOpen) {
			this.#calculateMinesAround(top[0], top[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(top[0], top[1])], top[0], top[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(top[0], top[1])], top[0], top[1]);

			if (!this.cells[top[0]][top[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(top[0], top[1])], top[0], top[1]);
			}
		}

		if (!this.cells[topRight[0]][topRight[1]].isOpen) {
			this.#calculateMinesAround(topRight[0], topRight[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])], topRight[0], topRight[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])], topRight[0], topRight[1]);

			if (!this.cells[topRight[0]][topRight[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(topRight[0], topRight[1])], topRight[0], topRight[1]);
			}
		}

		if (!this.cells[left[0]][left[1]].isOpen) {
			this.#calculateMinesAround(left[0], left[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(left[0], left[1])], left[0], left[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(left[0], left[1])], left[0], left[1]);

			if (!this.cells[left[0]][left[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(left[0], left[1])], left[0], left[1]);
			}
		}

		if (!this.cells[right[0]][right[1]].isOpen) {
			this.#calculateMinesAround(right[0], right[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(right[0], right[1])], right[0], right[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(right[0], right[1])], right[0], right[1]);

			if (!this.cells[right[0]][right[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(right[0], right[1])], right[0], right[1]);
			}
		}

		if (!this.cells[bottomLeft[0]][bottomLeft[1]].isOpen) {
			this.#calculateMinesAround(bottomLeft[0], bottomLeft[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])], bottomLeft[0], bottomLeft[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])], bottomLeft[0], bottomLeft[1]);

			if (!this.cells[bottomLeft[0]][bottomLeft[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(bottomLeft[0], bottomLeft[1])], bottomLeft[0], bottomLeft[1]);
			}
		}

		if (!this.cells[bottom[0]][bottom[1]].isOpen) {
			this.#calculateMinesAround(bottom[0], bottom[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])], bottom[0], bottom[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])], bottom[0], bottom[1]);

			if (!this.cells[bottom[0]][bottom[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(bottom[0], bottom[1])], bottom[0], bottom[1]);
			}
		}

		if (!this.cells[bottomRight[0]][bottomRight[1]].isOpen) {
			this.#calculateMinesAround(bottomRight[0], bottomRight[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])], bottomRight[0], bottomRight[1]);
			this.#showMinesAround(allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])], bottomRight[0], bottomRight[1]);

			if (!this.cells[bottomRight[0]][bottomRight[1]].minesAround) {
				this.#openNear(allCells[this.#calculateIndexByCoordinates(bottomRight[0], bottomRight[1])], bottomRight[0], bottomRight[1]);
			}
		}
	}

	#gameOver() {
		document.querySelector('.wrapper').classList.add('wrapper_disabled');
		document.querySelector('.frame__game-over').classList.remove('frame__game-over_disabled');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const game = new Game();
	game.init();
})