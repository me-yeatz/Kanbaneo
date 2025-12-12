// ===== CONFIGURATION =====
const CONFIG = {
    STORAGE_KEY: 'neon-kanban-data',
    AI_SUGGESTIONS: {
        development: [
            "Write unit tests for login module",
            "Optimize database queries for faster response",
            "Implement dark/light theme toggle",
            "Add loading skeleton screens",
            "Set up CI/CD pipeline",
            "Write API documentation",
            "Refactor legacy components",
            "Add error boundary to React components",
            "Implement lazy loading for images",
            "Create reusable button component library"
        ],
        general: [
            "Review project documentation",
            "Conduct user testing session",
            "Update project dependencies",
            "Create project roadmap for next quarter",
            "Write weekly progress report",
            "Organize team meeting agenda",
            "Backup important project files",
            "Clean up email inbox",
            "Update LinkedIn profile",
            "Learn a new programming concept"
        ]
    },
    DEFAULT_COLUMNS: [
        { id: 'todo', name: 'To Do', color: '#00ffff', icon: 'bi-list-check' },
        { id: 'inprogress', name: 'In Progress', color: '#ffff00', icon: 'bi-lightning-charge' },
        { id: 'review', name: 'Review', color: '#ff00ff', icon: 'bi-eye' },
        { id: 'onhold', name: 'On Hold', color: '#ff5500', icon: 'bi-pause' },
        { id: 'done', name: 'Done', color: '#00ff00', icon: 'bi-check-circle' }
    ]
};

// ===== STATE MANAGEMENT =====
let state = {
    tasks: [],
    columns: [...CONFIG.DEFAULT_COLUMNS],
    theme: localStorage.getItem('theme') || 'dark',
    nextTaskId: 1
};

// ===== DOM ELEMENTS =====
const elements = {
    // Header
    kanbanBoard: document.getElementById('kanban-board'),
    addTaskBtn: document.getElementById('add-task-btn'),
    addColumnBtn: document.getElementById('add-column-btn'),
    newNoteBtn: document.getElementById('new-note-btn'),
    aiSuggestBtn: document.getElementById('ai-suggest-btn'),
    themeToggle: document.getElementById('theme-toggle'),

    // Stats
    totalTasks: document.getElementById('total-tasks'),
    completedToday: document.getElementById('completed-today'),

    // Modals
    taskModal: document.getElementById('task-modal'),
    columnModal: document.getElementById('column-modal'),
    confirmModal: document.getElementById('confirm-modal'),

    // Forms
    taskForm: document.getElementById('task-form'),
    columnForm: document.getElementById('column-form'),

    // AI Panel
    aiPanel: document.getElementById('ai-panel'),
    aiClose: document.querySelector('.ai-close'),
    refreshAI: document.getElementById('refresh-ai'),
    addAllAI: document.getElementById('add-all-ai'),

    // Empty State
    emptyState: document.getElementById('empty-state'),
    addFirstTask: document.getElementById('add-first-task'),
    useAISuggestions: document.getElementById('use-ai-suggestions'),

    // Footer
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),
    helpBtn: document.getElementById('help-btn'),

    // Help
    shortcutsHelp: document.getElementById('shortcuts-help'),
    closeHelp: document.getElementById('close-help')
};

// ===== INITIALIZATION =====
function init() {
    loadState();
    setupEventListeners();
    renderBoard();
    setupTheme();
    setupKeyboardShortcuts();
    showToast('Welcome to Neon Kanban AI! 🚀', 'success');
}

// ===== STATE MANAGEMENT =====
function saveState() {
    const data = {
        tasks: state.tasks,
        columns: state.columns,
        theme: state.theme,
        nextTaskId: state.nextTaskId
    };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        state.tasks = data.tasks || [];
        state.columns = data.columns || CONFIG.DEFAULT_COLUMNS;
        state.theme = data.theme || 'dark';
        state.nextTaskId = data.nextTaskId || 1;
    }
    updateStats();
}

