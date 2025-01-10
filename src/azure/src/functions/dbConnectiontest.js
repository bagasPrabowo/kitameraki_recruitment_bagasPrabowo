const { app } = require('@azure/functions');
const { dbConfig } = require('../config/database');

async function testCosmosDbConnection() {
    try {
        const container = await dbConfig();
        // Perform a simple query to check the connection
        await container.items.query('SELECT * FROM c').fetchAll();
        return { success: true, message: `Connected to Cosmos DB` };
    } catch (error) {
        console.log(error)
        return { success: false, message: `Connection failed: ${error.message}` };
    }
}

app.http('dbConnectionTest', {
    methods: ['GET'],
    authLevel: 'anonymous', // Adjust this based on security needs
    handler: async (request, context) => {
        // Health check endpoint to test DB connection
        const connectionTestResult = await testCosmosDbConnection();
        return {
            headers: { "Content-Type": "application/json" },
            jsonBody: connectionTestResult,
        };
    }
});