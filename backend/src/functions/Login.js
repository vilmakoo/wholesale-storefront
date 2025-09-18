const { app } = require('@azure/functions');

app.http('Login', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const code = request.query.get('code')
        if (code == process.env.CLIENT_A_CODE) {
          return { body: `Hello, Client A!` };
        } else if (code == process.env.CLIENT_B_CODE) {
          return { body: `Hello, Client B!` }
        }
        return { status: 401,
          body: `Invalid code!` };
    }
});
