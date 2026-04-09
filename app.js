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
  manualMoveCount: 0,    // tracks moves for fact triggering
  firstBacktrackSeen: false,
  firstConflictSeen: false,
  firstPlacementSeen: false,
  hintCell: null,         // {row, col} of currently highlighted hint
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
  DOM.hintBtn = document.getElementById('hintBtn');
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
  DOM.codeBlock = document.getElementById('codeBlock');
  DOM.factText = document.getElementById('factText');
  DOM.confettiCanvas = document.getElementById('confettiCanvas');
  DOM.confettiCtx = DOM.confettiCanvas.getContext('2d');
}


// ─── INTERESTING FACT ENGINE ──────────────────────────────

const FACTS_POOL = [
  "👑 The 8-Queens puzzle was first proposed by chess composer Max Bezzel in 1848.",
  "🤯 There are 92 distinct solutions to the 8-Queens problem!",
  "⚡ Backtracking is used in Sudoku solvers, maze generators, and pathfinding algorithms.",
  "🧠 The N-Queens problem grows exponentially — that's why pruning is essential.",
  "💡 N=4 has only 2 distinct solutions — try finding both!",
  "🚀 Backtracking is a form of depth-first search (DFS) through a decision tree.",
  "📐 For N=1, there's exactly 1 solution. For N=2 and N=3, there are zero!",
  "🏆 In 1874, Günther proposed a determinant-based approach to N-Queens.",
  "🌀 The search space for 8-Queens is 16.7 million — backtracking prunes most of it.",
  "🔬 N-Queens is NP-hard when generalized, but efficient heuristics exist for large N.",
  "♟️ The problem is related to placing non-attacking rooks and bishops too!",
  "🎯 Constraint propagation can reduce the search space dramatically.",
  "📊 For N=10, there are 724 distinct solutions.",
  "💻 Backtracking was popularized by Derrick Lehmer in the 1950s.",
  "🌟 The first complete analysis of 8-Queens was by Franz Nauck in 1850.",
  "🔄 Every N-Queens solution has at most 8 variants through rotation and reflection.",
  "⏱️ A modern computer solves 8-Queens in microseconds using backtracking.",
  "🧩 N-Queens is a classic constraint satisfaction problem (CSP).",
  "🎲 Random placement solves N-Queens faster for very large N (like N=1000)!",
  "📈 The number of solutions grows roughly exponentially: S(N) ≈ 0.143 × N!"
];

const factEngine = {
  queue: [],
  lastIndex: -1,

  init() {
    this.shuffle();
  },

  shuffle() {
    this.queue = [...Array(FACTS_POOL.length).keys()];
    // Fisher-Yates shuffle
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    // Ensure no repeat of last shown fact
    if (this.queue[0] === this.lastIndex && this.queue.length > 1) {
      [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
    }
  },

  getNext() {
    if (this.queue.length === 0) this.shuffle();
    const idx = this.queue.shift();
    this.lastIndex = idx;
    return FACTS_POOL[idx];
  },

  showFact() {
    const fact = this.getNext();
    if (DOM.factText) {
      DOM.factText.style.animation = 'none';
      DOM.factText.offsetHeight; // trigger reflow
      DOM.factText.style.animation = 'factFadeIn 0.6s ease-out';
      DOM.factText.textContent = fact;
    }
  }
};


// ─── CONFETTI SYSTEM ──────────────────────────────────────

const confetti = {
  particles: [],
  animationId: null,

  init() {
    DOM.confettiCanvas.width = window.innerWidth;
    DOM.confettiCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      DOM.confettiCanvas.width = window.innerWidth;
      DOM.confettiCanvas.height = window.innerHeight;
    });
  },

  launch(count = 120) {
    this.particles = [];
    const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#67e8f9', '#fb923c'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 300,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 18 - 5,
        w: Math.random() * 8 + 3,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.3 + Math.random() * 0.15,
        opacity: 1,
        decay: 0.003 + Math.random() * 0.004
      });
    }
    if (!this.animationId) this.animate();
  },

  animate() {
    const ctx = DOM.confettiCtx;
    ctx.clearRect(0, 0, DOM.confettiCanvas.width, DOM.confettiCanvas.height);

    this.particles = this.particles.filter(p => p.opacity > 0.01);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      ctx.clearRect(0, 0, DOM.confettiCanvas.width, DOM.confettiCanvas.height);
    }
  }
};


