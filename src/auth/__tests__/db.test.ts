import { Client } from 'pg';
// Set env vars BEFORE importing the module
process.env.POSTGRES_HOST = "localhost";
process.env.POSTGRES_PORT = "5432";
process.env.POSTGRES_USER = "root";
process.env.POSTGRES_PASSWORD = "admin";
process.env.POSTGRES_DATABASE = "campus_connect_db";
import getDb from '../db';

jest.mock('pg', () => {
    const mockConnect = jest.fn();
    const mockClient = {
        connect: mockConnect,
        query: jest.fn(),
        end: jest.fn(),
    };
    return {
        Client: jest.fn(() => mockClient),
    };
});


describe('Database Module', () => {
    let mockClient: any;
    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = new Client();
    });

    afterEach(() => {
        jest.resetModules();
    });

    describe('getDb', () => {
        test('should connect to database on first call.', async () => {
            const client = await getDb();
            
            expect(Client).toHaveBeenCalledWith({
                host: process.env.POSTGRES_HOST,
                port: process.env.POSTGRES_PORT,
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DATABASE,
            });
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(client).toBeDefined();
        });

        test('should return the same client object from multiple calls.', async () => {
            const client1 = await getDb();
            const client2 = await getDb();

            expect(client1).toBe(client2);
        });
    });
});
