FROM oven/bun:1 as base
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json bun.lock* ./

# Instala dependências
RUN bun install --frozen-lockfile

# Copia o código-fonte e o schema do Prisma
COPY . .

# Compila o projeto
RUN bun run build

EXPOSE 3000

# Executa migrações no banco e inicia a API em modo produção
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start:prod"]
