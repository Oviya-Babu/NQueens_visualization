/* ============================================
   N-QUEENS AI LEARNING SYSTEM
   Complete Interactive Backtracking Visualizer
   ============================================ */

// ─── CONFIGURATION ────────────────────────────────────────
const CONFIG = {
  MIN_N: 4,
  MAX_N: 10,
  DEFAULT_N: 8,
  DEFAULT_SPEED: 5,
  SPEED_DELAYS: {
    1: 2000, 2: 1500, 3: 1000, 4: 700, 5: 500,
    6: 350, 7: 200, 8: 120, 9: 60, 10: 20
  },
  QUEEN_SVG: `<svg class="queen-svg" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="queenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e0e7ff"/>
        <stop offset="50%" style="stop-color:#c7d2fe"/>
        <stop offset="100%" style="stop-color:#a5b4fc"/>
      </linearGradient>
      <filter id="queenShadow">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#queenShadow)">
      <path d="M 9 26 C 17.5 24.5 27.5 24.5 36 26 L 38.5 13.5 L 31 25 L 22.5 8.5 L 14 25 L 6.5 13.5 L 9 26 z"
            fill="url(#queenGrad)" stroke="#818cf8" stroke-width="1" stroke-linejoin="round"/>
      <path d="M 9 26 C 9 28 10.5 30 15.5 31 C 20.5 31.5 24.5 31.5 29.5 31 C 34.5 30 36 28 36 26"
            fill="url(#queenGrad)" stroke="#818cf8" stroke-width="1"/>
      <path d="M 11 33.5 C 16 35.5 29 35.5 34 33.5 C 34.5 32 33.5 30.5 29.5 30 C 24.5 29.5 20.5 29.5 15.5 30 C 11.5 30.5 10.5 32 11 33.5"
            fill="url(#queenGrad)" stroke="#818cf8" stroke-width="1"/>
      <path d="M 11.5 37 C 16 38.5 29 38.5 33.5 37 C 34 35.5 33 34 29 33.5 C 24.5 33 20.5 33 16 33.5 C 12 34 11 35.5 11.5 37"
            fill="url(#queenGrad)" stroke="#818cf8" stroke-width="1"/>
      <circle cx="6.5" cy="13.5" r="2" fill="#c7d2fe" stroke="#818cf8" stroke-width="0.8"/>
      <circle cx="14" cy="8.5" r="2" fill="#c7d2fe" stroke="#818cf8" stroke-width="0.8"/>
      <circle cx="22.5" cy="6.5" r="2" fill="#c7d2fe" stroke="#818cf8" stroke-width="0.8"/>
      <circle cx="31" cy="8.5" r="2" fill="#c7d2fe" stroke="#818cf8" stroke-width="0.8"/>
      <circle cx="38.5" cy="13.5" r="2" fill="#c7d2fe" stroke="#818cf8" stroke-width="0.8"/>
    </g>
  </svg>`
};


// ─── STATE ────────────────────────────────────────────────
const state = {
  n: CONFIG.DEFAULT_N,
  mode: 'manual',      // 'manual' | 'solve' | 'learn'
  board: [],            // board[row] = col (-1 if empty)
  steps: [],            // precomputed algorithm steps
  currentStepIdx: 0,
  isPlaying: false,
  isPaused: false,
  isSolved: false,
  speed: CONFIG.DEFAULT_SPEED,
  timeoutId: null,
  queensPlaced: 0,
  totalSteps: 0,
  totalBacktracks: 0,
  manualConflicts: [],
  firstBacktrackSeen: false,
  firstConflictSeen: false,
  firstPlacementSeen: false,
};


// ─── DOM REFERENCES ───────────────────────────────────────
const DOM = {};

function cacheDom() {
  DOM.board = document.getElementById('board');
  DOM.boardContainer = document.getElementById('boardContainer');
  DOM.boardWrapper = document.getElementById('boardWrapper');
  DOM.canvas = document.getElementById('conflictCanvas');
  DOM.ctx = DOM.canvas.getContext('2d');
  DOM.colLabelsTop = document.getElementById('colLabelsTop');
  DOM.rowLabels = document.getElementById('rowLabels');
  DOM.queensPlaced = document.getElementById('queensPlaced');
  DOM.queensNeeded = document.getElementById('queensNeeded');
  DOM.stepsCount = document.getElementById('stepsCount');
  DOM.backtracksCount = document.getElementById('backtracksCount');
  DOM.statusText = document.getElementById('statusText');
  DOM.startBtn = document.getElementById('startBtn');
  DOM.pauseBtn = document.getElementById('pauseBtn');
  DOM.stepBtn = document.getElementById('stepBtn');
  DOM.resetBtn = document.getElementById('resetBtn');
  DOM.speedSlider = document.getElementById('speedSlider');
  DOM.speedValue = document.getElementById('speedValue');
  DOM.boardSizeSelect = document.getElementById('boardSizeSelect');
  DOM.tutorMessages = document.getElementById('tutorMessages');
  DOM.tutorStatus = document.getElementById('tutorStatus');
  DOM.algoRow = document.getElementById('algoRow');
  DOM.algoCol = document.getElementById('algoCol');
  DOM.algoAction = document.getElementById('algoAction');
  DOM.algoQueens = document.getElementById('algoQueens');
  DOM.codeDisplay = document.getElementById('codeDisplay');
  DOM.modeSelector = document.getElementById('modeSelector');
}


