import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : undefined;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@fairwayimpact.com';
  const password = 'AdminPassword123!';
  const fullName = 'System Admin';

  console.log(`Creating/updating admin user: ${email}...`);

  const { data: userRes, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  let userId = userRes?.user?.id;

  if (userErr) {
    if (userErr.message.includes('already been registered') || userErr.message.includes('User already exists')) {
       console.log('User already exists in auth. Fetching user ID...');
       const { data: listRes } = await supabase.auth.admin.listUsers();
       userId = listRes.users.find(u => u.email === email)?.id;
    } else {
       console.error('Error creating user:', userErr);
       process.exit(1);
    }
  }

  if (!userId) {
    console.error('Failed to resolve User ID.');
    process.exit(1);
  }

  console.log(`Updating profile for user ${userId}...`);
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      full_name: fullName,
      role: 'admin',
      subscription_status: 'active'
    });

  if (profileErr) {
    console.error('Error updating profile:', profileErr);
    process.exit(1);
  }

  console.log('✅ Admin user ready!');
  console.log('-----------------------------------');
  console.log(`URL: http://localhost:3000/auth/login`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
}

createAdmin();
