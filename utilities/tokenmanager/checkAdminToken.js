const jwt = require("jsonwebtoken");

module.exports = function AuthenticateAccessToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null) {
        res.status(500).json({
            status: false,
            error: "Invalid access token.",
        });
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            console.log("user", user);
            if (err) {
                if (err.message === "jwt expired") {
                    res.status(500).json({
                        status: false,
                        error: "Token Expired Please Login.",
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        error: "Unable To Validate Token",
                    });
                }
            } else if (user.type !== "admin") {
                res.status(500).json({
                    status: false,
                    error: "Forbidden access to this route.",
                });
            } else {
                req.user = user;
                next();
            }
        });
    }
};
