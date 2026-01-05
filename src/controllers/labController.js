
const supabase = require('../config/supabase');
const logAudit = require('../utils/auditLogger');

exports.uploadReport = async (req, res) => {
  try {
    const { patient_id, doctor_id, test_name, notes, report_url } = req.body;
    
    // In a real scenario, this endpoint might handle multipart file upload,
    // upload to Supabase Storage, and then save the URL. 
    // Here we assume the frontend/client uploads to Storage and sends us the URL.

    const { data, error } = await supabase
      .from('lab_reports')
      .insert({
        patient_id,
        doctor_id, // Refers to the doctor ordering/uploading
        test_name,
        notes,
        report_url
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit(req.user.id, 'UPLOAD_LAB_REPORT', 'lab_reports', data.id, { test_name });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { data, error } = await supabase
      .from('lab_reports')
      .select('*, doctors(specialization, users(full_name))')
      .eq('patient_id', patient_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
