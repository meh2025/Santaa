const { getRandomMineral } = require('./mineCore');

const GRID_TOTAL_CELLS = 25; // 5x5 layout, index 24 reserved for Cash Out
const PLAYABLE_CELLS = 24; // indices 0..23 are playable

const activeSessions = new Map(); // userId -> session

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateBoard() {
    const bombCount = randomInt(3, 4);
    const mineralCount = randomInt(4, 6);

    const indices = shuffle([...Array(PLAYABLE_CELLS).keys()]); // 0..23
    const bombSet = new Set(indices.slice(0, bombCount));
    const mineralIndices = indices.slice(bombCount, bombCount + mineralCount);

    const board = Array.from({ length: GRID_TOTAL_CELLS }, (_, i) => {
        if (i === GRID_TOTAL_CELLS - 1) return { type: 'cashout', revealed: false };
        if (bombSet.has(i)) return { type: 'bomb', revealed: false, adjacentMines: 0, mineral: null };
        return { type: 'empty', revealed: false, adjacentMines: 0, mineral: null };
    });

    for (const idx of mineralIndices) {
        board[idx] = { type: 'mineral', revealed: false, adjacentMines: 0, mineral: getRandomMineral() };
    }

    // compute adjacent bombs
    for (let i = 0; i < PLAYABLE_CELLS; i++) {
        if (board[i].type === 'bomb') continue;
        board[i].adjacentMines = countAdjacentBombs(board, i);
    }

    return { board, bombCount, safeCells: PLAYABLE_CELLS - bombCount };
}

function getNeighbors(index) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) continue;
            const ni = nr * 5 + nc;
            // Skip cashout cell
            if (ni >= PLAYABLE_CELLS) continue;
            neighbors.push(ni);
        }
    }
    return neighbors;
}

function countAdjacentBombs(board, index) {
    return getNeighbors(index).filter(i => board[i].type === 'bomb').length;
}

function revealCell(session, index) {
    if (!session || !session.board) return { changed: false };
    const cell = session.board[index];
    if (!cell || cell.revealed || cell.type === 'cashout') return { changed: false };

    cell.revealed = true;
    session.revealedCount = (session.revealedCount || 0) + 1;

    if (cell.type === 'bomb') return { hitBomb: true };
    if (cell.type === 'mineral') {
        // store sourceIndex so single-item commits can be handled
        const item = Object.assign({}, cell.mineral, { sourceIndex: index });
        session.sessionLoot.push(item);
        cell.keepable = true;
        return { hitBomb: false, revealedType: 'mineral', mineral: item };
    }

    if (cell.type === 'empty' && cell.adjacentMines === 0) {
        floodReveal(session, index);
        return { hitBomb: false, revealedType: 'empty' };
    }
    return { hitBomb: false, revealedType: cell.type };
}

function floodReveal(session, startIndex) {
    const queue = [startIndex];
    const seen = new Set([startIndex]);
    while (queue.length) {
        const idx = queue.shift();
        for (const ni of getNeighbors(idx)) {
            const c = session.board[ni];
            if (!c || c.revealed || c.type === 'bomb' || c.type === 'cashout') continue;
            c.revealed = true;
            session.revealedCount = (session.revealedCount || 0) + 1;
            if (c.type === 'mineral') {
                const item = Object.assign({}, c.mineral, { sourceIndex: ni });
                session.sessionLoot.push(item);
                c.keepable = true;
            }
            if (c.type === 'empty' && c.adjacentMines === 0 && !seen.has(ni)) {
                seen.add(ni);
                queue.push(ni);
            }
        }
    }
}

module.exports = {
    activeSessions,
    generateBoard,
    getNeighbors,
    countAdjacentBombs,
    revealCell,
    floodReveal
};