// ===== RENDERING =====
function renderBoard() {
    const hasTasks = state.tasks.length > 0;
    elements.emptyState.style.display = hasTasks ? 'none' : 'flex';
    elements.kanbanBoard.style.display = hasTasks ? 'grid' : 'none';

    if (!hasTasks) return;

    elements.kanbanBoard.innerHTML = '';

    state.columns.forEach(column => {
        const columnTasks = state.tasks.filter(task => task.columnId === column.id);

        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        columnEl.dataset.columnId = column.id;
        columnEl.style.borderColor = column.color;

        const isDefaultColumn = CONFIG.DEFAULT_COLUMNS.some(col => col.id === column.id);

        columnEl.innerHTML = `
            <div class="column-header" style="border-color: ${column.color}">
                <h2 class="column-title">
                    <i class="bi ${column.icon}"></i>
                    ${column.name}
                </h2>
                <div class="column-header-actions">
                    <span class="task-count">${columnTasks.length}</span>
                    ${!isDefaultColumn ? `<button class="column-delete-btn" data-column-id="${column.id}" title="Delete Column"><i class="bi bi-trash"></i></button>` : ''}
                </div>
            </div>
            <div class="column-content" data-column="${column.id}">
                ${columnTasks.map(task => createTaskHTML(task)).join('')}
                <div class="add-task-placeholder">
                    <button class="add-task-inline" data-column="${column.id}">
                        <i class="bi bi-plus"></i> Add Task
                    </button>
                </div>
            </div>
        `;

        elements.kanbanBoard.appendChild(columnEl);
    });

    setupDragAndDrop();
    attachTaskEvents();
    attachColumnEvents();
}

