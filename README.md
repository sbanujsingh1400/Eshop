Eshop - Full-Stack Microservices E-commerce PlatformWelcome to Eshop, a modern, full-stack e-commerce platform built with a microservices architecture. This project uses an Nx monorepo to manage a distributed system, including separate frontends for users and sellers, and a suite of backend services for handling everything from authentication to real-time chat.✨ FeaturesMonorepo Structure: Managed with Nx for streamlined, scalable development and shared code.Microservices Architecture: Decoupled services for auth, products, orders, and chat.Dual Frontend:User UI (user-ui): A Next.js app for customers to browse, shop, and manage their accounts.Seller UI (seller-ui): A Next.js app for sellers to manage products, view orders, and see analytics.API Gateway: A single, unified entry point (api-gateway) for all frontend requests, which then routes to the appropriate microservice.Async Communication: Kafka (kafka-service) is used for event-driven communication and analytics, ensuring services are loosely coupled.Real-time Chat: WebSocket-based chat (chatting-service) for live communication between users and sellers.Modern Database: Uses Prisma as a next-generation ORM for type-safe database access (likely with PostgreSQL).Caching: Redis is integrated for high-performance caching and session management.Containerized: Fully containerized with Docker and orchestrated with Docker Compose for easy setup and deployment.CI/CD: Includes a GitHub Actions workflow (deploy.yml) for automated deployment.AI Enhancements: The seller dashboard includes utilities for AI-powered features (e.g., Ai.enhancement.ts).🏗️ Architecture OverviewThis project is designed as a distributed system. The apps/ directory contains all the runnable applications (frontends and microservices), while the packages/ directory contains shared code (like components, middleware, and library clients).Flow of a Request:A user (in user-ui) or seller (in seller-ui) performs an action.The Next.js frontend sends an API request to the API Gateway (api-gateway).The API Gateway verifies the request (often using middleware from packages/middleware) and forwards it to the correct backend service (e.g., product-service).The service performs its business logic, communicating with the Prisma client (packages/libs/prisma) and Redis (packages/libs/redis).For asynchronous tasks (like sending analytics or generating a report), the service publishes an event to a Kafka topic.The kafka-service (or another interested service) consumes this event and processes it independently.🚀 Technology StackCategoryTechnologyDescriptionMonorepoNxFor managing the monorepo, tasks, and dependencies.FrontendNext.js (App Router)For server-side rendering (SSR) and static site generation (SSG).ReactFor building the user interfaces.TypeScriptFor type-safe frontend and backend code.Tailwind CSSFor utility-first styling.BackendNode.jsAs the runtime environment for all services.Express.js (implied)As the framework for building the microservices.WebSocketsFor the chatting-service.DatabasePrismaNext-gen ORM for database access.PostgreSQL (implied)The likely SQL database used by Prisma.CachingRedisFor caching, sessions, and message brokering.MessagingKafkaFor a distributed, event-driven message queue.DevOpsDocker & Docker ComposeFor containerization and local orchestration.GitHub ActionsFor continuous integration and deployment (CI/CD).File StorageImageKit(packages/libs/imageKit) For image and media management.📂 Project StructureHere is a high-level overview of the monorepo structure:/
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
🏁 Getting StartedFollow these instructions to get the entire platform up and running on your local machine.PrerequisitesNode.js (v18 or later)Docker and Docker ComposeNx CLI (Install globally: npm install -g nx)1. InstallationClone the repository and install the root dependencies:git clone [https://github.com/sbanujsingh1400/eshop.git](https://github.com/sbanujsingh1400/eshop.git)
cd eshop
npm install
2. Environment ConfigurationThis project requires several environment variables for database connections, API keys, and service-to-service communication.Create a .env file at the root of the project. You will need to add variables for:DATABASE_URL (for Prisma, e.g., postgresql://user:password@localhost:5432/eshop)REDIS_HOST and REDIS_PORTKAFKA_BROKERSJWT_SECRETIMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT...and any other keys used by the services (e.g., email provider keys).(Note: You may need to create .env files within each service in apps/ or manage this through a single root file, depending on how the docker-compose.yml is configured to inject them.)3. Build Docker ImagesBefore running, build all the necessary images using Docker Compose. This will read the docker-compose.yml file and build all the services defined within it.docker-compose build
4. Initialize the DatabaseThe database needs to be running, and the schema needs to be applied.Start the database service (and other core services like Kafka/Redis):# Check your docker-compose.yml for service names (e.g., db, postgres)
docker-compose up -d db kafka redis
Apply the Prisma schema:npx prisma db push
Generate the Prisma Client:npx prisma generate
5. Run the PlatformOnce the images are built and the database is ready, you can start the entire platform.docker-compose up -d
This will start all services in detached mode. You can view logs for all services or a specific service:docker-compose logs -f           # All services
docker-compose logs -f user-ui   # Just the user-ui service
Your applications should now be running (ports may vary based on your configuration):User UI: http://localhost:3000Seller UI: http://localhost:3001API Gateway: http://localhost:8000Development with Nx (Without Docker)If you prefer to run services individually for development (e.g., against a shared Docker DB), you can use the Nx CLI.# Serve the user-ui
npx nx serve user-ui

# Serve the api-gateway
npx nx serve api-gateway

# Run tests for the auth-service
npx nx test auth-service
