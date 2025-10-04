# Stoix Task Manager

Aplicação full-stack para gerenciamento de tarefas. O backend usa Express + TypeScript com Prisma e SQLite; o frontend foi construido com React, Vite e TypeScript. A API expõe endpoints REST protegidos com CSRF.

## Estrutura do projeto
```
stoix-task-manager/
  backend/        # API Express + Prisma
    prisma/       # Schema e migrations
    src/          # Código-fonte do servidor
  frontend/       # SPA React + Vite
    src/          # Componentes, páginas, serviços e estilos
```

## Requisitos
- Node.js 18 ou superior
- npm 9 ou superior
- (Opcional) Ferramentas SQLite para inspecionar `backend/prisma/dev.db`

## Passo a passo r�pido
1. Abra dois terminais (um para o backend e outro para o frontend).
2. Siga as instruções de cada pasta conforme descrito abaixo.

### Backend
```bash
cd backend
cp .env.example .env      # ajuste se quiser alterar porta/origem/DB
npm install
npm run prisma:gen        # gera o cliente Prisma
npm run prisma:migrate    # aplica migrations e cria o arquivo dev.db
npm run dev               # inicia o servidor com tsx (porta 4000 por padr�o)
```
Variáveis em `backend/.env`:
- `DATABASE_URL`  caminho do banco (padrão `file:./dev.db`)
- `PORT` porta HTTP (padrão `4000`)
- `CLIENT_ORIGIN`  origem permitida para CORS/CSRF (padrão `http://localhost:5173`)

Scripts úteis:
- `npm run dev` inicia o servidor em modo watch (`tsx watch src/server.ts`)
- `npm run build` gera saída em `dist`
- `npm start` executa o build compilado
- `npm run prisma:gen` regenera o cliente Prisma
- `npm run prisma:migrate` executa as migrations de desenvolvimento

### Frontend
```bash
cd frontend
cp .env.example .env      # ajuste VITE_API_BASE_URL se mudar a porta do backend
npm install
npm run dev               # inicia o Vite (porta 5173 por padr�o)
```
Vari�veis em `frontend/.env`:
- `VITE_API_BASE_URL`  URL base da API (padrão `http://localhost:4000/api`)

Scripts úteis:
- `npm run dev` inicia o servidor de desenvolvimento do Vite
- `npm run build` roda o TypeScript e gera `dist`
- `npm run preview` sobe o build de produção para testes locais

### Executando o stack completo
1. Inicie o backend (`npm run dev` na pasta `backend`).
2. Em outro terminal, inicie o frontend (`npm run dev` na pasta `frontend`).
3. Acesse `http://localhost:5173` no navegador. O front obtém o token CSRF em `http://localhost:4000/api/csrf-token` e passa a consumir os endpoints `/api/tasks`.

## Endpoints da API
Base: `http://localhost:4000/api`

| Método | Rota         | Descrição                   |
| ------ | ------------ | --------------------------- |
| GET    | `/csrf-token`| Obtém token CSRF            |
| GET    | `/tasks`     | Lista tarefas               |
| POST   | `/tasks`     | Cria uma nova tarefa        |
| PUT    | `/tasks/:id` | Atualiza uma tarefa         |
| DELETE | `/tasks/:id` | Remove uma tarefa           |

Para operações de escrita, envie o header `X-CSRF-Token` com o token retornado por `/csrf-token`; os cookies precisam ser mantidos (`credentials: "include"`).

## Banco de dados
- SQLite - o padrão (`backend/prisma/dev.db`).
- Para trocar de banco, ajuste `prisma/schema.prisma` e `DATABASE_URL`, depois execute `npm run prisma:migrate`.

## Publicando no GitHub
Ainda sem repositório? Faça assim:
1. Dentro da pasta `stoix-task-manager`, inicialize o git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. No GitHub, crie um repositório vazio (sem README/licença). Copie a URL HTTPS ou SSH exibida.
3. De volta ao terminal:
   ```bash
   git branch -M main             # garante a branch principal como main
   git remote add origin <URL>    # substitua <URL> pela URL do reposit�rio
   git push -u origin main
   ```
4. Após o primeiro push, basta usar `git add`, `git commit` e `git push` para enviar novas mudan�as.

## Próximos passos sugeridos
- Adicionar testes automatizados (Jest/RTL).
- Dockerizar backend e frontend para distribuição.
- Estender o modelo de tarefas (etiquetas, anexos, usuários etc.).
