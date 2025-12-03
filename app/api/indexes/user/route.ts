import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth-helpers';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { user, profile } = await getServerSession();

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return empty array if Supabase not configured
    if (!isSupabaseConfigured) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabaseAdmin
      .from('indexes')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user Indexes:', error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

