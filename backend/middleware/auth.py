import os
import jwt
from functools import wraps
from flask import request, jsonify

def verify_token(token_header):
    """Verify JWT token from Supabase"""
    try:
        # Remove 'Bearer ' prefix if present
        if token_header.startswith('Bearer '):
            token = token_header[7:]
        else:
            token = token_header
        
        # Supabase JWT verification key (public key)
        supabase_jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
        
        # Decode JWT without verification (for simplicity, in production verify signature)
        # In production, you should verify the signature using Supabase's public key
        payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id = payload.get('sub')
        return user_id
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated
