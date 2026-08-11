# 🚀 Tech & IA Blog

Conteúdo direto, prático e acessível sobre tecnologia, programação, Linux, APIs e Inteligência Artificial.

🌐 **Acesse o blog:**
https://techiablog.vercel.app/

🔌 **API:**
https://tech-ia-blog.onrender.com/api/health

---

## ✨ Sobre o projeto

O **Tech & IA Blog** começou como um projeto simples desenvolvido com HTML, CSS e JavaScript, criado com o objetivo de estudar e compartilhar conhecimentos sobre tecnologia.

Com o tempo, o projeto evoluiu para uma aplicação **full-stack**, incorporando backend, banco de dados PostgreSQL, API REST, autenticação administrativa e um assistente de Inteligência Artificial.

O objetivo é documentar uma jornada prática de aprendizado e criar um espaço onde conteúdos sobre tecnologia possam ser encontrados de forma simples, direta e acessível.

---

## 🌟 Funcionalidades

### 📰 Blog

* Sistema de posts dinâmicos
* Posts armazenados no PostgreSQL
* Organização por categorias
* Artigo em destaque
* Busca de artigos em tempo real
* Filtros por categoria
* Layout responsivo para mobile e desktop
* Dark mode
* Páginas individuais para os artigos
* Layout editorial para leitura
* Listas e tópicos
* Blocos de código
* Botão para copiar código

### 🔐 Painel administrativo

* Login administrativo
* Autenticação utilizando JWT
* Senha protegida com bcrypt
* Criação de posts
* Edição de posts
* Publicação de posts
* Exclusão de posts
* Gerenciamento dos conteúdos através da API

### 🤖 Assistente ✦ Tech & IA

O blog possui um assistente de Inteligência Artificial integrado à página inicial e às páginas dos artigos.

O assistente pode ajudar com:

* Inteligência Artificial
* Linux
* Programação
* Desenvolvimento web
* APIs
* Conceitos de tecnologia
* Explicação de conteúdos técnicos

Além das perguntas comuns, o assistente pode utilizar o **contexto do artigo atual** para fornecer respostas mais relevantes.

Também existem atalhos para:

* ✨ Resumir o artigo
* 💡 Explicar o artigo de forma simples
* 🧠 Explicar o conteúdo tecnicamente

As respostas possuem animação de digitação e formatação adequada para textos e códigos.

### 👤 Contas e comunidade

* Cadastro e login com e-mail e senha
* Login social com Google (OAuth)
* Avatar de perfil enviado ao Supabase Storage
* Menu de conta no topo para alterar foto, e-mail e senha
* Favoritos vinculados à conta
* Progresso de leitura salvo por artigo
* Acesso ao assistente de IA apenas para usuários autenticados

As senhas e as sessões são gerenciadas pelo Supabase Auth. O blog não recebe nem armazena senhas de contas Google.

---

## 🧠 Contexto dos artigos

Quando o assistente é utilizado dentro de um artigo, informações relevantes do conteúdo atual podem ser enviadas ao backend junto com a pergunta.

```text
Artigo atual
     ↓
Título + resumo + conteúdo relevante
     ↓
Backend
     ↓
Modelo de IA
     ↓
Resposta contextualizada
```

Isso permite perguntas como:

> "Pode explicar essa parte de uma forma mais simples?"

sem que o usuário precise copiar e colar todo o conteúdo do artigo.

---

## 💬 Histórico do assistente

O histórico das conversas pode ser armazenado localmente no navegador.

O usuário pode:

* Continuar uma conversa
* Recarregar a página sem perder o histórico local
* Limpar o histórico através do botão disponível no assistente

O histórico local não depende de uma conta ou de armazenamento permanente no banco de dados.

---

## 🔎 SEO e descoberta

* Metatags para páginas principais e artigos
* Dados estruturados (Schema.org)
* `robots.txt`
* Sitemap dinâmico com os artigos publicados
* Propriedade verificada no Google Search Console

---

