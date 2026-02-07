const isDoctor = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === "doctor") {
        return next(); 
    }
    return res.status(401).json({ message: "Doctor access denied! Please login as Doctor." });
};

const isPatient = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === "patient") {
        return next();
    }
    return res.status(401).json({ message: "Patient access denied!" });
};

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: "Please login first!" });
};

module.exports = { isDoctor, isPatient, isAuthenticated };