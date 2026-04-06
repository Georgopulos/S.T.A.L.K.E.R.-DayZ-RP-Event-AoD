class SpawnTool {
    constructor() {
        this.apiUrl = '/api/spawn';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        this.validateForm();
    }

    bindEvents() {
        document.getElementById('steam-auth').addEventListener('click', () => this.steamLogin());
        document.getElementById('logout').addEventListener('click', () => this.logout());
        document.getElementById('spawnBtn').addEventListener('click', () => this.handleSpawn());
        document.getElementById('itemSelect').addEventListener('change', () => this.validateForm());
        document.getElementById('quantityInput').addEventListener('input', () => this.validateForm());
    }

    steamLogin() {
        // Перенаправление на серверную аутентификацию Steam
        window.location.href = '/auth/steam';
    }

    logout() {
        fetch('/auth/logout', { method: 'POST' })
            .then(() => {
                this.isAuthenticated = false;
                document.getElementById('user-info').style.display = 'none';
                document.getElementById('auth-status').querySelector('button').style.display = 'block';
                this.validateForm();
                this.showStatus('Вы вышли из аккаунта Steam', 'success');
            });
    }

    checkAuthStatus() {
        fetch('/api/auth/status')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    this.isAuthenticated = true;
                    this.displayUserInfo(data.user);
                }
            });
    }

    displayUserInfo(user) {
        const userInfo = document.getElementById('user-info');
        const avatar = document.getElementById('steam-avatar');
        const name = document.getElementById('steam-name');

        avatar.src = user.avatar;
        name.textContent = user.personaname;
        userInfo.style.display = 'flex';
        document.getElementById('auth-status').querySelector('button').style.display = 'none';
    }

    validateForm() {
        const item = document.getElementById('itemSelect').value;
        const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
        const button = document.getElementById('spawnBtn');

        if (this.isAuthenticated && item && quantity > 0 && quantity <= 100) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    }

    updateTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent =
            now.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
    }

    async handleSpawn() {
        if (!this.isAuthenticated) {
            this.showStatus('Сначала авторизуйтесь через Steam', 'error');
            return;
        }

        const item = document.getElementById('itemSelect').value;
        const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item: item,
            quantity: quantity,
            token: '2006asdf222rtef44' // Замените на реальный токен
        })
            });
            const result = await response.json();
            this.showStatus(result.message, response.ok ? 'success' : 'error');
        } catch (