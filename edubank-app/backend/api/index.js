require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MODULE_COLUMNS = `
  id, code, title, subject, phase, duration, cp, tp, atp, summary,
  deleted_at AS "deletedAt"
`;

const QBANK_COLUMNS = `
  id, code, title, subject, phase,
  taxonomy_focus AS "taxonomyFocus",
  total_items AS "totalItems",
  questions,
  deleted_at AS "deletedAt"
`;

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      message: "EduBank REST API + Supabase (Soft Delete & Trash Ready)",
      endpoints: [
        "GET /api/modules",
        "GET /api/modules/trash",
        "GET /api/modules/:id",
        "POST /api/modules",
        "PUT /api/modules/:id",
        "DELETE /api/modules/:id (Soft Delete)",
        "PATCH /api/modules/:id/restore",
        "DELETE /api/modules/:id/permanent",
        "GET /api/question-banks",
        "GET /api/question-banks/trash",
        "GET /api/question-banks/:id",
        "POST /api/question-banks",
        "DELETE /api/question-banks/:id (Soft Delete)",
        "PATCH /api/question-banks/:id/restore",
        "DELETE /api/question-banks/:id/permanent"
      ]
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Gagal terhubung ke database", detail: err.message });
  }
});

// ==========================================
// ENDPOINT MODUL AJAR
// ==========================================

