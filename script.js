document.addEventListener("DOMContentLoaded", function () {
    const loginPage = document.getElementById("loginPage");
    const todoPage = document.getElementById("todoPage");

    // 🔹 ユーザー登録
    document.getElementById("registerBtn").addEventListener("click", async function () {
        const newUsername = document.getElementById("newUsername").value;
        const newPassword = document.getElementById("newPassword").value;

        if (!newUsername || !newPassword) {
            alert("ユーザー名とパスワードを入力してください。");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || {};

        if (users[newUsername]) {
            alert("このユーザー名は既に登録されています。");
            return;
        }

        // 🔹 パスワードをハッシュ化して保存（SHA-256）
        const hashedPassword = await hashPassword(newPassword);
        users[newUsername] = hashedPassword;
        localStorage.setItem("users", JSON.stringify(users));

        alert("ユーザー登録が完了しました。");
    });

    // 🔹 ログイン処理
    document.getElementById("loginBtn").addEventListener("click", async function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        let users = JSON.parse(localStorage.getItem("users")) || {};

        if (!users[username]) {
            showError("ユーザーが存在しません。");
            return;
        }

        const hashedInputPassword = await hashPassword(password);
        if (users[username] === hashedInputPassword) {
            localStorage.setItem("loggedIn", username);
            showTodoPage(username);
        } else {
            showError("パスワードが間違っています。");
        }
    });

    // 🔹 ログアウト処理
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("loggedIn");
        location.reload();
    });

    // 🔹 Todo追加
    document.getElementById("addTodoBtn").addEventListener("click", function () {
        const username = localStorage.getItem("loggedIn");
        if (!username) return;

        const todoText = document.getElementById("newTodo").value.trim();
        if (todoText === "") return;

        let todos = JSON.parse(localStorage.getItem("todos")) || {};
        if (!todos[username]) {
            todos[username] = [];
        }
        todos[username].push(todoText);
        localStorage.setItem("todos", JSON.stringify(todos));

        document.getElementById("newTodo").value = "";
        loadTodos(username);
    });

    // 🔹 Todoリストの読み込み
    function loadTodos(username) {
        const todoList = document.getElementById("todoList");
        todoList.innerHTML = "";
        let todos = JSON.parse(localStorage.getItem("todos")) || {};
        if (todos[username]) {
            todos[username].forEach((todo, index) => {
                const li = document.createElement("li");
                li.textContent = todo;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "削除";
                deleteButton.addEventListener("click", function () {
                    deleteTodo(username, index);
                });

                li.appendChild(deleteButton);
                todoList.appendChild(li);
            });
        }
    }

    // 🔹 Todo削除
    function deleteTodo(username, index) {
        let todos = JSON.parse(localStorage.getItem("todos")) || {};
        if (todos[username]) {
            todos[username].splice(index, 1);
            localStorage.setItem("todos", JSON.stringify(todos));
            loadTodos(username);
        }
    }

    // 🔹 SHA-256ハッシュ関数（パスワードをハッシュ化）
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    // 🔹 エラーメッセージ表示
    function showError(message) {
        document.getElementById("errorMessage").textContent = message;
    }

    // 🔹 ログイン状態の確認
    const loggedInUser = localStorage.getItem("loggedIn");
    if (loggedInUser) {
        showTodoPage(loggedInUser);
    }

    function showTodoPage(username) {
        loginPage.classList.add("hidden");
        todoPage.classList.remove("hidden");
        loadTodos(username);
    }
});
