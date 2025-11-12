# Sora Watermark Remover 🎬

A powerful, free, and privacy-focused web tool for removing watermarks from Sora AI-generated videos. All processing happens locally in your browser - no uploads, no server processing, complete privacy.

![Sora Watermark Remover](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🚀 Fast Processing**: Advanced algorithms process videos in seconds
- **🔒 100% Privacy**: All processing happens in your browser - videos never leave your device
- **💎 High Quality**: Maintains original video quality while removing watermarks
- **💰 Completely Free**: No hidden fees, subscriptions, or limitations
- **🎯 Custom Watermark Position**: Configure watermark location and size with presets or manual controls
- **⚙️ Quality Presets**: Choose between Fast, Balanced, or High Quality processing modes
- **📱 Real-time Progress**: Live progress indicators showing processing status
- **👁️ In-browser Preview**: Compare original and cleaned videos side-by-side with live watermark overlay
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

2. **Configure Watermark Position**:
   - Video preview with live watermark overlay
   - Choose from quick presets:
     - Bottom Right (default) - typical Sora watermark location
     - Bottom Left
     - Top Right
     - Top Left
   - Or fine-tune manually:
     - Horizontal Position (0-100%)
     - Vertical Position (0-100%)
     - Width (50-400px)
     - Height (30-200px)
   - See the watermark area highlighted on your video in real-time

3. **Select Output Quality**:
   - Choose your preferred quality preset:
     - **Fast**: Lower quality (CRF 28), faster processing - best for quick previews
     - **Balanced**: Good quality (CRF 23), moderate speed - recommended for most users
     - **High Quality**: Best quality (CRF 18), slower processing - best for final output
   - Trade-off between processing speed and video quality

4. **Processing**:
   - Click "Start Processing" to begin
   - Watch real-time progress as the tool analyzes and removes the watermark
   - Four-step process: Load → Analyze → Remove → Finalize

5. **Preview**:
   - Compare original and cleaned videos side-by-side
   - Verify watermark removal quality

6. **Download**:
   - Click "Download Cleaned Video" to save your watermark-free video
   - Video is saved as MP4 format

## 🛠️ Technical Details

### Technologies Used

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Video Processing**: FFmpeg.wasm (WebAssembly)
- **Architecture**: Client-side processing (no backend required)

### How It Works

1. **Video Loading**: Loads the video file into browser memory
2. **Watermark Configuration**: User selects watermark position and size using presets or manual controls
3. **Removal Processing**: Uses FFmpeg's delogo filter to remove watermark from configured area
4. **Output Generation**: Encodes the cleaned video as MP4 with H.264 codec

### FFmpeg Processing

The tool uses FFmpeg.wasm with a dynamically generated filter based on user configuration:

```bash
ffmpeg -i input.mp4 \
  -vf "delogo=x={computed}:y={computed}:w={user_width}:h={user_height}:show=0" \
  -c:v libx264 -preset ultrafast -crf 23 \
  -c:a copy \
  output.mp4
```

The position parameters are calculated from user settings:
- **x**: Horizontal position (percentage converted to pixels or expression like `iw-210`)
- **y**: Vertical position (percentage converted to pixels or expression like `ih-70`)
- **w**: Width in pixels (default: 200px, adjustable: 50-400px)
- **h**: Height in pixels (default: 60px, adjustable: 30-200px)

### Watermark Configuration

The watermark removal area can be customized through the UI:

**Quick Presets:**
- Bottom Right (82%, 88%) - Default, typical Sora watermark location
- Bottom Left (2%, 88%)
- Top Right (82%, 2%)
- Top Left (2%, 2%)

**Manual Controls:**
- Fine-tune horizontal and vertical position with sliders (0-100%)
- Adjust watermark width (50-400px) and height (30-200px)
- Real-time visual feedback with overlay on video preview

## 🎨 Customization

### Adjusting Watermark Detection

No code editing needed! Use the built-in configuration UI to adjust watermark position and size:

1. Upload your video
2. Select a preset or use sliders to position the watermark area
3. See the highlighted area on your video preview
4. Click "Start Processing" to remove the watermark

For advanced users who want to modify default values, edit `script.js`:

```javascript
// Default watermark configuration
let watermarkConfig = {
    x: 82,      // Horizontal position (%)
    y: 88,      // Vertical position (%)
    width: 200, // Width in pixels
    height: 60, // Height in pixels
    preset: 'bottom-right'
};
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
- Custom watermark configuration allows flexibility for different watermark positions
- **URL Download**: Direct downloads from Sora URLs may be blocked due to CORS restrictions and authentication requirements. Manual download and file upload is recommended.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [x] Support for custom watermark positions - ✨
- [x] Video quality presets (fast/balanced/high quality) - **NEW!** ✨
- [ ] Batch processing multiple videos
- [ ] Advanced watermark detection using AI
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