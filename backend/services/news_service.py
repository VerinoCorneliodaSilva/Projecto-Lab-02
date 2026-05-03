import os
import requests
from datetime import datetime

class NewsService:
    def __init__(self):
        self.api_key = os.getenv('4967b7a734bb7b1c4d7dfdcfaff84c6adb48ceb6853418cf25a693b3912ed3b1')
        self.base_url = 'https://newsapi.org/v2'
    
    def fetch_news(self, category='general', country='us', page=1):
        """Fetch news from NewsAPI"""
        try:
            url = f"{self.base_url}/top-headlines"
            params = {
                'country': country,
                'category': category,
                'page': page,
                'pageSize': 10,
                'apiKey': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'ok':
                raise Exception(f"NewsAPI error: {data.get('message', 'Unknown error')}")
            
            # Formatar dados de resposta
            articles = []
            for article in data.get('articles', []):
                articles.append({
                    'id': article.get('urlToImage', '').split('/')[-1] if article.get('urlToImage') else '',
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'url': article.get('url'),
                    'urlToImage': article.get('urlToImage'),
                    'publishedAt': article.get('publishedAt'),
                    'source': article.get('source', {}).get('name'),
                    'content': article.get('content', ''),
                    'author': article.get('author')
                })
            
            return {
                'status': 'success',
                'articles': articles,
                'totalResults': data.get('totalResults', 0)
            }
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch news: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing news: {str(e)}")
