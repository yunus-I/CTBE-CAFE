# CTBE Cafe

Meal registration and reporting app for tracking student meals.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Set the database connection string in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

3. Generate Prisma client and start the app:

```bash
npm run prisma:generate
npm run dev
```

## Vercel deployment

This app is a good fit for Vercel, with one requirement: it needs a PostgreSQL database available through `DATABASE_URL`.

### Recommended setup

1. Import this repository into Vercel.
2. Add the `DATABASE_URL` environment variable in the Vercel project settings.
3. Run your database schema against the production database before the first launch.
4. Deploy.

### Important note about student photos

Student photos are stored in the database as data URLs so uploads work in Vercel's serverless environment without relying on the local filesystem.

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` runs the production server locally.
- `npm run prisma:generate` regenerates the Prisma client.
