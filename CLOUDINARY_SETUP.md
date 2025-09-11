# Cloudinary Setup Guide for ANGO Tournament Media

## Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email
4. Go to your Dashboard

## Step 2: Get Your Cloud Name
1. In your Cloudinary Dashboard, you'll see your **Cloud Name**
2. It looks like: `d1234567890` or `your-company-name`
3. Copy this value

## Step 3: Update media.json
1. Open `media.json`
2. Replace `YOUR_CLOUD_NAME_HERE` with your actual Cloud Name
3. Save the file

## Step 4: Upload Your Media to Cloudinary

### Option A: Using Cloudinary Dashboard (Easiest)
1. Go to your Cloudinary Dashboard
2. Click "Media Library"
3. Create folders for each tournament:
   - `tournaments/spring-2025/photos/`
   - `tournaments/spring-2025/videos/`
   - `tournaments/spring-2025/thumbnails/`
4. Upload your photos and videos to the appropriate folders
5. For thumbnails, upload one representative image per tournament

### Option B: Using Cloudinary Upload Widget (Advanced)
Add this to your website for easy uploading:

```html
<!-- Add this to your media.html page -->
<script src="https://upload-widget.cloudinary.com/global/all.js"></script>
<button id="upload-widget" class="cloudinary-button">Upload Media</button>

<script>
const uploadWidget = cloudinary.createUploadWidget({
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UPLOAD_PRESET'
}, (error, result) => {
  if (!error && result && result.event === "success") {
    console.log('Uploaded:', result.info.secure_url);
  }
});

document.getElementById('upload-widget').addEventListener('click', () => {
  uploadWidget.open();
});
</script>
```

## Step 5: Test Your Integration
1. Open your website
2. Go to the Media page
3. Check if your uploaded media appears
4. If not, check the browser console for errors

## Folder Structure in Cloudinary
```
tournaments/
├── spring-2025/
│   ├── photos/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   └── ...
│   ├── videos/
│   │   ├── video1.mp4
│   │   ├── video2.mp4
│   │   └── ...
│   └── thumbnails/
│       └── spring-2025-thumb.jpg
├── winter-2024/
│   ├── photos/
│   ├── videos/
│   └── thumbnails/
└── ...
```

## Troubleshooting

### If media doesn't load:
1. Check that your Cloud Name is correct in `media.json`
2. Verify your media is uploaded to the correct folders
3. Check browser console for CORS errors
4. Make sure your Cloudinary account is active

### If you get CORS errors:
1. Go to Cloudinary Dashboard → Settings → Security
2. Add your domain to "Allowed referrers"
3. Or set it to allow all referrers for testing

### If API calls fail:
1. Check that your Cloud Name is correct
2. Verify the folder names match exactly
3. Make sure you have media in those folders

## Free Tier Limits
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **API calls**: 1,000/month

This should be plenty for a tournament website!

## Need Help?
- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com
