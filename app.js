// タスクとユーザーのデータを管理するクラス
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [
            { id: 1, name: 'ユーザー1' },
            { id: 2, name: 'ユーザー2' }
        ];
        this.currentUser = null;
    }

    // データの保存
    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // タスクの追加
    addTask(title, description, dueDate, priority, assignedTo) {
        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            assignedTo,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.saveData();
        return task;
    }

    // タスクの更新
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveData();
            return true;
        }
        return false;
    }

    // タスクの削除
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveData();
    }

    // タスクの完了状態を切り替え
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            return true;
        }
        return false;
    }

    // ユーザーの追加
    addUser(name) {
        const user = {
            id: Date.now(),
            name
        };
        this.users.push(user);
        this.saveData();
        return user;
    }

    // ユーザーの削除
    deleteUser(userId) {
        this.users = this.users.filter(user => user.id !== userId);
        this.tasks = this.tasks.filter(task => task.assignedTo !== userId);
        this.saveData();
    }

    // タスクの取得（フィルター付き）
    getTasks(filters = {}) {
        let filteredTasks = [...this.tasks];
        
        if (filters.userId) {
            filteredTasks = filteredTasks.filter(task => task.assignedTo === filters.userId);
        }
        
        if (filters.completed !== undefined) {
            filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
        }
        
        if (filters.priority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
        }

        return filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
}

// UIを管理するクラス
class TaskUI {
    constructor() {
        this.taskManager = new TaskManager();
        this.currentFilter = 'all';
        this.initializeUI();
        this.bindEvents();
        this.refreshUI();
    }

    initializeUI() {
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.userList = document.getElementById('userList');
        this.addUserBtn = document.getElementById('addUserBtn');
        this.modal = document.getElementById('taskModal');
        this.filterAllBtn = document.getElementById('filterAll');
        this.filterActiveBtn = document.getElementById('filterActive');
        this.filterCompletedBtn = document.getElementById('filterCompleted');
    }

    bindEvents() {
        // タスクフォームの送信
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // ユーザー追加ボタン
        this.addUserBtn.addEventListener('click', () => {
            const name = prompt('新しいユーザー名を入力してください：');
            if (name && name.trim()) {
                this.taskManager.addUser(name.trim());
                this.refreshUI();
            }
        });

        // フィルターボタンのイベント
        this.filterAllBtn.addEventListener('click', () => this.setFilter('all'));
        this.filterActiveBtn.addEventListener('click', () => this.setFilter('active'));
        this.filterCompletedBtn.addEventListener('click', () => this.setFilter('completed'));
    }

    setFilter(filter) {
        this.currentFilter = filter;
        // フィルターボタンのアクティブ状態を更新
        [this.filterAllBtn, this.filterActiveBtn, this.filterCompletedBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (filter) {
            case 'all':
                this.filterAllBtn.classList.add('active');
                break;
            case 'active':
                this.filterActiveBtn.classList.add('active');
                break;
            case 'completed':
                this.filterCompletedBtn.classList.add('active');
                break;
        }
        
        this.renderTaskList();
    }

    handleTaskSubmit() {
        const formData = new FormData(this.taskForm);
        const assignedTo = parseInt(formData.get('assignedTo'));
        
        if (!assignedTo) {
            alert('担当者を選択してください');
            return;
        }

        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            dueDate: formData.get('dueDate'),
            priority: formData.get('priority'),
            assignedTo: assignedTo
        };

        this.taskManager.addTask(
            taskData.title,
            taskData.description,
            taskData.dueDate,
            taskData.priority,
            taskData.assignedTo
        );

        this.taskForm.reset();
        this.refreshUI();
    }

    refreshUI() {
        this.renderUserList();
        this.renderTaskList();
    }

