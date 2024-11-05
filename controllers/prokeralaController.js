const HttpError = require("../models/httpError")
const axios = require('axios');
const { param } = require("../routes");

var token = "";


const getToken = async (req, res, next) => {
    try {
        const response = await axios.post("https://api.prokerala.com/token", {
            grant_type: "client_credentials",
            client_id: "f15a3aee-1c18-423d-ba03-c68e24fccf2f",
            client_secret: "yUwqnWuuTeDisTKJeFPXD0Y7D2xLcEE3Gxngyhcf"
        }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        token = response.data.access_token;
        return token;
    }
    catch (err) {
        return next(err)
    }
}


const getPorutham = async (req, res, next) => {
    if (!token) {
        token = await getToken();
    }
    try {
        var config = {
            method: 'get',
            url: 'https://api.prokerala.com/v2/astrology/thirumana-porutham/advanced',
            params: { ...req.query },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        axios(config)
            .then(function (response) {
                if (response.status === 200) {
                    res.status(200).json(response.data)
                }
                res.status(error.status).send()
            })
            .catch(function (error) {

                res.status(error.status).send()
            });
    }
    catch (err) {
        next(err)
    }
}

exports.getToken = getToken;
exports.getPorutham = getPorutham;
