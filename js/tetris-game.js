class Tetris {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('tetris-score');
        
        // Game dimensions
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 36; // Increased cell size
        
        // Set canvas size
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
        
        // Game state
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000; // Start with 1 second interval
        this.lastTime = 0;
        
        // Current piece
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Initialize
        this.resize();
        this.setupControls();
        this.colors = [
            null,
            '#FF0D72', // T
            '#0DC2FF', // I
            '#0DFF72', // O
            '#F538FF', // L
            '#FF8E0D', // J
            '#FFE138', // S
            '#3877FF'  // Z
        ];
        
        this.pieces = {
            'T': [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            'I': [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ],
            'O': [
                [3, 3],
                [3, 3]
            ],
            'L': [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 4]
            ],
            'J': [
                [0, 5, 0],
                [0, 5, 0],
                [5, 5, 0]
            ],
            'S': [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ],
            'Z': [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ]
        };
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    }

    createPiece() {
        const pieces = 'TIOLJS';
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            pos: {x: Math.floor(this.cols / 2) - 1, y: 0},
            matrix: this.pieces[piece],
            color: this.colors[this.pieces[piece][0].find(value => value !== 0) || 0]
        };
    }

    setupControls() {
        document.addEventListener('keydown', (event) => {
            if (this.isGameOver || this.isPaused) return;

            switch(event.code) {
                case 'ArrowLeft':
                    this.moveCurrentPiece(-1);
                    break;
                case 'ArrowRight':
                    this.moveCurrentPiece(1);
                    break;
                case 'ArrowDown':
                    this.dropCurrentPiece();
                    break;
                case 'ArrowUp':
                    this.rotateCurrentPiece();
                    break;
                case 'Space':
                    this.hardDrop();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });
    }

    moveCurrentPiece(dir) {
        this.currentPiece.pos.x += dir;
        if (this.checkCollision()) {
            this.currentPiece.pos.x -= dir;
        }
    }

    checkCollision() {
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0 &&
                    (this.grid[y + pos.y] &&
                    this.grid[y + pos.y][x + pos.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    rotate(matrix) {
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                rotated[x][N - 1 - y] = matrix[y][x];
            }
        }
        return rotated;
    }

    rotateCurrentPiece() {
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = this.rotate(this.currentPiece.matrix);
        
        if (this.checkCollision()) {
            this.currentPiece.matrix = originalMatrix;
        }
    }

    dropCurrentPiece() {
        this.currentPiece.pos.y++;
        if (this.checkCollision()) {
            this.currentPiece.pos.y--;
            this.mergePiece();
            this.checkLines();
            this.resetPiece();
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.pos.y++;
        }
        this.currentPiece.pos.y--;
        this.mergePiece();
        this.checkLines();
        this.resetPiece();
    }

    mergePiece() {
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + pos.y][x + pos.x] = value;
                }
            });
        });
    }

    checkLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(value => value !== 0)) {
                // Remove the line
                const row = this.grid.splice(y, 1)[0];
                this.grid.unshift(row.fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.score += [40, 100, 300, 1200][linesCleared - 1] * (Math.floor(this.score / 500) + 1);
            this.scoreElement.textContent = this.score;
            this.dropInterval = Math.max(100, 1000 - (Math.floor(this.score / 500) * 100));
        }
    }

    resetPiece() {
        this.currentPiece = this.nextPiece || this.createPiece();
        this.nextPiece = this.createPiece();
        
        if (this.checkCollision()) {
            this.isGameOver = true;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = 0;
            this.animate();
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, 
                                    this.cellSize - 1, this.cellSize - 1);
                }
            });
        });
        
        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.ctx.fillStyle = this.currentPiece.color;
                        this.ctx.fillRect((x + this.currentPiece.pos.x) * this.cellSize,
                                        (y + this.currentPiece.pos.y) * this.cellSize,
                                        this.cellSize - 1, this.cellSize - 1);
                    }
                });
            });
        }

        // Draw game over
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '2em Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '1.5em Arial';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }

        // Draw pause screen
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '2em Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    animate(time = 0) {
        if (this.isPaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropCurrentPiece();
        }
        
        this.draw();
        if (!this.isGameOver) {
            requestAnimationFrame((time) => this.animate(time));
        }
    }

    start() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.dropInterval = 1000;
        this.scoreElement.textContent = '0';
        this.resetPiece();
        this.lastTime = 0;
        this.animate();
    }
}

let tetrisGame;

function initTetris() {
    if (tetrisGame) {
        tetrisGame = null;
    }
    tetrisGame = new Tetris('tetris-canvas');
    tetrisGame.start();
}

// Add event listener for restart
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR' && tetrisGame && tetrisGame.isGameOver) {
        tetrisGame.start();
    }
});