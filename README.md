# Chatbot Generator - Générateur de Chatbots pour Sites Web

A comprehensive web platform that enables users to configure, create, and deploy customized chatbots for their websites. Visitors can interact with these chatbots and ask questions related to the specific website content using **RAG (Retrieval-Augmented Generation)** technology.

## 📋 Overview

This project is a **chatbot generator for websites** that allows users to create, configure, and deploy personalized chatbots on their websites. Visitors can interact with these chatbots to get answers based on the specific content of the site.

## 🏗️ Architecture

This project follows a **microservices architecture** with three main components:

### Frontend (React + Vite)

- **Location**: `frontend/`
- **Technology**: React with Vite
- **Purpose**: Admin dashboard for chatbot configuration and management
- **Features**:
  - Bot configuration interface
  - Resource management
  - Design customization
  - Website integration tools

### Backend (Node.js + TypeScript)

- **Location**: `backend/`
- **Technology**: Node.js with TypeScript and Express.js 5.1
- **Database**: PostgreSQL with Drizzle ORM
- **Purpose**: Core API and business logic
- **Features**:
  - JWT-based authentication (access + refresh tokens)
  - RBAC (Role-Based Access Control) with 3 roles
  - Bot configuration management (CRUD)
  - Database operations with Drizzle ORM
  - AI service communication via HTTP
  - Static file serving (generated bot widgets)
  - Dynamic JavaScript widget generation

### AI Service (FastAPI + OpenAI)

- **Location**: `servicePython/`
- **Technology**: FastAPI with OpenAI API
- **Purpose**: Natural language processing and response generation
- **Features**:
  - RAG (Retrieval-Augmented Generation) implementation
  - Context-aware responses based on website content
  - Website-specific knowledge integration
  - OpenAI API integration

## 🔄 Data Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Frontend │      │ Backend  │      │Service  │      │   DB     │
│ (React)  │◄────►│(Node.js) │◄────►│  AI     │      │(Postgres)│
└──────────┘ HTTP └──────────┘ HTTP └──────────┘      └──────────┘
```

**Chat Flow with RAG:**

1. User sends message via chatbot widget
2. Backend retrieves bot configuration from database
3. Backend sends message + config to AI Service
4. AI Service performs RAG (retrieves relevant content from sources)
5. AI Service generates response using OpenAI
6. Response returned to backend → widget → user

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL database
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/hatemAfli/chatbot-project.git
cd chatbot-project
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and configure (see Configuration section below)
# Required environment variables:
# - DATABASE_URL
# - ACCESS_TOKEN_SECRET
# - REFRESH_TOKEN_SECRET

# Run database migrations
npx drizzle-kit migrate

# (Optional) Seed the database with test data
npx ts-node scripts/seed.ts

# Start the backend server in development mode
npm run dev
# Or build and run in production:
npm run build
npm start
```

The backend will run on **http://localhost:3000**

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

### 4. AI Service Setup

```bash
# Navigate to Python service directory
cd servicePython

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# Or install manually:
# pip install fastapi uvicorn openai python-dotenv

# Create .env file with your OpenAI API key
# OPENAI_API_KEY=your-api-key-here

# Start the FastAPI service
uvicorn service:app --reload --port 8000
```

The AI service will run on **http://localhost:8000**

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_db"

# JWT Secrets (generate strong random strings)
ACCESS_TOKEN_SECRET="your-access-token-secret-key-here"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-key-here"

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for invitations)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

**Note**: Generate secure random strings for JWT secrets. You can use:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### AI Service (`servicePython/.env`)

