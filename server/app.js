const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;


const download = async (url) => {
    // const url = "https://www.amazon.in/Godrej-Refrigerator-EDGE-205B-WRF/dp/B0BS6XQVD1/ref=sr_1_1_sspa?_encoding=UTF8&content-id=amzn1.sym.58c90a12-100b-4a2f-8e15-7c06f1abe2be&dib=eyJ2IjoiMSJ9.SuYaJGM0QWQShkZ4E0oQZkGCqlghHZKA820O9L9-uEAaKfVBl81fOthtUCAYuAWtAZeEURQOkoOQD4OGbqz7vbUyMIf9YzK-OSASeUrLZ9ukNTOqKWLTt3LLF77JmL0RKY0xO3hE6SsH-LeMS3uImP_iSu_ACSe4OenFVm-R4PmHypN4t4YCKAXDHDvMk3d1urJ0-AXYU-OcrNkH5Wr9m6OYj4Du4Bq9pssNS-eOgYKSTQv65bgGIG2CNe5HwpKyCbbr9YcIBW6LEXgHEeFCGYqy91_qZK0V4YZ9l2GWa6s.sIy7ZdoAo90iB-QjVKxQT3FVJfIimxe8lZD-CJ8ZpPE&dib_tag=se&pd_rd_r=c63c9bec-1e8b-4a1a-afc8-6754e2490b93&pd_rd_w=22kTG&pd_rd_wg=u1XSO&pf_rd_p=58c90a12-100b-4a2f-8e15-7c06f1abe2be&pf_rd_r=86DKNVTNZYW0FV1KMKJQ&qid=1731592554&refinements=p_85%3A10440599031&rps=1&s=kitchen&sr=1-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfYnJvd3Nl&th=1"

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the page to load and display content (if needed)
    await page.waitForSelector('.vse-player-container');

    // Get the HTML content
    const content = await page.content();

    // Use Cheerio to load and parse the HTML
    const $ = cheerio.load(content);

    // Extract the video URL by locating the script tag with video data
    const videoDataScript = $('script[type="a-state"]').filter((i, el) => {
        return $(el).attr('data-a-state')?.includes('"key":"mbsoftlines-player-ps"');
    }).first();

    if (videoDataScript.length) {
        const jsonData = JSON.parse(videoDataScript.text());

        // Extract the video URL if available
        const videoUrl = jsonData.videoUrl;

        if (videoUrl) {
            const outputFile = path.join(__dirname, 'amazon_video.mp4');
            // Run the FFmpeg command
            return new Promise((resolve, reject) => {
                exec(`ffmpeg -i "${videoUrl}" -c copy ${outputFile}`, (error, stdout, stderr) => {
                    if (error) {
                        reject(`Error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`FFmpeg stderr: ${stderr}`);
                    }
                    console.log(`Video saved as ${outputFile}`);
                    resolve(outputFile);
                });
            });
        } else {
            throw new Error('No video URL found.');
        }
    } else {
        throw new Error('No relevant video data found.');
    }

    // Close the browser
};
app.post('/downloadVideo', async (req, res) => {
    try {
        console.log("awesrdtfyguhijl :::::::",req.body.url);
        const { url } = req.body; // Get the URL from the request body
        if (!url) {
            return res.status(400).send({ error: 'URL is required' });
        }
        console.log("url is ::::::",url);

        const filePath = await download(url); // Download the video and get the path

        // Read and send the video file as a blob
        const videoData = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="amazon_video.mp4"`);
        res.send(videoData);

        // Cleanup the file after sending
        fs.unlinkSync(filePath);
    }catch(err) {
        console.log(err);
        res.status(400).send({
            error: 'An error occurred'
        });
    }
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})
