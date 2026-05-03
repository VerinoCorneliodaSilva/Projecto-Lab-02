import os
from groq import Groq

class AIService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv('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'))
        self.model = 'mixtral-8x7b-32768'  # Modelo rápido do Groq
    
    def generate_summary(self, title, content, max_length=300):
        """Generate article summary using Groq AI"""
        try:
            # Criar prompt para resumo
            prompt = f"""Faça um resumo conciso do seguinte artigo em português. 
O resumo deve ter no máximo {max_length} caracteres e ser informativo.

Título: {title}

Conteúdo: {content}

Resumo:"""
            
            # Chamar API do Groq
            message = self.client.messages.create(
                model=self.model,
                max_tokens=150,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extrair texto da resposta
            summary = message.content[0].text.strip()
            
            # Limitar ao tamanho máximo
            if len(summary) > max_length:
                summary = summary[:max_length - 3] + "..."
            
            return summary
        except Exception as e:
            raise Exception(f"Failed to generate summary: {str(e)}")
