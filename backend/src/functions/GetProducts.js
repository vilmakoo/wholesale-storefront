const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

/**
 * Asynchronously reads and parses a CSV file for a given client ID.
 */
function getProductData(clientId) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, `../../../data/${clientId}_data.csv`);

        if (!fs.existsSync(filePath)) {
            return reject(new Error(`Data file not found for ${clientId}.`));
        }

        const fullResults = [];

        fs.createReadStream(filePath)
            .pipe(csvParser({
                // This function transforms CSV headers to camelCase keys (e.g., "Product Name" -> "productName")
                mapHeaders: ({ header }) => header.replace(/ /g, '_').replace(/([_]\w)/g, g => g[1].toUpperCase()).replace(/^[A-Z]/, (match) => match.toLowerCase()),
                // This function attempts to convert strings to numbers and booleans
                mapValues: ({ value }) => {
                    const number = Number(value);
                    if (!isNaN(number) && value.trim() !== '') {
                        return number;
                    }
                    return value;
                }
            }))
            .on('data', (data) => fullResults.push(data))
            .on('end', () => {
                const necessaryData = fullResults.map(product => ({
                    productCode: product.productCode,
                    availableStock: product.availableStock,
                    retailPrice: product.retailPrice
                }));
                resolve(necessaryData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}


app.http('GetProducts', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const clientId = request.query.get('clientId');

        if (!clientId) {
            return {
                status: 400,
                jsonBody: {
                    error: "Please give a 'clientId' in the query string. Expecting client_a or client_b."
                }
            };
        }

        try {
            const productData = await getProductData(clientId);

            if (productData) {
                const response = {
                    message: `Product data for ${clientId}`,
                    products: productData
                };

                return { jsonBody: response };
            } else {
                return {
                    status: 404,
                    jsonBody: { error: `No product data found for clientId '${clientId}'.` }
                };
            }
        } catch (error) {
            context.log(`Error processing request for ${clientId}:`, error.message);
            return {
                status: 500,
                jsonBody: { error: 'An internal error occurred while retrieving product data.' }
            }
        }
    }
});