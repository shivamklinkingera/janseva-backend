
const supabase = require('../config/supabase');

exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    // Fetch full profile including role name
    const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (name),
          clinics (name)
        `)
        .eq('id', req.user.id)
        .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
