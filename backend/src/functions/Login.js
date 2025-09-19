const { app } = require('@azure/functions');

app.http('Login', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const submittedCode = body.clientCode;

        if (!submittedCode) {
            return {
                status: 400,
                jsonBody: { error: "Please provide a 'clientCode' in the request body." }
            };
        }

        let clientData = null;

        if (submittedCode === process.env.CLIENT_A_CODE) {
            clientData = {
                clientId: 'clientA',
                name: 'Client A'
            };
        } else if (submittedCode === process.env.CLIENT_B_CODE) {
            clientData = {
                clientId: 'clientB',
                name: 'Client B'
            };
        }

        if (clientData) {
            return { jsonBody: clientData };
        } else {
            return {
                status: 401,
                jsonBody: { error: "Invalid client code." }
            };
        }
    }
});
