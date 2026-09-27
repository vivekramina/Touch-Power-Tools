# TouchPower™ — Pro-Grade Power Tools & Hardware Platform

> **Full-stack heavy-duty power tools eCommerce platform featuring an intelligent AI hardware assistant, real-time order tracking, and admin dashboard.**

---

## 🛠️ Overview

**TouchPower** is a modern full-stack eCommerce application designed for contractors, technicians, and heavy-duty tool enthusiasts. It showcases industrial-grade power tools, diamond blades, precision bits, and safety gear, backed by live jobsite reviews, interactive order tracking, an admin control center, and an intelligent AI shopping assistant.

---

## ✨ Features

- **🛒 Interactive Catalog**: Browse pro-grade machines, blades, bits, and safety gear with instant multi-brand filtering and responsive search.
- **🤖 AI Hardware Assistant**: Built-in AI shopping advisor to guide contractors in selecting the right blades, RPM settings, and power tools for their jobsites.
- **📦 Real-Time Order Tracking**: Comprehensive tracking system with milestone progression (Order Confirmed → Packed → Shipped → Out for Delivery).
- **📊 Admin Portal**: Manage inventory, update product listings, view live orders, and track stock counts.
- **🎥 Field-Tested Video Demos**: Integrated YouTube jobsite demonstration videos directly on product detail cards.
- **⚡ High Performance & Responsive UI**: Styled with Tailwind CSS and customized typography (`Outfit`, `Manrope`, `Space Mono`) for desktop, tablet, and mobile.

---

## 🏗️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), Tailwind CSS, HTML5
- **Backend**: Node.js, Express / Native HTTP Server (`server.js`)
- **Database**: PostgreSQL / Supabase (`supabase_schema.sql`)
- **Typography**: Google Fonts (`Outfit`, `Manrope`, `Space Mono`)

---

## 📁 Project Structure

```text
TouchPower/
├── assets/                  # Product imagery, banners, icons
├── css/                     # Custom component stylesheets
├── js/
│   ├── app.js               # Application bootstrap & initialization
│   ├── router.js            # Client-side router
│   ├── store.js             # Centralized application state management
│   ├── components/          # Reusable UI components (Hero, Navbar, Footer, etc.)
│   ├── data/                # Seed product catalog & specs
│   └── pages/               # Page controllers (Catalog, Tracking, Admin, etc.)
├── scripts/                 # Database initialization and utility scripts
├── index.html               # Main single-page application entry point
├── server.js                # Node.js backend server
├── supabase_schema.sql      # Supabase/PostgreSQL database schema & triggers
├── package.json             # Node dependencies and scripts
└── .gitignore               # Excludes node_modules and secrets
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

### 2. Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TouchPower.git
   cd TouchPower
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your database:
   - Import `supabase_schema.sql` into your Supabase or PostgreSQL SQL Editor.
   - Set up your database connection in environment variables or configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

---

## 📄 License

This project is licensed under the ISC License.