// ─── ALGORITHM ENGINE ─────────────────────────────────────

function isSafe(board, row, col) {
  for (let i = 0; i < row; i++) {
    if (board[i] === -1) continue;
    if (board[i] === col) return { safe: false, reason: 'column', conflictRow: i };
    if (Math.abs(board[i] - col) === Math.abs(i - row)) return { safe: false, reason: 'diagonal', conflictRow: i };
  }
  return { safe: true };
}

function generateSteps(n) {
  const steps = [];
  const board = new Array(n).fill(-1);

  function backtrack(row) {
    if (row === n) {
      steps.push({ type: 'solution', board: [...board] });
      return true;
    }

    steps.push({ type: 'enter-row', row, board: [...board] });

    for (let col = 0; col < n; col++) {
      steps.push({ type: 'try', row, col, board: [...board] });

      const check = isSafe(board, row, col);
      if (check.safe) {
        board[row] = col;
        steps.push({ type: 'place', row, col, board: [...board] });

        if (backtrack(row + 1)) return true;

        board[row] = -1;
        steps.push({ type: 'backtrack', row, col, board: [...board] });
      } else {
        steps.push({
          type: 'reject',
          row, col,
          board: [...board],
          conflictRow: check.conflictRow,
          conflictReason: check.reason
        });
      }
    }

    steps.push({ type: 'exhausted', row, board: [...board] });
    return false;
  }

  backtrack(0);
  return steps;
}


// ─── AI TUTOR MESSAGE GENERATOR ───────────────────────────

