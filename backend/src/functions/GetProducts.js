const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const productCache = {
    client_a: null,
    client_b: null
};

/**
 * Asynchronously reads and parses a CSV file for a given client ID.
 * Uses an in-memory cache to avoid re-reading the file if data is already loaded.
 */
function getProductData(clientId, context) {
    return new Promise((resolve, reject) => {
        if (productCache[clientId]) {
            context.log(`Returning cached data for ${clientId}.`);
            return resolve(productCache[clientId]);
        }

        context.log(`Cache missing for ${clientId}. Reading and parsing from file...`);
        const filePath = path.join(__dirname, `../../data/${clientId}_data.csv`);

        if (!fs.existsSync(filePath)) {
            return reject(new Error(`Data file not found for ${clientId}.`));
        }

        const fullResults = [];

        fs.createReadStream(filePath)
            .pipe(csvParser({
                // this function transforms CSV headers to camelCase keys (e.g., "Product Name" -> "productName")
                mapHeaders: ({ header }) => header.replace(/ /g, '_').replace(/([_]\w)/g, g => g[1].toUpperCase()).replace(/^[A-Z]/, (match) => match.toLowerCase()),
                // this function attempts to convert strings to numbers
                mapValues: ({ value }) => {
                    const number = Number(value);
                    if (!isNaN(number) && value.trim() !== '') { return number; }
                    return value;
                }
            }))
            .on('data', (data) => fullResults.push(data))
            .on('end', () => {
                const necessaryData = fullResults.map(product => ({
                    productName: product.productName,
                    productCode: product.productCode,
                    availableStock: product.availableStock,
                    retailPrice: product.retailPrice,
                    wholesalePrice: product.wholesalePrice
                }));
                productCache[clientId] = necessaryData;
                context.log(`Successfully parsed and cached data for ${clientId}.`);

                resolve(necessaryData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}


app.http('GetProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const clientId = request.query.get('clientId');

        if (!clientId) {
            return {
                status: 400,
                jsonBody: { error: "Please give a 'clientId' in the query string. Expecting client_a or client_b." }
            };
        }

        try {
            const productData = await getProductData(clientId, context);

            const response = {
                message: `Product data for ${clientId}`,
                products: productData
            };
            return { jsonBody: response };
            
        } catch (error) {
            context.log(`Error processing request for ${clientId}:`, error.message);
            return {
                status: 500,
                jsonBody: { error: 'An internal error occurred while retrieving product data.' }
            }
        }
    }
});
