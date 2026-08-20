
# 💰 Price Drop Alert System

A full-stack MERN web application that helps users track product prices across popular e-commerce platforms and receive email notifications when products reach their desired target price.

The application allows users to securely create an account, add products using product URLs, set target prices, monitor price changes, manually check the latest price, view historical price trends, and receive email alerts when the target price is reached.

---

## 🌐 Live Demo

### 🚀 Live Application

**https://pricedropalertsystem.onrender.com/**

### 📂 GitHub Repository

**https://github.com/DasariSumithra/PriceDropAlertSystem**

---

## 📌 Project Overview

Online product prices can change frequently, making it difficult to know the best time to purchase a product.

The **Price Drop Alert System** solves this problem by automatically monitoring product prices and notifying users when their desired target price is reached.

### How It Works

```text
User
  ↓
Register / Login
  ↓
Add Product URL
  ↓
Set Target Price
  ↓
System Fetches Current Price
  ↓
Price Monitoring
  ↓
Price History Updated
  ↓
Target Price Reached?
  ↓
Email Notification
````

---

# ✨ Features

## 🔐 User Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes
* Secure user-specific product tracking
* Automatic JWT token handling
* Logout functionality

---

## 🛍️ Product Tracking

Users can add products using their e-commerce product URLs.

### Supported Platforms

* Amazon
* Flipkart
* Myntra

Each tracked product contains:

* Product title
* Product URL
* Website
* Current price
* Target price
* Last checked time
* Email alert status
* Active monitoring status

---

## 💰 Target Price Monitoring

Users can set the maximum price they are willing to pay.

Example:

```text
Current Price: ₹2,999
Target Price:  ₹2,499
```

The system continuously monitors the product price.

When:

```text
Current Price <= Target Price
```

the target is considered reached.

---

## 📧 Email Price Alerts

When the product reaches the target price, the system sends an email notification to the user.

The dashboard also displays the notification status.

Example:

```text
📧 Price alert sent

You have been notified that the target price was reached.
```

---

## 🔄 Manual Price Checking

Users can manually check the latest price using:

```text
🔄 Check Price Now
```

The system:

1. Sends a request to the backend.
2. Fetches the latest available price.
3. Updates the product.
4. Saves the price history.
5. Compares the new price with the previous price.
6. Displays the price change.

### Price Dropped

```text
↓ Price dropped by ₹500.00
```

### Price Increased

```text
↑ Price increased by ₹300.00
```

### Price Unchanged

```text
→ Price unchanged
```

---

# 📈 Price History

Each tracked product has a dedicated price history page.

Users can view:

* Current price
* Target price
* Lowest price
* Highest price
* Average price
* Historical prices
* Price changes
* Interactive price trend chart

The price trend visualization is implemented using **Recharts**.

---

# 📊 Dashboard

The dashboard provides a complete overview of all monitored products.

### Dashboard Statistics

* 📦 Total Products
* 🔔 Active Alerts
* 🎯 Target Reached
* 📈 Price Monitoring

Users can also:

* Add products
* Edit products
* Delete products
* Check product prices
* View price history
* Open the original product page

---

# ✏️ Edit Products

Users can edit their tracked products and update the target price.

This allows users to change their desired purchase price without adding the product again.

---

# 🗑️ Delete Products

Users can delete products from their dashboard.

A custom confirmation modal is displayed before deleting a product.

Example:

```text
🗑️ Delete Product?

This action cannot be undone.

Are you sure you want to delete this product?

