
const supabase = require('../config/supabase');
const logAudit = require('../utils/auditLogger');

exports.getAllClinics = async (req, res) => {
  try {
    const { data, error } = await supabase.from('clinics').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogicDoctors = async (req, res) => {
  try {
    const { clinic_id } = req.query;
    let query = supabase.from('users')
      .select('*, doctors(*)') // inner join concept relies on consistent IDs
      .eq('role_id', (await getRoleId('doctor'))) 
      // Supabase join syntax is tricky without exact FK mapping if users.id is same as doctors.id
      // Simplified: Get doctors table, join users.

    // Better approach:
    let doctorQuery = supabase.from('doctors').select('*, users!inner(*)');
    
    if (clinic_id) {
       doctorQuery = doctorQuery.eq('users.clinic_id', clinic_id);
    }

    const { data, error } = await doctorQuery;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper to get role ID (could be cached)
async function getRoleId(roleName) {
   const { data } = await supabase.from('roles').select('id').eq('name', roleName).single();
   return data?.id;
}

exports.updateDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params; // doctor's user_id
    const { availability } = req.body;

    // Verify self or admin
    if (req.user.id !== id && req.userData.roles.name !== 'super_admin' && req.userData.roles.name !== 'clinic_admin') {
         return res.status(403).json({ error: 'Unauthorized to update this doctor availability' });
    }

    const { data, error } = await supabase
      .from('doctors')
      .update({ availability })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    await logAudit(req.user.id, 'UPDATE_AVAILABILITY', 'doctors', id, { availability });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
