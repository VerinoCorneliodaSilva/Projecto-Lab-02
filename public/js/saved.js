// ===========================
// Saved articles page
// ===========================

import { StorageUtils, UIUtils, DateUtils } from './utils.js';
import { ThemeManager } from './theme.js';

class SavedArticlesPage {
  constructor() {
    this.init();
  }

  async init() {
    new ThemeManager();
    this.checkAuth();
    this.setupUI();
    this.setupEventListeners();
    this.loadSavedArticles();
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
    const logoutBtn = document.getElementById('logout-btn');

    // Modal
    const modal = document.getElementById('summary-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    logoutBtn.addEventListener('click', () => {
      StorageUtils.removeToken();
      StorageUtils.removeUser();
      window.location.href = 'index.html';
    });
  }

  loadSavedArticles() {
    const savedArticles = StorageUtils.getSavedArticles();
    const emptyState = document.getElementById('empty-state');
    const articlesGrid = document.getElementById('saved-articles-grid');

    if (savedArticles.length === 0) {
      emptyState.style.display = 'block';
      articlesGrid.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';
    this.renderArticles(savedArticles);
  }

  renderArticles(articles) {
    const articlesGrid = document.getElementById('saved-articles-grid');
    articlesGrid.innerHTML = '';

    articles.forEach(article => {
      const card = this.createArticleCard(article);
      articlesGrid.appendChild(card);
    });
  }

  createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';

    const formatDate = (dateString) => {
      if (!dateString) return 'Data desconhecida';
      try {
        return DateUtils.formatDate(dateString);
      } catch {
        return 'Data desconhecida';
      }
    };

    card.innerHTML = `
      <img src="${article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}" 
           alt="${article.title}" 
           class="article-image"
           onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
      
      <div class="article-content">
        <div class="article-source">${article.source || 'Fonte Desconhecida'}</div>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-description">${article.description || 'Sem descrição disponível'}</p>
        
        <div class="article-meta">
          <span>${formatDate(article.publishedAt)}</span>
          <span>Salvo: ${formatDate(article.savedAt)}</span>
        </div>

        <div class="article-actions">
          <div class="article-actions-primary">
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn btn-read-original">
              🔗 Ler Artigo Original
            </a>
            <button class="btn btn-summarize" data-article-url="${article.url}" data-article-title="${article.title}" data-article-content="${(article.content || article.description || '').replace(/"/g, '&quot;')}">
              ✨ Resumo IA
            </button>
          </div>
          <button class="btn btn-save saved" data-article-url="${article.url}" style="width: 100%;">
            💾 Remover
          </button>
        </div>
      </div>
    `;

    const summarizeBtn = card.querySelector('.btn-summarize');
    summarizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSummaryModal(article);
    });

    const removeBtn = card.querySelector('.btn-save');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.removeSavedArticle(article.url, card);
    });

    return card;
  }

  async showSummaryModal(article) {
    const modal = document.getElementById('summary-modal');
    const summaryContent = document.getElementById('summary-content');
    const modalReadOriginal = document.getElementById('modal-read-original');

    modal.classList.add('active');
    summaryContent.innerHTML = `
      <div style="text-align: center;">
        <div class="spinner" style="margin: 0 auto;"></div>
        <p>Gerando resumo com IA...</p>
      </div>
    `;

    try {
      // Simular geração de resumo (em produção, chamar backend)
      // Para este exemplo, usar um resumo de placeholder
      const summary = this.generateMockSummary(article);
      
      summaryContent.innerHTML = `
        <h3 style="margin-bottom: 1rem;">${article.title}</h3>
        <p style="line-height: 1.6; color: var(--color-text);">${summary}</p>
      `;
    } catch (error) {
      console.error('[v0] Summary error:', error);
      summaryContent.innerHTML = `
        <div class="alert alert-error">
          Erro ao gerar resumo. Por favor, tente novamente.
        </div>
      `;
    }

    modalReadOriginal.onclick = () => {
      window.open(article.url, '_blank');
    };
  }

  generateMockSummary(article) {
    // Gerar um resumo mock baseado na descrição
    const description = article.description || article.content || '';
    if (description.length > 300) {
      return description.substring(0, 300) + '...';
    }
    return description || 'Resumo não disponível.';
  }

  removeSavedArticle(url, cardElement) {
    StorageUtils.removeSavedArticle(url);
    cardElement.remove();
    
    const savedArticles = StorageUtils.getSavedArticles();
    if (savedArticles.length === 0) {
      document.getElementById('empty-state').style.display = 'block';
    }

    UIUtils.showAlert('Artigo removido', 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SavedArticlesPage();
});
