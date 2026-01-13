const axios = require('axios');

const MALL_ID = 'daesan3833';
const CLIENT_ID = '5TbJGxFqFBOtlYEXoWL47D';
const CLIENT_SECRET = 'GIYib6feK0vCm4mevXpf7i';
const REDIRECT_URI = 'https://daesan3833.cafe24.com/order/basket.html';
const CODE = '4efgYrlSgE5fFEbtUCMJfl';

async function exchangeToken() {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        console.log('Exchanging code for tokens...');
        const response = await axios.post(
            `https://${MALL_ID}.cafe24api.com/api/v2/oauth/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: CODE,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        console.log('Exchange Success!');
        console.log('Access Token:', response.data.access_token);
        console.log('Refresh Token:', response.data.refresh_token);
        console.log('Scopes:', response.data.scope);
    } catch (error) {
        console.error('Exchange Failed:', error.response?.data || error.message);
    }
}

exchangeToken();
