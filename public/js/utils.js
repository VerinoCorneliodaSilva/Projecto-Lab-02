// ===========================
// Storage utilities
// ===========================

export const StorageUtils = {
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  removeToken() {
    localStorage.removeItem('auth_token');
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
  },

  getTheme() {
    return localStorage.getItem('theme') || 'light';
  },

  setSavedArticles(articles) {
    localStorage.setItem('saved_articles', JSON.stringify(articles));
  },

  getSavedArticles() {
    const articles = localStorage.getItem('saved_articles');
    return articles ? JSON.parse(articles) : [];
  },

  isArticleSaved(url) {
    const saved = this.getSavedArticles();
    return saved.some(article => article.url === url);
  },

  addSavedArticle(article) {
    const saved = this.getSavedArticles();
    if (!saved.some(a => a.url === article.url)) {
      saved.push({ ...article, savedAt: new Date().toISOString() });
      this.setSavedArticles(saved);
    }
  },

  removeSavedArticle(url) {
    const saved = this.getSavedArticles();
    this.setSavedArticles(saved.filter(a => a.url !== url));
  }
};

export const DateUtils = {
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return `Hoje às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (this.isSameDay(date, yesterday)) {
      return `Ontem às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  },

  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
};

export const APIUtils = {
  async fetchWithAuth(url, options = {}) {
    const token = StorageUtils.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, fazer logout
          StorageUtils.removeToken();
          StorageUtils.removeUser();
          window.location.href = 'index.html';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] API Error:', error);
      throw error;
    }
  },

  getBackendURL() {
    return 'http://localhost:5000';
  }
};

export const UIUtils = {
  showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.insertBefore(alertDiv, document.body.firstChild);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  },

  showLoading(element) {
    element.classList.add('btn-loading');
    element.disabled = true;
    element.innerHTML = `<span class="spinner"></span> Carregando...`;
  },

  hideLoading(element, text) {
    element.classList.remove('btn-loading');
    element.disabled = false;
    element.textContent = text;
  },

  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  addClass(element, className) {
    element.classList.add(className);
  },

  removeClass(element, className) {
    element.classList.remove(className);
  }
};
