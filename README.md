# OharaBack-End (NestJS)

O OharaBack-End é uma API REST robusta desenvolvida com o framework NestJS. Este projeto serve como o núcleo de processamento de dados para o ecossistema "Ohara", gerenciando a integração entre o bot do Discord, o banco de dados e o frontend da aplicação.

Documentação Swagger: https://ohara-back-end.vercel.app/api-docs

## 🚀 Tecnologias Utilizadas
- NestJS: Framework Node.js para construção de aplicativos escaláveis e eficientes.

- Prisma: ORM moderno para Node.js e TypeScript.

- PostgreSQL: Banco de dados relacional (gerenciado via Docker).

- TypeScript: Linguagem principal do projeto.

- Passport.js: Gerenciamento de autenticação (JWT e Discord OAuth2).

- Docker: Containerização do banco de dados e ambiente.

## 🏗️ Estrutura do Projeto
A API segue os padrões de módulos do NestJS:

- src/auth: Gerenciamento de segurança, incluindo estratégias de JWT, Discord e guards (como bot-key.guard.ts e site-key.guard.ts).

- src/membros: CRUD e lógica de negócio para os membros do servidor.

- src/cargos: Gestão de cargos e atribuições.

- prisma/: Esquemas de banco de dados e migrações.

## 🔒 Autenticação
A API implementa múltiplas camadas de segurança:
- Discord OAuth2: Para autenticação de usuários via dashboard.

- JWT: Para manter sessões seguras no frontend.

- API Keys: Para validar a comunicação vinda especificamente do bot ou do site.

## 📄 Licença
Este projeto está sob a licença MIT.