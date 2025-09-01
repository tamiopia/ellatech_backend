# Ellatech Backend

A small NestJS service with PostgreSQL and TypeORM that manages users, products, and records a transaction history.

## Table of Contents
- Features
- Technologies
- Setup
- Docker
- Database
- Running the Application
- API Endpoints
- Testing
- Assumptions & Trade-offs
- Future Optimizations

## Features
**User management:**
- Register new users
- Admin-only endpoints to list users and manage roles

**Product management:**
- Add new products
- Adjust stock and price
- Get product status

**Transaction history:**
- List all transactions with filters and pagination
- Admin-only access

- JWT authentication and role-based authorization
- DTO validation and proper HTTP status codes
- Swagger API documentation

## Technologies
- NestJS (Node.js framework)
- PostgreSQL (Database)
- TypeORM (ORM & Migrations)
- Docker & Docker Compose
- Passport JWT for authentication
- Swagger for API documentation
- class-validator for DTO validation

## Setup
Clone the repository:
```bash
git clone https://github.com/tamiopia/ellatech-backend.git
cd ellatech-backend
```
install dependency
```bash
npm install
```
Create a .env file in the root directory:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ellatech
JWT_SECRET=your-secret-key

```

Docker

Run API and DB locally:
```
docker-compose up --build
```
This will start:

PostgreSQL on port 5432

NestJS API on port 3000
Database

Run migrations to create tables:
```
npm run typeorm:migrate

```
Tables included:

users

products

transactions

Running the Application

Start in development mode:
```
npm run start:dev
```

Access Swagger docs:``` http://localhost:3000/api```

## 📌 API Endpoints

---

### 👤 Users
| Method | Endpoint                              | Description           | Roles       |
|--------|---------------------------------------|-----------------------|-------------|
| GET    | `/users`                              | Get all users         | Admin only  |
| GET    | `/users/{id}`                         | Get user by ID        | Admin only  |
| PATCH  | `/users/{id}/promote-to-admin`        | Promote user to admin | Admin only  |
| PATCH  | `/users/{id}/demote-to-user`          | Demote admin to user  | Admin only  |

---

### 🔑 Auth
| Method | Endpoint          | Description        | Roles  |
|--------|-------------------|--------------------|--------|
| POST   | `/auth/register`  | Register a new user | Public |
| POST   | `/auth/login`     | Login user          | Public |
| GET    | `/auth/profile`   | Get user profile    | Authenticated users |

---

### 📦 Products
| Method | Endpoint                         | Description                          | Roles       |
|--------|----------------------------------|--------------------------------------|-------------|
| POST   | `/products`                      | Create a new product                 | Admin only  |
| GET    | `/products`                      | Get all active products              | Public      |
| POST   | `/products/adjust`               | Adjust product quantity              | Admin only  |
| GET    | `/products/{id}`                 | Get product by ID                    | Public      |
| PATCH  | `/products/{id}`                 | Update product                       | Admin only  |
| DELETE | `/products/{id}`                 | Delete product (soft delete)         | Admin only  |
| GET    | `/products/status/{productId}`   | Get product status & stock info      | Public      |

---

### 💳 Transactions
| Method | Endpoint                                | Description                                | Roles       |
|--------|-----------------------------------------|--------------------------------------------|-------------|
| POST   | `/transactions`                         | Create a new transaction                   | Auth users  |
| GET    | `/transactions`                         | Get all transactions (with filters/pagination) | Admin only  |
| GET    | `/transactions/{id}`                    | Get transaction by ID                      | Auth users  |
| GET    | `/transactions/user/{userId}`           | Get transactions for a specific user       | Admin only  |
| GET    | `/transactions/product/{productId}`     | Get transactions for a specific product    | Admin only  |
| GET    | `/transactions/summary/overview`        | Get transaction summary overview           | Admin only  |
| GET    | `/transactions/me/my-transactions`      | Get my own transactions                    | Auth users  |



## ⚖️ Assumptions & Trade-offs

-  **Default Role**: Every new user is created as a **user** unless promoted to **admin**.  
-  **Authorization**: Admin-only endpoints are protected via a **RolesGuard**.  
-  **Authentication**: JWT token expiry is set to **1 hour**.  
-  **Pagination**: Defaults to `page=1` and `limit=10`.  
- **Validation & Errors**: DTO validation and structured error handling implemented for all endpoints.  
- **Transactions**: Automatically created when product adjustments occur (could be refactored into a dedicated service layer for complex business logic).  

---

## 🚀 Future Optimizations

- **Caching**: Integrate **Redis** to cache product data and frequently accessed queries, reducing API response times.  
- **Pagination & Filtering Enhancements**: Add advanced filtering, sorting, and flexible pagination for transactions and products.  
- **Background Jobs**: Use a queue system (e.g., **Bull + Redis**) for heavy tasks like bulk updates, report generation, or notifications.  
- **Rate Limiting & Security**: Implement request throttling, rate limiting, and stricter input validation for high-traffic environments.  
- **Monitoring & Logging**: Centralized logging with **Winston/ELK** and system monitoring using **Prometheus/Grafana** for production readiness.  
- **Testing**: Increase unit and end-to-end (E2E) test coverage for edge cases and complex scenarios.  

