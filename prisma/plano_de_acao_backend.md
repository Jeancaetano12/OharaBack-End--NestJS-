# Plano de Ação: Integração Mod Minecraft ↔ Web API

Este documento descreve os passos lógicos e estruturais para preparar o seu backend (Node.js/Prisma) para receber e vincular os dados gerados pelo mod Cobblemon.

## 1. Atualização do Banco de Dados (Prisma)

**Objetivo:** Preparar o terreno para salvar as capturas e permitir o vínculo com o Discord de forma limpa e retroativa.

- [ ] **Criar a tabela `ContaMinecraft`**
  - Chave primária: `uuid` (String).
  - Relação: Ligar 1-para-1 ou 1-para-N com a tabela `Membros`.
  - Campo extra: `nickAtual` (para exibição amigável no site).
- [ ] **Criar a tabela `PokemonsCapturados`**
  - Chave estrangeira (Opcional): `playerUuid` apontando para `ContaMinecraft`.
  - Campos de dados: `pokemon`, `level`, `pokebola`, `tipos` (Array), `criadoEm`.
- [ ] **Aplicar a Migração**
  - Rodar o comando do Prisma (ex: `prisma migrate dev`) para atualizar o banco de dados oficial.

## 2. Rota de Ingestão de Capturas (A "Esponja")

**Objetivo:** Criar um "ouvido" na sua API para receber o JSON que o mod vai enviar a cada captura.

- [ ] **Criar um endpoint POST (ex: `/api/capturas`)**
  - Esta rota receberá o body contendo: `uuid`, `pokemon`, `level`, `pokeball`, `tipos`.
- [ ] **Lógica de Salvamento**
  - A rota pega esses dados e insere diretamente na tabela `PokemonsCapturados`.
  - *Importante:* Se o Prisma reclamar de chave estrangeira, configure a relação para ser opcional no schema (`ContaMinecraft?`). Isso garante que a captura seja salva mesmo que o jogador nunca tenha acessado o site para se registrar.

## 3. O Sistema de Vínculo Seguro (Token In-Game)

**Objetivo:** Garantir que o membro do Discord realmente é dono da conta do Minecraft sem depender de APIs da Mojang.

- [ ] **Criar Tabela ou Cache para os Tokens Temporários**
  - Você precisará de um lugar (Pode ser uma tabela `TokensVinculo` no Prisma, ou Redis, ou até variável na memória) para guardar dados como: `{ uuid: "1234-abcd", token: "X9K2A", expiraEm: "10 minutos" }`.
- [ ] **Criar Endpoint para Gerar o Token**
  - O mod do Minecraft fará um POST avisando: "O UUID 1234-abcd pediu um token, guarde essa informação e me devolva um token válido".
- [ ] **Criar Endpoint para Validar o Token (Usado pelo frontend do site)**
  - O painel do seu site envia o token que o usuário digitou na tela.
  - O backend verifica quem gerou esse token. Se achar, descobre o `uuid` correspondente.
- [ ] **Efetivar o Vínculo**
  - O backend pega o `uuid` descoberto, pega o `membroId` de quem está logado no site, e cria a linha oficial na tabela `ContaMinecraft`. 
  - *Mágica:* Ao fazer isso, todas as capturas do Passo 2 que estavam soltas com esse `uuid` passam a aparecer no perfil desse membro automaticamente!

## 4. O Mod (Próximos Passos no Java)

**Objetivo:** Fazer o Minecraft conversar com os novos endpoints do seu backend.

- [ ] **Implementar requisições HTTP (HttpClient)**
  - Criar um método no Java para enviar um POST assíncrono para o `/api/capturas` sempre que o evento disparar.
- [ ] **Criar um Comando no Jogo (`/vincular`)**
  - Registrar um comando customizado no NeoForge que inicia o fluxo do Passo 3.