const TUTOR = {
  getColLetter(col) {
    return String.fromCharCode(65 + col);
  },

  welcome(mode, n) {
    const msgs = [];
    if (mode === 'manual') {
      msgs.push({ type: 'info', text: `Welcome! 🎮 You're playing the <b>${n}-Queens Challenge</b>. Place ${n} queens on the board so that no two attack each other.` });
      msgs.push({ type: 'system', text: 'Click on any cell to place or remove a queen. I\'ll check for conflicts in real-time.' });
    } else if (mode === 'solve') {
      msgs.push({ type: 'info', text: `🤖 <b>AI Solve Mode</b> — I'll solve the ${n}-Queens problem using <b>Backtracking</b>. Watch every step!` });
      msgs.push({ type: 'system', text: 'Use the controls below to Start, Pause, or Step through the algorithm.' });
    } else if (mode === 'learn') {
      msgs.push({ type: 'teaching', text: `📚 <b>Welcome to Learn Mode!</b> I'll teach you how the <b>Backtracking Algorithm</b> solves the ${n}-Queens problem.` });
      msgs.push({ type: 'teaching', text: `<b>The Goal:</b> Place ${n} queens on a ${n}×${n} board so no two queens threaten each other — no shared rows, columns, or diagonals.` });
      msgs.push({ type: 'teaching', text: `<b>The Strategy — Backtracking:</b><br>Think of it like exploring a maze. We go forward, placing one queen per row. If we reach a dead end (no safe spot), we <em>backtrack</em> — undo the last queen and try a different column.` });
      msgs.push({ type: 'system', text: 'Press Start or Step to begin. I\'ll explain every decision along the way!' });
    }
    return msgs;
  },

  stepMessage(step, mode, state) {
    const { type, row, col, conflictRow, conflictReason, board } = step;
    const colL = this.getColLetter(col);
    const msgs = [];

    switch (type) {
      case 'enter-row':
        msgs.push({ type: 'info', text: `➡️ Moving to <b>Row ${row + 1}</b>. Let me scan for a safe column...` });
        if (mode === 'learn' && row === 0) {
          msgs.push({ type: 'teaching', text: `🎓 We start at Row 1 (the top). The algorithm tries each column from left to right, checking if it's safe to place a queen there.` });
        }
        break;

      case 'try':
        msgs.push({ type: 'warning', text: `🔍 Checking Row ${row + 1}, Column ${colL} (${col + 1})...` });
        break;

      case 'place':
        if (mode === 'learn' && !state.firstPlacementSeen) {
          state.firstPlacementSeen = true;
          msgs.push({ type: 'success', text: `✅ <b>Safe!</b> Placed queen at Row ${row + 1}, Col ${colL}. No conflicts detected.` });
          msgs.push({ type: 'teaching', text: `🎓 <b>Why is it safe?</b> We check three things:<br>1️⃣ No queen in the same column<br>2️⃣ No queen on the upper-left diagonal<br>3️⃣ No queen on the upper-right diagonal<br>All clear — so we move forward to the next row!` });
        } else {
          msgs.push({ type: 'success', text: `✅ <b>Safe!</b> Queen placed at Row ${row + 1}, Col ${colL}.` });
        }
        break;

      case 'reject': {
        const conflictColL = this.getColLetter(board[conflictRow]);
        if (conflictReason === 'column') {
          msgs.push({ type: 'danger', text: `❌ <b>Conflict!</b> Column ${colL} blocked — queen at Row ${conflictRow + 1} is in the same column.` });
        } else {
          msgs.push({ type: 'danger', text: `❌ <b>Diagonal conflict!</b> Row ${row + 1}, Col ${colL} is attacked diagonally by the queen at Row ${conflictRow + 1}, Col ${conflictColL}.` });
        }
        if (mode === 'learn' && !state.firstConflictSeen) {
          state.firstConflictSeen = true;
          msgs.push({ type: 'teaching', text: `🎓 <b>Key Insight:</b> Queens attack along rows, columns, and diagonals. The <code>isSafe()</code> function checks all placed queens above this row. If any queen shares a column or diagonal, we skip this cell and try the next column.` });
        }
        break;
      }

      case 'backtrack':
        msgs.push({ type: 'danger', text: `↩️ <b>Backtracking!</b> Removing queen from Row ${row + 1}, Col ${colL}. Trying next option...` });
        if (mode === 'learn' && !state.firstBacktrackSeen) {
          state.firstBacktrackSeen = true;
          msgs.push({ type: 'teaching', text: `🎓 <b>This is BACKTRACKING!</b> The heart of the algorithm.<br><br>We couldn't find a safe spot in the next row, so we come back here and move this queen to a different column. It's like retracing your steps in a maze when you hit a wall.<br><br>This process of <em>try → fail → undo → try again</em> is what makes backtracking powerful. It systematically explores all possibilities without ever missing one!` });
        }
        break;

      case 'exhausted':
        msgs.push({ type: 'warning', text: `🚫 Row ${row + 1} exhausted — tried all columns, none worked. Going back up...` });
        if (mode === 'learn') {
          msgs.push({ type: 'teaching', text: `🎓 When every column in a row fails, we return to the previous row and continue trying columns there. This is the "recursive unwinding" of backtracking.` });
        }
        break;

      case 'solution':
        msgs.push({ type: 'success', text: `🎉 <b>SOLUTION FOUND!</b> All ${state.n} queens placed safely!` });
        if (mode === 'learn') {
          msgs.push({ type: 'teaching', text: `🎓 <b>Mission Complete!</b> The backtracking algorithm explored the search space systematically and found a valid arrangement.<br><br><b>Key Takeaways:</b><br>🔹 We placed one queen per row<br>🔹 For each row, we tried columns left to right<br>🔹 <code>isSafe()</code> checked column & diagonal conflicts<br>🔹 Dead ends triggered backtracking<br>🔹 The algorithm guarantees finding a solution if one exists!` });
        }
        break;
    }

    return msgs;
  },

  manualPlace(row, col, n, queensPlaced) {
    const colL = this.getColLetter(col);
    return { type: 'success', text: `♛ Queen placed at Row ${row + 1}, Col ${colL}. (${queensPlaced}/${n})` };
  },

  manualRemove(row, col) {
    const colL = this.getColLetter(col);
    return { type: 'system', text: `Removed queen from Row ${row + 1}, Col ${colL}.` };
  },

  manualConflict(row, col, conflicts) {
    const colL = this.getColLetter(col);
    const details = conflicts.map(c => {
      const cColL = this.getColLetter(c.col);
      return `Row ${c.row + 1}, Col ${cColL} (${c.reason})`;
    }).join('; ');
    return { type: 'danger', text: `⚠️ Row ${row + 1}, Col ${colL} conflicts with: ${details}` };
  },

  manualSolved(n) {
    return { type: 'success', text: `🎉 <b>Congratulations!</b> You solved the ${n}-Queens puzzle! All ${n} queens are safe.` };
  }
};


// ─── BOARD RENDERER ───────────────────────────────────────

