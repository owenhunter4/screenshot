const { onRequest } = require("firebase-functions/v2/https");
const screenshot = require("./screenshot");

exports.screenshot = onRequest({ memory: "4GiB", timeoutSeconds: 540, }, async (req, res) => {
    if (req.method === "POST") {
        console.log(Object.keys(req.body).length);
        if (Object.keys(req.body).length > 0) {
            const gData = await screenshot.getImageUrl(req.body).catch((err) => {
                console.log(err);
                res.status(400).send({ errmessage: err });
                return;
            });
            res.status(200).send(gData);
            return;

        } else {
            res.status(400).send({ message: "Content cannot be empty" });
            return;
        }
    }

    return res.send(req.method);
});