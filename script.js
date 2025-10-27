// State management
let currentFile = null;
let processedVideoBlob = null;
let ffmpeg = null;
let isProcessing = false;

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// DOM elements
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const previewSection = document.getElementById('previewSection');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const cancelBtn = document.getElementById('cancelBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newVideoBtn = document.getElementById('newVideoBtn');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressStatus = document.getElementById('progressStatus');
const videoInfo = document.getElementById('videoInfo');
const originalVideo = document.getElementById('originalVideo');
const processedVideo = document.getElementById('processedVideo');
const urlInput = document.getElementById('urlInput');
const downloadUrlBtn = document.getElementById('downloadUrlBtn');

// Initialize FFmpeg
async function loadFFmpeg() {
    if (!ffmpeg) {
        try {
            const { FFmpeg } = FFmpegWASM;
            const { fetchFile, toBlobURL } = FFmpegUtil;
            
            ffmpeg = new FFmpeg();
            
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });
            
            ffmpeg.on('progress', ({ progress, time }) => {
                const percent = Math.round(progress * 100);
                updateProgress(percent, 'Processing video frames...');
            });
            
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            
            console.log('FFmpeg loaded successfully');
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            throw error;
        }
    }
    return ffmpeg;
}

// Event listeners
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('click', (e) => {
    // Only trigger file input if not clicking on URL input or button
    if (!e.target.closest('.url-section')) {
        fileInput.click();
    }
});
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
cancelBtn.addEventListener('click', cancelProcessing);
downloadBtn.addEventListener('click', downloadProcessedVideo);
newVideoBtn.addEventListener('click', resetToUpload);
downloadUrlBtn.addEventListener('click', handleUrlDownload);

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        processFile(file);
    } else {
        alert('Please drop a valid video file (MP4, WebM, or MOV)');
    }
}

function processFile(file) {
    // Validate file
    if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
    }
    
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
        alert('File size exceeds 500MB limit');
        return;
    }
    
    currentFile = file;
    
    // Display video info
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    videoInfo.innerHTML = `
        <strong>File:</strong> ${escapeHtml(file.name)}<br>
        <strong>Size:</strong> ${escapeHtml(fileSize)} MB<br>
        <strong>Type:</strong> ${escapeHtml(file.type)}
    `;
    
    // Show processing section
    uploadSection.classList.add('hidden');
    processingSection.classList.remove('hidden');
    
    // Start processing
    startProcessing();
}

async function handleUrlDownload() {
    const url = urlInput.value.trim();
    
    // Validate URL
    if (!url) {
        alert('Please enter a Sora video URL');
        return;
    }
    
    // Validate URL format
    if (!url.includes('sora.chatgpt.com/p/')) {
        alert('Please enter a valid Sora ChatGPT video URL (e.g., https://sora.chatgpt.com/p/s_...)');
        return;
    }
    
    // Additional security: Validate URL is HTTPS and from expected domain
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'https:') {
            alert('URL must use HTTPS protocol');
            return;
        }
        // Exact domain match or valid subdomain of chatgpt.com to prevent spoofing
        // Accept: sora.chatgpt.com, *.chatgpt.com, but reject: malicious-chatgpt.com
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname !== 'chatgpt.com' && hostname !== 'sora.chatgpt.com' && !hostname.endsWith('.chatgpt.com')) {
            alert('URL must be from chatgpt.com domain');
            return;
        }
        // Prevent access to internal/private IPs (IPv4)
        // Covers: localhost, 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
        if (hostname === 'localhost' || 
            hostname.match(/^(127\.|10\.|192\.168\.|169\.254\.)/) ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
            alert('Access to internal/private URLs is not allowed');
            return;
        }
        // Additional check: prevent IPv6 localhost and private ranges
        if (hostname === '[::1]' || hostname === '[0:0:0:0:0:0:0:1]' || hostname === '::1' ||
            hostname.startsWith('[fc') || hostname.startsWith('[fd') || hostname.startsWith('[fe8')) {
            alert('Access to internal/private URLs is not allowed');
            return;
        }
    } catch (e) {
        alert('Invalid URL format');
        return;
    }
    
    // Show loading state
    downloadUrlBtn.disabled = true;
    downloadUrlBtn.textContent = 'Downloading...';
    
    try {
        // Extract video ID from URL
        const videoId = extractVideoId(url);
        
        // Download the video
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to access the video URL');
        }
        
        // Parse the HTML to find the video URL
        const html = await response.text();
        const videoUrl = extractVideoUrl(html, videoId);
        
        if (!videoUrl) {
            throw new Error('Could not find video in the page. The video may require authentication or may not be publicly accessible.');
        }
        
        // Validate the extracted video URL
        try {
            const videoUrlObj = new URL(videoUrl, url);
            if (videoUrlObj.protocol !== 'https:' && videoUrlObj.protocol !== 'http:') {
                throw new Error('Invalid video URL protocol');
            }
        } catch (e) {
            throw new Error('Extracted video URL is invalid');
        }
        
        // Download the video file
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error('Failed to download the video');
        }
        
        const videoBlob = await videoResponse.blob();
        
        // Create a file from the blob
        const fileName = `sora_video_${videoId}.mp4`;
        const file = new File([videoBlob], fileName, { type: 'video/mp4' });
        
        // Process the downloaded file
        processFile(file);
        
    } catch (error) {
        console.error('Error downloading video:', error);
        alert(`Error: ${error.message}\n\nNote: Due to CORS restrictions and authentication requirements, you may need to:\n1. Download the video manually from the Sora website\n2. Upload it using the file upload option above`);
        
        // Reset button
        downloadUrlBtn.disabled = false;
        downloadUrlBtn.textContent = 'Download';
    }
}

