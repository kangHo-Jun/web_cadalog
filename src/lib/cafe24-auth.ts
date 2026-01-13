import fs from 'fs';
import path from 'path';
import axios from 'axios';

const TOKEN_PATH = path.join(process.cwd(), '.tokens.json');

interface Tokens {
    access_token: string;
    refresh_token: string;
}

export function getTokens(): Tokens {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const data = fs.readFileSync(TOKEN_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading tokens file:', error);
    }

    return {
        access_token: process.env.CAFE24_ACCESS_TOKEN || '',
        refresh_token: process.env.CAFE24_REFRESH_TOKEN || '',
    };
}

export function saveTokens(tokens: Tokens) {
    try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    } catch (error) {
        console.error('Error saving tokens file:', error);
    }
}

export async function refreshAccessToken() {
    const { refresh_token } = getTokens();
    const mallId = process.env.MALL_ID;
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;

    if (!mallId || !clientId || !clientSecret || !refresh_token) {
        throw new Error('Missing credentials for token refresh');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await axios.post(
            `https://${mallId}.cafe24api.com/api/v2/oauth/token`,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
            }),
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const newTokens = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
        };

        saveTokens(newTokens);
        console.log('Successfully refreshed Cafe24 tokens');
        return newTokens.access_token;
    } catch (error: any) {
        console.error('Failed to refresh tokens:', error.response?.data || error.message);
        throw error;
    }
}
