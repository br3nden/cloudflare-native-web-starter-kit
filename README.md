# Cloudflare Native and Web Starter Kit

A starter template that demonstrates how to build AI-powered mobile and web applications using Cloudflare workers and wrangler CLI. This example app creates AI-generated stories about a user's day and generates accompanying images - all powered by Cloudflare workers. You can use this as a foundation to build any type of AI-powered application you want.

## Stack (modernized)

| Layer | Versions |
| --- | --- |
| Tooling | Node 22+, pnpm 10, Turborepo 2.11 |
| Web | Astro 7, React 19, Tailwind CSS 4 (`@tailwindcss/vite`) |
| Mobile | Expo SDK 57, React Native 0.86 |
| API | tRPC 11 (stable), Drizzle ORM 0.45, Zod 3 |
| Cloudflare | Wrangler 4, Workers Types v5, `wrangler.jsonc` configs |

## 🚀 Features

- 📱 **Expo Mobile App**: Cross-platform mobile application
- 🌐 **Astro Landing Page**: Fast, modern web presence
- 🔒 **Clerk Authentication**: Secure user management
- 🔄 **tRPC API**: Type-safe API communication
- 🤖 **Workers AI**: Edge AI processing
- 📦 **R2 Storage**: Image and asset storage
- 💾 **D1 Database**: Edge SQLite database with Drizzle ORM
- 🏗️ **Cloudflare Workers**: Serverless compute
- 🔄 **Workflows**: Durable AI task processing

## 📦 Project Structure

```
.
├── apps/
│   ├── apiservice/    # Cloudflare Worker API
│   ├── expo/         # Mobile application
│   ├── astro/        # Landing page
│   └── workflows/    # Cloudflare Workers AI processing
├── packages/
│   ├── db/           # Database schema and utilities
│   └── trpc/         # tRPC router definitions
└── tooling/          # Shared development tools
```

## 🛠️ Prerequisites

- Node.js >= 22.12.0
- pnpm >= 10.0.0
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)
- Clerk account

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd cloudflare-turbo
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure Cloudflare Resources**

First, login to Cloudflare CLI:
```bash
wrangler login
```

Create a D1 Database:
```bash
wrangler d1 create your-database-name
```

Create an R2 Bucket:
```bash
wrangler r2 bucket create your-bucket-name
```

4. **Configure wrangler.toml Files**

You'll need to update the `wrangler.jsonc` files in both `apps/apiservice` and `apps/workflows` with your specific configuration:

Example `wrangler.jsonc` structure:
```jsonc
{
  "name": "your-app-name",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-15",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-database-name",
      "database_id": "your-database-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "your-bucket-name"
    }
  ]
}
```

5. **Set up Cloudflare API Token**

Create a Cloudflare API token with D1 read and write permissions:

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Create Custom Token" option
4. Grant the following permissions:
   - Account > D1 > Edit
5. Copy the generated token

Create a `.env` file in the root of the project with the following variables:
```bash
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_DATABASE_ID="your-d1-database-id"
CLOUDFLARE_D1_TOKEN="your-api-token"
```

You can find your Account ID in the Cloudflare Dashboard URL or overview page.
The Database ID was provided when you created your D1 database.

6. **Initial Deployment**

Before running the app locally, you need to deploy the API service and workflows:

```bash
# Deploy API service
cd apps/apiservice
pnpm run deploy

# Deploy workflows
cd ../workflows
pnpm run deploy
```

7. **Environment Setup**

Create `.env` files based on the provided examples and update with your credentials:
```bash
cp apps/expo/.env.example apps/expo/.env
```

8. **Start Development**

```bash
pnpm dev
```
