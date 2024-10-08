const { verifyToken } = require("../utils/authUlits");

async function verifyOwner(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    const { valid, decoded, message } = verifyToken(token);
    if (!valid) {
      return res.status(401).json({ message });
    }
    req.user = { _id: decoded._id, role: decoded.role };
    console.log(req.user);
    if (req.user && req.user.role === "owner") {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    // res.status(401).json({ message: "Authorization Failed!" });
    next(err);
  }
}

async function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing!" });
    }
    const token = authHeader.split(" ")[1];
    const { valid, decoded, message } = verifyToken(token);
    if (!valid) {
      return res.status(401).json({ message });
    }
    req.user = { _id: decoded._id, role: decoded.role };
    if (req.user && req.user.role === "user") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { verifyOwner, verifyUser };
