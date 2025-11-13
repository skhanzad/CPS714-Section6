import { Client } from 'pg';
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
    let mockClient: never;
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
                host: 'localhost',
                port: 5432,
                user: 'root',
                password: 'admin',
                database: 'campus_connect_db',
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
