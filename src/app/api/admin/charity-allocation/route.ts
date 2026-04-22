import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Instantiate inside handler to avoid build-time evaluation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Count active subscriptions
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const activeMembers = count || 0;
    const monthlyRevenue = activeMembers * 15; // £15/mo subscription
    const charityPool = monthlyRevenue * 0.2;  // 20% allocated to charity

    return NextResponse.json({
      success: true,
      activeMembers,
      charityPoolGenerated: charityPool,
      status: 'Charity allocation calculation completed.',
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
