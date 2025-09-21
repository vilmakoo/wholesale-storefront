const { app } = require('@azure/functions');

app.http('Login', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
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
                    clientId: 'client_a',
                    name: 'Client A'
                };
            } else if (submittedCode === process.env.CLIENT_B_CODE) {
                clientData = {
                    clientId: 'client_b',
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
        } catch (error) {
            context.log("Error parsing JSON body:", error);
            return {
                status: 400,
                jsonBody: { error: "Could not parse the request body. Please ensure it is valid JSON."}
            }
        }
    }
});
