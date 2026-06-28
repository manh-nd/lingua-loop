# Self-Hosting & Deployment Guide

This guide details how to self-host and deploy **Lingua Loop** on a virtual machine (VM) using **Docker Compose** and route it securely behind **Nginx Proxy Manager**.

---

## 1. Prerequisites

Ensure your target Virtual Machine (VM) has the following installed:

- **Docker** and **Docker Compose** (V2 or higher).
- **Nginx Proxy Manager** (running in a Docker container on the same VM, sharing a network named `npm_network`).
- A **Domain Name** pointed to the VM's public IP address.

---

## 2. Environment Variables Configuration (`.env`)

Before deploying, create a `.env` file at the root of the directory:

```bash
cp .env.example .env
```

Open the `.env` file and configure the variables:

| Variable               | Description               | Production Configuration Recommendation                                     |
| :--------------------- | :------------------------ | :-------------------------------------------------------------------------- |
| `GEMINI_API_KEYS`      | Google Gemini API Keys    | A comma-separated list of Gemini API keys for client-side API key rotation. |
| `GEMINI_DEFAULT_MODEL` | Default Gemini model      | We recommend `gemini-3.1-flash-lite` for optimal cost/performance balance.  |
| `PORT`                 | Inside container port     | Default is `3000`. Do not change this unless required.                      |
| `HOSTNAME`             | Hostname inside container | Set to `0.0.0.0` so it accepts outside requests from Nginx Proxy Manager.   |

---

## 3. Docker Compose Setup

Lingua Loop runs entirely as a frontend application with `localStorage` persistence, meaning it does **not** require PostgreSQL or Redis databases.

Our `docker-compose.yml` connects the container to the external `npm_network` shared by Nginx Proxy Manager:

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
    networks:
      - npm_network

networks:
  npm_network:
    external: true
```

---

## 4. Deploying the Application

To build the Docker image and start the container, run:

```bash
docker compose up --build -d
```

Verify that the container is running:

```bash
docker compose ps
```

To view application logs for troubleshooting:

```bash
docker compose logs -f
```

---

## 5. Nginx Proxy Manager (NPM) Configuration

Log in to your Nginx Proxy Manager dashboard and add a new **Proxy Host**:

1. **Details Tab**:
   - **Domain Names**: Enter your sub-domain (e.g., `lingualoop.yourdomain.com`).
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `lingua-loop-web` (matches the `container_name` / service name).
   - **Forward Port**: `3000`
   - Toggle **Block Common Exploits** and **Websockets Support** to **ON**.
2. **SSL Tab**:
   - **SSL Certificate**: Select **Request a new SSL Certificate** (Let's Encrypt).
   - Toggle **Force SSL** and **HTTP/2 Support** to **ON**.
   - Enter your email, accept the Terms of Service, and click **Save**.

Your application will now be securely available over HTTPS at `https://lingualoop.yourdomain.com`.
