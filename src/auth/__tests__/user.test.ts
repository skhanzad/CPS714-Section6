import User, { Role } from '../User';
import getDb from '../db';

jest.mock('../db');

describe('User Class', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            query: jest.fn(),
        };
        (getDb as jest.MockedFunction<typeof getDb>).mockResolvedValue(mockDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('should return User instance with valid credentials.', async () => {
            const mockUserData = {
                id: '123',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@fake.torontomu.ca',
                student_id: '12345678',
                permission_level: Role.STUDENT,
            };

            mockDb.query.mockResolvedValueOnce({ rows: [mockUserData] });

            const user = await User.login('12345678', 'the_best_password');

            expect(user).toBeInstanceOf(User);
            expect(user?.id).toBe('123');
            expect(user?.firstName).toBe('John');
        });

        test('should return NULL with invalid credentials.', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [] });

            const user = await User.login('INVALID', 'wrongpassword');

            expect(user).toBeNull();
        });
    });

    describe('signup', () => {
        test('should create a new user and return the User instance.', async () => {
            const mockUserData = {
                id: '456',
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@fake.torontomu.ca',
                student_id: '23456789',
                permission_level: Role.STUDENT,
            };

            mockDb.query.mockResolvedValueOnce({ rows: [mockUserData] });

            const user = await User.signup('Jane', 'Smith', 'jane.smith@fake.torontomu.ca', '23456789', 'much_secure');

            expect(user).toBeInstanceOf(User);
            expect(user?.firstName).toBe('Jane');
        });
    });

    describe('User instance methods', () => {
        test('getFullName should return full name.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.STUDENT);
            expect(user.getFullName()).toBe('John Doe');
        });

        test('isStudent should return true for STUDENT role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.STUDENT);
            expect(user.isStudent()).toBe(true);
        });

        test('isClubLeader should return false for STUDENT role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.STUDENT);
            expect(user.isClubLeader()).toBe(false);
        });

        test('isDepartmentAdmin should return false for STUDENT role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.STUDENT);
            expect(user.isDepartmentAdmin()).toBe(false);
        });

        test('isSystemAdmin should return false for STUDENT role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.STUDENT);
            expect(user.isSystemAdmin()).toBe(false);
        });

        test('isStudent should return false for CLUBLEADER role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.CLUBLEADER);
            expect(user.isStudent()).toBe(false);
        });

        test('isClubLeader should return true for CLUBLEADER role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.CLUBLEADER);
            expect(user.isClubLeader()).toBe(true);
        });

        test('isDepartmentAdmin should return false for CLUBLEADER role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.CLUBLEADER);
            expect(user.isDepartmentAdmin()).toBe(false);
        });

        test('isSystemAdmin should return false for CLUBLEADER role.', () => {
            const user = new User('1', 'John', 'Doe', 'john@fake.torontomu.ca', '12345678', Role.CLUBLEADER);
            expect(user.isSystemAdmin()).toBe(false);
        });
    });
});