// ─── ALGORITHM ENGINE ─────────────────────────────────────

function isSafe(board, row, col) {
  for (let i = 0; i < row; i++) {
    if (board[i] === -1) continue;
    if (board[i] === col) return { safe: false, reason: 'column', conflictRow: i };
    if (Math.abs(board[i] - col) === Math.abs(i - row)) return { safe: false, reason: 'diagonal', conflictRow: i };
  }
  return { safe: true };
}

function isSafeSimple(board, row, col, n) {
  for (let i = 0; i < n; i++) {
    if (i === row || board[i] === -1) continue;
    if (board[i] === col) return false;
    if (Math.abs(board[i] - col) === Math.abs(i - row)) return false;
  }
  return true;
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


// ─── HINT SYSTEM (BACKTRACKING-BASED) ─────────────────────

function computeHint(currentBoard, n) {
  // Find the first empty row
  let targetRow = -1;
  for (let r = 0; r < n; r++) {
    if (currentBoard[r] === -1) {
      targetRow = r;
      break;
    }
  }
  if (targetRow === -1) return null; // all rows filled

  // Try to solve from current state using backtracking
  const testBoard = [...currentBoard];

  function canSolve(board, row) {
    if (row === n) return true;
    if (board[row] !== -1) {
      // Row already has a queen — check if it's valid and move on
      for (let i = 0; i < n; i++) {
        if (i === row || board[i] === -1) continue;
        if (board[i] === board[row]) return false;
        if (Math.abs(board[i] - board[row]) === Math.abs(i - row)) return false;
      }
      return canSolve(board, row + 1);
    }
    for (let col = 0; col < n; col++) {
      if (isSafeSimple(board, row, col, n)) {
        board[row] = col;
        if (canSolve(board, row + 1)) return true;
        board[row] = -1;
      }
    }
    return false;
  }

  // Try each column for targetRow and see if a solution is possible
  for (let col = 0; col < n; col++) {
    const tryBoard = [...currentBoard];
    if (isSafeSimple(tryBoard, targetRow, col, n)) {
      tryBoard[targetRow] = col;
      if (canSolve([...tryBoard], targetRow + 1)) {
        return { row: targetRow, col: col };
      }
    }
  }

  return null; // no valid hint (board state might be unsolvable)
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
      msgs.push({ type: 'system', text: 'Click any cell to place or remove a queen. Use 💡 Hint if you get stuck!' });
    } else if (mode === 'solve') {
      msgs.push({ type: 'info', text: `🤖 <b>AI Solve Mode</b> — I'll solve the ${n}-Queens problem using <b>Backtracking</b>. Watch every step!` });
      msgs.push({ type: 'system', text: 'Use Start, Pause, or Step to control the algorithm.' });
    } else if (mode === 'learn') {
      msgs.push({ type: 'teaching', text: `📚 <b>Welcome to Learn Mode!</b> I'll teach you how <b>Backtracking</b> solves the ${n}-Queens problem.` });
      msgs.push({ type: 'teaching', text: `<b>The Goal:</b> Place ${n} queens on a ${n}×${n} board — no shared rows, columns, or diagonals.` });
      msgs.push({ type: 'teaching', text: `<b>The Strategy:</b> Think of it like exploring a maze. We place one queen per row, moving forward when safe. If we hit a dead end, we <em>backtrack</em> — undo and try another path.` });
      msgs.push({ type: 'system', text: 'Press Start or Step to begin. I\'ll explain every decision!' });
    }
    return msgs;
  },

  stepMessage(step, mode, gameState) {
    const { type, row, col, conflictRow, conflictReason, board } = step;
    const colL = this.getColLetter(col);
    const msgs = [];

    switch (type) {
      case 'enter-row':
        msgs.push({ type: 'info', text: `➡️ Moving to <b>Row ${row + 1}</b>. Scanning for a safe column...` });
        if (mode === 'learn' && row === 0) {
          msgs.push({ type: 'teaching', text: `🎓 We start at Row 1. The algorithm tries each column left to right, checking safety before placing.` });
        }
        break;

      case 'try':
        msgs.push({ type: 'warning', text: `🔍 Trying Row ${row + 1}, Column ${colL}...` });
        break;

      case 'place':
        if (mode === 'learn' && !gameState.firstPlacementSeen) {
          gameState.firstPlacementSeen = true;
          msgs.push({ type: 'success', text: `✅ <b>Valid — no conflicts!</b> Queen placed at Row ${row + 1}, Col ${colL}.` });
          msgs.push({ type: 'teaching', text: `🎓 <b>How do we check safety?</b><br>1️⃣ No queen in the same column<br>2️⃣ No queen on the upper-left diagonal<br>3️⃣ No queen on the upper-right diagonal<br>All clear → move forward!` });
        } else {
          msgs.push({ type: 'success', text: `✅ <b>Valid!</b> Queen placed at Row ${row + 1}, Col ${colL}.` });
        }
        break;

      case 'reject': {
        const conflictColL = board[conflictRow] !== -1 ? this.getColLetter(board[conflictRow]) : '?';
        if (conflictReason === 'column') {
          msgs.push({ type: 'danger', text: `❌ <b>Rejected</b> — column ${colL} blocked by queen at Row ${conflictRow + 1}.` });
        } else {
          msgs.push({ type: 'danger', text: `❌ <b>Rejected</b> — diagonal conflict with queen at Row ${conflictRow + 1}, Col ${conflictColL}.` });
        }
        if (mode === 'learn' && !gameState.firstConflictSeen) {
          gameState.firstConflictSeen = true;
          msgs.push({ type: 'teaching', text: `🎓 <b>Key insight:</b> <code>isSafe()</code> checks all queens above this row. If any shares a column or diagonal — we skip and try the next column.` });
        }
        break;
      }

      case 'backtrack':
        msgs.push({ type: 'danger', text: `↩️ <b>Backtracking!</b> Removing queen from Row ${row + 1}, Col ${colL}.` });
        if (mode === 'learn' && !gameState.firstBacktrackSeen) {
          gameState.firstBacktrackSeen = true;
          msgs.push({ type: 'teaching', text: `🎓 <b>This is BACKTRACKING!</b> The heart of the algorithm.<br><br>No safe column exists in the next row → we come back and try a different column here. Like retracing steps in a maze.<br><br><em>Try → fail → undo → try again</em> — this systematic exploration is what makes backtracking powerful!` });
        }
        break;

      case 'exhausted':
        msgs.push({ type: 'warning', text: `🚫 Row ${row + 1} exhausted — all columns failed. Going back up...` });
        if (mode === 'learn') {
          msgs.push({ type: 'teaching', text: `🎓 Every column in this row failed. We return to the previous row — this is "recursive unwinding."` });
        }
        break;

      case 'solution':
        msgs.push({ type: 'success', text: `🔥 <b>SOLUTION FOUND!</b> All ${gameState.n} queens placed safely!<br><br>This is exactly how backtracking works — trying, validating, and correcting until a valid solution is found.` });
        if (mode === 'learn') {
          msgs.push({ type: 'teaching', text: `🎓 <b>Key Takeaways:</b><br>🔹 One queen per row<br>🔹 Try columns left to right<br>🔹 <code>isSafe()</code> prunes invalid branches<br>🔹 Dead ends trigger backtracking<br>🔹 The algorithm guarantees a solution if one exists!` });
        }
        break;
    }

    return msgs;
  },

  manualPlace(row, col, n, queensPlaced) {
    const colL = this.getColLetter(col);
    return { type: 'success', text: `♛ Queen placed at Row ${row + 1}, Col ${colL}. <span style="opacity:0.6">(${queensPlaced}/${n})</span>` };
  },

  manualRemove(row, col) {
    const colL = this.getColLetter(col);
    return { type: 'system', text: `Removed queen from Row ${row + 1}, Col ${colL}.` };
  },

  manualConflict(row, col, conflicts) {
    const colL = this.getColLetter(col);
    const details = conflicts.map(c => {
      const cColL = this.getColLetter(c.col);
      return c.reason === 'column'
        ? `Row ${c.row + 1} (same column)`
        : `Row ${c.row + 1}, Col ${cColL} (diagonal)`;
    }).join('; ');
    return { type: 'danger', text: `⚠️ <b>Unsafe position!</b> Row ${row + 1}, Col ${colL} conflicts with: ${details}` };
  },

  manualSolved(n) {
    return { type: 'success', text: `🔥 <b>Perfect!</b> You solved the ${n}-Queens puzzle!<br>This is exactly how backtracking works — trying, validating, and correcting until a valid solution is found.` };
  },

  hintMessage(row, col) {
    const colL = this.getColLetter(col);
    return { type: 'hint', text: `💡 Try placing a queen at <b>Row ${row + 1}, Col ${colL}</b> — it keeps all constraints satisfied and leads to a valid solution.` };
  },

  hintUnavailable() {
    return { type: 'warning', text: `💡 No valid hint available. The current board state may have conflicts — try removing some queens and rearranging.` };
  }
};


