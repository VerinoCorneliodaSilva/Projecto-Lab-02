// ===========================
// Preferences page
// ===========================

import { StorageUtils, UIUtils } from './utils.js';
import { ThemeManager } from './theme.js';

class PreferencesPage {
  constructor() {
    this.init();
  }

  async init() {
    new ThemeManager();
    this.checkAuth();
    this.setupUI();
    this.setupEventListeners();
    this.loadPreferences();
  }

  checkAuth() {
    const token = StorageUtils.getToken();
    const user = StorageUtils.getUser();

    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) {
      userNameEl.textContent = user.email || 'Utilizador';
    }
  }

  setupUI() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (window.innerWidth <= 768) {
      menuToggle.style.display = 'block';
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        menuToggle.style.display = 'none';
        sidebar.classList.remove('open');
      } else {
        menuToggle.style.display = 'block';
      }
    });

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  }

  setupEventListeners() {
    const form = document.getElementById('preferences-form');
    const resetBtn = document.getElementById('reset-btn');
    const logoutBtn = document.getElementById('logout-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePreferences();
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      this.loadPreferences();
    });

    logoutBtn.addEventListener('click', () => {
      StorageUtils.removeToken();
      StorageUtils.removeUser();
      window.location.href = 'index.html';
    });
  }

  loadPreferences() {
    // Carregar do localStorage (local) ou backend em produção
    // Por enquanto, usar localStorage
    const form = document.getElementById('preferences-form');
    
    // Para este exemplo, as preferências são simples
    // Em produção, buscar do backend
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      
      // Carregar categorias
      if (prefs.categories) {
        prefs.categories.forEach(cat => {
          const checkbox = form.querySelector(`input[value="${cat}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }

      // Carregar keywords
      if (prefs.keywords) {
        form.getElementById('keywords').value = prefs.keywords.join(', ');
      }

      // Carregar idioma
      if (prefs.language) {
        form.getElementById('language').value = prefs.language;
      }
    }
  }

  savePreferences() {
    const form = document.getElementById('preferences-form');
    const categories = Array.from(form.querySelectorAll('input[name="categories"]:checked'))
      .map(cb => cb.value);
    const keywords = form.getElementById('keywords').value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    const language = form.getElementById('language').value;

    const preferences = {
      categories,
      keywords,
      language,
      savedAt: new Date().toISOString()
    };

    // Salvar no localStorage
    localStorage.setItem('user_preferences', JSON.stringify(preferences));

    // Em produção, enviar para o backend
    // await this.saveToBackend(preferences);

    UIUtils.showAlert('Preferências guardadas com sucesso!', 'success');
    console.log('[v0] Preferences saved:', preferences);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PreferencesPage();
});
