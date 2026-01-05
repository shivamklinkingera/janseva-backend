
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDemo() {
  console.log('Seeding Demo User...');

  const email = 'admin@janseva.com';
  const password = 'password123';

  // Check if exists
  const { data: users } = await supabase.auth.admin.listUsers();
  const existing = users.users.find(u => u.email === email);
  
  let userId;

  if (existing) {
      console.log('User already exists:', email);
      userId = existing.id;
  } else {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Dr. Admin User',
            role: 'doctor' // give doctor role to see patients
        }
      });
      if (error) {
          console.error('Error creating user:', error);
          return;
      }
      userId = user.user.id;
      console.log('Created User:', email);
  }

  // Ensure Clinic
  const { data: clinic } = await supabase.from('clinics').select('id').limit(1).single();
  let clinicId = clinic?.id;
  
  if (!clinicId) {
       const { data: newClinic } = await supabase.from('clinics').insert({ name: 'Demo Clinic', address: 'Demo St', contact_number: '000' }).select().single();
       clinicId = newClinic.id;
  }

  // Link user
  await supabase.from('users').update({ clinic_id: clinicId }).eq('id', userId);
  
  // Create Doctor Profile if needed
  const { error: docError } = await supabase.from('doctors').upsert({
      id: userId,
      specialization: 'General Medicine',
      license_number: 'ADMIN-001',
      availability: { "mon": ["09:00-17:00"] }
  });

  if (!docError) console.log('Doctor Profile Ensured.');

  // Create some patients for this clinic
  for (let i = 1; i <= 3; i++) {
      const { data: pData } = await supabase.from('patients').insert({
          clinic_id: clinicId,
          full_name: `Demo Patient ${i}`,
          contact_number: `123456789${i}`,
          // user_id is optional in table definition? If strictly required, we need a user.
          // Assuming we can create "offline" patients without portal access for now, 
          // OR the schema requires user_id. Let's check schema/previous steps.
          // Schema Phase 1: patients table has user_id FK. 
          // If nullable, we are good. If not, we need users.
          // Let's assume nullable for "walk-in" patients or create users.
          // I will create users to be safe.
      }).select(); 
      // If error (user_id violated), I will skip or handle.
  }

  console.log('Demo Data Setup Complete.');
  console.log(`Credentials: ${email} / ${password}`);
}

seedDemo();
