const { onRequest } = require("firebase-functions/v2/https");
const screenshot = require("./screenshot");
const connfirebaseDb = require("./connfirebaseDB");

exports.screenshot = onRequest({ memory: "4GiB", timeoutSeconds: 540, }, async (req, res) => {
    if (req.method === "POST") {
        const X_athu = req.headers['x-authorization'];
        if (X_athu) {
            console.log(X_athu);
            await connfirebaseDb.verifyAuther(X_athu).then(async (resVerifyAuther) => {
                console.log(resVerifyAuther);
                if (resVerifyAuther.status === "success") {
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
                } else {
                    res.status(400).send({ message: resVerifyAuther.message });
                    return;
                }
            });

        } else {
            res.status(400).send({ message: "x-authorization cann't empty" });
            return;
        }
    } else {
        return res.send(req.method);
    }
});