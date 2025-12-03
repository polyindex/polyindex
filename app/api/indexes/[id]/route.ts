import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { IndexRow } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indexId } = await params;

    // Fetch Index
    const { data: index, error } = await supabaseAdmin
      .from('indexes')
      .select('*')
      .eq('id', indexId)
      .single();

    if (error || !index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }

    // Transform to camelCase
    const indexData = index as any;
    const transformedIndex = {
      id: indexData.id,
      name: indexData.name,
      description: indexData.description,
      createdBy: indexData.created_by,
      createdByUsername: indexData.created_by_username,
      isPublic: indexData.is_public,
      category: indexData.category,
      markets: indexData.markets || [],
      filters: indexData.filters,
      createdAt: indexData.created_at,
      updatedAt: indexData.updated_at,
    };

    return NextResponse.json(transformedIndex);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile } = await getServerSession();

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: indexId } = await params;
    const body = await request.json();
    const { name, description, category, markets, filters, isPublic } = body;

    // Check if Index belongs to user
    const { data: index } = await supabaseAdmin
      .from('indexes')
      .select('created_by')
      .eq('id', indexId)
      .single();

    if (!index || (index as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update Index
    const { data, error } = await (supabaseAdmin
      .from('indexes') as any)
      .update({
        name,
        description,
        category,
        markets,
        filters,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', indexId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Index:', error);
      return NextResponse.json(
        { error: 'Failed to update Index' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile } = await getServerSession();

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: indexId } = await params;
    const body = await request.json();
    const { isPublic } = body;

    // Check if Index belongs to user
    const { data: index } = await supabaseAdmin
      .from('indexes')
      .select('created_by')
      .eq('id', indexId)
      .single();

    if (!index || (index as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // All users can make Indexes public (subscription removed)

    const { data, error } = await (supabaseAdmin
      .from('indexes') as any)
      .update({ is_public: isPublic })
      .eq('id', indexId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Index:', error);
      return NextResponse.json(
        { error: 'Failed to update Index' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile } = await getServerSession();

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: indexId } = await params;

    // Check if Index belongs to user
    const { data: index } = await supabaseAdmin
      .from('indexes')
      .select('created_by')
      .eq('id', indexId)
      .single();

    if (!index || (index as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('indexes')
      .delete()
      .eq('id', indexId);

    if (error) {
      console.error('Error deleting Index:', error);
      return NextResponse.json(
        { error: 'Failed to delete Index' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

