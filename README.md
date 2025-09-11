# Ralph Creator Database

A comprehensive platform for managing content creator relationships, tracking interactions, and analyzing performance metrics.

## 🚀 Features

- **Creator Management**: Comprehensive profiles with social media handles, audience metrics
- **Interaction Tracking**: Record and track all creator interactions with project context
- **Search & Filter**: Advanced search capabilities with tags and filters
- **Authentication**: Secure JWT-based authentication system
- **Analytics**: Dashboard with key metrics and performance indicators
- **Responsive Design**: Modern UI built with Material-UI

## 🛠️ Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL with Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- Material-UI for components
- React Router for navigation
- Axios for API calls

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- Railway.app account (for deployment)

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