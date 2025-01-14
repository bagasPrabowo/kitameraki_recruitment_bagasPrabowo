import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import dbConfig from '../config/database';
import * as df from 'durable-functions';

import deleteStatus from './deleteTask/deleteStatus';
import deleteStarter from './deleteTask/deleteStarter';
import createTask from './createTask';
import getTask from './getTask';
import updateTask from './updateTask';

app.http('deleteStatus', {
    methods: ['GET'],
    route: 'bulk-delete/{instanceId}',
    authLevel: 'anonymous',
    extraInputs: [df.input.durableClient()],
    handler: async (request: HttpRequest, context: InvocationContext) => {
        try {
            return await deleteStatus(request, context)
        } catch (error) {
            context.log('Error get delete status:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: (error as Error).message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    },
});

app.http('deleteTask', {
    methods: ['POST'],
    route: 'bulk-delete',
    extraInputs: [df.input.durableClient()],
    handler: async (request: HttpRequest, context: InvocationContext) => {
        try {
            return await deleteStarter(request, context, 'deleteOrchestrator');
        } catch (error) {
            context.log('Error start delete task:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
});

app.http('updateTask', {
    methods: ['PATCH'],
    route: 'task/{id}',
    handler: async (request: HttpRequest, context: InvocationContext) => {
        const container = await dbConfig();
        return updateTask(request, context, container, request.params.id);
    }
})

app.http('task', {
    methods: ['POST', 'GET'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            context.log('Processing request for task.');
            const container = await dbConfig();

            if (request.method === 'POST') {
                return createTask(request, context, container);
            } else if (request.method === 'GET') {
                return getTask(request, context, container);
            }
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    message: ""
                }
            };
        } catch (error) {
            context.log('Error interacting with Cosmos DB:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
});
