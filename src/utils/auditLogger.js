
const supabase = require('../config/supabase');

/**
 * Middleware/Helper to log actions
 * Usage: Can be used as middleware or called directly in controllers
 */
const logAudit = async (userId, action, tableName, recordId, details = {}) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        details
      });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = logAudit;
