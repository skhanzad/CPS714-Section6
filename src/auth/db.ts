import { Client } from "pg";

// Next.js automatically loads .env files, but we need to ensure they're available
// Build config at runtime to ensure env vars are loaded
function getClientConfig() {
    const config = {
        host: process.env.POSTGRES_HOST || "localhost",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USER || "root",
        password: process.env.POSTGRES_PASSWORD || "admin",
        database: process.env.POSTGRES_DATABASE || process.env.POSTGRES_DB || "campus_connect_db",
    };
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
        console.log("Database config:", {
            host: config.host,
            port: config.port,
            user: config.user,
            database: config.database,
            password: config.password ? "***" : "NOT SET",
        });
    }
    
    return config;
}

let client: Client | null = null;

export default async function getDb(): Promise<Client> {
    // Always create a fresh config to ensure we get the latest env vars
    const config = getClientConfig();
    
    // If client doesn't exist, create a new one
    if (!client) {
        client = new Client(config);
        try {
            await client.connect();
        } catch (error) {
            client = null;
            console.error("Database connection error:", error);
            throw error;
        }
    }
    return client;
}