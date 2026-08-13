// ==========================================================================
// script.js — logika alur website. Isi/teks diatur lewat data.js (CONFIG).
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    initBubbles();
    fillStaticText();
    initScrollReveal();
    runLoadingStage();
});

/* ---------------------------------------------------------------------- */
/* helpers untuk pindah panggung                                          */
/* ---------------------------------------------------------------------- */
function goToStage(id) {
    document.querySelectorAll(".stage").forEach((el) => {
        const active = el.id === id;
        el.hidden = !active;
        el.style.display = active ? "flex" : "none"; // jaga-jaga kalau CSS ke-override
    });
    const target = document.getElementById(id);
    if (target) {
        target.style.animation = "none";
        void target.offsetWidth; // restart animasi fade-in
        target.style.animation = "";
        window.scrollTo(0, 0);
    }
}

/* ---------------------------------------------------------------------- */
/* isi teks statis dari CONFIG                                            */
/* ---------------------------------------------------------------------- */
function fillStaticText() {
    const $ = (id) => document.getElementById(id);

    $("loading-eyebrow").textContent = CONFIG.loading.eyebrow;
    $("loading-title").innerHTML = CONFIG.loading.title;
    $("loading-subtitle").textContent = CONFIG.loading.subtitle;

    $("game-title").textContent = CONFIG.game.title;
    $("game-instruction").textContent = CONFIG.game.instruction;

    $("menu-title").textContent = CONFIG.menu.title;
    $("menu-subtitle").textContent = CONFIG.menu.subtitle;
    $("menu-label-memories").textContent = CONFIG.menu.memoriesLabel;
    $("menu-label-gift").textContent = CONFIG.menu.giftLabel;

    $("memories-title").textContent = CONFIG.memories.title;

    $("gift-title").textContent = CONFIG.gift.title;
    $("letter-text").textContent = CONFIG.gift.letter;
    $("letter-signoff").textContent = CONFIG.gift.signoff;

    document.getElementById("btn-go-memories").addEventListener("click", () => {
        renderGallery("gallery", CONFIG.memories.photos);
        goToStage("stage-memories");
    });
    document.getElementById("btn-go-gift").addEventListener("click", () => {
        renderGallery("gift-gallery", CONFIG.gift.photos);
        goToStage("stage-gift");
    });
    document.getElementById("back-from-memories").addEventListener("click", () => goToStage("stage-menu"));
    document.getElementById("back-from-gift").addEventListener("click", () => goToStage("stage-menu"));
}

/* ---------------------------------------------------------------------- */
/* stage 1 — loading                                                      */
/* ---------------------------------------------------------------------- */
function runLoadingStage() {
    const fill = document.getElementById("loading-fill");
    const percent = document.getElementById("loading-percent");
    const duration = CONFIG.loading.durationMs;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const pct = Math.round(progress * 100);
        fill.style.width = pct + "%";
        percent.textContent = pct + "%";
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(() => {
                goToStage("stage-game");
                initTetris();
            }, 250);
        }
    }
    requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------------- */
/* stage 2 — mini game: Susun Baris (Tetris)                              */
/* ---------------------------------------------------------------------- */
const TETROMINOES = {
    I: { shape: [[1, 1, 1, 1]], color: "var(--neon-cyan)" },
    O: { shape: [[1, 1], [1, 1]], color: "var(--neon-yellow)" },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: "var(--neon-purple)" },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: "var(--neon-green)" },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "var(--neon-pink)" },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: "var(--neon-blue)" },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: "var(--neon-orange)" }
};

let tetris = null; // seluruh state permainan, dibuat ulang tiap masuk stage game
let tetrisControlsBound = false;

function initTetris() {
    const cols = CONFIG.game.columns;
    const rows = CONFIG.game.rows;
    const board = document.getElementById("tetris-board");
    board.innerHTML = "";
    board.style.setProperty("--cols", cols);
    board.style.setProperty("--rows", rows);

    const cells = [];
    for (let r = 0; r < rows; r++) {
        const rowCells = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.className = "tetris-cell";
            board.appendChild(cell);
            rowCells.push(cell);
        }
        cells.push(rowCells);
    }

    if (tetris && tetris.timer) clearInterval(tetris.timer);

    tetris = {
        cols,
        rows,
        cells,
        grid: Array.from({ length: rows }, () => Array(cols).fill(null)),
        linesCleared: 0,
        timer: null,
        piece: null,
        gameOver: false
    };

    updateTetrisStatus();
    spawnTetrisPiece();
    tetris.timer = setInterval(() => moveTetris(1, 0), CONFIG.game.dropIntervalMs);

    bindTetrisControlsOnce();
}

