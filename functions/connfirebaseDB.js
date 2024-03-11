const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const verifyAuther = async (x_auther) => {
    const colletion = "Authorization";
    var dataret = {};
    try {
        const dataAuther = await db.collection(colletion).where("x-authorization", "==", x_auther).where("isActive", "==", "Yes").get();
        var quota_remain = 0
        console.log(dataAuther.docs.length);
        if (dataAuther.docs.length > 0) {
            dataAuther.forEach((data) => {
                if (data.data().quota_remain > 0) {
                    console.log(data.data().quota_remain);
                    quota_remain = data.data().quota_remain - 1;
                    updateQuota(x_auther,quota_remain);
                    console.log(quota_remain);
                    dataret = { status: "success", message: "x-authorization is ok" };
                } else {
                    dataret = { status: "fail", message: "quota_remain is 0" };
                }
            });

        } else {
            dataret = { status: "fail", message: "x-authorization is not correct || isActive != Yes" };
        }
        return dataret;
    } catch (err) {
        console.log(err);
    }
}

const updateQuota = async (x_auther, q_num) => {
    const colletion = "Authorization";
    const updateRequest = await db.collection(colletion).doc(x_auther).set({ quota_remain: q_num }, { merge: true });
    console.log(updateRequest);
}

module.exports = { verifyAuther };