const {onRequest} = require("firebase-functions/v2/https");
const screenshot = require("./screenshot");

exports.screenshot = onRequest(async (req, res) => {
    if (req.method === "POST") {
        if(req.body.url){
           await screenshot.getImageUrl(req.body.url).then((url) => {
                res.status(200).json({screenUrl:url});
            });
        }
    }
    return res.send(req.method);
});