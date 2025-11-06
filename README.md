# CPS714-Section6 CampusConnect

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Next.js](https://nextjs.org)
- [Docker](https://www.docker.com)
- [Migration Tool](https://github.com/golang-migrate/migrate)

## Getting Started

0. Clone the repository and branch based on your group number

   ```bash
   git clone git@github.com:skhanzad/CPS714-Section6.git

   git branch <group_number>/<branch_name>

   git checkout <group_number>/<branch_name>
   ```

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables.Use the sample file as a starting point:
   ```bash
   cp .env.example .env
   ```
3. Start Docker services defined in `docker-compose.yml`:
   ```bash
   docker compose up -d
   ```
4. Launch the app
   ```bash
   npm run dev
   ```

## Tips & Suggestions

- `scripts/create_migration.sh <migration_name>` creates timestamped migration files. If you are unfamiliar with forward and rollback migrations I would recommend reading [this](https://github.com/golang-migrate/migrate/blob/master/database/postgres/TUTORIAL.md) or asking ChatGPT.
