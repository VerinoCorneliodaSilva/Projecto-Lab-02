// ===========================
// Dashboard - News Feed
// ===========================

import { StorageUtils, APIUtils, UIUtils, DateUtils } from './utils.js';
import { ThemeManager } from './theme.js';

class NewsAPI {
  constructor() {
    this.baseURL = APIUtils.getBackendURL();
    this.currentPage = 1;
    this.currentCategory = 'general';
    this.currentCountry = 'pt';
    this.articles = [];
    this.totalResults = 0;
  }

  async fetchNews(category = 'general', country = 'pt', page = 1) {
    try {
      const url = `${this.baseURL}/api/news?category=${category}&country=${country}&page=${page}`;
      const data = await APIUtils.fetchWithAuth(url);
      
      this.articles = data.articles || [];
      this.totalResults = data.totalResults || 0;
      this.currentPage = page;
      this.currentCategory = category;
      this.currentCountry = country;
      
      return data;
    } catch (error) {
      console.error('[v0] Failed to fetch news:', error);
      throw error;
    }
  }

  async generateSummary(article) {
    try {
      const url = `${this.baseURL}/api/summarize`;
      const response = await APIUtils.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({
          article_url: article.url,
          article_title: article.title,
          article_content: article.content || article.description || ''
        })
      });
      
      return response.summary;
    } catch (error) {
      console.error('[v0] Failed to generate summary:', error);
      throw error;
    }
  }
}

class Dashboard {
  constructor() {
    this.newsAPI = new NewsAPI();
    this.init();
  }

  async init() {
    new ThemeManager();
    this.checkAuth();
    this.setupUI();
    this.setupEventListeners();
    await this.loadNews();
  }

  checkAuth() {
    const token = StorageUtils.getToken();
    const user = StorageUtils.getUser();

    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    // Mostrar nome do utilizador
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) {
      userNameEl.textContent = user.email || 'Utilizador';
    }
  }

  setupUI() {
    // Setup mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Mostrar menu toggle apenas em mobile
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
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentCategory = e.target.getAttribute('data-category');
        this.newsAPI.currentPage = 1;
        await this.loadNews();
      });
    });

    // Country select
    document.getElementById('country-select').addEventListener('change', async (e) => {
      this.currentCountry = e.target.value;
      this.newsAPI.currentPage = 1;
      await this.loadNews();
    });

    // Pagination
    document.getElementById('prev-btn').addEventListener('click', async () => {
      if (this.newsAPI.currentPage > 1) {
        await this.loadNews(this.newsAPI.currentPage - 1);
      }
    });

    document.getElementById('next-btn').addEventListener('click', async () => {
      const totalPages = Math.ceil(this.newsAPI.totalResults / 10);
      if (this.newsAPI.currentPage < totalPages) {
        await this.loadNews(this.newsAPI.currentPage + 1);
      }
    });

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

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      StorageUtils.removeToken();
      StorageUtils.removeUser();
      window.location.href = 'index.html';
    });

    // Retry button
    document.getElementById('retry-btn').addEventListener('click', () => {
      this.loadNews();
    });
  }

  async loadNews(page = 1) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const articlesGrid = document.getElementById('articles-grid');

    try {
      loadingState.style.display = 'block';
      errorState.style.display = 'none';
      articlesGrid.innerHTML = '';

      const currentCategory = this.newsAPI.currentCategory || 'general';
      const currentCountry = document.getElementById('country-select').value || 'pt';

      await this.newsAPI.fetchNews(currentCategory, currentCountry, page);
      
      loadingState.style.display = 'none';
      this.renderArticles();
      this.updatePagination();

    } catch (error) {
      console.error('[v0] Load news error:', error);
      loadingState.style.display = 'none';
      errorState.style.display = 'block';
      errorState.querySelector('.alert-error').textContent = 'Erro ao carregar notícias. Por favor, tente novamente.';
    }
  }

  renderArticles() {
    const articlesGrid = document.getElementById('articles-grid');
    articlesGrid.innerHTML = '';

    if (this.newsAPI.articles.length === 0) {
      articlesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📰</div>
          <h3>Nenhuma notícia encontrada</h3>
          <p>Tente mudar a categoria ou o país</p>
        </div>
      `;
      return;
    }

    this.newsAPI.articles.forEach(article => {
      const card = this.createArticleCard(article);
      articlesGrid.appendChild(card);
    });
  }

  createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    const isSaved = StorageUtils.isArticleSaved(article.url);

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
          <span>${DateUtils.formatDate(article.publishedAt)}</span>
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
          <button class="btn btn-save ${isSaved ? 'saved' : ''}" data-article-url="${article.url}">
            ${isSaved ? '💾 Salvo' : '📌 Salvar'}
          </button>
        </div>
      </div>
    `;

    // Event listeners para este card
    const summarizeBtn = card.querySelector('.btn-summarize');
    summarizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSummaryModal(article);
    });

    const saveBtn = card.querySelector('.btn-save');
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleSaveArticle(article, saveBtn);
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
      const summary = await this.newsAPI.generateSummary(article);
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

  toggleSaveArticle(article, button) {
    const isSaved = StorageUtils.isArticleSaved(article.url);

    if (isSaved) {
      StorageUtils.removeSavedArticle(article.url);
      button.classList.remove('saved');
      button.textContent = '📌 Salvar';
      UIUtils.showAlert('Artigo removido dos salvos', 'info');
    } else {
      StorageUtils.addSavedArticle(article);
      button.classList.add('saved');
      button.textContent = '💾 Salvo';
      UIUtils.showAlert('Artigo salvo com sucesso', 'success');
    }
  }

  updatePagination() {
    const totalPages = Math.ceil(this.newsAPI.totalResults / 10);
    document.getElementById('current-page').textContent = this.newsAPI.currentPage;
    document.getElementById('total-pages').textContent = totalPages;

    document.getElementById('prev-btn').disabled = this.newsAPI.currentPage <= 1;
    document.getElementById('next-btn').disabled = this.newsAPI.currentPage >= totalPages;
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
