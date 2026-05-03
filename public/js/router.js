// ===========================
// Router for SPA navigation
// ===========================

export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.setupNavigation();
  }

  registerRoute(path, callback) {
    this.routes[path] = callback;
  }

  async navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path;
      await this.routes[path]();
      window.history.pushState({}, '', path);
    }
  }

  setupNavigation() {
    // Handle back/forward buttons
    window.addEventListener('popstate', async (e) => {
      const path = window.location.pathname;
      if (this.routes[path]) {
        await this.routes[path]();
      }
    });

    // Handle nav links
    document.addEventListener('click', async (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const path = e.target.getAttribute('data-route');
        await this.navigate(path);
      }
    });
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}
