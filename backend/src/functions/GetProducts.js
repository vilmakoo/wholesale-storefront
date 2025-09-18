const { app } = require('@azure/functions');

app.http('GetProducts', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const clientId = request.query.get('clientId')
        let productData;
        
        if (clientId == 1) {
          productData = [
            {
              'product code': 'aaaa',
              'available stockstock': 1111,
              'retail price': 10
            },
            {
              'product code': 'bbbb',
              'available stockstock': 1212,
              'retail price': 303
            }
          ]
        } else if (clientId == 2) {
          productData = [
            {
              'product code': 'aaaa',
              'available stockstock': 2222,
              'retail price': 20
            },
            {
              'product code': 'bbbb',
              'available stockstock': 3434,
              'retail price': 404
            }
          ]
        }

        return { jsonBody: productData };
    }
});