function randomTetrominoKey() {
    const keys = Object.keys(TETROMINOES);
    return keys[Math.floor(Math.random() * keys.length)];
}

function spawnTetrisPiece() {
    const def = TETROMINOES[randomTetrominoKey()];
    const shape = def.shape.map((row) => row.slice());
    const col = Math.floor((tetris.cols - shape[0].length) / 2);
    tetris.piece = { shape, color: def.color, row: 0, col };

    if (checkTetrisCollision(shape, tetris.piece.row, tetris.piece.col)) {
        // papan penuh: bersihkan biar tidak macet dan tetap seru
        tetris.grid = tetris.grid.map((row) => row.map(() => null));
    }
    drawTetris();
}

function rotateMatrix(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = shape[r][c];
        }
    }
    return rotated;
}

function checkTetrisCollision(shape, row, col) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const gr = row + r;
            const gc = col + c;
            if (gc < 0 || gc >= tetris.cols || gr >= tetris.rows) return true;
            if (gr >= 0 && tetris.grid[gr][gc]) return true;
        }
    }
    return false;
}

function moveTetris(dr, dc) {
    if (!tetris || tetris.gameOver) return;
    const p = tetris.piece;
    const newRow = p.row + dr;
    const newCol = p.col + dc;
    if (!checkTetrisCollision(p.shape, newRow, newCol)) {
        p.row = newRow;
        p.col = newCol;
        drawTetris();
    } else if (dr === 1) {
        // sudah menyentuh dasar atau tumpukan lain — kunci di tempat
        lockTetrisPiece();
    }
}

function rotateTetris() {
    if (!tetris || tetris.gameOver) return;
    const p = tetris.piece;
    const rotated = rotateMatrix(p.shape);
    const kicks = [0, -1, 1, -2, 2]; // coba geser kalau kena tembok saat rotasi
    for (const k of kicks) {
        if (!checkTetrisCollision(rotated, p.row, p.col + k)) {
            p.shape = rotated;
            p.col += k;
            drawTetris();
            return;
        }
    }
}

function hardDropTetris() {
    if (!tetris || tetris.gameOver) return;
    while (!checkTetrisCollision(tetris.piece.shape, tetris.piece.row + 1, tetris.piece.col)) {
        tetris.piece.row += 1;
    }
    lockTetrisPiece();
}

function lockTetrisPiece() {
    const p = tetris.piece;
    p.shape.forEach((row, r) => {
        row.forEach((val, c) => {
            if (val && p.row + r >= 0) {
                tetris.grid[p.row + r][p.col + c] = p.color;
            }
        });
    });
    clearTetrisLines();
    if (!tetris.gameOver) spawnTetrisPiece();
}

function clearTetrisLines() {
    let cleared = 0;
    for (let r = tetris.rows - 1; r >= 0; r--) {
        if (tetris.grid[r].every((cell) => cell)) {
            tetris.grid.splice(r, 1);
            tetris.grid.unshift(Array(tetris.cols).fill(null));
            cleared++;
            r++; // cek lagi baris yang sama setelah baris di atasnya turun
        }
    }
    if (cleared > 0) {
        tetris.linesCleared += cleared;
        updateTetrisStatus();
        launchConfetti();
        if (tetris.linesCleared >= CONFIG.game.linesToClear) {
            winTetris();
        }
    }
}

function winTetris() {
    tetris.gameOver = true;
    clearInterval(tetris.timer);
    const statusEl = document.getElementById("tetris-status");
    statusEl.textContent = CONFIG.game.clearedMessage;
    statusEl.style.color = "var(--neon-pink)";
    setTimeout(() => goToStage("stage-menu"), 1400);
}

function updateTetrisStatus() {
    const statusEl = document.getElementById("tetris-status");
    statusEl.textContent = "BARIS " + tetris.linesCleared + " / " + CONFIG.game.linesToClear;
    statusEl.style.color = "var(--neon-yellow)";
}

function drawTetris() {
    const { grid, cells, piece, rows, cols } = tetris;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = cells[r][c];
            const filled = grid[r][c];
            cell.style.background = filled || "";
            cell.classList.toggle("filled", Boolean(filled));
        }
    }
    piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
            const gr = piece.row + r;
            const gc = piece.col + c;
            if (val && gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
                const cell = cells[gr][gc];
                cell.style.background = piece.color;
                cell.classList.add("filled");
            }
        });
    });
}

