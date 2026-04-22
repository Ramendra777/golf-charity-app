import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { action, month, logicType, testMode } = await req.json();

    if (action !== 'EXECUTE_DRAW') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Generate 5 unique winning numbers between 1 and 45
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    const winningNumbers = Array.from(nums).sort((a, b) => a - b);

    // Fetch all user scores to match against winning numbers
    const { data: scores } = await supabaseAdmin.from('scores').select('user_id, score');

    // Group scores by user
    const userScoreMap: Record<string, number[]> = {};
    for (const row of scores ?? []) {
      if (!userScoreMap[row.user_id]) userScoreMap[row.user_id] = [];
      userScoreMap[row.user_id].push(row.score);
    }

    // Count matches
    const matchCounts = { '5-Match': 0, '4-Match': 0, '3-Match': 0 };
    for (const userScores of Object.values(userScoreMap)) {
      const hits = userScores.filter((s) => winningNumbers.includes(s)).length;
      if (hits >= 5) matchCounts['5-Match']++;
      else if (hits >= 4) matchCounts['4-Match']++;
      else if (hits >= 3) matchCounts['3-Match']++;
    }

    const jackpotRolled = matchCounts['5-Match'] === 0;

    if (testMode) {
      return NextResponse.json({
        success: true,
        mode: 'SIMULATION',
        winningNumbers,
        simulatedMatches: matchCounts,
        jackpotStatus: jackpotRolled ? 'No 5-match winner — jackpot rolls over' : '5-match winner found!',
      });
    }

    // Official publish
    const { data: drawEntry, error } = await supabaseAdmin
      .from('draws')
      .insert([{
        month: new Date(month).toISOString(),
        draw_type: 'Monthly',
        draw_logic: logicType,
        jackpot_amount: 5000.00,
        winning_numbers: winningNumbers,
        is_published: true,
        rolled_over: jackpotRolled,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      mode: 'OFFICIAL',
      drawId: drawEntry.id,
      winningNumbers,
      simulatedMatches: matchCounts,
      jackpotRolled,
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
