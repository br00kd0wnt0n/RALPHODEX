# Creator Rolodex 🎨

A comprehensive full-stack creator database and management system with AI-powered insights and recommendations, built with React, Node.js, PostgreSQL, and OpenAI integration.

![Creator Rolodex](https://img.shields.io/badge/Creator-Rolodex-EB008B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)

## 🚀 Features

### ✨ Core Functionality
- **Creator Database**: Comprehensive creator profiles with social media handles, audience metrics, and engagement rates
- **Smart Search & Filtering**: Find creators by name, content type, tags, and verification status
- **Interactive Dashboard**: Real-time analytics and creator management interface
- **Secure Authentication**: JWT-based auth system with role-based access control

### 🤖 AI-Powered Features
- **Creator Insights**: AI-generated marketability scores, key strengths analysis, and content strategy recommendations
- **Collaboration Recommendations**: Intelligent creator matching and campaign idea generation
- **Brand Fit Analysis**: Automated brand partnership recommendations based on creator profiles
- **Fallback Intelligence**: Works with or without OpenAI API key configuration

### 🎨 Design & UX
- **Ralph Branding**: Custom color scheme with Ralph brand colors (#EB008B, #31BDBF, #F16524)
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Intuitive Navigation**: Clean, professional interface with collapsible sections
- **Real-time Updates**: Live data synchronization and instant feedback

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT** authentication
- **OpenAI API** integration
- **CORS** enabled for cross-origin requests

### DevOps
- **Docker** containerization
- **Docker Compose** for orchestration
- **PostgreSQL** database
- **Nginx** for frontend serving
- **Health checks** and monitoring

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## 🔧 Installation

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd ralph-creator-database
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
\`\`\`

Edit the `.env` file with your database credentials:
\`\`\`env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/ralph_creator_db
JWT_SECRET=your-super-secret-jwt-key
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ..
npm install
cp .env.example .env
\`\`\`

Edit the `.env` file:
\`\`\`env
REACT_APP_API_URL=http://localhost:3001/api
\`\`\`

### 4. Database Setup
\`\`\`bash
createdb ralph_creator_db
cd backend
npm run migrate
\`\`\`

### 5. Start Development Servers

Backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`

Frontend:
\`\`\`bash
npm start
\`\`\`

## 🔐 Default Login

- **Username**: ralph_admin
- **Password**: password

## 📊 Database Schema

### Creators Table
- Personal information (name, email, phone)
- Social media handles (Instagram, TikTok, YouTube, Twitter)
- Audience metrics (size, engagement rate)
- Content categorization and tagging
- Verification status

### Interactions Table
- Creator relationship tracking
- Project context and notes
- Interaction types and dates
- Potential fit scoring

## 🚀 Deployment

### Railway.app Deployment

1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy backend and frontend services
4. Configure database connection

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<secure-random-string>
RAILWAY_STATIC_URL=<your-app-url>
\`\`\`

## 📁 Project Structure

\`\`\`
ralph-creator-database/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment config
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth and validation middleware
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Utility functions
│   ├── tests/               # Backend tests
│   ├── .env.example         # Environment template
│   ├── package.json
│   └── server.js           # Entry point
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── store/             # Redux store and slices
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   └── App.tsx            # Main App component
├── public/                # Static assets
├── .env.example          # Frontend environment template
└── README.md
\`\`\`

## 🔮 Future Enhancements

- [ ] AI-powered creator recommendations
- [ ] Social media API integrations
- [ ] Advanced analytics dashboard
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications and reminders
- [ ] Bulk import/export capabilities
- [ ] Advanced search with AI insights
- [ ] Integration with project management tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license - see the backend package.json for details.