// ─── BOARD RENDERER ───────────────────────────────────────

function renderBoard() {
  const n = state.n;
  DOM.board.innerHTML = '';
  DOM.board.classList.remove('board-solved');
  DOM.board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  DOM.board.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  const wrapperRect = DOM.boardWrapper.getBoundingClientRect();
  const availH = wrapperRect.height - 40;
  const availW = wrapperRect.width - 60;
  const maxBoardSize = Math.min(availH, availW, 600);
  const cellSize = Math.floor(maxBoardSize / n);
  const boardSize = cellSize * n;

  DOM.board.style.width = boardSize + 'px';
  DOM.board.style.height = boardSize + 'px';

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

  DOM.colLabelsTop.innerHTML = '';
  for (let c = 0; c < n; c++) {
    const lbl = document.createElement('div');
    lbl.className = 'col-label';
    lbl.textContent = String.fromCharCode(65 + c);
    lbl.style.width = cellSize + 'px';
    DOM.colLabelsTop.appendChild(lbl);
  }

  DOM.rowLabels.innerHTML = '';
  for (let r = 0; r < n; r++) {
    const lbl = document.createElement('div');
    lbl.className = 'row-label';
    lbl.textContent = r + 1;
    lbl.style.height = cellSize + 'px';
    DOM.rowLabels.appendChild(lbl);
  }

  DOM.canvas.width = boardSize;
  DOM.canvas.height = boardSize;
  DOM.canvas.style.width = boardSize + 'px';
  DOM.canvas.style.height = boardSize + 'px';
  DOM.canvas.style.position = 'absolute';

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
  const existing = cell.querySelector('.queen');
  if (existing) existing.remove();

  const queen = document.createElement('div');
  queen.className = `queen ${animClass}`;
  queen.innerHTML = CONFIG.QUEEN_SVG;
  cell.classList.add('has-queen');
  cell.appendChild(queen);
  queen.addEventListener('animationend', () => queen.classList.remove(animClass), { once: true });
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

function setCellState(row, col, stateClass) {
  const cell = getCell(row, col);
  if (cell) cell.classList.add(stateClass);
}

function clearCellStates() {
  DOM.board.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('valid', 'conflict', 'scanning', 'current-row', 'solution-cell', 'highlight-col', 'highlight-diag', 'hint-cell');
  });
}

