# Eshop - Full-Stack Microservices E-commerce Platform

Welcome to **Eshop**, a modern, full-stack e-commerce platform built with a microservices architecture. This project uses an Nx monorepo to manage a distributed system, including separate frontends for users and sellers, and a suite of backend services for handling everything from authentication to real-time chat.

##  Features

- **Monorepo Structure**: Managed with Nx for streamlined, scalable development and shared code.
- **Microservices Architecture**: Decoupled services for auth, products, orders, and chat.
- **Dual Frontend**:
  - **User UI** (`user-ui`): A Next.js app for customers to browse, shop, and manage their accounts.
  - **Seller UI** (`seller-ui`): A Next.js app for sellers to manage products, view orders, and see analytics.
- **API Gateway**: A single, unified entry point (`api-gateway`) for all frontend requests, which then routes to the appropriate microservice.
- **Async Communication**: Kafka (`kafka-service`) is used for event-driven communication and analytics, ensuring services are loosely coupled.
- **Real-time Chat**: WebSocket-based chat (`chatting-service`) for live communication between users and sellers.
- **Modern Database**: Uses Prisma as a next-generation ORM for type-safe database access (likely with PostgreSQL).
- **Caching**: Redis is integrated for high-performance caching and session management.
- **Containerized**: Fully containerized with Docker and orchestrated with Docker Compose for easy setup and deployment.
- **CI/CD**: Includes a GitHub Actions workflow (`deploy.yml`) for automated deployment.
- **AI Enhancements**: The seller dashboard includes utilities for AI-powered features (e.g., `Ai.enhancement.ts`).

##  Architecture Overview

This project is designed as a distributed system. The `apps/` directory contains all the runnable applications (frontends and microservices), while the `packages/` directory contains shared code (like components, middleware, and library clients).

### Flow of a Request

1. A user (in `user-ui`) or seller (in `seller-ui`) performs an action.
2. The Next.js frontend sends an API request to the **API Gateway** (`api-gateway`).
3. The API Gateway verifies the request (often using middleware from `packages/middleware`) and forwards it to the correct backend service (e.g., `product-service`).
4. The service performs its business logic, communicating with the Prisma client (`packages/libs/prisma`) and Redis (`packages/libs/redis`).
5. For asynchronous tasks (like sending analytics or generating a report), the service publishes an event to a Kafka topic.
6. The `kafka-service` (or another interested service) consumes this event and processes it independently.

##  Technology Stack

| Category       | Technology              | Description                                                      |
|----------------|-------------------------|------------------------------------------------------------------|
| **Monorepo**   | Nx                      | For managing the monorepo, tasks, and dependencies.             |
| **Frontend**   | Next.js (App Router)    | For server-side rendering (SSR) and static site generation (SSG).|
|                | React                   | For building the user interfaces.                                |
|                | TypeScript              | For type-safe frontend and backend code.                         |
|                | Tailwind CSS            | For utility-first styling.                                       |
| **Backend**    | Node.js                 | As the runtime environment for all services.                     |
|                | Express.js (implied)    | As the framework for building the microservices.                 |
|                | WebSockets              | For the `chatting-service`.                                      |
| **Database**   | Prisma                  | Next-gen ORM for database access.                                |
|                | PostgreSQL (implied)    | The likely SQL database used by Prisma.                          |
| **Caching**    | Redis                   | For caching, sessions, and message brokering.                    |
| **Messaging**  | Kafka                   | For a distributed, event-driven message queue.                   |
| **DevOps**     | Docker & Docker Compose | For containerization and local orchestration.                    |
|                | GitHub Actions          | For continuous integration and deployment (CI/CD).               |
| **File Storage** | ImageKit              | (`packages/libs/imageKit`) For image and media management.       |

##  Project Structure

Here is a high-level overview of the monorepo structure:

```
/
├── apps/
│   ├── api-gateway/      # Single entry point for all API requests
│   ├── auth-service/     # Manages user/seller authentication, JWTs, and emails
│   ├── chatting-service/ # Real-time WebSocket chat server
│   ├── kafka-service/    # Consumes and processes Kafka events (e.g., analytics)
│   ├── order-service/    # Manages order creation, history, and confirmation emails
│   ├── product-service/  # Manages products, shops, reviews, and cron jobs
│   ├── seller-ui/        # Next.js frontend for the seller dashboard
│   └── user-ui/          # Next.js frontend for the customer-facing shop
│
├── packages/
│   ├── components/       # Shared React components (Input, ColorSelector, etc.)
│   ├── error_handler/    # Shared error handling middleware
│   ├── kafka/            # Shared Kafka producer/consumer configurations
│   ├── libs/             # Shared clients for Prisma, Redis, and ImageKit
│   ├── logs/             # Shared logging utility
│   └── middleware/       # Shared auth middleware (e.g., isAuthenticated)
│
├── prisma/
│   └── schema.prisma     # The single source of truth for the database schema
│
├── .github/workflows/    # CI/CD pipelines
├── Dockerfile.backend    # Docker build definitions
├── Dockerfile.frontend
├── docker-compose.yml    # Orchestrates all services for development
├── nx.json               # Nx workspace configuration
└── package.json          # Root dependencies
```

##  Getting Started

Follow these instructions to get the entire platform up and running on your local machine.

### Prerequisites

- **Node.js** (v18 or later)
- **Docker** and **Docker Compose**
- **Nx CLI** (Install globally: `npm install -g nx`)

### 1. Installation

Clone the repository and install the root dependencies:

```bash
git clone https://github.com/sbanujsingh1400/eshop.git
cd eshop
npm install
```

### 2. Environment Configuration

This project requires several environment variables for database connections, API keys, and service-to-service communication.

Create a `.env` file at the root of the project. You will need to add variables for:

- `DATABASE_URL` (for Prisma, e.g., `postgresql://user:password@localhost:5432/eshop`)
- `REDIS_HOST` and `REDIS_PORT`
- `KAFKA_BROKERS`
- `JWT_SECRET`
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- ...and any other keys used by the services (e.g., email provider keys)

> **Note**: You may need to create `.env` files within each service in `apps/` or manage this through a single root file, depending on how the `docker-compose.yml` is configured to inject them.

### 3. Build Docker Images

Before running, build all the necessary images using Docker Compose. This will read the `docker-compose.yml` file and build all the services defined within it.

```bash
docker-compose build
```

### 4. Initialize the Database

The database needs to be running, and the schema needs to be applied.

**Start the database service** (and other core services like Kafka/Redis):

```bash
# Check your docker-compose.yml for service names (e.g., db, postgres)
docker-compose up -d db kafka redis
```

**Apply the Prisma schema**:

```bash
npx prisma db push
```

**Generate the Prisma Client**:

```bash
npx prisma generate
```

### 5. Run the Platform

Once the images are built and the database is ready, you can start the entire platform.

```bash
docker-compose up -d
```

This will start all services in detached mode. You can view logs for all services or a specific service:

```bash
docker-compose logs -f           # All services
docker-compose logs -f user-ui   # Just the user-ui service
```

Your applications should now be running (ports may vary based on your configuration):

- **User UI**: http://localhost:3000
- **Seller UI**: http://localhost:3001
- **API Gateway**: http://localhost:8080

### Development with Nx (Without Docker)

If you prefer to run services individually for development (e.g., against a shared Docker DB), you can use the Nx CLI.

```bash
# Serve the user-ui
npx nx serve user-ui

# Serve the api-gateway
npx nx serve api-gateway

# Run tests for the auth-service
npx nx test auth-service
```

## 📄 License

NA

---
