import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getServerSession();
    console.log('[Star API POST] User:', user?.id);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: indexId } = await params;
    console.log('[Star API POST] Index ID:', indexId);

    // Check if index exists
    const { data: index, error: indexError } = await supabaseAdmin
      .from('indexes')
      .select('id, is_public, created_by')
      .eq('id', indexId)
      .single();

    console.log('[Star API POST] Index data:', { index, indexError });

    if (indexError || !index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }

    // Can star public indexes or your own private indexes (created_by could be null for system indexes)
    if (!index.is_public && index.created_by !== user.id) {
      console.log('[Star API POST] Permission denied:', {
        isPublic: index.is_public,
        createdBy: index.created_by,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Can only star public indexes or your own private indexes' },
        { status: 403 }
      );
    }

    // Check if already starred
    const { data: existingStar } = await supabaseAdmin
      .from('stars')
      .select('id')
      .eq('index_id', indexId)
      .eq('user_id', user.id)
      .single();

    if (existingStar) {
      return NextResponse.json(
        { error: 'Already starred', starred: true },
        { status: 200 }
      );
    }

    // Add star
    console.log('[Star API POST] Inserting star:', { indexId, userId: user.id });
    const { error: insertError } = await supabaseAdmin
      .from('stars')
      .insert({
        index_id: indexId,
        user_id: user.id,
      });

    if (insertError) {
      console.error('[Star API POST] Error adding star:', insertError);
      return NextResponse.json(
        { error: 'Failed to add star', details: insertError.message },
        { status: 500 }
      );
    }

    // Get updated star count
    console.log('[Star API POST] Getting star count for index:', indexId);
    const { count, error: countError } = await supabaseAdmin
      .from('stars')
      .select('*', { count: 'exact', head: true })
      .eq('index_id', indexId);

    if (countError) {
      console.error('[Star API POST] Error counting stars:', countError);
    }

    console.log('[Star API POST] Success! Star count:', count);
    return NextResponse.json({ starred: true, starCount: count || 0 });
  } catch (error) {
    console.error('[Star API POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getServerSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: indexId } = await params;

    // Remove star
    const { error: deleteError } = await supabaseAdmin
      .from('stars')
      .delete()
      .eq('index_id', indexId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing star:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove star' },
        { status: 500 }
      );
    }

    // Get updated star count
    const { count } = await supabaseAdmin
      .from('stars')
      .select('*', { count: 'exact', head: true })
      .eq('index_id', indexId);

    return NextResponse.json({ starred: false, starCount: count || 0 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