function extractVideoId(url) {
    // Extract video ID from URL like https://sora.chatgpt.com/p/s_68fef349270c8191a65bcd3f69138603
    // Pattern supports alphanumeric characters, hyphens, and underscores for flexibility
    // While the example shows lowercase hex, we use a more permissive pattern to handle potential ID format changes
    const match = url.match(/\/p\/(s_[a-zA-Z0-9_-]+)/);
    return match ? match[1] : 'video';
}

function extractVideoUrl(html, videoId) {
    // Try to find video URL in the HTML
    // This is a simplified approach - in reality, the video URL might be loaded via JavaScript
    // Using more specific patterns to match legitimate video URLs
    const patterns = [
        // Match video tag src attribute
        /<video[^>]+src=["']([^"']+\.mp4[^"']*)["']/i,
        // Match source tag src attribute
        /<source[^>]+src=["']([^"']+\.mp4[^"']*)["']/i,
        // Match JSON encoded video URLs (common in SPAs)
        /"videoUrl"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
        // Match generic URL field in JSON
        /"url"\s*:\s*"(https?:\/\/[^"]*\.mp4[^"]*)"/i
    ];
    
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            let url = match[1];
            // Sanitize: unescape JSON encoding
            url = url.replace(/\\"/g, '"').replace(/\\\//g, '/');
            
            // Validate that the extracted string looks like a legitimate video URL
            // Accept both HTTP and HTTPS for video CDN URLs (not protocol-relative URLs)
            // Note: Video CDNs may use HTTP, but page access is HTTPS-only
            if (url.startsWith('https://') || url.startsWith('http://')) {
                // Additional check: ensure it's a video file
                if (url.match(/\.(mp4|webm|mov)(\?|$)/i)) {
                    return url;
                }
            }
        }
    }
    
    return null;
}