function renderBoard() {
  const n = state.n;
  DOM.board.innerHTML = '';
  DOM.board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  DOM.board.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  // Calculate cell size based on available space
  const wrapperRect = DOM.boardWrapper.getBoundingClientRect();
  const availH = wrapperRect.height - 40;
  const availW = wrapperRect.width - 60;
  const maxBoardSize = Math.min(availH, availW, 600);
  const cellSize = Math.floor(maxBoardSize / n);
  const boardSize = cellSize * n;

  DOM.board.style.width = boardSize + 'px';
  DOM.board.style.height = boardSize + 'px';

  // Create cells
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
      if (state.mode === 'manual') cell.classList.add('manual-hoverable');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.id = `cell-${r}-${c}`;
      cell.style.width = cellSize + 'px';
      cell.style.height = cellSize + 'px';
      cell.addEventListener('click', () => onCellClick(r, c));
      DOM.board.appendChild(cell);
    }
  }

  // Column labels
  DOM.colLabelsTop.innerHTML = '';
  for (let c = 0; c < n; c++) {
    const lbl = document.createElement('div');
    lbl.className = 'col-label';
    lbl.textContent = String.fromCharCode(65 + c);
    lbl.style.width = cellSize + 'px';
    DOM.colLabelsTop.appendChild(lbl);
  }

  // Row labels
  DOM.rowLabels.innerHTML = '';
  for (let r = 0; r < n; r++) {
    const lbl = document.createElement('div');
    lbl.className = 'row-label';
    lbl.textContent = r + 1;
    lbl.style.height = cellSize + 'px';
    DOM.rowLabels.appendChild(lbl);
  }

  // Canvas
  const boardEl = DOM.board;
  DOM.canvas.width = boardSize;
  DOM.canvas.height = boardSize;
  DOM.canvas.style.width = boardSize + 'px';
  DOM.canvas.style.height = boardSize + 'px';

  // Position canvas over board
  DOM.canvas.style.position = 'absolute';
  // We'll position it relative to board-container

  syncCanvasPosition();
}

function syncCanvasPosition() {
  const boardRect = DOM.board.getBoundingClientRect();
  const containerRect = DOM.boardContainer.getBoundingClientRect();
  DOM.canvas.style.left = (boardRect.left - containerRect.left) + 'px';
  DOM.canvas.style.top = (boardRect.top - containerRect.top) + 'px';
}

function getCell(row, col) {
  return document.getElementById(`cell-${row}-${col}`);
}

function getCellSize() {
  const cell = DOM.board.querySelector('.cell');
  return cell ? cell.offsetWidth : 0;
}

function placeQueenVisual(row, col, animClass = 'placing') {
  const cell = getCell(row, col);
  if (!cell) return;

  // Remove existing queen
  const existing = cell.querySelector('.queen');
  if (existing) existing.remove();

  const queen = document.createElement('div');
  queen.className = `queen ${animClass}`;
  queen.innerHTML = CONFIG.QUEEN_SVG;
  cell.classList.add('has-queen');
  cell.appendChild(queen);

  // Remove animation class after animation completes
  queen.addEventListener('animationend', () => {
    queen.classList.remove(animClass);
  }, { once: true });
}

function removeQueenVisual(row, col, animClass = 'removing') {
  const cell = getCell(row, col);
  if (!cell) return;

  const queen = cell.querySelector('.queen');
  if (!queen) return;

  queen.classList.add(animClass);
  queen.addEventListener('animationend', () => {
    queen.remove();
    cell.classList.remove('has-queen');
  }, { once: true });
}

function clearAllQueenVisuals() {
  const queens = DOM.board.querySelectorAll('.queen');
  queens.forEach(q => q.remove());
  const cells = DOM.board.querySelectorAll('.cell');
  cells.forEach(c => {
    c.classList.remove('has-queen', 'valid', 'conflict', 'scanning', 'current-row', 'solution-cell', 'highlight-col', 'highlight-diag');
  });
}

function setCellState(row, col, stateClass) {
  const cell = getCell(row, col);
  if (cell) cell.classList.add(stateClass);
}

function clearCellStates() {
  DOM.board.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('valid', 'conflict', 'scanning', 'current-row', 'solution-cell', 'highlight-col', 'highlight-diag');
  });
}

function highlightCurrentRow(row) {
  DOM.board.querySelectorAll('.cell').forEach(c => c.classList.remove('current-row'));
  for (let c = 0; c < state.n; c++) {
    setCellState(row, c, 'current-row');
  }
}

function markValidQueens(board) {
  for (let r = 0; r < board.length; r++) {
    if (board[r] !== -1) {
      setCellState(r, board[r], 'valid');
    }
  }
}

