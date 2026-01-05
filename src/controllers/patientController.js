
const supabase = require('../config/supabase');
const logAudit = require('../utils/auditLogger');

exports.getAllPatients = async (req, res) => {
  try {
    const { clinic_id } = req.query;
    let query = supabase.from('patients').select('*');

    // If logged in user is a doctor or admin, they can see patients. 
    // RLS might handle this, but explicit filtering is good for API.
    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('patients')
      .select('*, prescriptions(*), lab_reports(*), appointments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Patient not found' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { full_name, date_of_birth, gender, contact_number, address, medical_history, clinic_id } = req.body;
    
    // User validation logic could go here
    
    // Fetch the logged-in user's clinic_id
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', req.user.id)
        .single();
    
    if (userError || !userData) throw new Error('Could not verify user clinic.');

    const assignedClinicId = userData.clinic_id;

    const { data, error } = await supabase
      .from('patients')
      .insert({
        full_name,
        date_of_birth,
        gender,
        contact_number,
        address,
        medical_history,
        clinic_id: assignedClinicId, 
        // user_id is null for manually added patients until they claim/register
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit(req.user.id, 'CREATE_PATIENT', 'patients', data.id, { full_name });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAudit(req.user.id, 'UPDATE_PATIENT', 'patients', id, updates);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
