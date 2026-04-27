import { query, transaction } from "../config/db.js";

const contentSelect = `
  c.id, c.title, c.description, c.subject, c.file_path, c.file_url,
  c.file_type, c.file_size, c.uploaded_by, uploader.name AS uploaded_by_name,
  c.status, c.rejection_reason, c.approved_by, approver.name AS approved_by_name,
  c.approved_at, c.start_time, c.end_time, c.created_at,
  cs.rotation_order, cs.duration_minutes
`;

const contentJoins = `
  LEFT JOIN users uploader ON uploader.id = c.uploaded_by
  LEFT JOIN users approver ON approver.id = c.approved_by
  LEFT JOIN content_schedule cs ON cs.content_id = c.id
`;

export async function createContentWithSchedule(input) {
  return transaction(async (connection) => {
    const [slotRows] = await connection.execute(
      "SELECT id FROM content_slots WHERE subject = :subject LIMIT 1",
      { subject: input.subject },
    );

    let slotId = slotRows[0]?.id;
    if (!slotId) {
      const [slotResult] = await connection.execute(
        "INSERT INTO content_slots (subject) VALUES (:subject)",
        { subject: input.subject },
      );
      slotId = slotResult.insertId;
    }

    const [orderRows] = await connection.execute(
      "SELECT COALESCE(MAX(rotation_order), 0) + 1 AS next_order FROM content_schedule WHERE slot_id = :slotId",
      { slotId },
    );

    const [contentResult] = await connection.execute(
      `INSERT INTO content
       (title, description, subject, file_path, file_url, file_type, file_size, uploaded_by, status, start_time, end_time)
       VALUES
       (:title, :description, :subject, :filePath, :fileUrl, :fileType, :fileSize, :uploadedBy, 'pending', :startTime, :endTime)`,
      input,
    );

    await connection.execute(
      `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration_minutes)
       VALUES (:contentId, :slotId, :rotationOrder, :durationMinutes)`,
      {
        contentId: contentResult.insertId,
        slotId,
        rotationOrder: orderRows[0].next_order,
        durationMinutes: input.durationMinutes,
      },
    );

    return contentResult.insertId;
  });
}

export async function findContentById(id) {
  const rows = await query(
    `SELECT ${contentSelect}
     FROM content c
     ${contentJoins}
     WHERE c.id = :id
     LIMIT 1`,
    { id },
  );
  return rows[0] ?? null;
}

export async function listContent(filters = {}) {
  const where = [];
  const params = {};

  if (filters.status) {
    where.push("c.status = :status");
    params.status = filters.status;
  }
  if (filters.subject) {
    where.push("c.subject = :subject");
    params.subject = filters.subject;
  }
  if (filters.teacherId) {
    where.push("c.uploaded_by = :teacherId");
    params.teacherId = filters.teacherId;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return query(
    `SELECT ${contentSelect}
     FROM content c
     ${contentJoins}
     ${whereSql}
     ORDER BY c.created_at DESC`,
    params,
  );
}

export async function approveContent({ id, approvedBy }) {
  await query(
    `UPDATE content
     SET status = 'approved', approved_by = :approvedBy, approved_at = NOW(), rejection_reason = NULL
     WHERE id = :id`,
    { id, approvedBy },
  );
  return findContentById(id);
}

export async function rejectContent({ id, rejectedBy, reason }) {
  await query(
    `UPDATE content
     SET status = 'rejected', approved_by = :rejectedBy, approved_at = NULL, rejection_reason = :reason
     WHERE id = :id`,
    { id, rejectedBy, reason },
  );
  return findContentById(id);
}

export async function findLiveCandidates({ teacherId, subject }) {
  const params = {
    teacherId,
    subject: subject ?? null,
  };

  const where = [
    "c.uploaded_by = :teacherId",
    "c.status = 'approved'",
    "c.start_time <= NOW()",
    "c.end_time >= NOW()",
    "(:subject IS NULL OR c.subject = :subject)",
  ];

  return query(
    `SELECT ${contentSelect}
     FROM content c
     ${contentJoins}
     WHERE ${where.join(" AND ")}
     ORDER BY c.subject ASC, cs.rotation_order ASC`,
    params,
  );
}