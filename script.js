// ユーザー登録関数
function registerUser() {
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    if (newUsername && newPassword) {
        let users = JSON.parse(localStorage.getItem("users")) || {};
        if (users[newUsername]) {
            alert("このユーザー名は既に登録されています。");
            return;
        }
        users[newUsername] = newPassword;
        localStorage.setItem("users", JSON.stringify(users));
        alert("ユーザー登録が完了しました。");
    }
}

// ログイン処理
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username] && users[username] === password) {
        localStorage.setItem("loggedIn", username);
        showTodoPage(username);
    } else {
        document.getElementById("errorMessage").textContent = "ユーザー名またはパスワードが違います。";
    }
}

// ログアウト処理
function logout() {
    localStorage.removeItem("loggedIn");
    location.reload();
}

// Todoリストを表示する処理
function showTodoPage(username) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("todoPage").classList.remove("hidden");
    loadTodos(username);
}

// Todoを追加する処理
function addTodo() {
    const username = localStorage.getItem("loggedIn");
    if (!username) return;

    const todoText = document.getElementById("newTodo").value;
    if (todoText.trim() !== "") {
        let todos = JSON.parse(localStorage.getItem("todos")) || {};
        if (!todos[username]) {
            todos[username] = [];
        }
        todos[username].push(todoText);
        localStorage.setItem("todos", JSON.stringify(todos));
        document.getElementById("newTodo").value = "";
        loadTodos(username);
    }
}

// Todoリストを読み込む処理
function loadTodos(username) {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";
    let todos = JSON.parse(localStorage.getItem("todos")) || {};
    if (todos[username]) {
        todos[username].forEach((todo, index) => {
            const li = document.createElement("li");
            li.textContent = todo;

            // 削除ボタンを作成
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = function () {
                deleteTodo(username, index);
            };

            li.appendChild(deleteButton);
            todoList.appendChild(li);
        });
    }
}

// Todoを削除する処理
function deleteTodo(username, index) {
    let todos = JSON.parse(localStorage.getItem("todos")) || {};
    if (todos[username]) {
        todos[username].splice(index, 1); // 指定されたインデックスのTodoを削除
        localStorage.setItem("todos", JSON.stringify(todos));
        loadTodos(username); // 削除後にリストを再読み込み
    }
}

// ページロード時にログイン情報を確認
window.onload = function () {
    const loggedInUser = localStorage.getItem("loggedIn");
    if (loggedInUser) {
        showTodoPage(loggedInUser);
    }
};
