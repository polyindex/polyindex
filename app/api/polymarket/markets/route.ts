import { NextRequest, NextResponse } from 'next/server';
import { fetchPolymarketMarkets } from '@/lib/polymarket/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const endDateBefore = searchParams.get('endDateBefore') || undefined;
    const endDateAfter = searchParams.get('endDateAfter') || undefined;

    const markets = await fetchPolymarketMarkets(offset, limit, {
      endDateBefore,
      endDateAfter,
    });
    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
