const { app } = require('@azure/functions');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.setup({
    enableHttpStream: true,
});
