import { Client } from "pg";

const clientConfig = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
};

let client: Client;
//Connects to postgres using node-postgres
export default async function getDb(): Promise<Client> {
    if (!client) {
        client = new Client(clientConfig);
        await client.connect();
    }
    return client;
}
