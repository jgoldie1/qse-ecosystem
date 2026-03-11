const { run } = require('../db/sqlite');

async function writeAudit({ actorEmail = null, action, entityType, entityId = null, details = null }) {
  await run(
    `INSERT INTO audit_logs (actor_email, action, entity_type, entity_id, details_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      actorEmail,
      action,
      entityType,
      entityId !== null ? String(entityId) : null,
      details ? JSON.stringify(details) : null,
      new Date().toISOString()
    ]
  );
}

module.exports = { writeAudit };
