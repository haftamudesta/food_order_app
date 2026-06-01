# Food Delivery App <a name="readme-top"></a>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white" alt="Cloudinary" />
  <h3><b>Food Delivery App</b></h3>
  <p>Complete Restaurant Food Delivery Platform with Online Payments</p>
</div>

<!-- TABLE OF CONTENTS -->

<details>
  <summary>
    <h1>📗 Table of Contents</h1>
  </summary>

- [📖 About the Project](#about-project)
  - [🛠 Built With](#built-with)
    - [Tech Stack](#tech-stack)
    - [Key Features](#key-features)
- [💻 Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Install](#install)
  - [Environment Variables](#environment-variables)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
- [👥 Author](#author)
- [📈 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐ Show your support](#support)
- [📝 License](#license)
</details>

<!-- PROJECT DESCRIPTION -->

# Food Delivery App <a name="about-project"></a>

**Food Delivery App** is a full-stack restaurant food delivery platform that enables users to browse restaurants, view menus, place orders, and make secure online payments. The platform includes role-based authentication for customers, restaurant owners, and administrators, with features like real-time order tracking, payment processing, AI-powered food descriptions, and comprehensive dashboard analytics.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary> Frontend</summary>
  <ul>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="react" width="45" height="45"/> React 18</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redux/redux-original.svg" alt="redux" width="45" height="45"/> Redux Toolkit</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="tailwindcss" width="45" height="45"/> TailwindCSS</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vite/vite-original.svg" alt="vite" width="45" height="45"/> Vite</li>
  </ul>
</details>

<details>
  <summary> Backend</summary>
  <ul>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="nodejs" width="45" height="45"/> Node.js</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="express" width="45" height="45"/> Express.js</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" alt="mongodb" width="45" height="45"/> MongoDB</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongoose/mongoose-original.svg" alt="mongoose" width="45" height="45"/> Mongoose</li>
  </ul>
</details>

<details>
  <summary> Payment & Media</summary>
  <ul>
    <li>💳 Stripe API</li>
    <li>☁️ Cloudinary</li>
    <li>🤖 Groq AI API</li>
  </ul>
</details>

<details>
  <summary> Authentication & Security</summary>
  <ul>
    <li>🔐 JWT Authentication</li>
    <li>🍪 Cookie-based session management</li>
    <li>🔑 Bcrypt password hashing</li>
  </ul>
</details>

<details>
  <summary> Tools</summary>
  <ul>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" alt="git" width="45" height="45"/> Git</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vscode/vscode-original.svg" alt="vscode" width="45" height="45"/> VS Code</li>
    <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postman/postman-original.svg" alt="postman" width="45" height="45"/> Postman</li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

#### User Features

- **User Authentication** - Sign up, login, and profile management with JWT authentication
- **Restaurant Browsing** - Browse restaurants with advanced search and filter by cuisine, city, and price range
- **Menu Exploration** - View restaurant menus with categories and food items
- **Shopping Cart** - Add/remove items, adjust quantities, and manage cart across restaurants
- **Order Placement** - Secure checkout process with delivery address collection
- **Payment Processing** - Stripe integration for secure online payments
- **Order Tracking** - Real-time order status updates
- **Order History** - View past orders and order details
- **Profile Management** - Update personal information and profile picture
- **Password Management** - Change password and password reset functionality
- **Reviews & Ratings** - Rate and review restaurants

#### Restaurant Owner Features

- **Restaurant Management** - Create, update, and delete restaurants
- **Menu Management** - Create and organize menu categories and food items
- **Food Item Management** - Add, edit, and delete food items with images
- **AI Food Descriptions** - Generate food descriptions using AI
- **Order Management** - View and update order status
- **Restaurant Analytics** - View restaurant performance statistics

#### Admin Features

- **Admin Dashboard** - Overview of platform statistics
- **User Management** - View, update roles, activate/deactivate, and delete users
- **Restaurant Management** - Manage all restaurants on the platform
- **Order Management** - View and manage all orders
- **Platform Analytics** - Comprehensive platform statistics

#### Technical Features

- **Role-Based Access Control** - Different permissions for users, restaurant owners, and admins
- **Image Upload** - Cloudinary integration for profile pictures, restaurant images, and food images
- **Real-time Webhooks** - Stripe webhook integration for payment confirmation
- **AI Integration** - Groq AI for generating food descriptions
- **Responsive Design** - Mobile-first design with TailwindCSS
- **State Management** - Redux Toolkit for efficient state management
- **Secure Payments** - Stripe payment intent integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need:

- Node.js (v18 or higher)
- MongoDB installed locally or MongoDB Atlas account
- Stripe account for payment processing
- Cloudinary account for image upload
- Groq API key for AI features

### Setup

Clone the repository:

```bash
git clone https://github.com/haftamudesta/food_order_app
cd food_order_app
```

- [ ] Open the file in your code editor

```
code .
```

### Install dependencies:

## Install backend and frontend dependencies (for development):

- [ ] Install backend dependencies:

```
cd backend
npm install
```

- [ ] Install backend dependencies:

```
cd frontend
npm install
```

### Environment Variables

- [ ] Create a .env file in the backend directory:

```
# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/food_delivery

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

- [ ] Create a .env file in the frontend directory:

```
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Usage

Start the backend server:

```
cd backend
npm run dev
```

Start the frontend development server:

```
cd frontend
npm run dev
```

```
Open your browser and visit http://localhost:5173
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->

## 👥 Author <a name="author"></a>

👤 **Haftamu Desta**

- GitHub: [@haftamu](https://github.com/haftamudesta)
- Twitter: [@DestaHaftamu](https://twitter.com/DestaHftamu?t=NQ4ovkdWbsfsjh62NFEXFg&s=09)
- LinkedIn: [Haftamu Desta](https://www.linkedin.com/in/haftamu-desta-795791a1/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE FEATURES -->

## Future Features <a name="future-features"></a>

- [ ] **Improve design.**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## Show your support <a name="support"></a>

If you like this project then don't forget to give a star ⭐ on this repository.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
