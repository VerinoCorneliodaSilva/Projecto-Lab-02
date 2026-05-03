// ===========================
// Theme management
// ===========================

import { StorageUtils } from './utils.js';

export class ThemeManager {
  constructor() {
    this.theme = StorageUtils.getTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.setupToggle();
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.style.colorScheme = 'light';
    }
    StorageUtils.setTheme(theme);
    this.theme = theme;
  }

  toggle() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  setupToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
      this.updateToggleDisplay();
    }
  }

  updateToggleDisplay() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }
  }
}
