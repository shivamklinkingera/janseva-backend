
const supabase = require('../config/supabase');
const logAudit = require('../utils/auditLogger');

exports.getAppointments = async (req, res) => {
  try {
    const { clinic_id, doctor_id, patient_id, date } = req.query;
    let query = supabase.from('appointments').select('*, patients(full_name), doctors(specialization, users(full_name))');

    if (clinic_id) query = query.eq('clinic_id', clinic_id);
    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (date) query = query.eq('appointment_date', date); // Simplistic date match, arguably needs range

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { clinic_id, patient_id, doctor_id, appointment_date, reason } = req.body;

    // Check availability logic would go here

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        clinic_id,
        patient_id,
        doctor_id,
        appointment_date,
        reason,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit(req.user.id, 'CREATE_APPOINTMENT', 'appointments', data.id, { appointment_date });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAudit(req.user.id, `UPDATE_APPOINTMENT_STATUS_${status.toUpperCase()}`, 'appointments', id, { status });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
