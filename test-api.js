const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MALL_ID = 'daesan3833';
const API_VERSION = '2025-12-01';

// Try to read token from .tokens.json first, then fallback to hardcoded (if needed)
let ACCESS_TOKEN = '';
try {
    const tokenPath = path.join(__dirname, '.tokens.json');
    if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        ACCESS_TOKEN = tokens.access_token;
        console.log('Using token from .tokens.json');
    }
} catch (e) {
    console.log('Could not read .tokens.json');
}

if (!ACCESS_TOKEN) {
    ACCESS_TOKEN = 'HbGP2gqoFRlp8YDqiWIVVA';
}

async function testFetch() {
    try {
        // Test 1: explicit fields
        console.log('--- Requesting product with fields=category_list ---');
        const response = await axios.get(
            `https://${MALL_ID}.cafe24api.com/api/v2/admin/products`,
            {
                params: {
                    limit: 1,
                    fields: 'product_no,product_name,category_list'
                },
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Cafe24-Api-Version': API_VERSION,
                },
            }
        );
        console.log('Product Response:', JSON.stringify(response.data.products[0], null, 2));

        // Test 2: Categories endpoint
        console.log('\n--- Requesting Categories List ---');
        const catResponse = await axios.get(
            `https://${MALL_ID}.cafe24api.com/api/v2/admin/categories`,
            {
                params: { limit: 5 },
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Cafe24-Api-Version': API_VERSION,
                },
            }
        );
        console.log('Categories Response:', JSON.stringify(catResponse.data.categories, null, 2));

    } catch (error) {
        console.error('API Error:', error.response?.status, error.response?.data);
    }
}

testFetch();