function showSolutionCelebration(board) {
  const n = state.n;
  for (let r = 0; r < n; r++) {
    if (board[r] !== -1) {
      setTimeout(() => {
        setCellState(r, board[r], 'solution-cell');
        const queen = getCell(r, board[r])?.querySelector('.queen');
        if (queen) {
          queen.classList.add('celebrating');
          queen.addEventListener('animationend', () => queen.classList.remove('celebrating'), { once: true });
        }
      }, r * 100);
    }
  }
}


// ─── CONFLICT LINE DRAWING (CANVAS) ──────────────────────

function clearCanvas() {
  DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
}

function drawConflictLine(fromRow, fromCol, toRow, toCol) {
  const cellSize = getCellSize();
  const x1 = fromCol * cellSize + cellSize / 2;
  const y1 = fromRow * cellSize + cellSize / 2;
  const x2 = toCol * cellSize + cellSize / 2;
  const y2 = toRow * cellSize + cellSize / 2;

  const ctx = DOM.ctx;

  // Glow
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.15)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // Main line
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Endpoints
  [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(p => {
    ctx.save();
    ctx.fillStyle = 'rgba(248, 113, 113, 0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawConflictsForStep(board, row, col, conflictRow) {
  clearCanvas();
  if (conflictRow !== undefined && board[conflictRow] !== -1) {
    drawConflictLine(conflictRow, board[conflictRow], row, col);
    setCellState(conflictRow, board[conflictRow], 'conflict');
    setCellState(row, col, 'conflict');
  }
}

function drawManualConflicts(board) {
  clearCanvas();
  const n = state.n;
  const conflicts = [];

  for (let r1 = 0; r1 < n; r1++) {
    if (board[r1] === -1) continue;
    for (let r2 = r1 + 1; r2 < n; r2++) {
      if (board[r2] === -1) continue;
      if (board[r1] === board[r2]) {
        drawConflictLine(r1, board[r1], r2, board[r2]);
        conflicts.push({ row1: r1, col1: board[r1], row2: r2, col2: board[r2], reason: 'column' });
      } else if (Math.abs(board[r1] - board[r2]) === Math.abs(r1 - r2)) {
        drawConflictLine(r1, board[r1], r2, board[r2]);
        conflicts.push({ row1: r1, col1: board[r1], row2: r2, col2: board[r2], reason: 'diagonal' });
      }
    }
  }

  // Mark conflicting cells
  const conflictCells = new Set();
  conflicts.forEach(c => {
    conflictCells.add(`${c.row1}-${c.col1}`);
    conflictCells.add(`${c.row2}-${c.col2}`);
  });
  conflictCells.forEach(key => {
    const [r, c] = key.split('-').map(Number);
    setCellState(r, c, 'conflict');
  });

  // Mark valid queens (those not in any conflict)
  for (let r = 0; r < n; r++) {
    if (board[r] !== -1 && !conflictCells.has(`${r}-${board[r]}`)) {
      setCellState(r, board[r], 'valid');
    }
  }

  return conflicts;
}


// ─── CODE DISPLAY ─────────────────────────────────────────

const CODE_LINES = [
  'function solveNQueens(row) {',
  '  if (row === N) return true;',
  '',
  '  for (col = 0; col < N; col++) {',
  '    if (isSafe(board, row, col)) {',
  '      board[row] = col;',
  '      if (solveNQueens(row + 1))',
  '        return true;',
  '      board[row] = -1;',
  '    }',
  '  }',
  '  return false;',
  '}',
];

function updateCodeHighlight(stepType) {
  const lines = CODE_LINES.map((line, idx) => {
    let cls = 'code-line';
    switch (stepType) {
      case 'enter-row':
        if (idx === 0) cls += ' active';
        break;
      case 'solution':
        if (idx === 1) cls += ' success-line';
        break;
      case 'try':
        if (idx === 3) cls += ' active';
        break;
      case 'place':
        if (idx === 4 || idx === 5) cls += ' success-line';
        break;
      case 'reject':
        if (idx === 4) cls += ' danger-line';
        break;
      case 'backtrack':
        if (idx === 8) cls += ' danger-line';
        break;
      case 'exhausted':
        if (idx === 11) cls += ' danger-line';
        break;
    }
    return `<span class="${cls}">${escapeHtml(line)}</span>`;
  });
  DOM.codeDisplay.innerHTML = lines.join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


// ─── TUTOR MESSAGES ───────────────────────────────────────

function addTutorMessage(msg) {
  const el = document.createElement('div');
  el.className = `tutor-msg ${msg.type}`;
  el.innerHTML = `<span class="msg-text">${msg.text}</span>`;
  DOM.tutorMessages.appendChild(el);
  DOM.tutorMessages.scrollTop = DOM.tutorMessages.scrollHeight;
}

function addTutorMessages(msgs) {
  msgs.forEach(m => addTutorMessage(m));
}

function clearTutorMessages() {
  DOM.tutorMessages.innerHTML = '';
}


// ─── STATS UPDATER ────────────────────────────────────────

function updateStats() {
  DOM.queensPlaced.textContent = state.queensPlaced;
  DOM.queensNeeded.textContent = state.n;
  DOM.stepsCount.textContent = state.totalSteps;
  DOM.backtracksCount.textContent = state.totalBacktracks;
}

function updateAlgoState(row, col, action, queens) {
  DOM.algoRow.textContent = row !== null ? `Row ${row + 1}` : '—';
  DOM.algoCol.textContent = col !== null ? `Col ${TUTOR.getColLetter(col)}` : '—';
  DOM.algoAction.textContent = action || 'Idle';
  DOM.algoQueens.textContent = queens ?? 0;
}

function updateStatus(text) {
  DOM.statusText.textContent = text;
}


// ─── ANIMATION CONTROLLER ─────────────────────────────────

function getDelay() {
  return CONFIG.SPEED_DELAYS[state.speed] || 500;
}

function delay(ms) {
  return new Promise((resolve) => {
    state.timeoutId = setTimeout(resolve, ms);
  });
}

function stopAnimation() {
  state.isPlaying = false;
  state.isPaused = false;
  clearTimeout(state.timeoutId);
  state.timeoutId = null;
}

async function executeStep(step) {
  state.totalSteps++;
  state.currentStepIdx++;
  const { type, row, col, board, conflictRow, conflictReason } = step;

  // Clear previous cell states
  clearCellStates();
  clearCanvas();

  // Count queens from the board
  if (board) {
    state.queensPlaced = board.filter(c => c !== -1).length;
  }

  // Redraw all existing queens from board state
  renderBoardFromState(board);

  switch (type) {
    case 'enter-row':
      highlightCurrentRow(row);
      markValidQueens(board);
      updateAlgoState(row, null, 'Scanning row', state.queensPlaced);
      updateCodeHighlight('enter-row');
      break;

    case 'try':
      highlightCurrentRow(row);
      setCellState(row, col, 'scanning');
      markValidQueens(board);
      updateAlgoState(row, col, 'Checking cell', state.queensPlaced);
      updateCodeHighlight('try');
      // Show what columns/diagonals are being checked
      showThreatLines(board, row, col);
      break;

    case 'place':
      placeQueenVisual(row, col, 'placing');
      markValidQueens(board);
      setCellState(row, col, 'valid');
      updateAlgoState(row, col, '✓ Placed', state.queensPlaced);
      updateCodeHighlight('place');
      break;

    case 'reject':
      setCellState(row, col, 'conflict');
      drawConflictsForStep(board, row, col, conflictRow);
      markValidQueens(board);
      updateAlgoState(row, col, '✗ Rejected', state.queensPlaced);
      updateCodeHighlight('reject');
      break;

    case 'backtrack':
      state.totalBacktracks++;
      removeQueenVisual(row, col, 'backtracking');
      markValidQueens(board);
      updateAlgoState(row, col, '↩ Backtrack', state.queensPlaced);
      updateCodeHighlight('backtrack');
      break;

    case 'exhausted':
      markValidQueens(board);
      updateAlgoState(row, null, '🚫 Exhausted', state.queensPlaced);
      updateCodeHighlight('exhausted');
      break;

    case 'solution':
      state.isSolved = true;
      markValidQueens(board);
      showSolutionCelebration(board);
      updateAlgoState(null, null, '🎉 Solved!', state.n);
      updateCodeHighlight('solution');
      updateStatus('Solved!');
      DOM.tutorStatus.textContent = 'Solution found!';
      break;
  }

  // Generate and show tutor messages
  const msgs = TUTOR.stepMessage(step, state.mode, state);
  addTutorMessages(msgs);
  updateStats();
}

function renderBoardFromState(board) {
  if (!board) return;
  // Remove all queens from DOM
  DOM.board.querySelectorAll('.queen').forEach(q => q.remove());
  DOM.board.querySelectorAll('.cell').forEach(c => c.classList.remove('has-queen'));

  // Place queens at their positions (no animation, just instant)
  for (let r = 0; r < board.length; r++) {
    if (board[r] !== -1) {
      const cell = getCell(r, board[r]);
      if (cell) {
        const queen = document.createElement('div');
        queen.className = 'queen';
        queen.innerHTML = CONFIG.QUEEN_SVG;
        cell.classList.add('has-queen');
        cell.appendChild(queen);
      }
    }
  }
}

function showThreatLines(board, row, col) {
  // Show subtle highlights on cells being checked (column and diagonals)
  for (let r = 0; r < row; r++) {
    // Column check
    setCellState(r, col, 'highlight-col');
    // Diagonal checks
    const d1 = col - (row - r);
    const d2 = col + (row - r);
    if (d1 >= 0 && d1 < state.n) setCellState(r, d1, 'highlight-diag');
    if (d2 >= 0 && d2 < state.n) setCellState(r, d2, 'highlight-diag');
  }
}

async function runAnimation() {
  state.isPlaying = true;
  state.isPaused = false;
  updatePlaybackButtons();
  DOM.tutorStatus.textContent = 'Solving...';
  updateStatus('Solving...');

  while (state.currentStepIdx < state.steps.length && state.isPlaying) {
    const step = state.steps[state.currentStepIdx];
    await executeStep(step);

    if (state.isSolved || !state.isPlaying) break;

    // Adjust delay based on step type
    let d = getDelay();
    if (step.type === 'try') d = Math.max(d * 0.5, 20);
    if (step.type === 'enter-row') d = Math.max(d * 0.3, 10);
    if (step.type === 'reject') d = Math.max(d * 0.6, 30);
    if (state.mode === 'learn') d = Math.max(d * 1.5, 100);

    await delay(d);
  }

  if (state.isSolved) {
    state.isPlaying = false;
  }
  updatePlaybackButtons();
}

async function stepForward() {
  if (state.currentStepIdx < state.steps.length && !state.isSolved) {
    const step = state.steps[state.currentStepIdx];
    await executeStep(step);
    updatePlaybackButtons();
  }
}


// ─── PLAYBACK CONTROL ─────────────────────────────────────

function updatePlaybackButtons() {
  const isManual = state.mode === 'manual';
  const hasSteps = state.steps.length > 0;
  const isDone = state.isSolved || (hasSteps && state.currentStepIdx >= state.steps.length);

  DOM.startBtn.disabled = isManual || (state.isPlaying) || isDone;
  DOM.pauseBtn.disabled = isManual || !state.isPlaying;
  DOM.stepBtn.disabled = isManual || state.isPlaying || isDone;
  DOM.resetBtn.disabled = false;

  // Update button text
  if (state.isPlaying) {
    DOM.startBtn.querySelector('.ctrl-text').textContent = 'Running';
    DOM.pauseBtn.querySelector('.ctrl-text').textContent = 'Pause';
  } else if (state.isPaused) {
    DOM.startBtn.querySelector('.ctrl-text').textContent = 'Resume';
    DOM.startBtn.disabled = isDone;
    DOM.pauseBtn.querySelector('.ctrl-text').textContent = 'Paused';
  } else {
    DOM.startBtn.querySelector('.ctrl-text').textContent = isDone ? 'Done' : 'Start';
    DOM.pauseBtn.querySelector('.ctrl-text').textContent = 'Pause';
  }

  // In manual mode, show different controls
  if (isManual) {
    DOM.startBtn.querySelector('.ctrl-text').textContent = 'Start';
    DOM.pauseBtn.querySelector('.ctrl-text').textContent = 'Pause';
  }
}


// ─── EVENT HANDLERS ───────────────────────────────────────

function onCellClick(row, col) {
  if (state.mode !== 'manual') return;
  if (state.isPlaying) return;

  // Toggle queen
  if (state.board[row] === col) {
    // Remove queen
    state.board[row] = -1;
    removeQueenVisual(row, col);
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualRemove(row, col));
  } else if (state.board[row] !== -1) {
    // Remove old queen from this row first
    const oldCol = state.board[row];
    removeQueenVisual(row, oldCol);

    // Place new queen
    state.board[row] = col;
    placeQueenVisual(row, col, 'placing');
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualPlace(row, col, state.n, state.queensPlaced));
  } else {
    // Place queen
    state.board[row] = col;
    placeQueenVisual(row, col, 'placing');
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualPlace(row, col, state.n, state.queensPlaced));
  }

  // Check conflicts
  setTimeout(() => {
    clearCellStates();
    const conflicts = drawManualConflicts(state.board);

    // Show conflict messages
    if (conflicts.length > 0) {
      const lastPlaced = { row, col };
      const relevantConflicts = conflicts
        .filter(c => (c.row1 === row && c.col1 === col) || (c.row2 === row && c.col2 === col))
        .map(c => {
          const isFirst = c.row1 === row && c.col1 === col;
          return {
            row: isFirst ? c.row2 : c.row1,
            col: isFirst ? c.col2 : c.col1,
            reason: c.reason
          };
        });
      if (relevantConflicts.length > 0) {
        addTutorMessage(TUTOR.manualConflict(row, col, relevantConflicts));
      }
    }

    // Check if solved
    if (state.queensPlaced === state.n && conflicts.length === 0) {
      state.isSolved = true;
      addTutorMessage(TUTOR.manualSolved(state.n));
      showSolutionCelebration(state.board);
      updateStatus('Solved!');
      DOM.tutorStatus.textContent = '🎉 Puzzle solved!';
    }

    updateStats();
  }, 50);
}