// Ambil modul aktif (yang belum masuk sampah)
app.get('/api/modules', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${MODULE_COLUMNS} FROM modules WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Ambil modul di Sampah (WAJIB di atas /api/modules/:id)
app.get('/api/modules/trash', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${MODULE_COLUMNS} FROM modules WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get('/api/modules/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${MODULE_COLUMNS} FROM modules WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Modul tidak ditemukan" });
    }
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post('/api/modules', async (req, res) => {
  const { title, subject, phase, duration, cp, tp, atp, summary } = req.body;

  if (!title || !subject) {
    return res.status(400).json({
      status: "error",
      message: "Judul modul dan mata pelajaran wajib diisi."
    });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM modules');
    const nextNum = String(countRes.rows[0].total + 1).padStart(2, '0');
    const subjectCode = subject.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'MOD';

    const id = `mod-${Date.now().toString().slice(-6)}`;
    const code = `${subjectCode}-B4-${nextNum}`;
    const tpArray = Array.isArray(tp)
      ? tp
      : (tp ? tp.split('\n').map(item => item.trim()).filter(Boolean) : ["-"]);

    const insertQuery = `
      INSERT INTO modules (id, code, title, subject, phase, duration, cp, tp, atp, summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
      RETURNING ${MODULE_COLUMNS}
    `;

    const values = [
      id,
      code,
      title.trim(),
      subject.trim(),
      phase?.trim() || "Fase B - Kelas 4 SD",
      duration?.trim() || "4 JP (2 Pertemuan)",
      cp?.trim() || "-",
      JSON.stringify(tpArray.length > 0 ? tpArray : ["-"]),
      atp?.trim() || "-",
      summary?.trim() || "Modul pembelajaran Kurikulum Merdeka."
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.put('/api/modules/:id', async (req, res) => {
  const { title, subject, phase, duration, cp, tp, atp, summary } = req.body;

  if (!title || !subject) {
    return res.status(400).json({
      status: "error",
      message: "Judul modul dan mata pelajaran wajib diisi."
    });
  }

  try {
    const tpArray = Array.isArray(tp)
      ? tp
      : (tp ? tp.split('\n').map(item => item.trim()).filter(Boolean) : ["-"]);

    const updateQuery = `
      UPDATE modules
      SET title = $1, subject = $2, phase = $3, duration = $4,
          cp = $5, tp = $6::jsonb, atp = $7, summary = $8
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING ${MODULE_COLUMNS}
    `;

    const values = [
      title.trim(),
      subject.trim(),
      phase?.trim() || "Fase B - Kelas 4 SD",
      duration?.trim() || "4 JP (2 Pertemuan)",
      cp?.trim() || "-",
      JSON.stringify(tpArray.length > 0 ? tpArray : ["-"]),
      atp?.trim() || "-",
      summary?.trim() || "Modul pembelajaran Kurikulum Merdeka.",
      req.params.id
    ];

    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Modul tidak ditemukan" });
    }
    res.json({ status: "success", message: "Modul berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Soft Delete Modul (Pindahkan ke Sampah)
app.delete('/api/modules/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE modules SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING ${MODULE_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Modul tidak ditemukan" });
    }
    res.json({ status: "success", message: "Modul dipindahkan ke Sampah", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Pulihkan Modul dari Sampah
app.patch('/api/modules/:id/restore', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE modules SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING ${MODULE_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Modul tidak ditemukan di Sampah" });
    }
    res.json({ status: "success", message: "Modul berhasil dipulihkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Hapus Modul Secara Permanen
app.delete('/api/modules/:id/permanent', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM modules WHERE id = $1 RETURNING ${MODULE_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Modul tidak ditemukan" });
    }
    res.json({ status: "success", message: "Modul dihapus permanen", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==========================================
// ENDPOINT BANK SOAL
// ==========================================

// Ambil paket soal aktif
app.get('/api/question-banks', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${QBANK_COLUMNS} FROM question_banks WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Ambil paket soal di Sampah (WAJIB di atas /api/question-banks/:id)
app.get('/api/question-banks/trash', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${QBANK_COLUMNS} FROM question_banks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get('/api/question-banks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${QBANK_COLUMNS} FROM question_banks WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Paket soal tidak ditemukan" });
    }
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post('/api/question-banks', async (req, res) => {
  const { title, subject, phase, taxonomyFocus, questions } = req.body;

  if (!title || !subject) {
    return res.status(400).json({
      status: "error",
      message: "Judul paket soal dan mata pelajaran wajib diisi."
    });
  }

  const validQuestions = Array.isArray(questions)
    ? questions.filter(q => q.stem && q.stem.trim() !== '')
    : [];

  if (validQuestions.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Minimal harus ada 1 butir soal yang diisi."
    });
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM question_banks');
    const nextNum = String(countRes.rows[0].total + 1).padStart(2, '0');
    const subjectCode = subject.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SOAL';

    const formattedQuestions = validQuestions.map((q, idx) => ({
      no: idx + 1,
      stem: q.stem.trim(),
      bloom: q.bloom?.trim() || "C2 (Memahami)",
      solo: q.solo?.trim() || "Multistructural",
      options: Array.isArray(q.options) && q.options.length > 0
        ? q.options
        : ["A. -", "B. -", "C. -", "D. -"],
      answer: q.answer?.trim() || "A",
      explanation: q.explanation?.trim() || "-"
    }));

    const id = `qb-${Date.now().toString().slice(-6)}`;
    const code = `SAS-${subjectCode}-${nextNum}`;

    const insertQuery = `
      INSERT INTO question_banks (id, code, title, subject, phase, taxonomy_focus, total_items, questions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING ${QBANK_COLUMNS}
    `;

    const values = [
      id,
      code,
      title.trim(),
      subject.trim(),
      phase?.trim() || "Fase B - Kelas 4 SD",
      taxonomyFocus?.trim() || "Bloom C2-C4 & SOLO Relational",
      formattedQuestions.length,
      JSON.stringify(formattedQuestions)
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Soft Delete Paket Soal (Pindahkan ke Sampah)
app.delete('/api/question-banks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE question_banks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING ${QBANK_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Paket soal tidak ditemukan" });
    }
    res.json({ status: "success", message: "Paket soal dipindahkan ke Sampah", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Pulihkan Paket Soal dari Sampah
app.patch('/api/question-banks/:id/restore', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE question_banks SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING ${QBANK_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Paket soal tidak ditemukan di Sampah" });
    }
    res.json({ status: "success", message: "Paket soal berhasil dipulihkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Hapus Paket Soal Secara Permanen
app.delete('/api/question-banks/:id/permanent', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM question_banks WHERE id = $1 RETURNING ${QBANK_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Paket soal tidak ditemukan" });
    }
    res.json({ status: "success", message: "Paket soal dihapus permanen", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server EduBank (Soft Delete Ready) berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;