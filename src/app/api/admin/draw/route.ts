import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { action, month, logicType, testMode } = await req.json();

    if (action === 'EXECUTE_DRAW') {
      // 1. Generate Winning Numbers (1-45 range, 5 numbers)
      let winningNumbers: number[] = [];
      if (logicType === 'RANDOM' || logicType === 'ALGORITHMIC') {
         // simplified logic for now: random 5 numbers between 1 and 45 without duplicates
         const nums = new Set<number>();
         while(nums.size < 5) {
           nums.add(Math.floor(Math.random() * 45) + 1);
         }
         winningNumbers = Array.from(nums);
      }

      // 2. Fetch all eligible active subscribers' latest 5 scores
      const { data: scores } = await supabaseAdmin.from('scores').select('*');
      
      // (In a real scenario, group scores by user and find matchers...)
      const simulatedMatches = {
        '5-Match': 0,
        '4-Match': 2,
        '3-Match': 15,
      };

      if (testMode) {
        return NextResponse.json({
           success: true,
           mode: 'SIMULATION',
           winningNumbers,
           simulatedMatches,
           jackpotStatus: 'Rollover applied for 5-Match'
        });
      }

      // 3. Official Publish Mode
      // Create Draw Entry
      const { data: drawEntry, error } = await supabaseAdmin.from('draws').insert([
        { 
          month: new Date(month).toISOString(), 
          draw_type: 'Monthly', 
          draw_logic: logicType,
          jackpot_amount: 5000.00, // example derived amount
          winning_numbers: winningNumbers,
          is_published: true
        }
      ]).select().single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        mode: 'OFFICIAL',
        drawId: drawEntry.id,
        winningNumbers,
        simulatedMatches
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