function createTaskHTML(task) {
    const priorityClass = task.priority || 'medium';
    const date = new Date(task.createdAt).toLocaleDateString();

    return `
        <div class="task-card" data-task-id="${task.id}" draggable="true">
            <div class="task-header">
                <span class="task-priority ${priorityClass}">${priorityClass}</span>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" title="Edit task">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="Delete task">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <h3 class="task-title">${escapeHTML(task.title)}</h3>
            ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
            <div class="task-footer">
                <span class="task-date">
                    <i class="bi bi-calendar"></i> ${date}
                </span>
                <span class="task-id">#${task.id}</span>
            </div>
        </div>
    `;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== TASK MANAGEMENT =====
function createTask(taskData) {
    const task = {
        id: state.nextTaskId++,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        columnId: taskData.columnId || 'todo',
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    state.tasks.push(task);
    saveState();
    updateStats();
    renderBoard();
    showToast('Task created successfully! ✨', 'success');
    return task;
}

function updateTask(taskId, updates) {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
    saveState();
    updateStats();
    renderBoard();
    return state.tasks[taskIndex];
}

function deleteTask(taskId) {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    state.tasks.splice(taskIndex, 1);
    saveState();
    updateStats();
    renderBoard();
    showToast('Task deleted', 'warning');
    return true;
}

// ===== COLUMN MANAGEMENT =====
function createColumn(columnData) {
    const column = {
        id: columnData.name.toLowerCase().replace(/\s+/g, '-'),
        name: columnData.name.trim(),
        color: columnData.color || '#00ffff',
        icon: 'bi-columns'
    };

    state.columns.push(column);
    saveState();
    renderBoard();
    showToast(`Column "${column.name}" created!`, 'success');
    return column;
}

function deleteColumn(columnId) {
    const columnIndex = state.columns.findIndex(c => c.id === columnId);
    if (columnIndex === -1) return false;

    const column = state.columns[columnIndex];

    // Move all tasks from this column to 'todo'
    state.tasks.forEach(task => {
        if (task.columnId === columnId) {
            task.columnId = 'todo';
        }
    });

    state.columns.splice(columnIndex, 1);
    saveState();
    renderBoard();
    showToast(`Column "${column.name}" deleted`, 'warning');
    return true;
}

// ===== DRAG & DROP =====
function setupDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.column-content');

    taskCards.forEach(task => {
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.dataset.taskId);
    this.classList.add('dragging');
    setTimeout(() => this.style.display = 'none', 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.display = 'block';
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const columnId = this.dataset.column;

    updateTask(taskId, { columnId });
    showToast('Task moved! 🔄', 'success');
}

// ===== AI SUGGESTIONS =====
function loadAISuggestions() {
    const developmentEl = document.querySelector('[data-category="development"]');
    const generalEl = document.querySelector('[data-category="general"]');

    developmentEl.innerHTML = CONFIG.AI_SUGGESTIONS.development
        .map((text, index) => createAISuggestionHTML(text, 'development', index))
        .join('');

    generalEl.innerHTML = CONFIG.AI_SUGGESTIONS.general
        .map((text, index) => createAISuggestionHTML(text, 'general', index))
        .join('');

    attachAISuggestionEvents();
}

function createAISuggestionHTML(text, category, index) {
    return `
        <div class="ai-suggestion" data-category="${category}" data-index="${index}">
            <div class="ai-suggestion-content">
                <span class="ai-suggestion-text">${text}</span>
                <button class="ai-add-btn" title="Add to To Do">
                    <i class="bi bi-plus-circle"></i>
                </button>
            </div>
        </div>
    `;
}

function attachAISuggestionEvents() {
    document.querySelectorAll('.ai-suggestion').forEach(suggestion => {
        const addBtn = suggestion.querySelector('.ai-add-btn');
        const text = suggestion.querySelector('.ai-suggestion-text').textContent;

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createTask({
                title: text,
                description: 'Added from AI suggestions',
                priority: 'medium',
                columnId: 'todo'
            });
            showToast('AI task added! 🤖', 'success');
        });

        suggestion.addEventListener('click', () => {
            document.getElementById('task-title').value = text;
            openModal('task');
            elements.aiPanel.classList.remove('active');
        });
    });
}

// ===== MODAL MANAGEMENT =====
function openModal(modalType, data = null) {
    closeAllModals();

    switch (modalType) {
        case 'task':
            if (data) {
                document.getElementById('task-title').value = data.title;
                document.getElementById('task-description').value = data.description;
                document.getElementById('task-priority').value = data.priority;
                document.getElementById('task-column').value = data.columnId;
                elements.taskForm.dataset.editId = data.id;
            } else {
                elements.taskForm.reset();
                delete elements.taskForm.dataset.editId;
            }
            elements.taskModal.classList.add('active');
            document.getElementById('task-title').focus();
            break;

        case 'column':
            elements.columnModal.classList.add('active');
            document.getElementById('column-name').focus();
            break;

        case 'confirm':
            if (data?.message) {
                document.getElementById('confirm-message').textContent = data.message;
            }
            elements.confirmModal.classList.add('active');
            break;
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    elements.shortcutsHelp.classList.remove('active');
    elements.aiPanel.classList.remove('active');
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
    // Task Modal
    elements.addTaskBtn.addEventListener('click', () => openModal('task'));
    elements.addFirstTask.addEventListener('click', () => openModal('task'));

    document.getElementById('close-task-modal').addEventListener('click', closeAllModals);
    document.getElementById('cancel-task').addEventListener('click', closeAllModals);

    elements.taskForm.addEventListener('submit', handleTaskSubmit);

    // Column Modal
    elements.addColumnBtn.addEventListener('click', () => openModal('column'));
    document.getElementById('close-column-modal').addEventListener('click', closeAllModals);
    document.getElementById('cancel-column').addEventListener('click', closeAllModals);

    elements.columnForm.addEventListener('submit', handleColumnSubmit);

    // New Note Button (opens task modal)
    elements.newNoteBtn.addEventListener('click', () => openModal('task'));

    // Color Picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            document.getElementById('column-color').value = option.dataset.color;
        });
    });

    // Confirmation Modal
    document.getElementById('confirm-cancel').addEventListener('click', closeAllModals);

    // AI Panel
    elements.aiSuggestBtn.addEventListener('click', () => {
        elements.aiPanel.classList.toggle('active');
        if (elements.aiPanel.classList.contains('active')) {
            loadAISuggestions();
        }
    });

    elements.aiClose.addEventListener('click', () => elements.aiPanel.classList.remove('active'));
    elements.refreshAI.addEventListener('click', loadAISuggestions);
    elements.useAISuggestions.addEventListener('click', () => elements.aiPanel.classList.add('active'));

    elements.addAllAI.addEventListener('click', () => {
        CONFIG.AI_SUGGESTIONS.development.forEach(text => {
            createTask({
                title: text,
                description: 'Added from AI suggestions',
                priority: 'medium',
                columnId: 'todo'
            });
        });
        showToast('All AI tasks added! 🚀', 'success');
        elements.aiPanel.classList.remove('active');
    });

    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Export/Import
    elements.exportBtn.addEventListener('click', exportBoard);
    elements.importBtn.addEventListener('click', () => document.getElementById('import-file')?.click());

    // Help
    elements.helpBtn.addEventListener('click', () => elements.shortcutsHelp.classList.add('active'));
    elements.closeHelp.addEventListener('click', () => elements.shortcutsHelp.classList.remove('active'));

    // Overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeAllModals);
    });

    // Initialize color picker
    document.querySelector('.color-option').classList.add('selected');
}