```env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Note**: Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🚀 Usage

### Starting the Application

1. **Start all services** in the following order:

   ```bash
   # 1. Start PostgreSQL database (if not running as a service)

   # 2. Start Backend (in backend/ directory)
   cd backend
   npm run dev

   # 3. Start AI Service (in servicePython/ directory, new terminal)
   cd servicePython
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn service:app --reload --port 8000

   # 4. Start Frontend (in frontend/ directory, new terminal)
   cd frontend
   npm run dev
   ```

2. **Access the application**:
   - **Frontend Dashboard**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **AI Service**: http://localhost:8000

### Creating a Chatbot

1. **Login** to the admin dashboard
2. **Create a new bot** with a name and status
3. **Configure the bot**:
   - **General**: Name, domain of expertise, description
   - **Design**: Colors, fonts, icons, animations
   - **Behavior**: Personality, default responses
   - **Sources**: URLs and files for RAG (knowledge base)
   - **Contact**: Email, phone for escalations
4. **Publish the bot** to generate the embed code
5. **Copy the HTML snippet** and integrate it into your website

### API Endpoints

#### Authentication

- `POST /auth` - Login (returns access token)
- `GET /refreshToken` - Refresh access token
- `POST /auth/invite` - Invite user by email
- `POST /auth/accepte` - Accept invitation
- `GET /logout` - Logout

#### Bots

- `POST /bots` - Create a bot
- `GET /bots` - Get all bots
- `GET /bots/:id` - Get bot by ID
- `PUT /bots/:id` - Update bot
- `DELETE /bots/:id` - Delete bot
- `POST /bots/:id/publish` - Publish bot (generates widget)
- `GET /bots/user/:id` - Get user's bots

#### Bot Configurations

- `POST /botConfigs` - Create configuration (admin+)
- `GET /botConfigs` - Get all configurations
- `GET /botConfigs/:id` - Get configuration by bot ID
- `PUT /botConfigs/:id` - Update configuration (admin+)
- `DELETE /botConfigs/:id` - Delete configuration (admin+)

#### Chat

- `POST /chat/:botId` - Send message to chatbot

#### Users

- `POST /users` - Create user
- `GET /users` - Get all users
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🧪 Testing

A test environment is available in the `test/` directory for bot integration testing.

```bash
cd test
npm install
npm start
```

This will start a simple HTML page where you can test the chatbot widget integration.

## 📁 Project Structure

```
ChatBot Generator/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── controllers/       # Business logic (auth, bots, chat)
│   │   ├── db/                # Database schema and relations
│   │   ├── middleware/        # JWT verification, RBAC
│   │   ├── routes/            # API route definitions
│   │   ├── public/            # Generated bot widgets (JS files)
│   │   └── index.ts           # Express server entry point
│   ├── drizzle/              # Database migrations
│   ├── scripts/               # Utility scripts (seed)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── servicePython/              # FastAPI AI service
│   ├── service.py             # Main FastAPI app with RAG
│   └── .env                   # OpenAI API key
│
├── test/                       # Integration testing
│   ├── index.html
│   └── bot-*.js               # Test bot widgets
│
├── ARCHITECTURE_BACKEND.md    # Detailed backend architecture
├── RESUME_PRESENTATION.md     # Presentation summary
└── README.md                   # This file
```

## 🗄️ Database Schema

The project uses PostgreSQL with the following main tables:

- **`users`** - System users with roles (superadmin, admin, analyste)
- **`bots`** - Chatbots created by users
- **`bot_configs`** - Bot configurations (general, design, behavior, sources, contact)
- **`conversation`** - Chat sessions
- **`messages`** - Individual messages with sources used
- **`userBot`** - Many-to-many relationship between users and bots
- **`refresh_tokens`** - JWT refresh tokens
- **`statistics_daily`** - Daily statistics per bot
- **`invitation`** - User invitations

See `ARCHITECTURE_BACKEND.md` for detailed schema documentation.

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Password Hashing**: bcrypt for secure password storage
- **RBAC**: Role-Based Access Control (superadmin, admin, analyste)
- **HTTP-only Cookies**: Refresh tokens stored securely
- **CORS**: Configured for allowed origins
- **Input Validation**: Request validation on all endpoints

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm run build      # Compile TypeScript
npm start          # Run production build
```

### Database Migrations

```bash
cd backend
npx drizzle-kit generate    # Generate migration from schema changes
npx drizzle-kit migrate     # Apply migrations to database
npx drizzle-kit studio      # Open Drizzle Studio (DB GUI)
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📚 Documentation

- **`ARCHITECTURE_BACKEND.md`** - Complete backend architecture documentation

## 🐛 Troubleshooting

### Backend won't start

- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Ensure all environment variables are set

### AI Service errors

- Verify `OPENAI_API_KEY` is set in `servicePython/.env`
- Check OpenAI API key is valid and has credits
- Ensure service is running on port 8000

### Database connection issues

- Verify PostgreSQL is installed and running
- Check database exists: `CREATE DATABASE chatbot_db;`
- Run migrations: `npx drizzle-kit migrate`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

```
MIT License

Copyright (c) 2025 Chatbot Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Note**: This project is actively being developed (Frontend part). For detailed architecture documentation, see `ARCHITECTURE_BACKEND.md`.