function bindTetrisControlsOnce() {
    if (tetrisControlsBound) return;
    tetrisControlsBound = true;

    document.getElementById("tetris-left").addEventListener("click", () => moveTetris(0, -1));
    document.getElementById("tetris-right").addEventListener("click", () => moveTetris(0, 1));
    document.getElementById("tetris-rotate").addEventListener("click", () => rotateTetris());
    document.getElementById("tetris-drop").addEventListener("click", () => hardDropTetris());

    // kontrol keyboard (untuk yang tes di komputer)
    document.addEventListener("keydown", (e) => {
        const stageGame = document.getElementById("stage-game");
        if (!tetris || tetris.gameOver || stageGame.hidden) return;
        if (e.key === "ArrowLeft") moveTetris(0, -1);
        else if (e.key === "ArrowRight") moveTetris(0, 1);
        else if (e.key === "ArrowDown") moveTetris(1, 0);
        else if (e.key === "ArrowUp") rotateTetris();
        else if (e.key === " ") { e.preventDefault(); hardDropTetris(); }
    });
}

/* konfeti sederhana saat satu baris berhasil disusun */
function launchConfetti() {
    const colors = ["#ff3cac", "#2ee6d6", "#f9f871", "#39ff88", "#9d4dff"];
    const count = 40;
    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
        piece.style.opacity = String(0.7 + Math.random() * 0.3);
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 3400);
    }
}

/* ---------------------------------------------------------------------- */
/* galeri foto (dipakai di stage kenangan & stage hadiah)                 */
/* ---------------------------------------------------------------------- */
function renderGallery(containerId, photos) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    photos.forEach((photo, index) => {
        const fig = document.createElement("figure");
        // selang-seling arah masuk: genap dari kiri, ganjil dari kanan
        const direction = index % 2 === 0 ? "reveal-left" : "reveal-right";
        fig.className = "polaroid reveal-item " + direction;
        // jeda bertahap tiap foto biar tidak muncul barengan
        fig.style.transitionDelay = (index * 0.08) + "s";

        const img = document.createElement("img");
        img.src = photo.src;
        img.alt = photo.caption || "";
        img.loading = "lazy";

        const cap = document.createElement("figcaption");
        cap.textContent = photo.caption || "";

        fig.appendChild(img);
        fig.appendChild(cap);
        container.appendChild(fig);
    });
    initScrollReveal(container);
}

/* ---------------------------------------------------------------------- */
/* scroll reveal — animasi muncul saat elemen di-scroll ke layar (untuk HP)*/
/* ---------------------------------------------------------------------- */
let revealObserver;
function getRevealObserver() {
    if (!revealObserver) {
        revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // toggle: animasi replay tiap kali elemen masuk/keluar layar
                    entry.target.classList.toggle("in-view", entry.isIntersecting);
                });
            },
            { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
        );
    }
    return revealObserver;
}

function initScrollReveal(root = document) {
    const observer = getRevealObserver();
    root.querySelectorAll(".reveal-item").forEach((el) => {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = "true";
        observer.observe(el);
    });
}

/* ---------------------------------------------------------------------- */
/* gelembung ambient di background                                        */
/* ---------------------------------------------------------------------- */
function initBubbles() {
    const wrap = document.getElementById("bubbles");
    const count = 18;
    for (let i = 0; i < count; i++) {
        const b = document.createElement("span");
        b.className = "bubble";
        const size = 4 + Math.random() * 12;
        b.style.width = size + "px";
        b.style.height = size + "px";
        b.style.left = Math.random() * 100 + "%";
        b.style.setProperty("--drift", (Math.random() * 40 - 20) + "px");
        b.style.animationDuration = 6 + Math.random() * 10 + "s";
        b.style.animationDelay = Math.random() * 10 + "s";
        wrap.appendChild(b);
    }
}
//  function widget music
window.addEventListener('load', () => {
    const widget = document.getElementById('music-widget');
    const audio = document.getElementById('bg-music');

    // Autoplay musik saat loading selesai (Opsional, tergantung aturan browser)
    audio.play().then(() => {
        widget.classList.add('playing');
    }).catch(() => {
        // Kebijakan browser sering memblokir autoplay audio tanpa interaksi user
        console.log("Autoplay diblokir browser, klik widget untuk memutar.");
    });

    // Otomatis ubah pop-up menjadi icon piringan berputar setelah 4 detik
    setTimeout(() => {
        widget.classList.remove('expanded');
    }, 4000);

    // Toggle buka/tutup info & play/pause saat diklik
    widget.addEventListener('click', () => {
        // Jika sedang ciut, buka keterangannya
        if (!widget.classList.contains('expanded')) {
            widget.classList.add('expanded');
        } else {
            // Jika diklik saat terbuka, toggle play/pause audio
            if (audio.paused) {
                audio.play();
                widget.classList.add('playing');
            } else {
                audio.pause();
                widget.classList.remove('playing');
            }
        }
    });
});
