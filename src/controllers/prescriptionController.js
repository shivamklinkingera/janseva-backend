
const supabase = require('../config/supabase');
const logAudit = require('../utils/auditLogger');

exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, medications, instructions } = req.body;

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        appointment_id,
        medications,
        instructions
      })
      .select()
      .single();

    if (error) throw error;

    // Update appointment status to completed? Optional logic.
    
    await logAudit(req.user.id, 'CREATE_PRESCRIPTION', 'prescriptions', data.id, { appointment_id });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('appointment_id', appointment_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
