class TodoApp {
    constructor() {
        this.tasks = {
            large: [],
            medium: [],
            small: []
        };
        
        this.limits = {
            large: 1,
            medium: 3,
            small: 5
        };
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateProgress();
        this.updateAllTaskLists();
    }
    
    bindEvents() {
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.add-task-btn').dataset.category;
                this.addTask(category);
            });
        });
        
        document.querySelectorAll('.task-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const category = e.target.id.replace('TaskInput', '').toLowerCase();
                    this.addTask(category);
                }
            });
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAllTasks();
        });
        
        document.querySelectorAll('.task-column').forEach(column => {
            column.addEventListener('dblclick', (e) => {
                const category = column.classList.contains('task-column--large') ? 'large' :
                               column.classList.contains('task-column--medium') ? 'medium' : 'small';
                this.enterFocusMode(category);
            });
        });
        
        document.getElementById('focusExit').addEventListener('click', () => {
            this.exitFocusMode();
        });
        
        document.getElementById('motivationalMessage').addEventListener('click', () => {
            this.hideMotivationalMessage();
        });
    }
    
    addTask(category) {
        const input = document.getElementById(`${category}TaskInput`);
        const text = input.value.trim();
        
        if (!text) {
            this.showError('Please enter a task');
            return;
        }
        
        if (this.tasks[category].length >= this.limits[category]) {
            this.showError(`Maximum ${this.limits[category]} ${category} task${this.limits[category] > 1 ? 's' : ''} allowed`);
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            category: category,
            createdAt: new Date()
        };
        
        this.tasks[category].push(task);
        input.value = '';
        
        this.updateTaskList(category);
        this.saveToStorage();
        this.updateInputState(category);
        
        setTimeout(() => {
            this.updateProgress();
        }, 10);
        
        this.showSuccess('Task added successfully!');
    }
    
    toggleTask(taskId, category) {
        const task = this.tasks[category].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateTaskList(category);
            this.updateProgress();
            this.saveToStorage();
            
            if (this.getAllCompletedCount() === this.getTotalTaskCount() && this.getTotalTaskCount() > 0) {
                this.celebrateCompletion();
            }
        }
    }
    
    deleteTask(taskId, category) {
        this.tasks[category] = this.tasks[category].filter(t => t.id !== taskId);
        this.updateTaskList(category);
        this.updateProgress();
        this.saveToStorage();
        this.updateInputState(category);
    }
    
    updateTaskList(category) {
        const container = document.getElementById(`${category}TaskList`);
        container.innerHTML = '';
        
        this.tasks[category].forEach(task => {
            const taskElement = this.createTaskElement(task, category);
            container.appendChild(taskElement);
        });
    }
    
    updateAllTaskLists() {
        ['large', 'medium', 'small'].forEach(category => {
            this.updateTaskList(category);
            this.updateInputState(category);
        });
    }
    
    createTaskElement(task, category) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="app.toggleTask(${task.id}, '${category}')"></div>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="app.deleteTask(${task.id}, '${category}')" 
                    title="Delete task">×</button>
        `;
        return taskDiv;
    }
    
    updateProgress() {
        const completed = this.getAllCompletedCount();
        const total = this.getTotalTaskCount();
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('progressPercentage').textContent = `${percentage}%`;
        
        const progressText = document.querySelector('.progress-text');
        progressText.innerHTML = `Progress: <span id="completedCount">${completed}</span>/${total} tasks`;
        
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
    }
    
    updateInputState(category) {
        const input = document.getElementById(`${category}TaskInput`);
        const button = input.nextElementSibling;
        const isAtLimit = this.tasks[category].length >= this.limits[category];
        
        input.disabled = isAtLimit;
        button.disabled = isAtLimit;
        
        if (isAtLimit) {
            input.placeholder = `Maximum ${this.limits[category]} ${category} task${this.limits[category] > 1 ? 's' : ''} reached`;
        } else {
            const placeholders = {
                large: "What's your big priority today?",
                medium: "Add a medium priority task",
                small: "Add a small task"
            };
            input.placeholder = placeholders[category];
        }
    }
    
    getAllCompletedCount() {
        return Object.values(this.tasks).flat().filter(task => task.completed).length;
    }
    
    getTotalTaskCount() {
        return Object.values(this.tasks).flat().length;
    }
    
    celebrateCompletion() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        setTimeout(() => {
            this.showMotivationalMessage();
        }, 500);
        
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 1000);
    }
    
    showMotivationalMessage() {
        const message = document.getElementById('motivationalMessage');
        message.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideMotivationalMessage();
        }, 5000);
    }
    
    hideMotivationalMessage() {
        document.getElementById('motivationalMessage').classList.add('hidden');
    }
    
    resetAllTasks() {
        const totalTasks = this.getTotalTaskCount();
        
        if (totalTasks === 0) {
            this.showError('No tasks to reset');
            return;
        }
        
        const shouldReset = confirm(`Are you sure you want to reset all ${totalTasks} tasks? This cannot be undone.`);
        
        if (shouldReset) {
            this.tasks.large = [];
            this.tasks.medium = [];
            this.tasks.small = [];
            
            this.updateAllTaskLists();
            this.updateProgress();
            this.saveToStorage();
            
            this.hideMotivationalMessage();
            
            this.showSuccess('All tasks have been reset successfully!');
        }
    }
    
    enterFocusMode(category) {
        const focusOverlay = document.getElementById('focusOverlay');
        const focusColumn = document.getElementById('focusColumn');
        const originalColumn = document.querySelector(`.task-column--${category}`);
        
        focusColumn.innerHTML = originalColumn.innerHTML;
        focusOverlay.classList.remove('hidden');
        
        this.bindFocusEvents(category);
    }
    
    bindFocusEvents(category) {
        const focusColumn = document.getElementById('focusColumn');
        
        const addBtn = focusColumn.querySelector('.add-task-btn');
        const input = focusColumn.querySelector('.task-input');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const text = input.value.trim();
                if (text && this.tasks[category].length < this.limits[category]) {
                    this.addTask(category);
                    setTimeout(() => {
                        if (!document.getElementById('focusOverlay').classList.contains('hidden')) {
                            this.enterFocusMode(category);
                        }
                    }, 100);
                }
            });
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addBtn.click();
                }
            });
        }
    }
    
    exitFocusMode() {
        document.getElementById('focusOverlay').classList.add('hidden');
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('todoApp_lastSaved', Date.now().toString());
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const savedTasks = localStorage.getItem('todoApp_tasks');
            if (savedTasks) {
                const parsedTasks = JSON.parse(savedTasks);
                this.tasks = {
                    large: parsedTasks.large || [],
                    medium: parsedTasks.medium || [],
                    small: parsedTasks.small || []
                };
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
            this.tasks = { large: [], medium: [], small: [] };
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            background-color: ${type === 'success' ? '#A3B565' : '#d64545'};
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});

window.TodoApp = TodoApp;