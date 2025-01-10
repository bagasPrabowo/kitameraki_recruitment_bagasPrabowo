const { app } = require('@azure/functions');

app.http('httpExample', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || request.params.name || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