function clearHintHighlight() {
  if (state.hintCell) {
    const cell = getCell(state.hintCell.row, state.hintCell.col);
    if (cell) cell.classList.remove('hint-cell');
    state.hintCell = null;
  }
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
  DOM.board.classList.add('board-solved');

  for (let r = 0; r < n; r++) {
    if (board[r] !== -1) {
      setTimeout(() => {
        setCellState(r, board[r], 'solution-cell');
        const queen = getCell(r, board[r])?.querySelector('.queen');
        if (queen) {
          queen.classList.add('celebrating', 'solved-queen');
          queen.addEventListener('animationend', () => queen.classList.remove('celebrating'), { once: true });
        }
      }, r * 120);
    }
  }

  // Launch confetti!
  setTimeout(() => confetti.launch(150), 200);
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

  // Glow layer
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.15)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // Main dashed line
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.55)';
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

  const conflictCells = new Set();
  conflicts.forEach(c => {
    conflictCells.add(`${c.row1}-${c.col1}`);
    conflictCells.add(`${c.row2}-${c.col2}`);
  });
  conflictCells.forEach(key => {
    const [r, c] = key.split('-').map(Number);
    setCellState(r, c, 'conflict');
  });

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
  let activeIdx = -1;
  const lines = CODE_LINES.map((line, idx) => {
    let cls = 'code-line';
    switch (stepType) {
      case 'enter-row':
        if (idx === 0) { cls += ' active'; activeIdx = idx; }
        break;
      case 'solution':
        if (idx === 1) { cls += ' success-line'; activeIdx = idx; }
        break;
      case 'try':
        if (idx === 3) { cls += ' active'; activeIdx = idx; }
        break;
      case 'place':
        if (idx === 4 || idx === 5) { cls += ' success-line'; if (activeIdx < 0) activeIdx = idx; }
        break;
      case 'reject':
        if (idx === 4) { cls += ' danger-line'; activeIdx = idx; }
        break;
      case 'backtrack':
        if (idx === 8) { cls += ' danger-line'; activeIdx = idx; }
        break;
      case 'exhausted':
        if (idx === 11) { cls += ' danger-line'; activeIdx = idx; }
        break;
    }
    return `<span class="${cls}" id="code-line-${idx}">${escapeHtml(line)}</span>`;
  });
  DOM.codeDisplay.innerHTML = lines.join('\n');

  // Auto-scroll to active line
  if (activeIdx >= 0 && DOM.codeBlock) {
    const activeLine = document.getElementById(`code-line-${activeIdx}`);
    if (activeLine) {
      activeLine.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
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
  const { type, row, col, board, conflictRow } = step;

  clearCellStates();
  clearCanvas();
  clearHintHighlight();

  if (board) {
    state.queensPlaced = board.filter(c => c !== -1).length;
  }

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
      factEngine.showFact();
      break;
  }

  // Show fact periodically during solve/learn
  if (type === 'place' && state.totalSteps % 15 === 0) {
    factEngine.showFact();
  }

  const msgs = TUTOR.stepMessage(step, state.mode, state);
  addTutorMessages(msgs);
  updateStats();
}

