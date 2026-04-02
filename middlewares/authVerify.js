const { auth } = require('express-oauth2-jwt-bearer');

const verifyJwt = (req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    auth({
        audience: process.env.AUTH0_AUDIENCE || 'matcher',
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-matcher.us.auth0.com/',
        tokenSigningAlg: 'RS256'
    })(req, res, (err) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return next(err);
        }
        console.log('JWT Verified for user:', req.auth?.sub);
        next();
    });
};

module.exports = verifyJwt;