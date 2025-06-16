import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ decoded = { id: 1 }
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: 'Invalid Token' });
  }
};
export default verifyToken;
