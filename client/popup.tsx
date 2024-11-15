import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function IndexPopup() {
    const [mediaLinks, setMediaLinks] = useState({ images: [], videos: [] });
    const downloadProductMedia = async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "downloadProductMedia" }, async (response) => {
                    if (!response || (!response.images.length && !response.videos.length)) {
                        console.log("No media found for this product");
                        return;
                    }
                    setMediaLinks(response);

                    const zip = new JSZip();
                    const folder = zip.folder("product_media");

                    // Download images
                    for (const imgUrl of response.images) {
                        console.log("image url :L=::::::", imgUrl);
                        try {
                            const imgBlob = await fetch(imgUrl).then(res => res.blob());
                            const imgName = imgUrl.split('/').pop();
                            folder.file(`${imgName}.jpg`, imgBlob, { binary: true });
                        } catch (error) {
                            console.error("Error downloading image:", error);
                        }
                    }

                    // Download videos
                    for (const videoUrl of response.videos) {
                        console.log("Hello video url ::::",videoUrl);
                        if (videoUrl.endsWith(".m3u8")) {
                            chrome.runtime.sendMessage(
                                { action: "downloadM3U8Video", url: videoUrl },
                                (response) => {
                                    if (response.success) {
                                        console.log("Downloading .m3u8 video...");
                                    } else {
                                        console.error("Failed to download .m3u8 video.");
                                    }
                                }
                            );
                        } else {
                            // Handle other video URLs as before
                        }
                        try {
                            const videoBlob = await fetch(videoUrl).then(res => res.blob());
                            const videoName = videoUrl.split('/').pop();

                            // Check the MIME type of the video
                            const contentType = videoBlob.type;
                            let extension = ".mp4"; // Default to mp4 if we can't determine the format

                            if (contentType.includes("video/webm")) {
                                extension = ".webm";
                            } else if (contentType.includes("video/ogg")) {
                                extension = ".ogv";
                            }

                            folder.file(`${videoName}${extension}`, videoBlob, { binary: true });
                        } catch (error) {
                            console.error("Error downloading video:", error);
                        }
                    }

                    try {
                        // const uuid = localStorage.getItem("uuid") ?? "55dede67-ecee-4852-b469-7e4b0c5ebee";
                        const url = "https://www.amazon.in/Panasonic-Convertible-Purification-CS-CU-SU12ZKYWA/dp/B0CSCTCMX9/ref=sr_1_1_sspa?crid=26N5LP6N5D1QD&dib=eyJ2IjoiMSJ9.Tddefc5SQGI9VJ6AndAFXvtBaDM1T_YV6t83F-OLbWTtigPGTruf0Xp8EDoXgT-WqjCURHgVSMVf-dEH_eOHPexqPGF7EuZ_zhoEHL4vEtvjIOEocGm7l_PtcYUgQk7ZdOJU17Uy5K_nZWyG63rKQtiAJ6kbFaDhFpBkaHpZH_KrcvkE-bFB1nzAFZTF0tmNGmClmnHVXNNqkl2qP-bZRuJmBxb5DccgMsSN5oUsnDw.mERwk514YdGQFZSD_ZmXuxNowQB1n7Lmjr4F3HfWw7Q&dib_tag=se&keywords=ac%2Bfor%2Bsplit%2B1.5%2Bton&qid=1731601840&sprefix=ac%2Bfor%2Bsplit%2B1.5%2Bton%2Caps%2C233&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
                        console.log("line 71 :::::::",url);
                        const apiResponse = await fetch("http://localhost:8080/downloadVideo", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ url: response.videos[0] }) // Replace "uuid" with the actual UUID or URL
                        });                        if (!apiResponse.ok) throw new Error("Failed to fetch video from API");
                        console.log("Downloading video:", apiResponse);
                        const apiVideoBlob = await apiResponse.blob();
                        const apiVideoName = "api_video.mp4"; // Use a default or dynamic name

                        folder.file(apiVideoName, apiVideoBlob, { binary: true });
                    } catch (error) {
                        console.error("Error fetching video from API:", error);
                    }

                    // Generate and save the zip
                    zip.generateAsync({ type: "blob" }).then((content) => {
                        console.log("hcbrjde  chrechrhrec  chr4bcu4b4rc")
                        saveAs(content, "product_media.zip");
                    });
                });
            }
        });
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>Amazon Media Downloader Extension</h2>
            <button onClick={downloadProductMedia}>Download Product Media</button>

            <div>
                <h3>Images</h3>
                {mediaLinks.images.length > 0 ? (
                    <ul>
                        {mediaLinks.images.map((url, index) => (
                            <li key={index}>
                                <a href={url} target="_blank">{url}</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No images found</p>
                )}

                <h3>Videos</h3>
                {mediaLinks.videos.length > 0 ? (
                    <ul>
                        {mediaLinks.videos.map((url, index) => (
                            <li key={index}>
                                <a href={url} target="_blank">{url}</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No videos found</p>
                )}
            </div>
        </div>
    );
}

export default IndexPopup;
