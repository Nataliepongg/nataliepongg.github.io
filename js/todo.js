class TodoList {
    constructor() {
        // Initialize todos from localStorage, or an empty array if none exist
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.itemsLeft = document.getElementById('items-left');
        this.filter = 'active';  // Default filter is 'active'
        
        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        // Add todo event listener
        document.getElementById('add-todo').addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Clear completed tasks event listener
        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompleted());
        
        // Filter buttons event listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                
                // Add active class to the clicked button
                e.target.classList.add('active');
                
                // Set the filter based on the button's data-filter attribute
                this.filter = e.target.dataset.filter;
                this.render();
            });
        });

        // Set the default 'active' button as active on page load
        document.querySelector(`.filter-btn[data-filter="active"]`).classList.add('active');
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (text) {
            this.todos.push({
                id: Date.now(),
                text: text,
                completed: false
            });
            this.todoInput.value = '';
            this.saveTodos();
            this.render();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    render() {
        this.todoList.innerHTML = '';
        
        // Filter the todos based on the active filter
        const filteredTodos = this.todos.filter(todo => {
            if (this.filter === 'active') return !todo.completed;
            if (this.filter === 'completed') return todo.completed;
            return true;
        });

        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.innerHTML = `
                <div class="checkbox-wrapper-46">
                    <input type="checkbox" id="cbx-${todo.id}" class="inp-cbx" ${todo.completed ? 'checked' : ''} />
                    <label for="cbx-${todo.id}" class="cbx">
                        <span>
                            <svg viewBox="0 0 12 10" height="10px" width="12px">
                                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                            </svg>
                        </span>
                        <span>${todo.text}</span>
                    </label>
                </div>
                <button class="delete-btn" aria-label="Delete todo">&times;</button>
            `;
    
            const checkbox = todoItem.querySelector(`#cbx-${todo.id}`);
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
    
            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
    
            this.todoList.appendChild(todoItem);
        });
    
        // Update the "items left" count
        const activeTodos = this.todos.filter(t => !t.completed);
        this.itemsLeft.textContent = `${activeTodos.length} items left`;
    }
}

// Initialize the todo list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});
