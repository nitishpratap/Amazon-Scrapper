console.log("Content script loaded on Amazon page");


// Function to extract product-related images and videos
function extractAllProductMedia() {
  return new Promise((resolve) => {
    const productImages = document.querySelectorAll('div#imgTagWrapperId img, div#altImages img') as NodeListOf<HTMLImageElement>;

    let videoPageUrl = null;
    let extractedVideoUrl = null; // Variable to store blob video URL
    const videoThumbnail = document.querySelector('div#video-player-wrapper a') ||
      document.querySelector('div#main-video-container a') ||
      document.querySelector('a#some-other-possible-id');

    // Extract image URLs
    const imageUrls = Array.from(productImages)
      .map((img) => img.src || img.dataset.src)
      .filter((src) => src);

    // If a video thumbnail is found, process it
    if (videoThumbnail instanceof HTMLAnchorElement) {
      const href = videoThumbnail.getAttribute('href');
      console.log("href is ::::::", href);
      if (href === "javascript:void(0)") {
        videoThumbnail.click();
        // Wait for the popup to open and extract the video URL
        setTimeout(() => {
          extractedVideoUrl =   extractVideoUrlFromPopup();
          console.log("Extracted Popup Video URL:", extractedVideoUrl);

          // You can send this URL to storage or background (optional)
          localStorage.setItem("extractedVideoUrl", extractedVideoUrl);
          console.log("extractedVideoUrl ::::::::::: ",extractedVideoUrl);
          resolve({
            images: imageUrls,
            videos: extractedVideoUrl ? [extractedVideoUrl] : [],

          });
        }, 500);
      } else {
        videoPageUrl = videoThumbnail.getAttribute('href');
        fetchVideoFromPopup(videoPageUrl);

        resolve({
          images: imageUrls,
          videos: videoPageUrl ? [videoPageUrl] : []
        });
      }
    } else {
      resolve({
        images: imageUrls,
        videos: []
      });
    }
  });
}
let videos = {};
// Extract video URL from the popup content
 function extractVideoUrlFromPopup() {
  const video = document.querySelector('video') || document.querySelector('video source');
  const testPopup = document.querySelector('.a-popover-wrapper');
   console.log("Test popup :::::::",testPopup);
  let uuid = ""
  if (video) {
    console.log("line 61 :::::::",video);
    console.log("url is  :::::",window.location.href)
    if (video) {
      const videoId = video.id;
      const uuidMatch = videoId.match(/[0-9a-fA-F-]{36}/); // Regular expression for UUID

      if (uuidMatch) {
        uuid = uuidMatch[0];
        uuid = uuid.slice(1);
        videos[uuid] = window.location.href;
        videos["url"] = window.location.href;
        console.log("Extracted UUID:", uuid);
      } else {
        console.log("UUID not found in the id.");
      }
    } else {
      console.log("Video element not found.");
    }
    localStorage.setItem("url", window.location.href);
    return window.location.href;
  }
  return null;
}

// Fetch video URL from popup page
function fetchVideoFromPopup(pageUrl) {
  fetch(pageUrl)
    .then(response => response.text())
    .then(html => {
      const videoUrl = extractVideoUrlFromPage(html);
      if (videoUrl) {
        console.log("Extracted Video URL from Popup:", videoUrl);
        // You can save or process this URL as needed
        localStorage.setItem("popupVideoUrl", videoUrl);
      }
    })
    .catch(error => console.error("Error fetching popup video:", error));
}

// Extract the video URL from HTML
function extractVideoUrlFromPage(html) {
  const videoMatch = html.match(/"video_url":"(https:\/\/[^"]+)"/);
  return videoMatch ? videoMatch[1] : null;
}

// Listen for messages (optional if background is still in use)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'videoUrlCaptured') {
    // Handle the captured .m3u8 URL here
    const capturedVideoUrl = message.videoUrl;
    console.log("Captured .m3u8 Video URL:", capturedVideoUrl);

    // Trigger download or any further actions here
    const link = document.createElement('a');
    link.href = capturedVideoUrl;
    link.download = 'video.m3u8';
    link.click();

    // Optionally, you can send the URL to your server or log it for further processing
    localStorage.setItem("capturedVideoUrl", capturedVideoUrl);
  }

  if (message.action === "downloadProductMedia") {




    console.log("Download m3u8 :::::::::127");
    extractAllProductMedia().then(media => {
      console.log("Extracted Media URL:", media);
      sendResponse(media);
    });
  }
  return true; // Keep the message listener alive
});

// Observe changes in the page DOM for dynamic content
// Observe changes in the page DOM for dynamic content
let observer = new MutationObserver(() => {
  extractAllProductMedia().then((mediaList) => {
    console.log("Extracted Media URL:", mediaList);

    // Disconnect observer after the first run
    observer.disconnect();
  });
});

observer.observe(document.body, { childList: true, subtree: true });
