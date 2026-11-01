app.get('/api/public/treatments', async (req, res) => {
  const { subdomain } = req.query;
  if (typeof subdomain !== 'string' || !subdomain) {
    return res.status(400).json({ error: 'El parámetro subdomain es obligatorio.' });
  }

  try {
    const result = await db.query(
      `SELECT tr.id, tr.name, tr.duration_minutes, tr.price, t.currency
       FROM treatments tr
       JOIN tenants t ON t.id = tr.tenant_id
       WHERE t.subdomain = $1 AND t.is_active = TRUE
       ORDER BY tr.name`,
      [subdomain]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tratamientos públicos:', error);
    res.status(500).json({ error: 'Error al obtener los tratamientos' });
  }
});