[ Cancel ]    [ 🗑️ Delete Product ]
```

This prevents accidental product deletion and provides a better user experience than the default browser confirmation popup.

---

# 📱 Responsive Design

The application is responsive and works across different screen sizes.

Supported devices include:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📲 Tablet

The frontend UI is built using responsive Tailwind CSS utilities.

---

# 🛠️ Technologies Used

## Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router DOM
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token
* Nodemailer
* CORS
* dotenv

## External Services

* MongoDB Atlas
* Render
* ScrapingDog API
* Gmail SMTP / Gmail App Password

---

# 🏗️ Application Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │ Desktop / Mobile     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │       + Vite         │
                         │    Tailwind CSS      │
                         └──────────┬───────────┘
                                    │
                              REST API / Axios
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Backend    │
                         │       Node.js        │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
       │   MongoDB    │     │ E-commerce   │     │    Email     │
       │    Atlas     │     │ APIs /       │     │   Service    │
       │              │     │ Scraping     │     │  Nodemailer  │
       └──────────────┘     └──────────────┘     └──────────────┘
```

---

# 📂 Project Structure

```text
PriceDropAlertSystem/
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── PriceHistory.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── productRoutes.js
│   │
│   ├── scheduler/
│   │   └── priceScheduler.js
│   │
│   ├── services/
│   │   ├── productService.js
│   │   └── emailService.js
│   │
│   ├── server.js
│   └── package.json
│
├── fronted/
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AddProduct.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   └── PriceHistory.jsx
│   │   │
│   │   ├── services/
│   │   │   └── productService.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── package.json
```

---

# ⚙️ Installation and Setup

## 1. Clone the Repository

```bash
git clone https://github.com/DasariSumithra/PriceDropAlertSystem.git
```

Navigate into the project:

```bash
cd PriceDropAlertSystem
```

---

# 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_gmail_app_password

SCRAPINGDOG_API_KEY=your_scrapingdog_api_key
```

> ⚠️ Never commit the `.env` file to GitHub.

---

## ▶️ Start Backend

Run:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

---

# 🎨 Frontend Setup

Open a new terminal.

Navigate to the frontend:

```bash
cd fronted
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `fronted` directory.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL.

Usually:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend Environment Variables

| Variable              | Description                            |
| --------------------- | -------------------------------------- |
| `PORT`                | Backend server port                    |
| `MONGO_URI`           | MongoDB Atlas connection string        |
| `JWT_SECRET`          | Secret key used for JWT authentication |
| `EMAIL_USER`          | Email account used to send alerts      |
| `EMAIL_PASS`          | Gmail App Password                     |
| `SCRAPINGDOG_API_KEY` | ScrapingDog API key                    |

## Frontend Environment Variables

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

# 🔌 API Endpoints

## Authentication

### Register User

```http
POST /api/auth/register
```

### Login User

```http
POST /api/auth/login
```

---

# 📦 Product APIs

### Get All Products

```http
GET /api/products
```

Requires authentication.

---

### Add Product

```http
POST /api/products
```

Requires authentication.

---

### Get Single Product

```http
GET /api/products/:id
```

Requires authentication.

---

### Update Product

```http
PUT /api/products/:id
```

Requires authentication.

---

### Delete Product

```http
DELETE /api/products/:id
```

Requires authentication.

---

### Check Product Price

```http
POST /api/products/:id/check-price
```

Requires authentication.

---

### Get Price History

```http
GET /api/products/:id/history
```

Requires authentication.

---

# 🔐 Authentication Flow

The application uses JWT-based authentication.

```text
User
  ↓
Login
  ↓
Backend validates credentials
  ↓
JWT token generated
  ↓
Frontend receives token
  ↓
Token stored on client
  ↓
Axios automatically attaches token
  ↓
Protected API request
  ↓
Backend validates JWT
  ↓
Response returned
```

Protected requests use:

```http
Authorization: Bearer <token>
```

---

# ⏰ Automatic Price Monitoring

The backend contains a price monitoring scheduler.

The scheduler periodically checks tracked products and updates their prices.

The monitoring flow is:

```text
Tracked Product
      ↓
Scheduled Price Check
      ↓
Fetch Latest Price
      ↓
Update Current Price
      ↓
Save Price History
      ↓
Compare With Target Price
      ↓
Target Reached?
    /       \
  YES        NO
   ↓          ↓
Email Alert   Continue Monitoring
```

---

# 📧 Email Notification Flow

