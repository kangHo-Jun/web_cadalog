import { NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';

  try {
    const response = await apiClient.get('/products', {
      params: {
        product_name: keyword || undefined,
        category: category || undefined,
        display: 'T',
        selling: 'T',
        limit: 50,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Cafe24 API Client Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    } else {
      console.error('Unexpected API Error:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