    renderUserList() {
        this.userList.innerHTML = '';
        const assignedToSelect = document.getElementById('assignedTo');
        const editAssignedToSelect = document.getElementById('editAssignedTo');
        
        // セレクトボックスをクリア
        assignedToSelect.innerHTML = '<option value="">担当者を選択</option>';
        if (editAssignedToSelect) {
            editAssignedToSelect.innerHTML = '<option value="">担当者を選択</option>';
        }

        this.taskManager.users.forEach(user => {
            // ユーザーリストの描画
            const li = document.createElement('li');
            li.innerHTML = `
                ${user.name}
                <button class="btn-delete-user" data-user-id="${user.id}">削除</button>
            `;
            li.querySelector('.btn-delete-user').addEventListener('click', () => {
                if (confirm('このユーザーを削除してもよろしいですか？')) {
                    this.taskManager.deleteUser(user.id);
                    this.refreshUI();
                }
            });
            this.userList.appendChild(li);

            // セレクトボックスのオプション追加
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            assignedToSelect.appendChild(option);
            
            if (editAssignedToSelect) {
                const editOption = option.cloneNode(true);
                editAssignedToSelect.appendChild(editOption);
            }
        });
    }

    renderTaskList() {
        this.taskList.innerHTML = '';
        let tasks = this.taskManager.getTasks();

        // フィルター適用
        switch (this.currentFilter) {
            case 'active':
                tasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                tasks = tasks.filter(task => task.completed);
                break;
        }

        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'タスクがありません';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            this.taskList.appendChild(emptyMessage);
            return;
        }

        tasks.forEach(task => {
            const assignedUser = this.taskManager.users.find(user => user.id === task.assignedTo);
            const taskElement = document.createElement('li');
            taskElement.className = `task-item priority-${task.priority} ${task.completed ? 'task-completed' : ''}`;
            
            const priorityText = {
                'high': '高',
                'medium': '中',
                'low': '低'
            };
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-meta">
                        <span class="task-priority">優先度: ${priorityText[task.priority]}</span>
                        <span>期限: ${new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>担当: ${assignedUser ? assignedUser.name : '未割り当て'}</span>
                    </div>
                </div>
                <p>${task.description || '説明なし'}</p>
                <div class="task-actions">
                    <button class="btn-small btn-complete">${task.completed ? '未完了に戻す' : '完了'}</button>
                    <button class="btn-small btn-edit">編集</button>
                    <button class="btn-small btn-delete">削除</button>
                </div>
            `;

            // イベントリスナーの設定
            const completeBtn = taskElement.querySelector('.btn-complete');
            const editBtn = taskElement.querySelector('.btn-edit');
            const deleteBtn = taskElement.querySelector('.btn-delete');

            completeBtn.addEventListener('click', () => {
                this.taskManager.toggleTaskComplete(task.id);
                this.refreshUI();
            });

            editBtn.addEventListener('click', () => {
                this.showEditModal(task);
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm('このタスクを削除してもよろしいですか？')) {
                    this.taskManager.deleteTask(task.id);
                    this.refreshUI();
                }
            });

            this.taskList.appendChild(taskElement);
        });
    }

    showEditModal(task) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('editTaskForm');
        
        // フォームに現在の値をセット
        form.elements.title.value = task.title;
        form.elements.description.value = task.description;
        form.elements.dueDate.value = task.dueDate;
        form.elements.priority.value = task.priority;
        form.elements.assignedTo.value = task.assignedTo;

        modal.style.display = 'block';

        // 保存ボタンのイベントリスナー
        const saveHandler = (e) => {
            e.preventDefault();
            const updates = {
                title: form.elements.title.value,
                description: form.elements.description.value,
                dueDate: form.elements.dueDate.value,
                priority: form.elements.priority.value,
                assignedTo: parseInt(form.elements.assignedTo.value)
            };

            this.taskManager.updateTask(task.id, updates);
            modal.style.display = 'none';
            this.refreshUI();
            form.removeEventListener('submit', saveHandler);
        };

        form.addEventListener('submit', saveHandler);

        // モーダルを閉じるボタン
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            form.removeEventListener('submit', saveHandler);
        };

        // モーダルの外側をクリックして閉じる
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                form.removeEventListener('submit', saveHandler);
            }
        };
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TaskUI();
}); 