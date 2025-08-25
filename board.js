const CELL_TYPE = {
    X: -1,
    O: 1,
    EMPTY: 0,
}

class Board {
    constructor() {
        this.cells = Array(9).fill(CELL_TYPE.EMPTY);
    }

    clone() {
        const newBoard = new Board();
        newBoard.cells = [...this.cells];
        return newBoard;
    }

    getCell(x, y) {
        return this.cells(x * 3 + y);
    }

    setCell(index, player) {
        this.cells[index] = player;
    }

    setCell(x, y, player) {
        this.cells[x * 3 + y] = player;
    }

    getPossibleMovements() {
        const movements = [];
        
        for (let i = 0; i < 9; i++) {
            if (this.cells[i] === CELL_TYPE.EMPTY) {
                movements.push(i);
            }
        }

        return movements;
    }

    getWinner() {
        // check horizontal
        for (let i = 0; i < 3; i++) {
            if (this.getCell(i, 0) !== CELL_TYPE.EMPTY &&
                this.getCell(i, 0) === this.getCell(i, 1) &&
                this.getCell(i, 1) === this.getCell(i, 2)) {
                return this.getCell(i, 0);
            }
        }

        // check vertical
        for (let i = 0; i < 3; i++) {
            if (this.getCell(0, i) !== CELL_TYPE.EMPTY &&
                this.getCell(0, i) === this.getCell(1, i) &&
                this.getCell(1, i) === this.getCell(2, i)) {
                return this.getCell(0, i);
            }
        }

        // check diagonal
        if (this.getCell(0, 0) !== CELL_TYPE.EMPTY &&
            this.getCell(0, 0) === this.getCell(1, 1) &&
            this.getCell(1, 1) === this.getCell(2, 2)) {
            return this.getCell(0, 0);
        }

        if (this.getCell(0, 2) !== CELL_TYPE.EMPTY &&
            this.getCell(0, 2) === this.getCell(1, 1) &&
            this.getCell(1, 1) === this.getCell(2, 0)) {
            return this.getCell(0, 2);
        }

        return CELL_TYPE.EMPTY;
    }

    heuristic(player) {
        let score = 0;

        for (let i = 0; i < 3; i++) {
            const row = [this.getCell(i, 0), this.getCell(i, 1), this.getCell(i, 2)];
            score += evaluateLine(row, player);
        }

        for (let i = 0; i < 3; i++) {
            const col = [this.getCell(0, i), this.getCell(1, i), this.getCell(2, i)];
            score += evaluateLine(col, player);
        }

        const diag1 = [this.getCell(0, 0), this.getCell(1, 1), this.getCell(2, 2)];
        const diag2 = [this.getCell(0, 2), this.getCell(1, 1), this.getCell(2, 0)];
        score += evaluateLine(diag1, player);
        score += evaluateLine(diag2, player);

        return score;
    }
};

function evaluateLine(line, player) {
    let player_score = 0;
    let opponent_score = 0;

    for (const cell of line) {
        if (cell === player) {
            player_score++;
        } else if (cell === -player) {
            opponent_score++;
        }
    }

    return player_score * player_score - opponent_score * opponent_score;
}