function renderBoardFromState(board) {
  if (!board) return;
  DOM.board.querySelectorAll('.queen').forEach(q => q.remove());
  DOM.board.querySelectorAll('.cell').forEach(c => c.classList.remove('has-queen'));

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
  for (let r = 0; r < row; r++) {
    setCellState(r, col, 'highlight-col');
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

  DOM.startBtn.disabled = isManual || state.isPlaying || isDone;
  DOM.pauseBtn.disabled = isManual || !state.isPlaying;
  DOM.stepBtn.disabled = isManual || state.isPlaying || isDone;
  DOM.hintBtn.disabled = !isManual || state.isSolved;
  DOM.resetBtn.disabled = false;

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

  if (isManual) {
    DOM.startBtn.querySelector('.ctrl-text').textContent = 'Start';
    DOM.pauseBtn.querySelector('.ctrl-text').textContent = 'Pause';
  }
}


// ─── EVENT HANDLERS ───────────────────────────────────────

function onCellClick(row, col) {
  if (state.mode !== 'manual') return;
  if (state.isPlaying || state.isSolved) return;

  clearHintHighlight();
  state.manualMoveCount++;

  if (state.board[row] === col) {
    state.board[row] = -1;
    removeQueenVisual(row, col);
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualRemove(row, col));
  } else if (state.board[row] !== -1) {
    const oldCol = state.board[row];
    removeQueenVisual(row, oldCol);
    state.board[row] = col;
    placeQueenVisual(row, col, 'placing');
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualPlace(row, col, state.n, state.queensPlaced));
  } else {
    state.board[row] = col;
    placeQueenVisual(row, col, 'placing');
    state.queensPlaced = state.board.filter(c => c !== -1).length;
    addTutorMessage(TUTOR.manualPlace(row, col, state.n, state.queensPlaced));
  }

  // Show a fact every 4 moves
  if (state.manualMoveCount % 4 === 0) {
    factEngine.showFact();
  }

  setTimeout(() => {
    clearCellStates();
    const conflicts = drawManualConflicts(state.board);

    if (conflicts.length > 0) {
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

    if (state.queensPlaced === state.n && conflicts.length === 0) {
      state.isSolved = true;
      addTutorMessage(TUTOR.manualSolved(state.n));
      showSolutionCelebration(state.board);
      updateStatus('Solved!');
      DOM.tutorStatus.textContent = '🎉 Puzzle solved!';
      updatePlaybackButtons();
    }

    updateStats();
  }, 50);
}

