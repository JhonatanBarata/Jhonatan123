# Sistema de Pedidos Online

Um sistema completo para restaurantes e lanchonetes gerenciarem seus produtos e receberem pedidos online com temas personalizados baseados no domínio do email.

## 🚀 Funcionalidades

- **Temas Personalizados**: Cada negócio tem seu próprio visual baseado no domínio do email
- **Cardápio Digital**: Apresentação atrativa dos produtos com imagens e descrições
- **Pedidos Online**: Sistema completo de carrinho de compras
- **Dashboard Administrativo**: Gerenciamento de produtos, pedidos e personalização
- **Autenticação JWT**: Sistema seguro de login e registro
- **API REST**: Backend profissional com validação e tratamento de erros

## 🛠️ Tecnologias

### Frontend
- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Axios** para requisições HTTP

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma** + **PostgreSQL** para banco de dados
- **JWT** para autenticação
- **Zod** para validação
- **Winston** para logging

### Infraestrutura
- **Docker Compose** para desenvolvimento
- **PostgreSQL** como banco de dados

## 📦 Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+
- npm ou yarn

### Passos para executar

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd sistema-pedidos
   ```

2. **Inicie os containers**
   ```bash
   docker-compose up -d
   ```

3. **Instale as dependências do frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Execute as migrações do banco**
   ```bash
   cd ../backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Inicie o frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```

6. **Acesse a aplicação**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

## 🎨 Temas Personalizados

O sistema suporta temas automáticos baseados no domínio do email:

- **@pizzaria.com**: Tema vermelho para pizzarias
- **@burger.com**: Tema verde para hamburguerias
- **@sushi.com**: Tema roxo para restaurantes de sushi

Os donos de negócio podem personalizar completamente as cores, nome e slogan através do dashboard.

## 📱 Como Usar

### Para Clientes
1. Acesse http://localhost:3001/pedir
2. Navegue pelos produtos disponíveis
3. Adicione itens ao carrinho
4. Informe seu nome e faça o pedido
5. Receba confirmação imediata

### Para Donos de Negócio
1. Acesse http://localhost:3001/register para criar conta
2. Faça login em http://localhost:3001/login
3. No dashboard, personalize o tema do seu negócio
4. Adicione e gerencie seus produtos
5. Acompanhe os pedidos recebidos
6. Compartilhe o link http://localhost:3001/pedir com seus clientes

## 🔧 Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── index.ts              # Servidor principal
│   │   ├── modules/
│   │   │   ├── auth/            # Autenticação JWT
│   │   │   ├── products/        # CRUD de produtos
│   │   │   ├── pedidos/         # Sistema de pedidos
│   │   │   └── theme/           # Gerenciamento de temas
│   │   └── prisma/
│   │       └── schema.prisma    # Schema do banco
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Páginas Next.js
│   │   │   ├── dashboard/       # Dashboard admin
│   │   │   ├── login/           # Página de login
│   │   │   ├── register/        # Página de registro
│   │   │   ├── produtos/        # Gerenciamento de produtos
│   │   │   ├── pedidos/         # Lista de pedidos
│   │   │   └── pedir/           # Página pública de pedidos
│   │   ├── contexts/            # Contextos React
│   │   │   ├── ThemeContext.tsx # Gerenciamento de temas
│   │   │   └── CartContext.tsx  # Carrinho de compras
│   │   └── services/
│   │       └── api.ts           # Cliente HTTP
│   └── Dockerfile
└── docker-compose.yml
```

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Validação de entrada com Zod
- Sanitização de dados
- Logs estruturados com Winston
- CORS configurado adequadamente

## 🚀 Próximos Passos

- [ ] Integração com WhatsApp para notificações
- [ ] Sistema de pagamentos online
- [ ] Relatórios e analytics
- [ ] App mobile para clientes
- [ ] Integração com delivery services
- [ ] Sistema de avaliações e comentários

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de enviar pull requests.

## 📞 Suporte

Para suporte, entre em contato através das issues do GitHub ou envie um email para suporte@sistema-pedidos.com.