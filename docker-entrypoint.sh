#!/bin/sh
set -e

echo "🔄 Aguardando PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done

echo "✅ PostgreSQL conectado!"
echo "🔄 Sincronizando schema do banco..."

# Instala prisma temporariamente e faz o push
npm install -g prisma@6.19.3
prisma db push --accept-data-loss --schema=/app/prisma/schema.prisma

echo "✅ Schema sincronizado!"
echo "🚀 Iniciando aplicação..."

# Muda para usuário nextjs e inicia o Next.js
su-exec nextjs node server.js
