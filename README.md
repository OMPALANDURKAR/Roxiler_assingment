# Stores Rating System

A full-stack web application where users can **sign up, log in, and rate stores**. The project includes a **backend API** (Node.js + Express + MySQL) and a **frontend interface** (React + Vite).


## Features
- User authentication (Sign up, Log in).  
- Store listing and rating system.  
- Dashboard with store insights.  
- MySQL database integration.  
- Responsive frontend using React.  


## Tech Stack
**Frontend:** React, Vite, TailwindCSS  
**Backend:** Node.js, Express.js, MySQL  
**Database:** MySQL  
**Other Tools:** Nodemon, Axios  


## Project Structure
```
Roxiler_assingment-main/
│── backend/              # Node.js + Express backend
│   ├── node_modules/     # Dependencies
│   ├── index.js          # Entry point (server setup)
│   ├── package.json      # Backend dependencies
│   ├── database/         # MySQL connection & queries (if included)
│
│── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── Components/   # Reusable UI components (Navbar, StoreCard, etc.)
│   │   ├── Pages/        # App pages (Login, Signup, Dashboard, Stores, etc.)
│   │   ├── assets/       # Static files (logos, images)
│   │   ├── App.jsx       # Main React app
│   │   ├── main.jsx      # React DOM entry
│   ├── index.html        # Root HTML
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.js    # Vite configuration
│
│── README.md             # Project documentation
```


## Installation & Setup

### 1.Clone the Repository
```bash
git clone https://github.com/yourusername/Roxiler_assingment.git
cd Roxiler_assingment-main
```

### 2.Backend Setup
```bash
cd backend
npm install
npm start
```
- Server will start at `http://localhost:5000` (or configured port).  
- Ensure MySQL is running and credentials are set correctly in your backend files.

### 3.Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Frontend will run at `http://localhost:5173` (Vite default).  


## Usage
- Open the frontend URL.  
- Sign up or log in.  
- Browse stores and rate them.  
- View ratings and dashboard analytics.  


## Future Improvements
- JWT authentication for secure login.  
- Role-based access control (Admin, User).  
- Deployment on cloud (Vercel for frontend, Render/Heroku for backend).  
- Better dashboard with charts (using Chart.js or Recharts).  
