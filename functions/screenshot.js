const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');

const GOOGLE_CLOUD_PROJECT_ID = "screenshot-47f59";
const BUCKET_NAME = "gs://screenshot-47f59.appspot.com";

const getImageUrl = async (url) => {
    console.log("url === > " + url);
    const imgBuffer = await scrnShot(url, "screen");
    const dName = new Date().getTime();
    const imgUrl = await urlImage(imgBuffer, dName + "/screen--");
    console.log("imgUrl === > " + imgUrl);
    
    return imgUrl;
}

//
const scrnShot = async (url, content) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    // await page.setViewport({
    //     width: 1920,
    //     height: 1080,
    //     deviceScaleFactor: 1,
    // });
    switch (content) {
        case "screen":
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            });
            await page.goto(url, { waitUntil: 'networkidle2' });
            break;
        default:
            await page.goto("https://www.google.com/search?q=" + stockname, { waitUntil: 'networkidle2' });
            break;


    }

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
        file.save(buffer, cache_file_options, () => {
            const downLoadPath =
                "https://firebasestorage.googleapis.com/v0/b/"+GOOGLE_CLOUD_PROJECT_ID+".appspot.com/o/";

            const imageUrl =
                downLoadPath +
                encodeURIComponent(filename) +
                "?alt=media&token=" +
                gTime;
            resolve(imageUrl);
        });
    })
}



module.exports = { getImageUrl };