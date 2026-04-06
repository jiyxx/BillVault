# 🏦 BillVault Expense Tracker

Welcome to **BillVault**, a comprehensive full-stack web application designed to help you track, analyze, and manage your expenses effortlessly. BillVault stands out by automatically capturing expense data from SMS/WhatsApp messages using NLP and extracting details from uploaded receipt images via OCR.

---

## 📖 Explanation & Features

BillVault is built for users who want a seamless expense tracking experience without manually entering every detail. It features a robust Next.js frontend and an Express.js backend, powered by Firebase.

### Key Features:
- **📊 Interactive Dashboard & Analytics**: Visualize your spending trends, category breakdowns, and monthly comparisons using interactive charts.
- **📱 Automated Expense Parsing**: Forward your SMS or WhatsApp transaction messages, and BillVault's NLP engine will automatically extract the amount, merchant, and category.
- **🧾 Receipt OCR Scanning**: Upload pictures of your bills or receipts. The system utilizes Tesseract.js to perform OCR and automatically fill in your expense details.
- **📂 Export to PDF & Excel**: Generate comprehensive spending reports in PDF or Excel formats for your personal records or accounting needs.
- **🗂️ Custom Categories & Trips**: Organize your spending by creating custom categories or grouping expenses by trips/events.
- **🔒 Secure Authentication**: Robust JWT-based authentication integrated with Firebase to keep your financial data safe.

---

## 🛠️ Tech Stack

BillVault leverages a modern, robust technology stack to ensure performance, scalability, and ease of development.

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (React 18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: Next.js App Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Database Backend**: Firebase Admin (Firestore Database)
- **OCR Engine**: Tesseract.js
- **NLP Processing**: `natural` (Node.js library)
- **Document Generation**: PDFKit (PDFs) & ExcelJS (Excel spreadsheets)
- **File Uploads**: Multer
- **Validation**: Joi
- **Auth Tokens**: jsonwebtoken (JWT)

### Testing & DevOps
- **Testing**: Jest, Supertest
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

---

## 🚀 How to Run

You can run BillVault either native using Node.js or via Docker for an automatically linked containerized experience. Both run modes expect `.env` configuration.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (v9 or higher)
- A Firebase project with Firestore enabled (you will need the service account credentials)
- [Docker & Docker Compose](https://www.docker.com/) (optional, if running as containers)

### Initial Setup (Required for both modes)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd BillVault
   ```

2. **Configure Environment Variables:**
   You will find example `.env` files in both the client and server directories.
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   ```
   *Note: Open both `.env` files and fill in your Firebase credentials, API URLs, and other required variables for the services.*

### Option 1: Local Development (Node.js)

1. **Install Dependencies:**
   Install dependencies for both the frontend and backend.
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Seed the Database (Optional but recommended):**
   Seed your Firestore with default categories to get started quickly.
   ```bash
   cd ../server
   npm run seed
   ```

3. **Start the Development Servers:**
   Start the backend and frontend in separate terminals:
   
   **Terminal 1 (Backend API):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 (Frontend Web):**
   ```bash
   cd client
   npm run dev
   ```

   The API server will run on `http://localhost:5000` and the web client on `http://localhost:3000`.

### Option 2: Running with Docker Compose

If you prefer using Docker, you can spin up the entire application stack with a single command. 

Ensure your `.env` files are configured first as the `docker-compose.yml` mounts them and provides the configuration to the images.

1. **Build and start the containers:**
   ```bash
   docker-compose up --build
   ```
2. The frontend web application will be accessible at `http://localhost:3000` and the API at `http://localhost:5000` on your host machine.

---

## 🧪 Testing

To run the testing suite for the API server (includes both unit and integration tests):
```bash
cd server
npm test
```

## 📜 Project Structure Summary

- `/server`: Node.js Express API. Contains the route controllers, services (containing business logic), DAL (Data Access Layer for Firestore), data models, configuration, testing suites, and OCR/NLP processing logic.
- `/client`: Next.js web application frontend. Composed of Next.js App Router pages, global components, Tailwind styling, and React queries.
- `docker-compose.yml`: Local multi-container Docker deployment config mapping internal ports and injecting environment variables.
- `.github/workflows`: Defines GitHub integration (CI/CD) pipelines to run `npm test` and `npm run lint` on incoming PRs.
