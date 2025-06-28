window.addEventListener('DOMContentLoaded', () => {
    // まずは認証されているかを確認
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated) {
        const username = localStorage.getItem("username");
        createBoardUI(username);
        loadComments();
    } else {
        createLoginUI();
    }
});

// ログイン画面のUIを作成
function createLoginUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>ログイン</h1>
        <form id="login-form">
            <label for="username">名前:</label>
            <input type="text" id="username" required><br>
            <label for="password">パスワード:</label>
            <input type="password" id="password" required><br>
            <button type="submit">ログイン</button>
        </form>
    `;

    document.getElementById("login-form").addEventListener("submit", handleLogin);
}

// ログイン処理
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 簡易パスワードのチェック（仮のパスワード：password123）
    if (password === "password123") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);
        createBoardUI(username);
        loadComments();
    } else {
        alert("パスワードが間違っています！");
    }
}

// 掲示板のUIを作成
function createBoardUI(username) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>掲示板</h1>
        <p>ようこそ、${username} さん</p>
        <form id="comment-form">
            <textarea id="comment-text" placeholder="コメントを入力..." required></textarea><br>
            <input type="file" id="comment-image"><br>
            <button type="submit">投稿</button>
        </form>
        <div id="comments-container"></div>
        <button id="logout-button">ログアウト</button>
    `;

    document.getElementById("logout-button").addEventListener("click", handleLogout);
    document.getElementById("comment-form").addEventListener("submit", handleCommentSubmit);
}

// ログアウト処理
function handleLogout() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    createLoginUI();
}

// コメント投稿処理
function handleCommentSubmit(event) {
    event.preventDefault();

    const commentText = document.getElementById("comment-text").value;
    const imageInput = document.getElementById("comment-image");
    let imageBase64 = null;

    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            imageBase64 = reader.result;
            const comment = {
                username: localStorage.getItem("username"),
                text: commentText,
                image: imageBase64,
                replies: []
            };
            saveComment(comment);
            loadComments();
        };
        reader.readAsDataURL(file);
    } else {
        const comment = {
            username: localStorage.getItem("username"),
            text: commentText,
            image: null,
            replies: []
        };
        saveComment(comment);
        loadComments();
    }

    document.getElementById("comment-text").value = '';
    imageInput.value = '';
}

// コメントをローカルストレージに保存する
function saveComment(comment) {
    const comments = JSON.parse(localStorage.getItem("comments")) || [];
    comments.push(comment);
    localStorage.setItem("comments", JSON.stringify(comments));
}

// コメントの読み込み
function loadComments() {
    const comments = JSON.parse(localStorage.getItem("comments")) || [];
    const commentsContainer = document.getElementById("comments-container");

    commentsContainer.innerHTML = comments.map((comment, index) => `
        <div class="comment" id="comment-${index}">
            <p><strong>${comment.username}</strong>: ${comment.text}</p>
            ${comment.image ? `<img src="${comment.image}" alt="Image">` : ""}
            <button onclick="replyToComment(${index})">返信</button>
            <div id="replies-${index}">
                ${comment.replies.map((reply, replyIndex) => `
                    <div class="reply">
                        <p><strong>${reply.username}</strong>: ${reply.text}</p>
                        ${reply.image ? `<img src="${reply.image}" alt="Image">` : ""}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join("");
}

// コメントへの返信処理
function replyToComment(commentIndex) {
    const replyText = prompt("返信を入力してください:");
    if (replyText) {
        const comments = JSON.parse(localStorage.getItem("comments")) || [];
        const comment = comments[commentIndex];
        const reply = {
            username: localStorage.getItem("username"),
            text: replyText,
            image: null
        };
        comment.replies.push(reply);
        localStorage.setItem("comments", JSON.stringify(comments));
        loadComments();
    }
}
