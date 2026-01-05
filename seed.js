
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed() {
  console.log('Seeding data...');

  // 1. Create a Clinic
  console.log('Creating Clinic...');
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      name: 'JanSeva General Hospital',
      address: '123 Health St, Wellness City',
      contact_number: '9876543210'
    })
    .select()
    .single();

  if (clinicError) {
    console.error('Error creating clinic:', clinicError);
    // Try to fetch existing if error (likely unique constraint if I added one, but I didn't constraint name)
  }
  const clinicId = clinic?.id;
  console.log('Clinic Created:', clinicId);

  // 2. Create Doctor User
  console.log('Creating Doctor User...');
  const doctorEmail = `doctor_${Date.now()}@janseva.com`;
  const { data: docUser, error: docUserError } = await supabase.auth.admin.createUser({
    email: doctorEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
        full_name: 'Dr. John Doe',
        role: 'doctor'
    }
  });

  if (docUserError) console.error('Error creating doctor user:', docUserError);
  const docUserId = docUser.user.id;
  console.log('Doctor User Created:', docUserId);

  // 3. Update Doctor Profile (Triggers might have created the user entry in public.users, but we need to ensure roles and doctor table)
  // The 'handle_new_user' trigger inserts into public.users. 
  // We need to insert into 'doctors' table and assign clinic.
  
  // Wait a bit for trigger? Or just insert.
  // We should upsert into users just in case trigger failed or to set clinic_id.
  await supabase.from('users').update({ clinic_id: clinicId }).eq('id', docUserId);

  // Insert into doctors
  const { data: doctor, error: docProfileError } = await supabase
    .from('doctors')
    .insert({
      id: docUserId, // Link to user
      specialization: 'Cardiology',
      license_number: 'LIC-' + Date.now(),
      availability: { "mon": ["09:00-17:00"] }
    })
    .select()
    .single();
  
  if (docProfileError) console.error('Error creating doctor profile:', docProfileError);
  const doctorId = doctor?.id; // Should be same as docUserId

  // 4. Create Patients
  console.log('Creating Patients...');
  const patientIds = [];
  for (let i = 0; i < 5; i++) {
    const pEmail = `patient_${i}_${Date.now()}@example.com`;
    const { data: pUser, error: pError } = await supabase.auth.admin.createUser({
        email: pEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            full_name: `Patient ${i+1} Name`,
            role: 'patient'
        }
    });
    
    if (!pError) {
        const pId = pUser.user.id;
        patientIds.push(pId);
        // Link to clinic
        await supabase.from('users').update({ clinic_id: clinicId }).eq('id', pId);
        // Create public.patients entry (if not created by trigger or separate logic)
        // My schema has a 'patients' table. The trigger might just fill 'users'. 
        // I likely need to fill 'patients' table myself unless I have a trigger for that too. I don't recall one.
        const { error: ppError } = await supabase.from('patients').insert({
            user_id: pId, // if linked
            clinic_id: clinicId,
            full_name: `Patient ${i+1} Name`,
            contact_number: `555-010${i}`,
            // id is auto uuid usually
        });
        if (ppError) console.error('Error in patients table:', ppError);
    }
  }

  // 5. Create Appointments
  console.log('Creating Appointments...');
  if (doctorId && patientIds.length > 0) {
      for (const pId of patientIds) {
          // Determine patient table ID
          const { data: pData } = await supabase.from('patients').select('id').eq('user_id', pId).single();
          if (pData) {
              await supabase.from('appointments').insert({
                  clinic_id: clinicId,
                  patient_id: pData.id,
                  doctor_id: doctorId,
                  appointment_date: new Date(Date.now() + 86400000 * Math.random() * 10).toISOString(), // Future dates
                  status: 'scheduled',
                  reason: 'Regular Checkup'
              });
          }
      }
  }

  console.log('Seeding Complete.');
  console.log(`Login as Doctor with: ${doctorEmail} / password123`);
}

seed();
