# ImageKit Integration Setup Guide

## Overview
The Legal Guardian backend now supports image uploads in addition to PDF uploads. Images are stored on ImageKit's cloud storage using the Multer buffer.

## Required Steps

### 1. Install ImageKit Package
```bash
npm install imagekitio
```

### 2. Get ImageKit Credentials
1. Sign up at https://imagekit.io (free tier available)
2. Go to Developer Settings → API Keys
3. Copy:
   - Public Key
   - Private Key
   - URL Endpoint (usually looks like: `https://ik.imagekit.io/xxxxx`)

### 3. Add Environment Variables to `.env`
```
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

## How It Works

### Upload Flow
- **PDF Files**: Uploaded via Multer → Extracted and cleaned → Returned as base64 for analysis
- **Image Files** (JPG, PNG, GIF, WebP, BMP): Uploaded via Multer → Sent to ImageKit → URL stored in database

### New Files Created
1. **`src/config/imagekit.js`** - ImageKit initialization
2. **`src/services/imagekit.service.js`** - Image upload/delete functions
3. **Updated files:**
   - `src/config/env.js` - Added ImageKit config variables
   - `src/models/document.model.js` - Added imageUrl, imageKitFileId, fileType fields
   - `src/middlewares/upload.middleware.js` - Now accepts images alongside PDFs
   - `src/controllers/upload.controller.js` - Updated to handle image uploads

### API Response Format

#### PDF Upload Response
```json
{
  "success": true,
  "filename": "contract.pdf",
  "charCount": 5000,
  "contractText": "...",
  "pdfBuffer": "base64_encoded_pdf",
  "fileType": "pdf"
}
```

#### Image Upload Response
```json
{
  "success": true,
  "filename": "contract_scan.jpg",
  "imageUrl": "https://ik.imagekit.io/...",
  "imageKitFileId": "xxx",
  "imageKitThumbnailUrl": "https://ik.imagekit.io/.../tr:h-200,w-200/",
  "fileType": "image"
}
```

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, BMP (max 10MB)
- **Documents**: PDF (max 10MB)

## Frontend Updates Needed
Update the frontend upload component to:
1. Accept both PDF and image files
2. Handle the `fileType` field in responses
3. Display images using the `imageUrl` for preview
4. Store the `imageKitFileId` for potential future deletion

## ImageKit Service Functions

### Upload Image
```javascript
const { uploadImage } = require("../services/imagekit.service");

const result = await uploadImage(buffer, filename, "folder_name");
// Returns: { success: true, imageUrl, fileId, thumbnailUrl }
```

### Delete Image
```javascript
const { deleteImage } = require("../services/imagekit.service");

await deleteImage(fileId);
```
