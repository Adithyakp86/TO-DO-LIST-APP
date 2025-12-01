// script.js - Enhanced To-Do List Application Logic

// Task class to represent individual tasks
class Task {
  constructor(id, text, completed = false, priority = 'medium', category = 'personal', dueDate = null, description = '', subtasks = []) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.priority = priority;
    this.category = category;
    this.dueDate = dueDate;
    this.description = description;
    this.subtasks = subtasks; // Array of subtask objects
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Subtask class
class Subtask {
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }
}

// To-Do List Manager Class
class TodoListManager {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.currentView = 'tasks'; // Default view
    this.init();
  }

  // Initialize the application
  init() {
    this.loadTasksFromLocalStorage();
    this.setupEventListeners();
    this.renderTasks();
    this.updateStats();
    this.loadThemePreference();
  }

  // Load tasks from localStorage
  loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      this.tasks = parsedTasks.map(task => {
        // Convert plain objects to Task instances
        const taskInstance = new Task(
          task.id, 
          task.text, 
          task.completed, 
          task.priority, 
          task.category, 
          task.dueDate, 
          task.description,
          task.subtasks ? task.subtasks.map(sub => new Subtask(sub.id, sub.text, sub.completed)) : []
        );
        // Restore date objects
        taskInstance.createdAt = new Date(task.createdAt);
        taskInstance.updatedAt = new Date(task.updatedAt);
        return taskInstance;
      });
    }
  }

  // Save tasks to localStorage
  saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // Load theme preference from localStorage
  loadThemePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', () => this.addTask());
    
    // Enter key in input field
    document.getElementById('task-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    
    // Theme toggle button
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter || e.target.closest('.filter-btn').dataset.filter));
    });
    
    // Clear all button
    document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAllTasks());
    
    // Search input
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderTasks();
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', () => this.exportTasks());
    
    // Import button
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
    
    // Import file input
    document.getElementById('import-file').addEventListener('change', (e) => {
      this.importTasks(e.target.files[0]);
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setView(e.target.dataset.view || e.target.closest('.nav-link').dataset.view);
      });
    });
    
    // Footer links
    document.querySelectorAll('.footer-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setView(e.target.dataset.view || e.target.closest('.footer-link').dataset.view);
      });
    });
    
    // Mobile menu toggle
    document.querySelector('.nav-toggle').addEventListener('click', () => {
      document.querySelector('.nav-menu').classList.toggle('active');
      document.querySelector('.nav-toggle').classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const navMenu = document.querySelector('.nav-menu');
      const navToggle = document.querySelector('.nav-toggle');
      
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  }

  // Set current view
  setView(view) {
    this.currentView = view;
    
    // Update active navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.view === view) {
        link.classList.add('active');
      }
    });
    
    // For now, we'll just show an alert - in a full implementation, you would render different views
    alert(`Switching to ${view} view. This is a demo of the navigation functionality.`);
    
    // In a full implementation, you would render the appropriate view here
    // For example:
    // if (view === 'tasks') {
    //   this.renderTasks();
    // } else if (view === 'categories') {
    //   this.renderCategories();
    // } else if (view === 'stats') {
    //   this.renderStats();
    // } else if (view === 'settings') {
    //   this.renderSettings();
    // }
  }

  // Add a new task
  addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    if (text) {
      const priority = document.getElementById('task-priority').value;
      const category = document.getElementById('task-category').value;
      const dueDate = document.getElementById('task-date').value;
      
      const newTask = new Task(
        Date.now(), 
        text, 
        false, 
        priority, 
        category, 
        dueDate || null,
        '' // description
      );
      
      this.tasks.push(newTask);
      this.saveTasksToLocalStorage();
      this.renderTasks();
      this.updateStats();
      
      // Clear input and focus
      input.value = '';
      document.getElementById('task-date').value = '';
      input.focus();
    }
  }

  // Edit a task
  editTask(id, newText, newPriority, newCategory, newDueDate, newDescription) {
    const task = this.tasks.find(task => task.id === id);
    if (task && newText.trim()) {
      task.text = newText.trim();
      task.priority = newPriority;
      task.category = newCategory;
      task.dueDate = newDueDate || null;
      task.description = newDescription;
      task.updatedAt = new Date();
      this.saveTasksToLocalStorage();
      this.renderTasks();
    }
  }

  // Delete a task
  deleteTask(id) {
    // Add animation class for smooth removal
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add('deleted');
      
      // Wait for animation to complete before removing
      setTimeout(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasksToLocalStorage();
        this.renderTasks();
        this.updateStats();
      }, 300);
    }
  }

  // Toggle task completion status
  toggleTaskCompletion(id) {
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = new Date();
      this.saveTasksToLocalStorage();
      this.renderTasks();
      this.updateStats();
    }
  }

  // Add a subtask
  addSubtask(taskId, subtaskText) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task && subtaskText.trim()) {
      const newSubtask = new Subtask(Date.now(), subtaskText.trim());
      task.subtasks.push(newSubtask);
      task.updatedAt = new Date();
      this.saveTasksToLocalStorage();
      this.renderTasks();
    }
  }

  // Toggle subtask completion
  toggleSubtaskCompletion(taskId, subtaskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      const subtask = task.subtasks.find(sub => sub.id === subtaskId);
      if (subtask) {
        subtask.completed = !subtask.completed;
        task.updatedAt = new Date();
        this.saveTasksToLocalStorage();
        this.renderTasks();
      }
    }
  }

  // Delete a subtask
  deleteSubtask(taskId, subtaskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.subtasks = task.subtasks.filter(sub => sub.id !== subtaskId);
      task.updatedAt = new Date();
      this.saveTasksToLocalStorage();
      this.renderTasks();
    }
  }

  // Set current filter
  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });
    
    this.renderTasks();
  }

  // Clear all tasks
  clearAllTasks() {
    if (this.tasks.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
      this.tasks = [];
      this.saveTasksToLocalStorage();
      this.renderTasks();
      this.updateStats();
    }
  }

  // Toggle dark/light theme
  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
  }

  // Export tasks to JSON file
  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'todo-tasks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Import tasks from JSON file
  importTasks(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        if (Array.isArray(importedTasks)) {
          // Convert imported tasks to Task instances
          this.tasks = importedTasks.map(task => {
            const taskInstance = new Task(
              task.id, 
              task.text, 
              task.completed, 
              task.priority, 
              task.category, 
              task.dueDate, 
              task.description,
              task.subtasks ? task.subtasks.map(sub => new Subtask(sub.id, sub.text, sub.completed)) : []
            );
            // Restore date objects
            taskInstance.createdAt = new Date(task.createdAt);
            taskInstance.updatedAt = new Date(task.updatedAt);
            return taskInstance;
          });
          
          this.saveTasksToLocalStorage();
          this.renderTasks();
          this.updateStats();
          
          alert('Tasks imported successfully!');
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        alert('Error importing tasks: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    document.getElementById('import-file').value = '';
  }

  // Search tasks
  searchTasks(tasks) {
    if (!this.searchTerm) return tasks;
    
    return tasks.filter(task => 
      task.text.toLowerCase().includes(this.searchTerm) ||
      task.description.toLowerCase().includes(this.searchTerm) ||
      task.category.toLowerCase().includes(this.searchTerm)
    );
  }

  // Get filtered tasks based on current filter
  getFilteredTasks() {
    let filteredTasks = this.tasks;
    
    // Apply filter
    switch (this.currentFilter) {
      case 'completed':
        filteredTasks = this.tasks.filter(task => task.completed);
        break;
      case 'pending':
        filteredTasks = this.tasks.filter(task => !task.completed);
        break;
      default:
        filteredTasks = this.tasks;
    }
    
    // Apply search
    filteredTasks = this.searchTasks(filteredTasks);
    
    return filteredTasks;
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  // Calculate task completion percentage
  calculateCompletionPercentage(task) {
    if (task.subtasks.length === 0) return task.completed ? 100 : 0;
    
    const completedSubtasks = task.subtasks.filter(sub => sub.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }

  // Render tasks to the DOM
  renderTasks() {
    const taskList = document.getElementById('task-list');
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = `<li class="no-tasks">No tasks found. Add a new task to get started!</li>`;
      return;
    }
    
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
      const taskElement = document.createElement('li');
      taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
      taskElement.dataset.id = task.id;
      
      // Calculate completion percentage for progress bar
      const completionPercentage = this.calculateCompletionPercentage(task);
      
      taskElement.innerHTML = `
        <div class="task-header">
          <div class="task-title-container">
            <div class="priority-indicator priority-${task.priority}"></div>
            <span class="task-text">${task.text}</span>
            <span class="category-tag category-${task.category}">${task.category}</span>
          </div>
          <span class="task-date-display">${this.formatDate(task.dueDate)}</span>
        </div>
        ${task.description ? `<div class="task-details">${task.description}</div>` : ''}
        ${task.subtasks.length > 0 ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${completionPercentage}%"></div>
          </div>
          <div class="subtasks">
            ${task.subtasks.map(subtask => `
              <div class="subtask-item" data-subtask-id="${subtask.id}">
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${subtask.text}</span>
                <button class="action-btn delete-btn delete-subtask-btn" title="Delete subtask">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="task-actions">
          <button class="action-btn complete-btn" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button class="action-btn edit-btn" title="Edit task">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" title="Delete task">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;
      
      // Add animation class for new tasks
      if (!task.completed) {
        taskElement.classList.add('added');
        setTimeout(() => taskElement.classList.remove('added'), 400);
      }
      
      taskList.appendChild(taskElement);
      
      // Add event listeners to the new task buttons
      taskElement.querySelector('.complete-btn').addEventListener('click', () => {
        this.toggleTaskCompletion(task.id);
      });
      
      taskElement.querySelector('.edit-btn').addEventListener('click', () => {
        this.handleEditTask(task.id, task.text, task.priority, task.category, task.dueDate, task.description);
      });
      
      taskElement.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteTask(task.id);
      });
      
      // Add event listeners for subtasks
      if (task.subtasks.length > 0) {
        taskElement.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
            const subtaskId = parseInt(e.target.closest('.subtask-item').dataset.subtaskId);
            this.toggleSubtaskCompletion(task.id, subtaskId);
          });
        });
        
        taskElement.querySelectorAll('.delete-subtask-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const subtaskId = parseInt(e.target.closest('.subtask-item').dataset.subtaskId);
            this.deleteSubtask(task.id, subtaskId);
          });
        });
      }
    });
  }

  // Handle task editing
  handleEditTask(id, currentText, currentPriority, currentCategory, currentDueDate, currentDescription) {
    const newText = prompt('Edit your task:', currentText);
    if (newText !== null) {
      // In a more advanced version, we could show a modal with all fields
      // For now, we'll just update the text
      this.editTask(id, newText, currentPriority, currentCategory, currentDueDate, currentDescription);
      
      // Add visual feedback
      const taskElement = document.querySelector(`[data-id="${id}"]`);
      if (taskElement) {
        taskElement.classList.add('updated');
        setTimeout(() => taskElement.classList.remove('updated'), 300);
      }
    }
  }

  // Update statistics
  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoListManager();
});