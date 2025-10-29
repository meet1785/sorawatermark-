# Backend Proxy Option for Automatic Downloads

## Overview

If you want automatic URL downloads like savesora.com, you need a backend server. This document explains how to implement it.

## Why Backend is Needed

**CORS (Cross-Origin Resource Sharing)** is a browser security feature that prevents:
- JavaScript running on `yourdomain.com` from fetching `sora.chatgpt.com`
- This is by design to prevent malicious sites from accessing your data

**How savesora.com works**:
```
User → savesora.com frontend → savesora.com backend → sora.chatgpt.com
                                 ↓
                            Downloads video
                                 ↓
                            Sends to user
```

The backend server makes the request (no CORS restrictions server-side).

## Implementation Options

### Option 1: Node.js Backend (Recommended)

**Stack**: Express.js + Node.js

**Setup**:
```bash
npm install express cors axios
```

**Backend Code** (`server.js`):
```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/api/download-sora', async (req, res) => {
    try {
        const { url } = req.body;
        
        // Validate URL
        if (!url.includes('sora.chatgpt.com')) {
            return res.status(400).json({ error: 'Invalid URL' });
        }
        
        // Fetch the page
        const response = await axios.get(url);
        const html = response.data;
        
        // Extract video URL (you'll need to parse HTML)
        const videoUrl = extractVideoUrl(html);
        
        if (!videoUrl) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Stream the video to the client
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'stream'
        });
        
        res.setHeader('Content-Type', 'video/mp4');
        videoResponse.data.pipe(res);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
```

**Frontend Changes** (script.js):
```javascript
async function handleUrlDownload() {
    // ... validation code ...
    
    try {
        const response = await fetch('http://localhost:3000/api/download-sora', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const file = new File([blob], `sora_video_${videoId}.mp4`, { type: 'video/mp4' });
        processFile(file);
        
    } catch (error) {
        // Fallback to manual instructions
        showManualDownloadInstructions(url, videoId);
    }
}
```

**Deployment**:
- Vercel: Free tier available
- Heroku: Free tier available
- Railway: Free tier available
- AWS Lambda: Pay per use

### Option 2: Python Backend

**Stack**: Flask + Python

**Setup**:
```bash
pip install flask flask-cors requests
```

**Backend Code** (`server.py`):
```python
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import re

app = Flask(__name__)
CORS(app)

@app.route('/api/download-sora', methods=['POST'])
def download_sora():
    try:
        data = request.get_json()
        url = data.get('url')
        
        # Validate URL
        if 'sora.chatgpt.com' not in url:
            return jsonify({'error': 'Invalid URL'}), 400
        
        # Fetch the page
        response = requests.get(url)
        html = response.text
        
        # Extract video URL
        video_url = extract_video_url(html)
        
        if not video_url:
            return jsonify({'error': 'Video not found'}), 404
        
        # Stream video
        video_response = requests.get(video_url, stream=True)
        
        return Response(
            video_response.iter_content(chunk_size=8192),
            content_type='video/mp4'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_video_url(html):
    # Parse HTML to find video URL
    patterns = [
        r'<video[^>]+src="([^"]+)"',
        r'<source[^>]+src="([^"]+)"',
        r'"videoUrl":"([^"]+)"'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            return match.group(1)
    
    return None

if __name__ == '__main__':
    app.run(port=3000)
```

### Option 3: Serverless Function

**Platform**: Vercel/Netlify Functions

**Example** (Vercel):

Create `api/download-sora.js`:
```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { url } = req.body;
        
        // Fetch and proxy video
        const response = await fetch(url);
        const html = await response.text();
        
        const videoUrl = extractVideoUrl(html);
        
        const videoResponse = await fetch(videoUrl);
        const buffer = await videoResponse.arrayBuffer();
        
        res.setHeader('Content-Type', 'video/mp4');
        res.send(Buffer.from(buffer));
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

## Costs and Considerations

### Free Tier Options (Monthly):
- **Vercel**: 100GB bandwidth
- **Netlify**: 100GB bandwidth
- **Railway**: $5 free credit
- **Render**: 750 hours free

### Video Bandwidth:
- Average Sora video: 50-200MB
- 100GB = ~500-2000 videos/month

### Costs Beyond Free Tier:
- **Vercel**: $20/100GB
- **AWS S3 + Lambda**: ~$0.09/GB + compute
- **DigitalOcean**: $5/month for VPS

## Security Considerations

**Backend Security Checklist**:
- [ ] Rate limiting (prevent abuse)
- [ ] URL validation (only sora.chatgpt.com)
- [ ] HTTPS only
- [ ] API key authentication (optional)
- [ ] Timeout limits
- [ ] File size limits
- [ ] Error handling
- [ ] Logging (for debugging)

**Example Rate Limiting**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // limit each IP to 10 requests per windowMs
});

app.use('/api/download-sora', limiter);
```

## Recommended Setup

For this project, I recommend:

1. **Start with**: Vercel Serverless Function
   - Free tier sufficient for testing
   - Easy deployment (`vercel deploy`)
   - Automatic HTTPS
   - No server management

2. **Scale to**: Node.js on Railway/Render
   - When you exceed free tier
   - More control over caching
   - Better performance

3. **Production**: AWS Lambda + CloudFront
   - Enterprise scale
   - CDN caching
   - Pay per use

## Implementation Steps

1. **Create backend** (choose Option 1, 2, or 3)
2. **Deploy backend** to hosting platform
3. **Update frontend** to use backend API
4. **Test with real Sora URLs**
5. **Monitor usage** and costs
6. **Add rate limiting** if needed

## Privacy Trade-offs

**Current (Client-side only)**:
- ✅ Videos never sent to any server
- ✅ No infrastructure costs
- ✅ No maintenance
- ❌ Manual download required

**With Backend**:
- ✅ Automatic downloads
- ✅ Better UX
- ❌ Videos pass through your server
- ❌ Infrastructure costs
- ❌ Server maintenance
- ❌ Potential legal liability

## Legal Considerations

**Important**: 
- Sora videos may be copyrighted
- Downloading may violate Sora's Terms of Service
- Your backend could be held liable
- Consider adding Terms of Service
- Add disclaimer about usage rights

## Conclusion

**For Privacy**: Stick with current client-side approach + manual download

**For Convenience**: Add backend proxy (recommend Vercel Serverless)

**For Scale**: Use cloud infrastructure with CDN

The choice depends on your priorities: privacy vs convenience vs cost.

## Need Help?

If you decide to implement backend proxy, I can help with:
1. Setting up the backend code
2. Deploying to Vercel/Railway/Render
3. Integrating with the frontend
4. Security best practices

Just let me know which option you prefer!
