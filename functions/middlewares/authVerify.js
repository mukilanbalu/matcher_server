const { auth } = require('express-oauth2-jwt-bearer');


const verifyJwt = auth({
    audience: 'matcher',
    issuerBaseURL: 'https://dev-matcher.us.auth0.com/',
    tokenSigningAlg: 'RS256'
})

module.exports = verifyJwt;