const { app } = require('@azure/functions');
const { dbConfig } = require('../config/database');
const df = require('durable-functions');

const deleteStatus = require('./deleteTask/deleteStatus');
const deleteStarter = require('./deleteTask/deleteStarter');
const deleteOrchestrator = require('./deleteTask/deleteOrchestrator');
const deleteActivity = require('./deleteTask/deleteActivity');
const createTask = require('./createTask');
const getTask = require('./getTask');
const updateTask = require('./updateTask');

df.app.orchestration('deleteOrchestrator', deleteOrchestrator);

df.app.activity('taskDelete', {
    handler:deleteActivity
});

app.http('deleteStatus', {
    methods: ['GET'],
    route: 'deleteStatus/{instanceId}',
    authLevel: 'anonymous',
    extraInputs: [df.input.durableClient()],
    handler: async (request, context) => {
        try {
            return await deleteStatus(request, context)
        } catch (error) {
            context.log('Error get delete status:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    },
});

app.http('deleteTask', {
    methods: ['POST'],
    route: 'orchestrators/{orchestratorName}',
    extraInputs: [df.input.durableClient()],
    handler: async (request, context) => {
        try {
            return await deleteStarter(request, context, request.params.orchestratorName);
        } catch (error) {
            context.log('Error start delete task:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
})

app.http('taskHandler', {
    methods: ['POST', 'GET', 'PATCH'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log('Processing request for task.');
            const container = await dbConfig();

            /// Delete with bulk operation
            /// commented because there is an unkhown error
            /// error message
            /// Bulk request errored with: Message: {"Errors":["An unknown error occurred while processing this request. If the issue persists, please contact Azure Support: http://aka.ms/azure-support"]}
            // const operations = tasksToDelete.map(task => {
            //     return {
            //         operationType: 'Delete',
            //         partitionKey: task.userId,
            //         id: task.id
            //     };
            // });

            // await container.items.bulk(operations);

            if (request.method === 'POST') {
                return createTask(request, context, container);
            } else if (request.method === 'GET') {
                return getTask(request, context, container);
            } else if (request.method === 'PATCH') {
                return updateTask(request, context, container);
            }
        } catch (error) {
            context.log('Error interacting with Cosmos DB:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
});