function onHintClick() {
  if (state.mode !== 'manual' || state.isSolved) return;
  clearHintHighlight();

  // Check for existing conflicts first
  const currentConflicts = [];
  for (let r1 = 0; r1 < state.n; r1++) {
    if (state.board[r1] === -1) continue;
    for (let r2 = r1 + 1; r2 < state.n; r2++) {
      if (state.board[r2] === -1) continue;
      if (state.board[r1] === state.board[r2] || Math.abs(state.board[r1] - state.board[r2]) === Math.abs(r1 - r2)) {
        currentConflicts.push({ r1, r2 });
      }
    }
  }

  if (currentConflicts.length > 0) {
    addTutorMessage({ type: 'warning', text: '⚠️ Your board has conflicts! Remove the conflicting queens first, then ask for a hint.' });
    return;
  }

  const hint = computeHint(state.board, state.n);
  if (hint) {
    state.hintCell = hint;
    setCellState(hint.row, hint.col, 'hint-cell');
    addTutorMessage(TUTOR.hintMessage(hint.row, hint.col));
  } else {
    addTutorMessage(TUTOR.hintUnavailable());
  }
}

function onStartClick() {
  if (state.mode === 'manual') return;

  if (state.isPaused) {
    state.isPaused = false;
    runAnimation();
    return;
  }

  if (state.isPlaying || state.isSolved) return;

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
  state.manualMoveCount = 0;
  state.hintCell = null;
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

  const welcomeMsgs = TUTOR.welcome(state.mode, state.n);
  addTutorMessages(welcomeMsgs);
  factEngine.showFact();
}

function onModeChange(mode) {
  if (mode === state.mode) return;
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

  state.board = new Array(state.n).fill(-1);

  factEngine.init();
  confetti.init();

  renderBoard();
  updateStats();
  updatePlaybackButtons();
  updateAlgoState(null, null, 'Idle', 0);
  updateCodeHighlight('');

  const welcomeMsgs = TUTOR.welcome(state.mode, state.n);
  addTutorMessages(welcomeMsgs);
  factEngine.showFact();

  // Event Listeners
  DOM.startBtn.addEventListener('click', onStartClick);
  DOM.pauseBtn.addEventListener('click', onPauseClick);
  DOM.stepBtn.addEventListener('click', onStepClick);
  DOM.hintBtn.addEventListener('click', onHintClick);
  DOM.resetBtn.addEventListener('click', onResetClick);
  DOM.speedSlider.addEventListener('input', (e) => onSpeedChange(e.target.value));
  DOM.boardSizeSelect.addEventListener('change', (e) => onBoardSizeChange(e.target.value));

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => onModeChange(btn.dataset.mode));
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderBoard();
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

document.addEventListener('DOMContentLoaded', init);
