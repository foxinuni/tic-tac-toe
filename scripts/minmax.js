const INFINITY = 1_000_000;

function minmax(board, depth, bot, player, alpha, beta) {
    if (depth === 0 || board.getWinner() !== CELL_TYPE.EMPTY) {
        return board.heuristic(bot);
    }

    // Se calculan los movimientos posibles 
    let moves = board.getPossibleMovements();

    // Se asigna el valor por defecto para alfa-beta prunning
    let maximizing = player === bot;
    let best_score = maximizing ? -INFINITY : INFINITY;

    for (const move of moves) {
        // 1. Se realiza el movimiento
        let clone = board.clone();
        clone.setCell(move, player);

        // 2. Se comprueba la heuristica
        let next_player = (player === CELL_TYPE.X) ? CELL_TYPE.O : CELL_TYPE.X;
        let score = minmax(board, depth - 1, bot, next_player, alpha, beta);

        // 3. Se comprueba si se esta maximizando o minimizando
        if (maximizing) {
            best_score = Math.max(best_score, score);
            alpha = Math.max(alpha, best_score);
        } else {
            best_score = Math.min(best_score, score);
            beta = Math.min(beta, best_score);
        }

        // 4. Si se converge en beta <= alpha, estamos en una rama no optima
        //    entonces, no seguimos y break.
        if (beta <= alpha) {
            break;
        }
    }

    return best_score;
}   