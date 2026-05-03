#!/bin/bash

# Script para iniciar o backend Flask

cd /vercel/share/v0-project/backend

# Ativar virtual environment
source venv/bin/activate

# Exportar variáveis de ambiente do arquivo .env
export $(cat .env | grep -v '#' | xargs)

# Iniciar Flask
python app.py
