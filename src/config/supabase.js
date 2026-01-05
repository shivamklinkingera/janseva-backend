
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env');
  // We might not want to crash immediately if just testing, but critical for real usage
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
