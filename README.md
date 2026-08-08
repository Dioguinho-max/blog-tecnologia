# Tech & IA Blog

Blog full-stack de tecnologia. A interface funciona de forma estática como fallback e consome automaticamente a API quando ela está disponível.

## Executar localmente

1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env` e preencha a URL de conexão PostgreSQL do Supabase.
3. Para login, defina `ADMIN_PASSWORD_HASH` como hash bcrypt. Gere um com `node -e "require('bcryptjs').hash('SUA_SENHA', 12).then(console.log)"`.
4. Inicie com `npm run dev` e acesse `http://localhost:3000`.

## API

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/api/posts?search=&categoria=&page=&limit=` | Público |
| GET | `/api/posts/:id` | Público |
| POST | `/api/posts` | Admin (Bearer token) |
| PUT | `/api/posts/:id` | Admin (Bearer token) |
| DELETE | `/api/posts/:id` | Admin (Bearer token) |
| POST | `/api/auth/login` | Público |

O backend deve ser hospedado em um serviço com Node.js, como Render, Railway ou VPS. GitHub Pages atende apenas ao frontend estático.

## Deploy no Render

O arquivo `render.yaml` já configura o deploy da aplicação inteira — frontend e API no mesmo endereço.

1. Envie este repositório para o GitHub.
2. No [Render](https://render.com), selecione **New +** → **Blueprint** e conecte o repositório.
3. Preencha `DATABASE_URL`, `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` nas variáveis de ambiente. O `JWT_SECRET` é gerado automaticamente.
4. Faça o deploy. A verificação de saúde estará em `/api/health`.

Não envie o arquivo `.env` ao GitHub: ele já está protegido pelo `.gitignore`.
