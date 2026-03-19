# HNU Marketplace

A second-hand buy/sell marketplace exclusively for Holy Name University students.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Real-time Chat**: Socket.io
- **Image Uploads**: Cloudinary
- **Auth**: JWT + bcrypt (restricted to @hnu.edu.ph emails)

---

## Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) 8.0 or higher
- A free [Cloudinary](https://cloudinary.com) account

---

## Setup Instructions

### 1. Set up the MySQL Database

Open MySQL and run:

```sql
source /path/to/hnu-marketplace/server/config/schema.sql
```

Or paste the contents of `server/config/schema.sql` directly into your MySQL client (MySQL Workbench, TablePlus, DBeaver, etc.).

---

### 2. Configure Environment Variables

Copy the example env file:

```bash
cd server
cp .env.example .env
```

Then open `server/.env` and fill in your values:

```
PORT=5000
CLIENT_URL=http://localhost:5173

JWT_SECRET=make_this_a_long_random_string

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hnu_marketplace

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Cloudinary**: Sign up free at https://cloudinary.com → Dashboard → copy Cloud Name, API Key, API Secret.

---

### 3. Install Dependencies

From the root of the project:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 4. Run the Project

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
You should see:
```
🚀 Server running on http://localhost:5000
✅ MySQL connected successfully
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
You should see:
```
VITE ready on http://localhost:5173
```

---

### 5. Open the App

Visit: **http://localhost:5173**

Register with your HNU email (must end in `@hnu.edu.ph`).

---

## Project Structure

```
hnu-marketplace/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard
│   │   ├── context/         # AuthContext, SocketContext
│   │   └── pages/           # All page components
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                  # Express backend
    ├── config/
    │   ├── db.js            # MySQL connection
    │   ├── cloudinary.js    # Cloudinary + multer
    │   └── schema.sql       # Database schema
    ├── middleware/
    │   └── auth.js          # JWT middleware
    ├── routes/
    │   ├── auth.js          # Register, login, profile
    │   ├── products.js      # CRUD listings
    │   ├── categories.js    # Category list
    │   └── chat.js          # Conversations & messages
    ├── socket/
    │   └── chat.js          # Socket.io real-time logic
    └── index.js             # Entry point
```

---

## Features
- 🔐 HNU-only registration (@hnu.edu.ph emails)
- 🛍️ Buy & sell listings with images
- 🔍 Search, filter by category, sort by price
- 💬 Real-time chat between buyers and sellers (Socket.io)
- 📸 Image uploads via Cloudinary (up to 5 per listing)
- 📋 My Listings management (mark sold, delete)
- 👤 Student profile with course & year level
