class Whiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.color = '#000000';
        this.size = 5;
        this.textBoxes = [];
        this.draggedTextBox = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.initializeCanvas();
        this.initializeTools();
        this.addEventListeners();
    }

    initializeCanvas() {
        const resize = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.canvasRect = this.canvas.getBoundingClientRect();
        };
        
        resize();
        window.addEventListener('resize', () => {
            resize();
            this.canvasRect = this.canvas.getBoundingClientRect();
        });
    }

    initializeTools() {
        this.penButton = document.getElementById('pen-tool');
        this.eraserButton = document.getElementById('eraser-tool');
        this.colorPicker = document.getElementById('color-picker');
        this.sizeSlider = document.getElementById('size-slider');
        this.clearButton = document.getElementById('clear-board');
        this.addTextBoxButton = document.getElementById('add-textbox');
    }

    addEventListeners() {
        // Drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(this.getMousePos(e)));
        this.canvas.addEventListener('mousemove', (e) => this.draw(this.getMousePos(e)));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(this.getTouchPos(e));
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(this.getTouchPos(e));
        });
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Tool events
        this.penButton.addEventListener('click', () => this.setTool('pen'));
        this.eraserButton.addEventListener('click', () => this.setTool('eraser'));
        this.colorPicker.addEventListener('input', (e) => this.color = e.target.value);
        this.sizeSlider.addEventListener('input', (e) => this.size = e.target.value);
        this.clearButton.addEventListener('click', () => this.clearBoard());
        this.addTextBoxButton.addEventListener('click', () => this.createTextBox());

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    getMousePos(e) {
        this.canvasRect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - this.canvasRect.left,
            y: e.clientY - this.canvasRect.top
        };
    }

    getTouchPos(e) {
        this.canvasRect = this.canvas.getBoundingClientRect();
        return {
            x: e.touches[0].clientX - this.canvasRect.left,
            y: e.touches[0].clientY - this.canvasRect.top
        };
    }

    setTool(tool) {
        this.currentTool = tool;
        this.penButton.classList.toggle('active', tool === 'pen');
        this.eraserButton.classList.toggle('active', tool === 'eraser');
    }

    startDrawing(pos) {
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? 'white' : this.color;
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }

    draw(pos) {
        if (!this.isDrawing) return;

        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? 'white' : this.color;
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    createTextBox() {
        const container = document.querySelector('.whiteboard-container');
        const textBox = document.createElement('div');
        textBox.className = 'text-box';
        
        // Set initial position
        textBox.style.left = '20px';
        textBox.style.top = '20px';

        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Type your note here...';

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => this.deleteTextBox(textBox));

        // Add drag functionality
        textBox.addEventListener('mousedown', (e) => {
            if (e.target === textarea) return;
            this.startDrag(e, textBox);
        });

        textBox.appendChild(textarea);
        textBox.appendChild(deleteBtn);
        container.appendChild(textBox);
        this.textBoxes.push(textBox);

        // Focus the textarea
        textarea.focus();
    }

    startDrag(e, textBox) {
        this.draggedTextBox = textBox;
        const rect = textBox.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleDrag(e) {
        if (!this.draggedTextBox) return;

        const container = document.querySelector('.whiteboard-container');
        const containerRect = container.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - this.dragOffset.x;
        let newY = e.clientY - containerRect.top - this.dragOffset.y;

        // Constrain to container bounds
        newX = Math.max(0, Math.min(newX, containerRect.width - this.draggedTextBox.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - this.draggedTextBox.offsetHeight));

        this.draggedTextBox.style.left = `${newX}px`;
        this.draggedTextBox.style.top = `${newY}px`;
    }

    stopDrag() {
        this.draggedTextBox = null;
    }

    deleteTextBox(textBox) {
        textBox.remove();
        this.textBoxes = this.textBoxes.filter(box => box !== textBox);
    }

    clearBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Clear text boxes
        this.textBoxes.forEach(box => box.remove());
        this.textBoxes = [];
    }
}

// Initialize whiteboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Whiteboard();
});