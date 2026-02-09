const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to in-memory database before all tests
beforeAll(async () => {
    try {
        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Create new in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to in-memory test database');
    } catch (error) {
        console.error('❌ Failed to connect to test database:', error);
        throw error;
    }
}, 60000); // 60 second timeout for MongoDB Memory Server startup

// Clear all test data after each test
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
}, 10000);

// Disconnect and stop MongoDB after all tests
afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
        console.log('✅ Disconnected from test database');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}, 10000);
