import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth-helpers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { fetchPolymarketMarkets } from '@/lib/polymarket/client';
import { generateCuratedIndexes } from '@/lib/etf-generator';

export async function GET(request: NextRequest) {
  try {
    // If Supabase not configured, generate and return curated indexes only
    if (!isSupabaseConfigured) {
      const markets = await fetchPolymarketMarkets(0, 100);
      const curatedIndexes = generateCuratedIndexes(markets);
      console.log('Supabase not configured - returning curated indexes only');
      return NextResponse.json(curatedIndexes);
    }

    const { user, profile } = await getServerSession();

    // Fetch markets and generate curated indexes
    const markets = await fetchPolymarketMarkets(0, 100);
    const curatedIndexes = generateCuratedIndexes(markets);

    // Upsert curated indexes into database so they can be starred
    for (const curatedIndex of curatedIndexes) {
      try {
        await supabaseAdmin
          .from('indexes')
          .upsert(
            {
              id: curatedIndex.id,
              name: curatedIndex.name,
              description: curatedIndex.description,
              created_by: null, // System indexes have no user creator
              created_by_username: 'system',
              is_public: curatedIndex.isPublic,
              category: curatedIndex.category,
              markets: curatedIndex.markets,
              filters: null,
              created_at: curatedIndex.createdAt,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false,
            }
          );
      } catch (error) {
        console.error('Error upserting curated Index:', curatedIndex.id, error);
      }
    }

    // Fetch user Indexes from database
    let query = supabaseAdmin
      .from('indexes')
      .select('*')
      .eq('is_public', true);

    if (user?.id) {
      query = supabaseAdmin
        .from('indexes')
        .select('*')
        .or(`is_public.eq.true,created_by.eq.${user.id}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching indexes:', error);
      return NextResponse.json(curatedIndexes, { status: 200 });
    }

    // Get star counts for all indexes
    const indexIds = (data || []).map((index: any) => index.id);
    const { data: starData } = await supabaseAdmin
      .from('stars')
      .select('index_id, user_id')
      .in('index_id', indexIds);

    // Create a map of index ID to star count and user's stars
    const starCounts = new Map<string, number>();
    const userStars = new Set<string>();

    (starData || []).forEach((star: any) => {
      starCounts.set(star.index_id, (starCounts.get(star.index_id) || 0) + 1);
      if (user?.id && star.user_id === user.id) {
        userStars.add(star.index_id);
      }
    });

    // Transform database indexes to match TypeScript types (snake_case to camelCase)
    // Also filter out expired indexes (where maxEndDate has passed)
    const now = new Date();
    const transformedIndexes = (data || [])
      .filter((index: any) => {
        // If index has filters with maxEndDate, check if it's expired
        if (index.filters?.maxEndDate) {
          const maxEndDate = new Date(index.filters.maxEndDate);
          return maxEndDate >= now; // Keep only if maxEndDate is in the future or today
        }
        return true; // Keep indexes without date filters
      })
      .map((index: any) => ({
        id: index.id,
        name: index.name,
        description: index.description,
        createdBy: index.created_by,
        createdByUsername: index.created_by_username,
        isPublic: index.is_public,
        category: index.category,
        markets: index.markets || [],
        filters: index.filters,
        createdAt: index.created_at,
        updatedAt: index.updated_at,
        marketCount: index.filters ? undefined : (index.markets?.length || 0), // Will calculate for dynamic indexes client-side
        totalVolume: undefined, // Will calculate client-side if needed
        starCount: starCounts.get(index.id) || 0,
        isStarred: user?.id ? userStars.has(index.id) : false,
      }));

    // Return all indexes (including curated ones now stored in database)
    return NextResponse.json(transformedIndexes);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return error if Supabase not configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Database not configured. Set up Supabase to create indexes.' },
        { status: 503 }
      );
    }

    const { user, profile } = await getServerSession();

    console.log('POST /api/indexes - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasProfile: !!profile,
      profileData: profile ? { id: profile.id, username: profile.username } : null,
    });

    if (!user || !profile) {
      console.error('POST /api/indexes - Authentication failed:', {
        user: !!user,
        profile: !!profile,
      });
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: !user ? 'No user session found' : 'User profile not found in database',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category, markets, filters, isPublic } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // For dynamic indexes, markets can be empty but filters must be present
    if ((!markets || markets.length === 0) && !filters) {
      return NextResponse.json(
        { error: 'Either markets or filters are required' },
        { status: 400 }
      );
    }

    // All users can make indexes public (subscription removed)

    const { data, error } = await supabaseAdmin
      .from('indexes')
      .insert({
        name,
        description,
        category,
        markets,
        filters,
        is_public: isPublic || false,
        created_by: user.id,
        created_by_username: profile.username,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating index:', error);
      return NextResponse.json(
        { error: 'Failed to create index' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

