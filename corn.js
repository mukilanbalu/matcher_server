const corn = require("node-cron");
const https = require("http2");

const backendUrl = "http://localhost:3001/api";
const job = new corn.CronJob("*/14 * * * *", function () {
    console.log("Restarting server...")

    https.get(backendUrl, (res) => {
        if (res.statusCode === 200) {
            console.log("server restarted")
        } else {
            console.error(
                `failes to restart server with status code :${res.statusCode}`
            )
        }
    }).on("error", (err) => {
        console.error("Error during restart:", err.message)
    })
})

module.exports = {
    job
}