function onStartClick() {
  if (state.mode === 'manual') return;

  if (state.isPaused) {
    // Resume
    state.isPaused = false;
    runAnimation();
    return;
  }

  if (state.isPlaying || state.isSolved) return;

  // Pre-compute steps
  if (state.steps.length === 0) {
    state.steps = generateSteps(state.n);
  }

  runAnimation();
}

function onPauseClick() {
  if (state.isPlaying) {
    state.isPlaying = false;
    state.isPaused = true;
    clearTimeout(state.timeoutId);
    updatePlaybackButtons();
    DOM.tutorStatus.textContent = 'Paused';
    updateStatus('Paused');
    addTutorMessage({ type: 'system', text: '⏸ Paused. Click Resume or Step to continue.' });
  }
}

function onStepClick() {
  if (state.mode === 'manual') return;
  if (state.isPlaying) return;

  if (state.steps.length === 0) {
    state.steps = generateSteps(state.n);
    // Show initial messages
    const welcomeMsgs = TUTOR.welcome(state.mode, state.n);
    addTutorMessages(welcomeMsgs);
    DOM.tutorStatus.textContent = 'Step-by-step';
    updateStatus('Stepping...');
  }

  stepForward();
}

function onResetClick() {
  stopAnimation();
  state.board = new Array(state.n).fill(-1);
  state.steps = [];
  state.currentStepIdx = 0;
  state.isPlaying = false;
  state.isPaused = false;
  state.isSolved = false;
  state.queensPlaced = 0;
  state.totalSteps = 0;
  state.totalBacktracks = 0;
  state.firstBacktrackSeen = false;
  state.firstConflictSeen = false;
  state.firstPlacementSeen = false;

  clearTutorMessages();
  clearCanvas();
  renderBoard();
  updateStats();
  updateAlgoState(null, null, 'Idle', 0);
  updateCodeHighlight('');
  updatePlaybackButtons();
  updateStatus('Ready');
  DOM.tutorStatus.textContent = 'Ready to help';

  // Show welcome
  const welcomeMsgs = TUTOR.welcome(state.mode, state.n);
  addTutorMessages(welcomeMsgs);

  // Remove solution overlay if any
  const overlay = DOM.board.querySelector('.solution-overlay');
  if (overlay) overlay.remove();
}

