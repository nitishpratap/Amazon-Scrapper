// background.js

// Function to handle downloading an m3u8 file
async function downloadM3U8Video(m3u8Url) {
    console.log("dxcfgvhbjnkml")
    try {
        const response = await fetch(m3u8Url);
        const m3u8Text = await response.text();

        const segmentUrls = [];
        const lines = m3u8Text.split("\n");

        // Parse the m3u8 file for video segments
        for (const line of lines) {
            if (line && !line.startsWith("#")) {
                const url = new URL(line, m3u8Url).href;
                segmentUrls.push(url);
            }
        }

        const zip = new JSZip();
        const folder = zip.folder("video_segments");

        // Download each segment and add it to the zip
        for (const segmentUrl of segmentUrls) {
            const segmentBlob = await fetch(segmentUrl).then((res) => res.blob());
            const segmentName = segmentUrl.split("/").pop();
            folder.file(segmentName, segmentBlob, { binary: true });
        }

        // Generate the zip and trigger the download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);

        chrome.downloads.download({
            url: url,
            filename: "video_segments.zip",
            saveAs: true
        });

    } catch (error) {
        console.error("Error downloading .m3u8 segments:", error);
    }
}

// Listen for messages from the popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadM3U8Video") {
        downloadM3U8Video(message.url);
        sendResponse({ success: true });
    }
});
