# 💰 Finora AI — AI-Powered Personal Finance Manager

<div align="center">

![Finora AI Banner](https://img.shields.io/badge/Finora_AI-Personal_Finance_Manager-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0xIDE1aC0ydi0yaDF2LTRoLTF2LTJoMnY2em0wLThoLTJWN2gydjJ6Ii8+PC9zdmc+)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?style=flat-square&logo=openai)](https://openai.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

**A full-stack, AI-powered personal finance management web application.**  
Track expenses, manage budgets, set savings goals, and get intelligent financial insights — all in one beautiful dashboard.

<br/>

[🚀 Live Demo](#-live-demo) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [⚡ Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)

</div>

---

## 📸 Screenshots

<div align="center">

| Dashboard (Dark Mode) | Expense Tracker |
|:---:|:---:|
| ![Dashboard](https://via.placeholder.com/500x300/0f172a/3b82f6?text=Dashboard+Dark+Mode) | ![Expenses](https://via.placeholder.com/500x300/0f172a/22c55e?text=Expense+Tracker) |

| AI Chatbot (FinBot) | Analytics & Charts |
|:---:|:---:|
| ![Chatbot](https://via.placeholder.com/500x300/0f172a/a855f7?text=AI+FinBot+Chatbot) | ![Analytics](https://via.placeholder.com/500x300/0f172a/f59e0b?text=Analytics+Charts) |

</div>

> 💡 Replace the placeholder images above with actual screenshots of your running app!

---

## ✨ Features

### 🔐 Authentication & Security
- Secure **JWT-based** login, registration & logout
- **bcrypt** password hashing (10 salt rounds)
- Forgot password with token-based reset
- Role-based access control (`user` / `admin`)
- Protected routes on both frontend & backend

### 💸 Expense Tracking
- Full **CRUD** — add, edit, delete expenses
- **8 categories**: Food, Bills, Shopping, Transport, Health, Entertainment, Education, Others
- Search, filter by category and date range
- Automatic **budget-exceeded notifications**
- Recurring expense support

### 💰 Income Management
- Track **multiple income sources** (Salary, Freelance, Investment, etc.)
- Monthly income summaries
- Category-wise breakdown

### 📊 Budget Planner
- Set **monthly budgets per category**
- Real-time **progress bars** (green → yellow → red)
- Automatic alerts when budget is approaching or exceeded
- Upsert logic — update existing budgets seamlessly

### 🎯 Savings Goals
- Create goals with **target amounts & deadlines**
- **Circular progress visualisation**
- Completion tracking with milestone celebrations

### 🔔 Bill Reminders
- Manage **recurring & one-time** bill reminders
- Urgency-based colour coding (today/tomorrow/overdue)
- EMI, credit card, insurance, subscription tracking
- Mark-as-paid functionality

### 📈 Analytics Dashboard
- **Area Chart** — 6-month Income vs Expenses trend
- **Pie Chart** — Spending by category
- **Bar Chart** — Monthly expense breakdown
- Real-time summary cards with balance calculation

### 🤖 AI Assistant (FinBot)
- **OpenAI GPT-3.5** powered financial chatbot
- Knows your actual spending data for personalised advice
- Ask questions like:
  - *"Where am I overspending?"*
  - *"How much can I spend this week?"*
  - *"Give me savings tips for my situation"*
- **Rule-based fallback** — works without OpenAI API key
- Conversation history persisted per user

### 💡 AI Budget Suggestions
- Automatically analyses income vs. expenses
- Detects overspending patterns by category
- Generates personalised tips, e.g.:
  > *"Food expenses are 35% of income. Reducing by 10% saves ₹1,200/month."*

### 📄 PDF Reports
- Download **monthly financial reports** as PDFs
- Includes income summary, expense list, net balance
- Powered by **PDFKit** on the server

### 🧮 Finance Calculators
- **EMI Calculator** with interactive pie chart
- **Fixed Deposit** maturity calculator
- Personal finance tips & guides

### 🌙 Dark / Light Mode
- Full **dark mode** support across all pages
- Toggle persisted to localStorage
- Smooth transition via Tailwind CSS

### 🛡️ Admin Panel
- View and manage all users
- System-wide statistics
- Activate / deactivate user accounts

### 🔔 Notification Centre
- Budget alerts, AI suggestions, bill reminders
- Mark as read / delete
- Real-time unread count in header

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.2 | UI component framework |
| React Router DOM | 6.21 | Client-side routing |
| Tailwind CSS | 3.x | Utility-first styling |
| Recharts | 2.10 | Charts (Area, Bar, Pie, Line) |
| Axios | 1.6 | HTTP client with interceptors |
| Lucide React | 0.303 | Icon library |
| React Hot Toast | 2.4 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18 | REST API framework |
| MySQL2 | 3.6 | MySQL driver (Promise API) |
| jsonwebtoken | 9.0 | JWT authentication |
| bcryptjs | 2.4 | Password hashing |
| OpenAI SDK | 4.20 | AI chatbot & suggestions |
| PDFKit | 0.14 | PDF report generation |
| Multer | 1.4 | File upload handling |
| Nodemailer | 6.9 | Email notifications |

### Database
| Technology | Purpose |
|---|---|
| MySQL 8.0+ | Primary relational database |
| 8 tables | users, expenses, income, budgets, savings_goals, reminders, notifications, chat_history |

---

## 📁 Project Structure

```
finora-ai/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   └── db.js                  # MySQL connection pool
│   ├── 📂 middleware/
│   │   └── auth.js                # JWT auth + admin guard
│   ├── 📂 routes/
│   │   ├── auth.js                # Register, login, profile
│   │   ├── expenses.js            # Expense CRUD + summaries
│   │   ├── income.js              # Income CRUD
│   │   ├── budgets.js             # Budget planning (upsert)
│   │   ├── savings.js             # Savings goals CRUD
│   │   ├── reminders.js           # Bill reminders CRUD
│   │   ├── notifications.js       # Notification centre
│   │   ├── dashboard.js           # Aggregated summary API
│   │   ├── ai.js                  # FinBot chatbot + AI suggestions
│   │   ├── reports.js             # PDF report generation
│   │   └── admin.js               # Admin panel APIs
│   ├── 📂 uploads/                # Uploaded files
│   ├── server.js                  # Express entry point
│   ├── schema.sql                 # Full MySQL schema
│   ├── package.json
│   └── .env                       # ⚠️ Not committed — see .env.example
│
└── 📂 frontend/
    ├── 📂 public/
    │   └── index.html
    ├── 📂 src/
    │   ├── 📂 components/
    │   │   └── 📂 Layout/
    │   │       ├── Layout.js      # Main layout wrapper
    │   │       ├── Sidebar.js     # Collapsible navigation
    │   │       └── Header.js      # Top bar with notifications
    │   ├── 📂 context/
    │   │   └── AuthContext.js     # Global auth + dark mode
    │   ├── 📂 pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── Dashboard.js       # Main overview
    │   │   ├── ExpensesPage.js    # Expense tracker
    │   │   ├── IncomePage.js      # Income manager
    │   │   ├── BudgetPage.js      # Budget planner
    │   │   ├── SavingsPage.js     # Savings goals
    │   │   ├── RemindersPage.js   # Bill reminders
    │   │   ├── AnalyticsPage.js   # Charts & reports
    │   │   ├── ChatbotPage.js     # AI FinBot
    │   │   ├── CalculatorPage.js  # EMI / FD calculator
    │   │   ├── NotificationsPage.js
    │   │   ├── ProfilePage.js
    │   │   └── AdminPage.js
    │   ├── 📂 utils/
    │   │   └── api.js             # Axios instance
    │   ├── App.js                 # Routes & providers
    │   ├── index.js
    │   └── index.css              # Tailwind + custom styles
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚡ Quick Start

### Prerequisites

Make sure you have these installed:

- [Node.js v18+](https://nodejs.org/)
- [MySQL 8.0+](https://dev.mysql.com/downloads/)
- [Git](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/finora-ai.git
cd finora-ai
```

### 2️⃣ Set Up the Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql -u root -p < backend/schema.sql
```

Or open `backend/schema.sql` in **MySQL Workbench** and run it.

### 3️⃣ Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=finance_app

# JWT — change this to a long random string!
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d

# OpenAI (optional — app works without it using fallback AI)
OPENAI_API_KEY=sk-...your_key_here

# Email (optional — for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4️⃣ Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🚀 Server running on http://localhost:5000
```

### 5️⃣ Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm install -D tailwindcss autoprefixer
npm start
```

The app opens automatically at **http://localhost:3000** 🎉

---

## 🔑 Demo Credentials

| Field | Value |
|---|---|
| **Email** | `admin@financeapp.com` |
| **Password** | `Admin@123` |
| **Role** | Admin — full access |

---

## 🔌 API Endpoints

<details>
<summary><b>Authentication</b> — click to expand</summary>

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login, returns JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update name/currency/language | ✅ |
| `PUT` | `/api/auth/change-password` | Change password | ✅ |
| `POST` | `/api/auth/forgot-password` | Password reset token | ❌ |

</details>

<details>
<summary><b>Expenses</b> — click to expand</summary>

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/expenses` | List (filters: category, date, search) | ✅ |
| `POST` | `/api/expenses` | Add expense | ✅ |
| `PUT` | `/api/expenses/:id` | Update expense | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete expense | ✅ |
| `GET` | `/api/expenses/summary/category` | Category breakdown | ✅ |
| `GET` | `/api/expenses/summary/monthly` | 12-month trend | ✅ |

</details>

<details>
<summary><b>Income, Budgets, Savings, Reminders</b> — click to expand</summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/api/income` | Income CRUD |
| `GET/POST/DELETE` | `/api/budgets` | Budget management with live spent |
| `GET/POST/PUT/DELETE` | `/api/savings` | Savings goals CRUD |
| `GET/POST/PUT/DELETE` | `/api/reminders` | Bill reminders CRUD |

</details>

<details>
<summary><b>AI, Dashboard & Reports</b> — click to expand</summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send message to FinBot AI |
| `GET` | `/api/ai/suggestions` | Get AI financial suggestions |
| `GET` | `/api/ai/chat-history` | Conversation history |
| `GET` | `/api/dashboard/summary` | Full dashboard aggregation |
| `GET` | `/api/reports/pdf` | Download monthly PDF report |

</details>

---

## 🗄️ Database Schema

```sql
-- 8 Tables
users          -- accounts, roles, preferences
expenses       -- all expense records
income         -- income sources
budgets        -- monthly per-category limits
savings_goals  -- goals with progress tracking
reminders      -- bill & EMI reminders
notifications  -- alerts & AI tips
chat_history   -- FinBot conversation logs
```

All tables use **foreign keys** with `ON DELETE CASCADE` on `user_id`.

---

## 🌐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Backend server port (default: 5000) |
| `DB_HOST` | ✅ | MySQL host (usually `localhost`) |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_NAME` | ✅ | Database name (`finance_app`) |
| `JWT_SECRET` | ✅ | Secret key for signing tokens |
| `JWT_EXPIRE` | ✅ | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `OPENAI_API_KEY` | ⚡ Optional | Enables full AI features |
| `EMAIL_USER` | ⚡ Optional | Gmail for password reset emails |
| `EMAIL_PASS` | ⚡ Optional | Gmail app password |

> ⚡ The app works **without** `OPENAI_API_KEY` — it uses intelligent rule-based fallback suggestions.

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)

```bash
# Set all environment variables in your hosting dashboard
# Then deploy:
npm start
```

### Frontend (Vercel / Netlify)

```bash
# Build the production bundle
cd frontend
npm run build

# Deploy the /build folder to Vercel or Netlify
```

> ⚠️ Update `REACT_APP_API_URL` in frontend to point to your deployed backend URL.

---

## 🐛 Troubleshooting

<details>
<summary><b>❌ MySQL connection failed</b></summary>

```bash
# Check MySQL is running
sudo service mysql start      # Linux / Mac
net start mysql               # Windows

# Verify your .env credentials match MySQL
# Try connecting manually:
mysql -u root -p
```
</details>

<details>
<summary><b>❌ Module not found: Can't resolve '../utils/api'</b></summary>

```bash
# Create the missing file
mkdir -p frontend/src/utils

# Then create frontend/src/utils/api.js with the Axios instance
# (see the file in this repo)
```
</details>

<details>
<summary><b>❌ Failed to load dashboard / expenses</b></summary>

1. Make sure **backend is running** on port 5000
2. Test: open `http://localhost:5000/api/health` in browser
3. Check backend terminal for SQL errors
4. Verify `finance_app` database exists and schema was run
5. Ensure **two terminals** are open simultaneously (backend + frontend)
</details>

<details>
<summary><b>❌ Tailwind styles not applying</b></summary>

```bash
cd frontend
npm install -D tailwindcss autoprefixer postcss
npm start
```
</details>

<details>
<summary><b>❌ Port already in use</b></summary>

```bash
# Kill port 5000
npx kill-port 5000

# Or change PORT in backend/.env
PORT=5001
```
</details>

---

## 📊 Project Stats

```
📁 Total Files          44
💻 Lines of Code      5,000+
🖥️  Frontend Pages       15
🔌 API Endpoints        27+
🗄️  Database Tables       8
⚙️  Backend Routes        11
✅ Feature Modules        17
```

---

## 🗺️ Roadmap

- [x] Core expense & income tracking
- [x] Budget planner with alerts
- [x] Savings goals with progress
- [x] AI chatbot (FinBot)
- [x] PDF report generation
- [x] Dark mode
- [x] Admin panel
- [ ] Mobile app (React Native)
- [ ] Google OAuth login
- [ ] Bank account sync (Plaid API)
- [ ] WhatsApp expense entry bot
- [ ] Multi-currency support
- [ ] Budget templates

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "Add amazing feature"

# 4. Push to your branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please make sure to:
- Follow the existing code style
- Add meaningful commit messages
- Test your changes before submitting

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — feel free to use, modify, and distribute.
Just keep the attribution. 🙏
```

---

## 👨‍💻 Developer

<div align="center">

<img src="https://via.placeholder.com/100/3b82f6/ffffff?text=N" width="100" style="border-radius: 50%"/>

### Nishan HS

**Full Stack Developer** | React · Node.js · MySQL · AI

*Passionate about building beautiful, intelligent web applications*

[![GitHub](https://img.shields.io/badge/GitHub-NishanHS-181717?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nishan_HS-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/YOUR_PROFILE)

</div>

---

<div align="center">

**⭐ If you found this project useful, please give it a star! ⭐**

Made with ❤️ by **Nishan HS**

*Finora AI — Smart Money. Smarter Life.*

</div>
