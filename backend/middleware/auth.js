const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1]; 

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "complex-secret-key"
        );

        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};

const isPatient = (req, res, next) => {
    if (req.user && req.user.role === "patient") {
        return next();
    }
    return res.status(403).json({ message: "Patient access denied" });
};

const isDoctor = (req, res, next) => {
    if (req.user && req.user.role === "doctor") {
        return next();
    }
    return res.status(403).json({ message: "Doctor access denied" });
};

module.exports = { isAuthenticated, isPatient, isDoctor };
