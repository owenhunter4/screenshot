const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');

const GOOGLE_CLOUD_PROJECT_ID = "screenshot-47f59";
const BUCKET_NAME = "gs://screenshot-47f59.appspot.com";

const getImageUrl = async (body) => {
    const _body = {
        url: body.url,
        width: body.width,
        height: body.height
    };
    console.log("url === > " + _body.url);
    console.log("width === > " + _body.width);
    console.log("height === > " + _body.height);
    const imgBuffer = await scrnShot(_body, "screen");
    const dName = new Date().getTime();
    const imgUrl = await urlImage(imgBuffer, dName + "/screen--");
    console.log("imgUrl === > " + imgUrl);

    var dataJsonReturn = {};
    if (imgUrl != ""){
        dataJsonReturn = {
            status : "success",
            imgUrl : imgUrl,
            date : new Date()
        };
    }else{
        dataJsonReturn = {
            status : "fail"

        };
    }

        return dataJsonReturn;
}

//-----
const scrnShot = async (_body, content) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', "--disable-setuid-sandbox",'--disable-web-security']
    });
    console.log(await browser.version());
    const page = await browser.newPage();
    // await page.setViewport({
    //     width: 1920,
    //     height: 1080,
    //     deviceScaleFactor: 1,
    // });
    
    await page.setCacheEnabled(false);
    var responseWeb = null;
    switch (content) {
        case "screen":
            await page.setViewport({
                width: _body.width ? parseInt(_body.width) : 1920,
                height: _body.height ? parseInt(_body.height) : 1080,
                deviceScaleFactor: 1,
            });
            responseWeb = await page.goto(_body.url, { waitUntil: 'networkidle2' });
            break;
        default:
            responseWeb = await page.goto("https://www.google.com/search?q=" + stockname, { waitUntil: 'networkidle2' });
            break;


    }
    console.log(responseWeb);
    // await page.setBypassCSP(true);
    // await page.setContent("<meta charset='utf-8'>");

    const buffer = await page.screenshot();

    await page.close();
    await browser.close();

    return buffer;
}

const urlImage = async (buffer, filename) => {
    const storage = new Storage({
        projectId: GOOGLE_CLOUD_PROJECT_ID,
    });

    const bucket = storage.bucket(BUCKET_NAME);

    const file = bucket.file(filename);

    const urlImg = await uploadBufferImage(file, buffer, filename);;

    //console.log("urlImg === >" + urlImg);

    return urlImg;
}

const uploadBufferImage = async (file, buffer, filename) => {
    return new Promise((resolve) => {
        const gTime = new Date().getTime();
        const cache_file_options = {
            metadata: {
                destination: filename,
                contentType: "image/jpeg",
                resumable: false,
                cacheControl: 'no-cache',
                metadata: {
                    firebaseStorageDownloadTokens: gTime,
                }
            }
        };
        try {
            file.save(buffer, cache_file_options, () => {
                const downLoadPath =
                    "https://firebasestorage.googleapis.com/v0/b/" + GOOGLE_CLOUD_PROJECT_ID + ".appspot.com/o/";

                const imageUrl =
                    downLoadPath +
                    encodeURIComponent(filename) +
                    "?alt=media&token=" +
                    gTime;
                resolve(imageUrl);
            });
        } catch (err) {
            resolve("");
        }
    })
}



module.exports = { getImageUrl };