When the current price reaches or falls below the target price:

```text
Current Price
      ↓
Compare Target Price
      ↓
Current Price <= Target Price
      ↓
Target Reached
      ↓
Send Email
      ↓
Update Alert Status
      ↓
User Receives Notification
```

---

# 📈 Price History Flow

Every price check can create a price history record.

```text
Product
   ↓
Price Check
   ↓
Current Price
   ↓
PriceHistory
   ↓
checkedAt
```

The history is displayed using an interactive chart.

---

# 🧪 Testing Checklist

Before deploying changes, verify:

* [x] User registration
* [x] User login
* [x] JWT authentication
* [x] Protected dashboard
* [x] Add product
* [x] Edit product
* [x] Delete product
* [x] Delete confirmation modal
* [x] Manual price checking
* [x] Price difference display
* [x] Price history
* [x] Target price calculation
* [x] Email notification
* [x] Responsive mobile UI
* [x] Production deployment

---

# 🚀 Production Deployment

The application is deployed using **Render**.

Production environment variables are configured in the Render dashboard.

The following values should be configured as environment variables:

```text
PORT
MONGO_URI
JWT_SECRET
EMAIL_USER
EMAIL_PASS
SCRAPINGDOG_API_KEY
```

> 🔒 Never commit production credentials or API keys to GitHub.

---

# 🌐 Production URLs

## Live Application

```text
https://pricedropalertsystem.onrender.com/
```

## GitHub Repository

```text
https://github.com/DasariSumithra/PriceDropAlertSystem
```

---

# 🖼️ Screenshots

Screenshots can be added here to demonstrate the application's UI.

## 🔐 Login Page

Add login page screenshot here.

---

## 📝 Registration Page

Add registration page screenshot here.

---

## 📊 Dashboard

Add dashboard screenshot here.

---

## ➕ Add Product

Add add-product screenshot here.

---

## 📈 Price History

Add price history screenshot here.

---

## 📱 Mobile Responsive View

Add mobile screenshot here.

---

# 🔮 Future Improvements

The following features can be considered for future versions:

* Push notifications
* WhatsApp price alerts
* Support for additional e-commerce websites
* Product image support
* Advanced price analytics
* Price prediction
* Wishlist functionality
* Multiple target prices
* User notification preferences
* Improved scraping reliability
* Product search
* Admin dashboard
* Cloud-based scheduled jobs
* Historical price comparison
* Price-drop percentage analysis

---

# 🛡️ Security

The application follows basic security practices including:

* JWT authentication
* Protected API routes
* Password hashing
* Environment variables for sensitive information
* CORS configuration
* User-specific product access
* API authentication
* No sensitive credentials committed to GitHub

---

# 📚 Learning Outcomes

This project provided practical experience in:

* Full-stack MERN development
* React component development
* REST API development
* JWT authentication
* MongoDB database design
* Mongoose models
* Express middleware
* Axios API integration
* Web scraping/API integration
* Email automation
* Scheduled background tasks
* Price tracking
* Data visualization
* Responsive UI development
* Git and GitHub
* Production deployment using Render
* Environment variable management

---

# 💡 Why This Project?

The project was developed to solve a real-world problem:

> Users often wait for products to become cheaper before purchasing them, but manually checking prices is inconvenient.

The Price Drop Alert System automates this process by monitoring product prices and notifying users when their desired price is reached.

---

# 👨‍💻 Author

## Dasari Sumithra

**Full Stack Developer**

### Technical Skills

* HTML
* CSS
* JavaScript
* React.js
* Tailwind CSS
* Node.js
* Express.js
* MongoDB
* Mongoose
* REST APIs
* JWT Authentication
* Git
* GitHub
* Render

---

# ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

### GitHub

[https://github.com/DasariSumithra/PriceDropAlertSystem](https://github.com/DasariSumithra/PriceDropAlertSystem)

### Live Application

[https://pricedropalertsystem.onrender.com/](https://pricedropalertsystem.onrender.com/)
