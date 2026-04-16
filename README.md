# 🍷 VinoVault

VinoVault is a full-stack web platform that helps users **discover wines, manage their personal cellar, and connect with other wine enthusiasts**—all in one place.

It unifies features like recommendations, reviews, inventory tracking, and social interactions into a single seamless workflow, eliminating the need to switch between multiple apps.

---

## 🚀 Features

### 🔍 Wine Discovery & Recommendations

- Search and filter wines by various attributes
- Personalized recommendations based on user behavior
- Similar wine suggestions via recommendation engine

### 📝 Wine Reviews

- Create and view community reviews
- Add ratings, tasting notes, photos, and comments
- Explore feedback from other users

### 🍾 Cellar Management

- Track your personal wine inventory
- Store details like vintage, quantity, and storage location
- Get reminders for optimal drinking windows

### 💰 Wishlist & Price Tracking

- Maintain a wishlist of wines
- Track price changes over time
- Receive alerts for significant price drops

### 👥 Social Features

- User profiles and friend connections
- Private messaging (real-time chat)
- Organize tastings and events

### 🔔 Notifications

- Centralized notification system
- Email alerts for reminders and updates
- User-configurable preferences

---

## 🏗️ Architecture Overview

VinoVault follows a **three-tier client-server architecture**:

```
Web Client  <-->  Backend Server  <-->  Database
                    |
                    +--> External APIs (Price, Email)
```

- **Frontend (Web App)**: Handles user interactions and UI rendering
- **Backend (Application Server)**: Implements business logic and REST APIs
- **Database**: Stores user data, wine metadata, and system records
- **External Services**: Provide price data and email delivery

The system also supports **real-time communication via WebSockets (Socket.IO)** for chat features.

---

## 🧩 Core Components

### Frontend (UI Layer)

- Wine discovery and browsing
- Reviews and social interactions
- Inventory and wishlist management

### Backend Subsystems

- **Wine Review System** – manages user-generated reviews
- **Recommendation & Discovery Engine** – search and ranking logic
- **Profile & Social System** – user relationships and chat metadata
- **Inventory & Reminder System** – cellar tracking + scheduled reminders
- **Notification System** – centralized alerts and preferences

### Data & Integration Layer

- **MongoDB Atlas** for persistence
- **GoPuff API** for wine metadata and pricing
- **Email API** for notifications

All data access is handled through a **Database Connector** to maintain separation of concerns.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript
- **UI Framework**: Tailwind CSS, Radix UI, Material-UI, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **API Design**: RESTful APIs + Swagger
- **Tooling**:
  - Prettier (code formatting)
  - GitHub (version control)

---

## ⚙️ Key Design Decisions

- **Layered Architecture**

  - Separation of UI, business logic, and data layers
  - Improves maintainability and scalability
- **Centralized Notification System**

  - Avoids duplicated logic across features
  - Supports user preferences (quiet hours, frequency limits)
- **Asynchronous Processing**

  - Background scheduler for reminders
  - External API calls handled via connectors to avoid blocking
- **Data Separation**

  - Wine catalog (shared data) vs. user cellar (personal data)
  - Reduces duplication and improves consistency

---

## 🔌 API & Communication

- **REST APIs (JSON over HTTP)** for client-server communication
- **WebSocket (Socket.IO)** for real-time chat
- **Connectors** isolate external dependencies (price APIs, email services)

---

## 📦 Getting Started

### Prerequisites

- Node.js (recommended ≥ 18)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/your-org/vinovault.git
cd VinoVault

cd client
npm install

cd ../server
npm install
```

### Running the App

```bash
cd server
npm run dev

cd ../client
npm run dev
```

---

## 📈 Future Improvements

- Microservices extraction (recommendation, pricing)
- Advanced recommendation algorithms
- Mobile app support
- Multi-language localization
- Analytics & insights dashboard

---

## 👥 Team

**Team SX-8**
