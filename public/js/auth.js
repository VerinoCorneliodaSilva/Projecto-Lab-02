// ===========================
// Authentication with Supabase
// ===========================

import { StorageUtils, UIUtils } from './utils.js';
import { ThemeManager } from './theme.js';

// Supabase configuration
const SUPABASE_URL = 'https://vtdfbkgaiotlpnxwrzsi.supabase.co'; // Será preenchido dinamicamente
const SUPABASE_ANON_KEY = 'sb_publishable_1i0v9JCPC4JJ-r8frvGVsg_Bih-whUw'; // Será preenchido dinamicamente

class AuthManager {
  constructor() {
    this.setupSupabase();
    this.setupEventListeners();
    this.checkAuthStatus();
    new ThemeManager();
  }

  setupSupabase() {
    // Verificar se já existe um script do Supabase
    if (window.supabase) {
      this.supabase = window.supabase;
      return;
    }

    // Criar cliente Supabase dinamicamente
    // Nota: Em produção, essas variáveis devem vir do servidor/env
    console.error('[v0] Supabase client não foi inicializado. Configure SUPABASE_URL e SUPABASE_ANON_KEY');
  }

  setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }
  }

  switchTab(tab) {
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
        btn.style.color = 'var(--color-primary)';
        btn.style.borderBottomColor = 'var(--color-primary)';
      } else {
        btn.classList.remove('active');
        btn.style.color = 'var(--color-text-muted)';
        btn.style.borderBottomColor = 'transparent';
      }
    });

    // Update forms
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';

    // Clear error
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const errorDiv = document.getElementById('auth-error');

    try {
      UIUtils.showLoading(submitBtn);

      // Para desenvolvimento: Usar localStorage como simulação
      // Em produção, usar Supabase Auth
      if (!this.supabase) {
        // Simular autenticação com backend
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          throw new Error('Falha na autenticação');
        }

        const data = await response.json();
        StorageUtils.setToken(data.token);
        StorageUtils.setUser(data.user);
        
        window.location.href = 'dashboard.html';
        return;
      }

      // Usar Supabase
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      StorageUtils.setToken(data.session.access_token);
      StorageUtils.setUser(data.user);

      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error('[v0] Login error:', error);
      errorDiv.textContent = error.message || 'Erro ao entrar. Verifique as suas credenciais.';
      errorDiv.style.display = 'block';
      UIUtils.hideLoading(submitBtn, 'Entrar');
    }
  }

  async handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const submitBtn = document.querySelector('#signup-form button[type="submit"]');
    const errorDiv = document.getElementById('auth-error');

    try {
      if (password !== passwordConfirm) {
        throw new Error('As palavras-passe não coincidem.');
      }

      UIUtils.showLoading(submitBtn);

      // Para desenvolvimento: Usar localStorage como simulação
      // Em produção, usar Supabase Auth
      if (!this.supabase) {
        // Simular registo com backend
        const response = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          throw new Error('Falha no registo');
        }

        const data = await response.json();
        StorageUtils.setToken(data.token);
        StorageUtils.setUser(data.user);
        
        window.location.href = 'dashboard.html';
        return;
      }

      // Usar Supabase
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      errorDiv.style.backgroundColor = '#dcfce7';
      errorDiv.style.color = '#166534';
      errorDiv.style.borderColor = '#86efac';
      errorDiv.style.display = 'block';
      errorDiv.textContent = 'Conta criada com sucesso! Por favor, faça login.';

      // Limpar formulário
      document.getElementById('signup-form').reset();
      setTimeout(() => {
        this.switchTab('login');
      }, 2000);

      UIUtils.hideLoading(submitBtn, 'Criar Conta');
    } catch (error) {
      console.error('[v0] Signup error:', error);
      errorDiv.textContent = error.message || 'Erro ao criar conta.';
      errorDiv.style.display = 'block';
      UIUtils.hideLoading(submitBtn, 'Criar Conta');
    }
  }

  checkAuthStatus() {
    const token = StorageUtils.getToken();
    if (token) {
      // Se já tem token, redirecionar para dashboard
      window.location.href = 'dashboard.html';
    }
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});
