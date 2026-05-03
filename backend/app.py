import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# Carregar variáveis de ambiente
load_dotenv()

# Criar app Flask
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Inicializar serviços com tratamento de erro gracioso
services_ready = False
news_service = None
ai_service = None
db_service = None

try:
    from services.news_service import NewsService
    from services.ai_service import AIService
    from services.db_service import DBService
    from middleware.auth import verify_token
    
    news_service = NewsService()
    ai_service = AIService()
    db_service = DBService()
    services_ready = True
    print("[INFO] All services initialized successfully")
except Exception as e:
    print(f"[WARNING] Error initializing services: {str(e)}")
    print("[INFO] App will run with limited functionality")

# Rota de health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "message": "Backend running",
        "services_ready": services_ready
    }), 200

# Rota para obter notícias
@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        if not news_service:
            return jsonify({"error": "News service not available"}), 503
        
        category = request.args.get('category', 'general')
        country = request.args.get('country', 'pt')
        page = request.args.get('page', 1, type=int)
        
        news_data = news_service.fetch_news(category=category, country=country, page=page)
        return jsonify(news_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para gerar resumo com IA
@app.route('/api/summarize', methods=['POST'])
def summarize_article():
    try:
        if not ai_service or not db_service:
            return jsonify({"error": "AI service not available"}), 503
        
        data = request.get_json()
        article_url = data.get('article_url')
        article_title = data.get('article_title')
        article_content = data.get('article_content')
        
        if not article_url or not article_content:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Verificar se resumo existe em cache
        cached_summary = db_service.get_cached_summary(article_url)
        if cached_summary:
            return jsonify({
                "summary": cached_summary,
                "cached": True
            }), 200
        
        # Gerar resumo com IA
        summary = ai_service.generate_summary(article_title, article_content)
        
        # Armazenar em cache
        db_service.save_summary(article_url, article_title, summary)
        
        return jsonify({
            "summary": summary,
            "cached": False
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para salvar preferências do utilizador
@app.route('/api/preferences', methods=['POST'])
def save_preferences():
    try:
        if not db_service:
            return jsonify({"error": "Database service not available"}), 503
        
        data = request.get_json()
        user_id = data.get('user_id')
        categories = data.get('categories', [])
        keywords = data.get('keywords', [])
        language = data.get('language', 'pt')
        
        db_service.save_user_preferences(user_id, categories, keywords, language)
        
        return jsonify({"message": "Preferences saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para obter preferências do utilizador
@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    try:
        if not db_service:
            return jsonify({"error": "Database service not available"}), 503
        
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        preferences = db_service.get_user_preferences(user_id)
        return jsonify(preferences), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para salvar artigo
@app.route('/api/saved-articles', methods=['POST'])
def save_article():
    try:
        if not db_service:
            return jsonify({"error": "Database service not available"}), 503
        
        data = request.get_json()
        user_id = data.get('user_id')
        article_url = data.get('article_url')
        article_title = data.get('article_title')
        article_description = data.get('article_description', '')
        article_image_url = data.get('article_image_url', '')
        article_source = data.get('article_source', '')
        
        db_service.save_article(user_id, article_url, article_title, article_description, article_image_url, article_source)
        
        return jsonify({"message": "Article saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para obter artigos salvos
@app.route('/api/saved-articles', methods=['GET'])
def get_saved_articles():
    try:
        if not db_service:
            return jsonify({"error": "Database service not available"}), 503
        
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        articles = db_service.get_saved_articles(user_id)
        return jsonify(articles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para remover artigo salvo
@app.route('/api/saved-articles/<article_id>', methods=['DELETE'])
def delete_saved_article(article_id):
    try:
        if not db_service:
            return jsonify({"error": "Database service not available"}), 503
        
        db_service.delete_saved_article(article_id)
        
        return jsonify({"message": "Article deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)
