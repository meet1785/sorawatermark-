# Sora Watermark Remover 🎬

A powerful, free, and privacy-focused web tool for removing watermarks from Sora AI-generated videos. All processing happens locally in your browser - no uploads, no server processing, complete privacy.

![Sora Watermark Remover](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🚀 Fast Processing**: Advanced algorithms process videos in seconds
- **🔒 100% Privacy**: All processing happens in your browser - videos never leave your device
- **💎 High Quality**: Maintains original video quality while removing watermarks
- **💰 Completely Free**: No hidden fees, subscriptions, or limitations
- **📱 Real-time Progress**: Live progress indicators showing processing status
- **👁️ In-browser Preview**: Compare original and cleaned videos side-by-side
- **⬇️ One-click Download**: Download your processed MP4 file instantly
- **🎯 Easy to Use**: Simple drag-and-drop interface or URL input
- **🔗 URL Support**: Attempt to download videos directly from Sora ChatGPT URLs (when possible)

## 🚀 Quick Start

### Option 1: Use Online (Recommended)

Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari).

### Option 2: Local Development Server

```bash
# Clone the repository
git clone https://github.com/meet1785/sorawatermark.git
cd sorawatermark

# Serve using Python
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Open browser at http://localhost:8000
```

## 📖 How to Use

### Option 1: Upload Local Video File

1. **Upload Video**: 
   - Click "Choose Video File" or drag and drop your Sora video
   - Supports MP4, WebM, and MOV formats (max 500MB)

### Option 2: Download from Sora URL

1. **Enter URL**:
   - Paste a Sora ChatGPT video URL (e.g., `https://sora.chatgpt.com/p/s_...`)
   - Click "Download" button
   
2. **Automatic vs Manual Download**:
   - The tool will attempt automatic download (rarely succeeds due to CORS)
   - If automatic download fails, detailed manual instructions will appear
   - Follow the step-by-step guide to download using:
     - Browser DevTools (Network tab) - Recommended
     - Browser extension (Video DownloadHelper)
     - Right-click on video player
   
3. **Why Manual Download?**:
   - **CORS Security**: Browser security prevents client-side JavaScript from accessing cross-origin resources
   - **Privacy First**: This tool is 100% client-side for your privacy (no backend server)
   - **Comparison**: Sites like savesora.com use backend servers to bypass CORS restrictions
   - **Solution**: The manual method is simple and works reliably

### Processing and Download

2. **Processing**:
   - Watch real-time progress as the tool analyzes and removes the watermark
   - Four-step process: Load → Analyze → Remove → Finalize

3. **Preview**:
   - Compare original and cleaned videos side-by-side
   - Verify watermark removal quality

4. **Download**:
   - Click "Download Cleaned Video" to save your watermark-free video
   - Video is saved as MP4 format

## 🛠️ Technical Details

### Technologies Used

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Video Processing**: FFmpeg.wasm (WebAssembly)
- **Architecture**: Client-side processing (no backend required)

### How It Works

1. **Video Loading**: Loads the video file into browser memory
2. **Watermark Detection**: Analyzes typical Sora watermark locations (bottom-right corner)
3. **Removal Processing**: Uses FFmpeg's delogo filter to remove watermark from detected area
4. **Output Generation**: Encodes the cleaned video as MP4 with H.264 codec

### FFmpeg Processing

The tool uses FFmpeg.wasm with the following filter chain:

```bash
ffmpeg -i input.mp4 \
  -vf "delogo=x=iw-210:y=ih-70:w=200:h=60:show=0" \
  -c:v libx264 -preset ultrafast -crf 23 \
  -c:a copy \
  output.mp4
```

This targets the typical Sora watermark position (200x60 pixels in bottom-right area).

## 🎨 Customization

### Adjusting Watermark Detection

Edit `script.js` to modify watermark detection parameters:

```javascript
// In removeWatermark function
await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', 'delogo=x=iw-210:y=ih-70:w=200:h=60:show=0',
    // x=iw-210: 210 pixels from right edge
    // y=ih-70: 70 pixels from bottom edge
    // w=200: watermark width
    // h=60: watermark height
    ...
]);
```

### Styling

Modify `styles.css` to customize colors and theme:

```css
:root {
    --primary-color: #6366f1;  /* Change primary color */
    --primary-dark: #4f46e5;   /* Change dark shade */
    /* ... other color variables */
}
```

## 🔧 Browser Compatibility

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Requirements:**
- WebAssembly support
- Modern JavaScript (ES6+)
- Sufficient memory for video processing (4GB+ RAM recommended)

## 📊 Performance

- **Small videos** (< 50MB): 10-30 seconds
- **Medium videos** (50-200MB): 30-90 seconds
- **Large videos** (200-500MB): 90-180 seconds

*Processing time varies based on video length, resolution, and device performance.*

## 🔐 Privacy & Security

- **No Data Collection**: Videos are processed entirely in your browser
- **No Server Uploads**: Files never leave your device
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency - inspect the code yourself

## ⚠️ Limitations

- Maximum file size: 500MB
- Processing large 4K videos may require significant memory
- Some browser configurations may limit WASM memory usage
- Watermark detection is optimized for standard Sora watermarks
- **URL Download**: Direct downloads from Sora URLs may be blocked due to CORS restrictions and authentication requirements. Manual download and file upload is recommended.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Support for custom watermark positions
- [ ] Batch processing multiple videos
- [ ] Advanced watermark detection using AI
- [ ] Video quality presets (fast/balanced/quality)
- [ ] Progress persistence (resume interrupted processing)
- [ ] Mobile app version

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚖️ Legal Disclaimer

This tool is provided for educational and personal use only. Users are responsible for ensuring they have the right to remove watermarks from any video content. The developers assume no liability for misuse of this tool. Always respect content creators' rights and terms of service.

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - For enabling browser-based video processing
- OpenAI Sora - For inspiring this tool
- The open-source community

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contribute improvements via pull requests

---

**Made with ❤️ for the AI video community**