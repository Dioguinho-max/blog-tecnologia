# 🚀 Tech & IA Blog

> Conteúdo direto e acessível sobre tecnologia, programação, Linux, APIs e Inteligência Artificial. 💻🤖

🔗 **Acesse o blog:** [blog-tecnologia-two.vercel.app](https://blog-tecnologia-two.vercel.app/)

## ✨ Sobre o projeto

O **Tech & IA Blog** nasceu como um projeto de aprendizado em HTML, CSS e JavaScript. Hoje, ele evoluiu para uma aplicação full-stack, com posts dinâmicos, painel administrativo e banco de dados.

O objetivo é compartilhar conhecimento para quem está começando e quer evoluir na área de tecnologia. 📚

## 🌟 Recursos

- 📰 Posts dinâmicos organizados por categoria;
- 🔎 Busca em tempo real e filtros de conteúdo;
- 🌙 Modo escuro no blog, artigos e painel administrativo;
- 📱 Layout responsivo para desktop e celular;
- 🧑‍💻 Blocos de código com botão para copiar;
- 🔐 Área administrativa com login;
- ✍️ Criação, edição, publicação e exclusão de posts;
- ⚡ API REST protegida por JWT;
- 🗄️ Dados armazenados no Supabase PostgreSQL.

## 🧰 Tecnologias

| Área | Tecnologias |
| --- | --- |
| Frontend | HTML, CSS e JavaScript puro |
| Backend | Node.js e Express |
| Banco de dados | Supabase PostgreSQL |
| Hospedagem do frontend | Vercel |
| Hospedagem da API | Render |

## 🏗️ Arquitetura

```text
Visitante
   ↓
Vercel (site e painel)
   ↓
Render (API REST)
   ↓
Supabase (PostgreSQL)
```

## 📁 Estrutura do projeto

```text
blog-tecnologia/
├── backend/          # API Express, autenticação e banco de dados
├── posts/            # Páginas de artigos
├── imagens/          # Imagens locais do blog
├── admin.html        # Painel administrativo
├── index.html        # Página inicial
├── style.css         # Estilos globais
├── script.js         # Interações do frontend
└── render.yaml       # Configuração de deploy da API
```

---

## 🎯 Próximos passos

- [ ] Paginação de posts;
- [ ] Tags e artigos relacionados;
- [ ] Upload de imagens;
- [ ] SEO avançado e sitemap;
- [ ] Integrações de IA para resumos e sugestões de títulos.

---

Feito com dedicação para aprender e compartilhar tecnologia. ⭐