function handleTaskSubmit(e) {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        columnId: document.getElementById('task-column').value
    };

    if (elements.taskForm.dataset.editId) {
        const taskId = parseInt(elements.taskForm.dataset.editId);
        updateTask(taskId, taskData);
        showToast('Task updated! ✨', 'success');
    } else {
        createTask(taskData);
    }

    closeAllModals();
}

function handleColumnSubmit(e) {
    e.preventDefault();

    const columnData = {
        name: document.getElementById('column-name').value,
        color: document.getElementById('column-color').value
    };

    createColumn(columnData);
    closeAllModals();
}

function attachTaskEvents() {
    // Edit task
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.closest('.task-card').dataset.taskId);
            const task = state.tasks.find(t => t.id === taskId);
            if (task) openModal('task', task);
        });
    });

    // Delete task
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card');
            const taskId = parseInt(taskCard.dataset.taskId);
            const task = state.tasks.find(t => t.id === taskId);

            openModal('confirm', {
                message: `Delete task "${task.title}"?`
            });

            document.getElementById('confirm-ok').onclick = () => {
                deleteTask(taskId);
                closeAllModals();
            };
        });
    });

    // Inline add task
    document.querySelectorAll('.add-task-inline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const columnId = e.target.dataset.column;
            openModal('task');
            document.getElementById('task-column').value = columnId;
        });
    });
}

// ===== UTILITIES =====
function updateStats() {
    const total = state.tasks.length;
    const today = new Date().toDateString();
    const completedToday = state.tasks.filter(task =>
        task.completedAt && new Date(task.completedAt).toDateString() === today
    ).length;

    elements.totalTasks.querySelector('span').textContent = total;
    elements.completedToday.querySelector('span').textContent = completedToday;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');

    // Set icon based on type
    switch (type) {
        case 'success':
            icon.className = 'toast-icon bi bi-check-circle';
            break;
        case 'error':
            icon.className = 'toast-icon bi bi-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'toast-icon bi bi-exclamation-triangle';
            break;
    }

    messageEl.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setupTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun';
    localStorage.setItem('theme', state.theme);
    showToast(`Switched to ${state.theme} theme`, 'success');
}

function exportBoard() {
    const data = {
        tasks: state.tasks,
        columns: state.columns,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon-kanban-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Board exported successfully! 💾', 'success');
}

function importBoard(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            openModal('confirm', {
                message: 'Import will replace current board. Continue?'
            });

            document.getElementById('confirm-ok').onclick = () => {
                state.tasks = data.tasks || [];
                state.columns = data.columns || CONFIG.DEFAULT_COLUMNS;
                state.nextTaskId = Math.max(...state.tasks.map(t => t.id), 0) + 1;

                saveState();
                renderBoard();
                closeAllModals();
                showToast('Board imported successfully! 📂', 'success');
            };
        } catch (error) {
            showToast('Invalid import file', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'n':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openModal('task');
                }
                break;

            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openModal('column');
                }
                break;

            case 'k':
                e.preventDefault();
                elements.aiPanel.classList.toggle('active');
                if (elements.aiPanel.classList.contains('active')) {
                    loadAISuggestions();
                }
                break;

            case 'escape':
                closeAllModals();
                break;

            case 'delete':
                // Could add delete selected functionality
                break;

            case '?':
                e.preventDefault();
                elements.shortcutsHelp.classList.toggle('active');
                break;
        }
    });
}

// ===== FILE IMPORT HANDLER =====
// Create hidden file input for import
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
fileInput.id = 'import-file';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importBoard(e.target.files[0]);
        fileInput.value = '';
    }
});

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', init);

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}