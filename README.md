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

API Endpoints
Users
Method	Endpoint	Description	Roles
-POST	/users	Create a new user	Public
-GET	/users	List all users	Admin
-GET	/users/:id	Get user by ID	Admin
-PATCH	/users/:id/promote-to-admin	Promote user to admin	Admin
-PATCH	/users/:id/demote-to-user	Demote admin to user	Admin
**Products**
Method	Endpoint	Description	Roles
-POST	/products	Create a product	Admin
-PUT	/products/adjust	Adjust product stock/price	Admin
-GET	/status/:productId	Get product status	Public
-Transactions
-Method	Endpoint	Description	Roles
-GET	/transactions	List transactions (with filters & pagination)	Admin



## Assumptions & Trade-offs

-Default user role is user unless promoted.

-Admin-only endpoints are protected using RolesGuard.

-JWT token expiry: 1 hour.

-Pagination defaults: page=1, limit=10.

-Error handling and DTO validation implemented for all endpoints.

-For simplicity, transactions are created automatically when products are adjusted (can be improved with a service layer for complex business logic).

##Future Optimizations

Caching: Use Redis to cache product data and frequently accessed queries to improve API response times.

Pagination & Filtering Enhancements: Implement advanced filtering, sorting, and pagination for transactions and products.

Background Jobs: Use a queue (e.g., Bull with Redis) for heavy operations like bulk updates or notifications.

Rate Limiting & Security: Add rate limiting, request throttling, and enhanced validation for high traffic.

Monitoring & Logging: Integrate centralized logging (Winston/ELK) and monitoring (Prometheus/Grafana) for production readiness.

Unit & E2E Tests: Expand test coverage for edge cases and complex scenarios.