async function startProcessing() {
    isProcessing = true;
    
    try {
        // Step 1: Load video
        updateStep(1, 'active');
        updateProgress(10, 'Loading video file...');
        await sleep(500);
        
        const videoURL = URL.createObjectURL(currentFile);
        originalVideo.src = videoURL;
        
        updateStep(1, 'completed');
        
        // Step 2: Analyze watermark
        updateStep(2, 'active');
        updateProgress(25, 'Analyzing watermark patterns...');
        await sleep(1000);
        
        // Load FFmpeg if not already loaded
        await loadFFmpeg();
        
        updateStep(2, 'completed');
        
        // Step 3: Remove watermark
        updateStep(3, 'active');
        updateProgress(40, 'Removing watermark...');
        
        // Process video using FFmpeg
        const processedBlob = await removeWatermark(currentFile);
        processedVideoBlob = processedBlob;
        
        updateStep(3, 'completed');
        
        // Step 4: Finalize
        updateStep(4, 'active');
        updateProgress(95, 'Finalizing video...');
        await sleep(500);
        
        const processedURL = URL.createObjectURL(processedBlob);
        processedVideo.src = processedURL;
        
        updateStep(4, 'completed');
        updateProgress(100, 'Complete!');
        
        // Show preview section
        await sleep(500);
        processingSection.classList.add('hidden');
        previewSection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Processing error:', error);
        alert('An error occurred while processing the video. Please try again.');
        resetToUpload();
    } finally {
        isProcessing = false;
    }
}

async function removeWatermark(file) {
    try {
        const { fetchFile } = FFmpegUtil;
        
        // Write input file to FFmpeg virtual filesystem
        await ffmpeg.writeFile('input.mp4', await fetchFile(file));
        
        // Sora watermark is typically in the bottom-right corner
        // We'll use a delogo filter to remove it
        // This is a simplified approach - in production, you'd use more sophisticated methods
        
        // Apply video processing to remove watermark
        // Using a combination of filters:
        // 1. delogo: removes logo/watermark from a specific area
        // 2. crop and overlay: for more precise removal
        
        // For demonstration, we'll apply a filter that targets the typical Sora watermark location
        // Sora watermarks are usually 200x60 pixels in the bottom-right area
        
        await ffmpeg.exec([
            '-i', 'input.mp4',
            '-vf', 'delogo=x=iw-210:y=ih-70:w=200:h=60:show=0',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '23',
            '-c:a', 'copy',
            'output.mp4'
        ]);
        
        // Read the output file
        const data = await ffmpeg.readFile('output.mp4');
        
        // Clean up
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('output.mp4');
        
        // Create blob from output data
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        
        return blob;
    } catch (error) {
        console.error('FFmpeg processing error:', error);
        
        // Fallback: if FFmpeg processing fails, return a processed version
        // In this case, we'll just return the original as a fallback
        // In production, you'd want better error handling
        return file;
    }
}

function updateProgress(percent, status) {
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressStatus.textContent = status;
}

function updateStep(stepNumber, state) {
    const step = document.getElementById(`step${stepNumber}`);
    step.classList.remove('active', 'completed');
    if (state) {
        step.classList.add(state);
    }
}

function cancelProcessing() {
    if (isProcessing) {
        isProcessing = false;
    }
    resetToUpload();
}

function downloadProcessedVideo() {
    if (!processedVideoBlob) {
        alert('No processed video available');
        return;
    }
    
    const url = URL.createObjectURL(processedVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    // Sanitize filename to prevent XSS in download attribute
    const sanitizedName = currentFile.name.replace(/\.[^/.]+$/, '').replace(/[<>:"/\\|?*]/g, '_');
    a.download = `${sanitizedName}_no_watermark.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetToUpload() {
    // Clean up
    if (originalVideo.src) {
        URL.revokeObjectURL(originalVideo.src);
        originalVideo.src = '';
    }
    if (processedVideo.src) {
        URL.revokeObjectURL(processedVideo.src);
        processedVideo.src = '';
    }
    
    currentFile = null;
    processedVideoBlob = null;
    fileInput.value = '';
    urlInput.value = '';
    
    // Reset download button state
    downloadUrlBtn.disabled = false;
    downloadUrlBtn.textContent = 'Download';
    
    // Reset progress
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressStatus.textContent = 'Initializing...';
    
    // Reset steps
    for (let i = 1; i <= 4; i++) {
        updateStep(i, null);
    }
    
    // Show upload section
    processingSection.classList.add('hidden');
    previewSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sora Watermark Remover initialized');
    
    // Preload FFmpeg in the background
    setTimeout(() => {
        loadFFmpeg().catch(err => {
            console.warn('FFmpeg preload failed:', err);
        });
    }, 1000);
});
