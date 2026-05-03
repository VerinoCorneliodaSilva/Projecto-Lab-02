import os
from supabase import create_client, Client
from datetime import datetime

class DBService:
    def __init__(self):
        # Try different env var names that might be set
        self.supabase_url = os.getenv('https://vtdfbkgaiotlpnxwrzsi.supabase.co') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('sb_publishable_1i0v9JCPC4JJ-r8frvGVsg_Bih-whUw') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Anonymous Key are required")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    def get_cached_summary(self, article_url):
        """Get cached summary from database"""
        try:
            response = self.supabase.table('article_summaries').select('summary').eq('article_url', article_url).single().execute()
            if response.data:
                return response.data.get('summary')
            return None
        except Exception as e:
            # Se não encontrar, retorna None
            return None
    
    def save_summary(self, article_url, article_title, summary):
        """Save article summary to cache"""
        try:
            self.supabase.table('article_summaries').insert({
                'article_url': article_url,
                'article_title': article_title,
                'summary': summary
            }).execute()
        except Exception as e:
            print(f"Error saving summary: {str(e)}")
    
    def save_user_preferences(self, user_id, categories, keywords, language):
        """Save user preferences"""
        try:
            # Primeiro, tenta atualizar
            self.supabase.table('user_preferences').update({
                'categories': categories,
                'keywords': keywords,
                'language': language,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
        except Exception as e:
            # Se falhar, tenta inserir
            try:
                self.supabase.table('user_preferences').insert({
                    'user_id': user_id,
                    'categories': categories,
                    'keywords': keywords,
                    'language': language,
                    'created_at': datetime.utcnow().isoformat()
                }).execute()
            except Exception as insert_error:
                print(f"Error saving preferences: {str(insert_error)}")
    
    def get_user_preferences(self, user_id):
        """Get user preferences"""
        try:
            response = self.supabase.table('user_preferences').select('*').eq('user_id', user_id).single().execute()
            if response.data:
                return response.data
            return {
                'categories': [],
                'keywords': [],
                'language': 'en'
            }
        except Exception as e:
            return {
                'categories': [],
                'keywords': [],
                'language': 'en'
            }
    
    def save_article(self, user_id, article_url, article_title, article_description='', article_image_url='', article_source=''):
        """Save article for later"""
        try:
            self.supabase.table('saved_articles').insert({
                'user_id': user_id,
                'article_url': article_url,
                'article_title': article_title,
                'article_description': article_description,
                'article_image_url': article_image_url,
                'article_source': article_source,
                'created_at': datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            print(f"Error saving article: {str(e)}")
    
    def get_saved_articles(self, user_id):
        """Get all saved articles for user"""
        try:
            response = self.supabase.table('saved_articles').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            return []
    
    def delete_saved_article(self, article_id):
        """Delete saved article"""
        try:
            self.supabase.table('saved_articles').delete().eq('id', article_id).execute()
        except Exception as e:
            print(f"Error deleting article: {str(e)}")
