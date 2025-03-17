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

function logout() {
    localStorage.removeItem("loggedIn");
    location.reload();
}

function showTodoPage(username) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("todoPage").classList.remove("hidden");
    loadTodos(username);
}

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

function loadTodos(username) {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";
    let todos = JSON.parse(localStorage.getItem("todos")) || {};
    if (todos[username]) {
        todos[username].forEach((todo, index) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";  // テキストとボタンを両端に配置
            li.style.alignItems = "center"; // テキストとボタンを縦方向に中央揃え

            // ToDoテキストを作成
            const todoText = document.createElement("span");
            todoText.textContent = todo;

            // 削除ボタンを作成
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.onclick = function () {
                deleteTodo(username, index);
            };

            // liの中にテキストと削除ボタンを追加
            li.appendChild(todoText);
            li.appendChild(deleteButton);

            // ToDoリストに追加
            todoList.appendChild(li);
        });
    }
}

function deleteTodo(username, index) {
    let todos = JSON.parse(localStorage.getItem("todos")) || {};
    if (todos[username]) {
        todos[username].splice(index, 1); // 指定されたインデックスのTodoを削除
        localStorage.setItem("todos", JSON.stringify(todos));
        loadTodos(username); // 削除後にリストを再読み込み
    }
}

window.onload = function () {
    const loggedInUser = localStorage.getItem("loggedIn");
    if (loggedInUser) {
        showTodoPage(loggedInUser);
    }
};
