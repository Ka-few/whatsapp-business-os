exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  res.json({
    message: 'Login endpoint placeholder',
    token: 'jwt-placeholder-token',
    user: { email, role: 'manager' },
  });
};
