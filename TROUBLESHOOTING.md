# Troubleshooting Guide

This guide helps you resolve common issues with the Sora Watermark Remover tool.

## Table of Contents
1. [Upload Issues](#upload-issues)
2. [Processing Errors](#processing-errors)
3. [Performance Issues](#performance-issues)
4. [Browser Compatibility](#browser-compatibility)
5. [Quality Issues](#quality-issues)
6. [Download Problems](#download-problems)

---

## Upload Issues

### Problem: "Cannot select file" or file input not working

**Symptoms:**
- Click on "Choose Video File" does nothing
- Cannot drag and drop files

**Solutions:**
1. **Check browser permissions**: Ensure your browser allows file uploads
2. **Try different browser**: Switch to Chrome or Firefox
3. **Disable browser extensions**: Ad blockers may interfere
4. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: "File size exceeds 500MB limit"

**Solutions:**
1. **Compress video first**: Use a video compressor
2. **Lower resolution**: Convert to 720p before processing
3. **Trim video**: Split into smaller segments

**Recommended tools for compression:**
- [HandBrake](https://handbrake.fr/) (Desktop)
- [FFmpeg](https://ffmpeg.org/) command line
- Online compressors (use with caution for privacy)

### Problem: "Invalid file format"

**Solutions:**
1. **Check file extension**: Must be .mp4, .webm, or .mov
2. **Re-encode video**: Convert to standard MP4 format
3. **Check corruption**: Ensure file is not corrupted

```bash
# Convert to compatible MP4 using FFmpeg
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
```

---

## Processing Errors

### Problem: "Failed to load FFmpeg" error

**Symptoms:**
- Error message appears during initialization
- Processing never starts

**Solutions:**
1. **Check internet connection**: FFmpeg.wasm loads from CDN
2. **Disable ad blockers**: May block CDN resources
3. **Try different CDN**: Edit script.js to use alternative CDN
4. **Use local copy**: Download FFmpeg.wasm locally

**Alternative CDN URLs:**
```javascript
// In script.js, replace CDN URL:
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
// Or try:
const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
```

### Problem: "Processing failed" or stuck at certain percentage

**Symptoms:**
- Progress bar stops moving
- Browser becomes unresponsive
- Error in console

**Solutions:**
1. **Refresh and retry**: Sometimes temporary glitch
2. **Smaller file**: Try with a smaller video first
3. **Close other tabs**: Free up memory
4. **Check console**: Look for specific error messages (F12)
5. **Update browser**: Ensure you have latest version

### Problem: "Out of memory" error

**Symptoms:**
- Browser crashes during processing
- "Out of memory" message
- Tab becomes unresponsive

**Solutions:**
1. **Close other applications**: Free up system RAM
2. **Use smaller video**: Reduce file size or resolution
3. **Increase browser memory**:
   - Chrome: Launch with `--max-old-space-size=4096` flag
   - Firefox: about:config → javascript.options.mem.max
4. **Use desktop browser**: Mobile browsers have less memory
5. **Restart browser**: Clear memory leaks

**Chrome launch with more memory (Windows):**
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --max-old-space-size=4096
```

---

## Performance Issues

### Problem: Processing is very slow

**Expected Processing Times:**
- 10MB video: 15-20 seconds
- 50MB video: 45-60 seconds
- 100MB video: 90-120 seconds
- 200MB video: 3-4 minutes

**If slower than expected:**

1. **Close unnecessary tabs**: Reduce CPU/memory usage
2. **Use wired internet**: For initial FFmpeg load
3. **Disable browser extensions**: Reduce overhead
4. **Check CPU usage**: Ensure system isn't overloaded
5. **Try desktop browser**: Mobile browsers are slower
6. **Update hardware drivers**: Especially graphics drivers

### Problem: Browser becomes laggy during processing

**Solutions:**
1. **Expected behavior**: Video processing is CPU-intensive
2. **Don't switch tabs**: Let it process in foreground
3. **Close other applications**: Free up resources
4. **Disable animations**: In browser settings
5. **Use performance mode**: Windows power settings

---

## Browser Compatibility

### Problem: Tool doesn't work in Safari

**Solutions:**
1. **Update Safari**: Need version 14 or later
2. **Enable WebAssembly**: Safari → Preferences → Advanced
3. **Disable content blockers**: May interfere
4. **Try Chrome/Firefox**: Better compatibility

### Problem: Mobile browser issues

**Symptoms:**
- Slow processing
- Memory errors
- UI issues

**Solutions:**
1. **Use desktop browser**: Mobile browsers have limitations
2. **Close all other apps**: Free up mobile RAM
3. **Try Chrome mobile**: Best mobile compatibility
4. **Reduce video size**: Mobile can't handle large files

### Recommended Browsers:
| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Excellent |
| Firefox | 88+     | ✅ Good |
| Edge    | 90+     | ✅ Excellent |
| Safari  | 14+     | ⚠️ Good (with caveats) |
| Opera   | 76+     | ✅ Good |

---

## Quality Issues

### Problem: Output video quality is worse than original

**Causes:**
- Re-encoding always has some quality loss
- CRF 23 is a balance between quality and size

**Solutions:**
1. **Accept minor quality loss**: CRF 23 is near-transparent
2. **Modify CRF value**: Edit script.js (lower = better quality)
3. **Use lossless encoding**: Much larger file size

**Adjust quality in script.js:**
```javascript
// Find this line:
'-crf', '23',
// Change to:
'-crf', '18',  // Higher quality, larger file
// Or:
'-crf', '28',  // Lower quality, smaller file
```

**CRF Scale:**
- 0 = Lossless (huge file)
- 18 = Very high quality
- 23 = High quality (default)
- 28 = Medium quality
- 35+ = Low quality

### Problem: Watermark still visible or partially removed

**Causes:**
- Watermark in different location than expected
- Watermark larger than standard size
- Multiple watermarks

**Solutions:**
1. **Adjust removal area**: Edit script.js coordinates
2. **Manual inspection**: Check watermark position in video
3. **Process multiple times**: For stubborn watermarks

**Custom watermark position:**
```javascript
// In script.js, find:
'delogo=x=iw-210:y=ih-70:w=200:h=60:show=0'

// Adjust parameters:
// x=iw-210 → x position (210 pixels from right)
// y=ih-70  → y position (70 pixels from bottom)
// w=200    → width (200 pixels)
// h=60     → height (60 pixels)
```

### Problem: Artifacts or blurriness in watermark area

**Causes:**
- Delogo filter creates interpolation artifacts
- Complex background behind watermark

**Solutions:**
1. **Expected behavior**: Some artifacts are normal
2. **Adjust filter parameters**: May improve results
3. **Use inpainting method**: Future enhancement
4. **Accept minor imperfections**: Better than watermark

---

## Download Problems

### Problem: Download button doesn't work

**Solutions:**
1. **Check browser settings**: Allow downloads from localhost
2. **Disable download manager extensions**: May interfere
3. **Try right-click**: Right-click processed video → Save As
4. **Check disk space**: Ensure enough space for download

### Problem: Downloaded video won't play

**Symptoms:**
- Video file downloaded but won't open
- Media player shows error
- File size is 0 or very small

**Solutions:**
1. **Verify processing completed**: Check for 100% progress
2. **Try different media player**: VLC is recommended
3. **Re-process video**: May have been corrupted
4. **Check file extension**: Should be .mp4

**Recommended media players:**
- [VLC Media Player](https://www.videolan.org/)
- Windows Media Player (Windows 10+)
- QuickTime (Mac)
- MPV Player

### Problem: Video plays but has issues

**Symptoms:**
- Audio missing
- Video stuttering
- Playback errors

**Solutions:**
1. **Check original video**: Ensure it was valid
2. **Re-encode with different settings**: Modify script.js
3. **Use video repair tool**: Try video repair software
4. **Contact support**: Open GitHub issue with details

---

## Advanced Troubleshooting

### Enable Debug Mode

Add this to your browser console (F12) to enable detailed logging:

```javascript
// Enable verbose FFmpeg logging
ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]:', message);
});

// Monitor memory usage
setInterval(() => {
    console.log('Memory:', performance.memory.usedJSHeapSize / 1048576, 'MB');
}, 5000);
```

### Check Browser Console

Press F12 (or Cmd+Option+I on Mac) to open developer tools:

1. Go to **Console** tab
2. Look for red error messages
3. Copy error details when reporting issues

### System Requirements Check

Minimum requirements:
- **CPU**: Dual-core 2.0 GHz
- **RAM**: 4GB (8GB recommended)
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Internet**: For initial CDN load only
- **Disk Space**: 2x video file size free space

### Network Issues

If FFmpeg.wasm won't load:

1. **Check CDN status**: Visit https://unpkg.com in browser
2. **Try alternative**: Use jsdelivr.com instead
3. **Download locally**: Host FFmpeg.wasm files yourself
4. **Check firewall**: May block WebAssembly downloads

---

## Getting Help

If you still have issues:

1. **Search existing issues**: [GitHub Issues](https://github.com/meet1785/sorawatermark-/issues)
2. **Create new issue**: Include:
   - Browser and version
   - Operating system
   - Video file details (size, format, resolution)
   - Error messages from console
   - Steps to reproduce
3. **Provide minimal example**: Simplest case that reproduces issue
4. **Be patient**: This is an open-source project

### Issue Template

```markdown
**Browser**: Chrome 119
**OS**: Windows 11
**Video**: 50MB, MP4, 1080p
**Error**: "Processing failed at 45%"
**Console log**: [paste error messages]
**Steps**:
1. Uploaded video
2. Processing started
3. Stopped at 45% with error
```

---

## FAQ

**Q: Is this tool safe to use?**
A: Yes, all processing happens in your browser. No data is sent to servers.

**Q: Why is it slow?**
A: Video processing is computationally intensive. Times vary by device.

**Q: Can I use this commercially?**
A: Tool is MIT licensed, but ensure you have rights to modify videos.

**Q: Does it work offline?**
A: After initial load, yes (FFmpeg.wasm is cached).

**Q: What about my privacy?**
A: 100% private - videos never leave your device.

---

Last Updated: October 26, 2024