## 🛡️ Segurança e controle de custos

O assistente foi projetado para evitar uso excessivo da API de Inteligência Artificial.

O backend possui controles para limitar:

* Mensagens por dia
* Mensagens por hora por IP
* Tamanho máximo da pergunta
* Quantidade de mensagens no histórico
* Quantidade máxima de contexto enviado
* Limite de tokens utilizados pela IA

Esses limites são aplicados no **backend**, evitando depender apenas de validações no navegador.

---

## 🧰 Tecnologias utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

### Backend

* Node.js
* Express
* API REST
* JWT
* bcrypt
* Rate limiting

### Banco de dados

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage

### Inteligência Artificial

* Hugging Face
* Inference Providers
* Modelo open-source

### Deploy

* Vercel — Frontend
* Render — Backend
* Supabase — Banco de dados, autenticação e arquivos
* Google Cloud — credenciais OAuth para login com Google

---

## 🏗️ Arquitetura

```text
Visitante
   ↓
Vercel (HTML, CSS e JavaScript)
   ├── Supabase Auth + Storage
   │   └── contas, login Google e avatares
   ↓
Render (Node.js + Express)
   ├── API REST de posts e painel admin
   ├── regras de limite e segurança do chat
   └── integração com Hugging Face
   ↓
Supabase PostgreSQL
   └── posts, favoritos, progresso de leitura e uso da IA
```

---

## ⚙️ Executar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Crie o arquivo `.env`

Use um arquivo `.env` apenas no backend e nunca envie credenciais para o GitHub:

```env
DATABASE_URL=sua_url_de_conexao_postgresql
JWT_SECRET=uma_chave_longa_e_aleatoria
ADMIN_EMAIL=seu_email
ADMIN_PASSWORD_HASH=hash_bcrypt_da_senha
CLIENT_URL=http://localhost:5500
PUBLIC_SITE_URL=http://localhost:5500
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_publica
HF_TOKEN=seu_token_hugging_face
HF_MODEL=Qwen/Qwen2.5-7B-Instruct:fastest
CHAT_RATE_LIMIT=8
CHAT_MAX_TOKENS=340
CHAT_DAILY_LIMIT=10
```

### 3. Inicie a API

```bash
npm run dev
```

Para abrir o frontend, use uma extensão como **Live Server** no VS Code ou um servidor estático local.

> O `SUPABASE_PUBLISHABLE_KEY` pode ficar no frontend, pois é uma chave pública. Nunca exponha `HF_TOKEN`, `JWT_SECRET`, senha administrativa, `DATABASE_URL` ou Client Secret do Google.

---

## 📚 Objetivo

O **Tech & IA Blog** não é apenas um blog.

Ele também funciona como um laboratório prático para estudar e experimentar tecnologias utilizadas no desenvolvimento de aplicações modernas.

Cada funcionalidade representa uma etapa de aprendizado em:

* Frontend
* Backend
* JavaScript
* Node.js
* Express
* APIs REST
* PostgreSQL
* Supabase
* Autenticação
* Segurança
* Deploy
* Inteligência Artificial
* Integração com modelos open-source

---

## ⭐ Contribuição

Sinta-se livre para abrir **Issues**, sugerir melhorias ou contribuir com o projeto.

Toda contribuição é bem-vinda, principalmente ideias relacionadas a:

* Desenvolvimento web
* Inteligência Artificial
* Linux
* APIs
* Segurança
* Performance
* Experiência do usuário

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

Você pode usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e vender cópias do software, desde que o aviso de copyright e a licença sejam mantidos nas cópias ou partes substanciais do software.

Consulte o arquivo [`LICENSE`](LICENSE) para ver o texto completo da licença.


---

## 💙 Feito para aprender

O **Tech & IA Blog** nasceu da curiosidade por tecnologia e evoluiu junto com o aprendizado.

> **Aprender, construir, testar e compartilhar.**

🚀 Feito para quem gosta de tecnologia e quer evoluir junto com ela.
