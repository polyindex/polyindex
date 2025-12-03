import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase/server';

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
    const transformedIndex = {
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

    if (!index || index.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update Index
    const { data, error } = await supabaseAdmin
      .from('indexes')
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

    if (!index || index.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // All users can make Indexes public (subscription removed)

    const { data, error } = await supabaseAdmin
      .from('indexes')
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

    if (!index || index.created_by !== user.id) {
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

