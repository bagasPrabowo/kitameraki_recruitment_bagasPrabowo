import { app, HttpRequest, InvocationContext } from '@azure/functions';

app.http('httpExample', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || request.params.name || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
