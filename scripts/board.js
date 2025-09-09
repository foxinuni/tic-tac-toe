
const CELL_TYPE = {
    X: -1,
    O: 1,
    EMPTY: 0,
};

let userSymbol = null;
let botSymbol = null;
let currentPlayer = null;
let boardInstance = null;

function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach((cell, idx) => {
        const value = boardInstance.cells[idx];
        cell.classList = 'cell'; // Se resetea todas las clases de la celula
        
        if (value !== CELL_TYPE.EMPTY) {
            const symbol_class = value === CELL_TYPE.X ? 'sym-x' : 'sym-o';
            cell.classList.add(symbol_class);
            cell.classList.add('disabled');
        }
    });
}

function showWinnerModal(winner) {
    const modal = document.getElementById('winner-modal');
    const text = document.getElementById('winner-text');

    if (winner === CELL_TYPE.EMPTY) {
        text.textContent = '¡Empate!';
    } else if (winner === userSymbol) {
        text.textContent = '¡Ganaste!';
    } else {
        text.textContent = '¡Gana el bot!';
    }
    
    modal.style.display = 'flex';
}

function hideWinnerModal() {
    document.getElementById('winner-modal').style.display = 'none';
}

function resetGame() {
    boardInstance = new Board();
    currentPlayer = userSymbol;

    renderBoard();
}

function botMove() {
    const moves = boardInstance.getPossibleMovements();
    if (moves.length === 0) return;

    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    for (const move of moves) {
        let clone = boardInstance.clone();
        clone.setCell(move, botSymbol);
    
        // El bot es botSymbol, el usuario es userSymbol
        let score = minmax(clone, 4, botSymbol, userSymbol, -Infinity, Infinity); // Profundidad 4 para buen rendimiento
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    boardInstance.setCell(bestMove, botSymbol);
    renderBoard();
    
    const winner = boardInstance.getWinner();
    if (winner !== CELL_TYPE.EMPTY || boardInstance.getPossibleMovements().length === 0) {
        setTimeout(() => showWinnerModal(winner), 200);
        return;
    }
    
    currentPlayer = userSymbol;
}

function handleCellClick(e) {
    const idx = Array.from(document.querySelectorAll('.cell')).indexOf(e.target);
    if (boardInstance.cells[idx] !== CELL_TYPE.EMPTY || currentPlayer !== userSymbol) return;

    boardInstance.setCell(idx, userSymbol);
    renderBoard();
    
    const winner = boardInstance.getWinner();
    if (winner !== CELL_TYPE.EMPTY || boardInstance.getPossibleMovements().length === 0) {
        setTimeout(() => showWinnerModal(winner), 200);
        return;
    }
    
    currentPlayer = botSymbol;
    setTimeout(botMove, 400);
}

function setupBoardEvents() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

function setupSymbolSelection() {
    document.getElementById('choose-x').onclick = () => {
        userSymbol = CELL_TYPE.X;
        botSymbol = CELL_TYPE.O;
        document.getElementById('symbol-modal').style.display = 'none';
        startGame();
    };

    document.getElementById('choose-o').onclick = () => {
        userSymbol = CELL_TYPE.O;
        botSymbol = CELL_TYPE.X;
        document.getElementById('symbol-modal').style.display = 'none';
        startGame();
    };
    // El modal solo se cierra al elegir un símbolo
}

function startGame() {
    boardInstance = new Board();
    currentPlayer = userSymbol;

    renderBoard();
    if (userSymbol === CELL_TYPE.O) {
        // Bot inicia si el usuario es O
        currentPlayer = botSymbol;
        setTimeout(botMove, 400);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setupBoardEvents();
    setupSymbolSelection();
    
    document.getElementById('restart-btn').onclick = () => {
        hideWinnerModal();
        startGame();
    };
    // El modal de símbolo ya está visible por defecto en el HTML y CSS
});

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
        return this.cells[x * 3 + y];
    }

    setCell(index, player) {
        this.cells[index] = player;
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

    const is_row_dead = player_score > 0 && opponent_score > 0;
    if (is_row_dead) {
        return 0;
    }

    return Math.pow(10, player_score) - Math.pow(10, opponent_score);
}
