# Self-Hosting & Deployment Guide

This guide details how to self-host and deploy **Lingua Loop** on a virtual machine (VM) using **Docker Compose** and route it securely behind **Nginx Proxy Manager** with a production-grade isolated PostgreSQL database.

---

## 1. Prerequisites

Ensure your target Virtual Machine (VM) has the following installed:

- **Docker** and **Docker Compose** (V2 or higher).
- **Nginx Proxy Manager** (running in a Docker container on the same VM, sharing an external network named `npm_network`).
- A **Domain Name** pointed to the VM's public IP address.

---

## 2. Environment Variables Configuration (`.env`)

Before deploying, create a `.env` file at the root of the project directory on your server:

```bash
cp .env.example .env
```

Open the `.env` file and configure the variables:

| Variable               | Description               | Production Recommendation                                           |
| :--------------------- | :------------------------ | :------------------------------------------------------------------ |
| `GEMINI_API_KEYS`      | Google Gemini API Keys    | Comma-separated list for client-side API key rotation.              |
| `GEMINI_DEFAULT_MODEL` | Default Gemini model      | `gemini-3.1-flash-lite` for optimal cost/performance balance.       |
| `DATABASE_URL`         | PostgreSQL Connection URI | `postgresql://postgres:YOUR_DB_PASSWORD@postgres:5432/lingualoop`   |
| `BETTER_AUTH_SECRET`   | Better Auth Secret        | A secure random string (e.g. generated via `openssl rand -hex 32`). |
| `BETTER_AUTH_URL`      | Base URL of the app       | `https://lingualoop.yourdomain.com` (must match HTTPS URL).         |
| `PORT`                 | Inside container port     | `3000` (default, do not change).                                    |
| `HOSTNAME`             | Hostname inside container | `0.0.0.0` (accepts traffic from reverse proxy).                     |

---

## 3. Docker Compose Architecture

The production [compose.yml](file:///Users/manhnd/lingua-loop/compose.yml) configures two services: the Next.js web application (`web`) and an isolated PostgreSQL database (`postgres`).

For security, the database does not expose any ports to the host or internet. It resides solely in the internal `app_network` and is accessed securely by the `web` container using the host alias `postgres`.

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lingua-loop-web
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - postgres
    networks:
      - npm_network
      - app_network

  postgres:
    image: postgres:16-alpine
    container_name: lingua-loop-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-lingualooppassword}
      POSTGRES_DB: ${POSTGRES_DB:-lingualoop}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app_network

volumes:
  pgdata:
    driver: local

networks:
  npm_network:
    external: true
  app_network:
    driver: bridge
```

---

## 4. Deploying the Application

### Step 1: Start the services

To build the web container and start all services in the background, run:

```bash
docker compose up -d --build
```

### Step 2: Apply Database Schema

To apply the database schema structure (tables, fields, indexes) to your database, execute Drizzle Kit schema push:

```bash
# If running drizzle-kit inside the container (recommended):
docker compose exec web npx drizzle-kit push
```

### Step 3: Verify Status

Verify that both containers are running properly:

```bash
docker compose ps
```

To watch application logs for troubleshooting:

```bash
docker compose logs -f
```

---

## 5. Nginx Proxy Manager (NPM) Configuration

Log in to your Nginx Proxy Manager dashboard and add a new **Proxy Host**:

1. **Details Tab**:
   - **Domain Names**: Enter your sub-domain (e.g., `lingualoop.yourdomain.com`).
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `lingua-loop-web` (matches the `container_name`).
   - **Forward Port**: `3000`
   - Toggle **Block Common Exploits** and **Websockets Support** to **ON**.
2. **SSL Tab**:
   - **SSL Certificate**: Select **Request a new SSL Certificate** (Let's Encrypt).
   - Toggle **Force SSL** and **HTTP/2 Support** to **ON**.
   - Enter your email, accept the Terms of Service, and click **Save**.

Your application will now be securely available over HTTPS at `https://lingualoop.yourdomain.com` with persistent PostgreSQL storage and spaced-repetition logic running.
