import { Client } from "pg";

const clientConfig = {
    host: "localhost",
    port: 5432,
    user: "root",
    password: "admin",
    database: "campus_connect_db",
};

let client: Client;

export default async function getDb(): Promise<Client> {
    if (!client) {
        client = new Client(clientConfig);
        await client.connect();
    }
    return client;
}
