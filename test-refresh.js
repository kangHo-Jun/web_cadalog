const axios = require('axios');

const MALL_ID = 'daesan3833';
const CLIENT_ID = '5TbJGxFqFBOtlYEXoWL47D';
const CLIENT_SECRET = 'GIYib6feK0vCm4mevXpf7i';
// Step 257 user said:
// 5TbJGxFqFBOtlYEXoWL47D (Client ID?)
// 5TbJGxFqFBOtlYEXoWL47D (Client Secret?) -> Suspicious if they are identical.
// LjxqeeSFO0PYuq3LV4sfhG (Refresh Token)

// A Client Secret usually looks different. If the user pasted the ID twice, the refresh will fail.
// I'll try anyway.

const REFRESH_TOKEN = 'LjxqeeSFO0PYuq3LV4sfhG';

async function testRefresh() {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        console.log('Attempting refresh with:');
        console.log('Client ID:', CLIENT_ID);
        console.log('Refresh Token:', REFRESH_TOKEN);

        const response = await axios.post(
            `https://${MALL_ID}.cafe24api.com/api/v2/oauth/token`,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: REFRESH_TOKEN,
            }),
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        console.log('Refresh Success!');
        console.log('New Access Token:', response.data.access_token);
        console.log('New Refresh Token:', response.data.refresh_token);
    } catch (error) {
        console.error('Refresh Failed:', error.response?.data || error.message);
    }
}

testRefresh();
