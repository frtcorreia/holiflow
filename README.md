# HoliFlow - Gestor de Férias e Ausências

HoliFlow é uma aplicação web moderna para gestão de férias e ausências, desenvolvida com React, TypeScript e Tailwind CSS. A aplicação permite que colaboradores solicitem férias e que líderes de equipe gerenciem essas solicitações de forma eficiente.

## 🚀 Funcionalidades

- **Autenticação de Usuários**

  - Login/Registro
  - Recuperação de senha
  - Diferentes níveis de acesso (Colaborador, Team Leader, Admin)

- **Gestão de Férias**

  - Solicitação de férias
  - Aprovação/Rejeição por líderes
  - Visualização do calendário de férias
  - Histórico de solicitações

- **Gestão de Equipa**

  - Visualização de membros da equipa
  - Gestão de permissões
  - Monitoramento de ausências

- **Dashboard**

  - Visão geral das férias
  - Estatísticas de ausências
  - Gráficos informativos

- **Recursos Adicionais**
  - Tema claro/escuro
  - Interface responsiva
  - Notificações em tempo real
  - Logs de acesso

## 🛠️ Tecnologias Utilizadas

- **Frontend**

  - React 18
  - TypeScript
  - Tailwind CSS
  - Vite
  - Zustand (Gerenciamento de Estado)
  - React Router
  - Firebase (Autenticação e Banco de Dados)

- **UI/UX**
  - Lucide Icons
  - Tailwind Animate
  - Radix UI
  - EmailJS (Notificações por email)

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/holiflow.git
cd holiflow
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_EMAIL_SERVICE_ID=seu_email_service_id
VITE_EMAIL_SIGNIN_TEMPLATE_ID=seu_signin_template_id
VITE_EMAIL_SIGNUP_TEMPLATE_ID=seu_signup_template_id
VITE_EMAIL_PUBLIC_KEY=sua_email_public_key
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── hooks/         # Hooks personalizados
├── screens/       # Páginas da aplicação
├── store/         # Gerenciamento de estado
├── types/         # Definições de tipos
├── helpers/       # Funções auxiliares
└── assets/        # Recursos estáticos
```

## 🔒 Segurança

- Autenticação via Firebase
- Proteção de rotas
- Validação de dados
- Logs de acesso
- Política de privacidade

## 🌐 Deploy

O projeto está configurado para deploy na Vercel. Para fazer o deploy:

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para support@holiflow.pt ou abra uma issue no repositório.

## 🙏 Agradecimentos

- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