function onModeChange(mode) {
  if (mode === state.mode) return;

  // Update active button
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  state.mode = mode;
  onResetClick();
}

function onBoardSizeChange(newN) {
  newN = parseInt(newN);
  if (newN < CONFIG.MIN_N || newN > CONFIG.MAX_N) return;
  if (newN === state.n) return;

  state.n = newN;
  onResetClick();
}

function onSpeedChange(val) {
  state.speed = parseInt(val);
  DOM.speedValue.textContent = val + 'x';
}


// ─── INITIALIZATION ───────────────────────────────────────

function init() {
  cacheDom();

  // Set initial state
  state.board = new Array(state.n).fill(-1);

  // Render board
  renderBoard();
  updateStats();
  updatePlaybackButtons();
  updateAlgoState(null, null, 'Idle', 0);
  updateCodeHighlight('');

  // Welcome messages
  const welcomeMsgs = TUTOR.welcome(state.mode, state.n);
  addTutorMessages(welcomeMsgs);

  // Event Listeners
  DOM.startBtn.addEventListener('click', onStartClick);
  DOM.pauseBtn.addEventListener('click', onPauseClick);
  DOM.stepBtn.addEventListener('click', onStepClick);
  DOM.resetBtn.addEventListener('click', onResetClick);

  DOM.speedSlider.addEventListener('input', (e) => onSpeedChange(e.target.value));

  DOM.boardSizeSelect.addEventListener('change', (e) => onBoardSizeChange(e.target.value));

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => onModeChange(btn.dataset.mode));
  });

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderBoard();
      // Re-render queens from current state
      if (state.board) {
        renderBoardFromState(state.board);
        if (state.mode === 'manual') {
          clearCellStates();
          drawManualConflicts(state.board);
        }
      }
    }, 200);
  });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
