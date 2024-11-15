# Amazon Media Downloader Extension

This browser extension, built with [Plasmo](https://www.plasmo.com/), enables users to download all images and videos from a product page on Amazon with a single click. This tool is designed for ease of use, helping users gather media assets efficiently.

## Features

- **One-Click Download**: Automatically collects and downloads all images and videos displayed on an Amazon product page.
- **Organized Files**: Downloads are organized, making it easy to review and access content.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/amazon-media-downloader.git
   cd amazon-media-downloader
   ```
2. Install dependencies:
   1. Install in client
       ```bash
      pnpm install
      ```
   2. Install in server
      ```bash
      npm i
      ```
  
3. Run the development Client:
      Inside Client To build Extension
   1. ```bash
      pnpm dev
      ```
      Inside server
   2. ```bash
      node app.js
      ```

4. Load the extension in your browser:
    - Open your browser’s extensions page (`chrome://extensions/` for Chrome).
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `dist` folder.

## Usage

1. Navigate to any Amazon product page.
2. Click on the Amazon Media Downloader extension icon.
3. All images and videos will be downloaded to your default download location.

## Technologies

- **Plasmo**: Framework for building browser extensions.
- **JavaScript**: Core logic for media detection and download.
- **Node.js** : Create logic for video download

## Contributing

Feel free to open issues or submit pull requests to improve the extension.

---

Let me know if you'd like to add or adjust any sections!
