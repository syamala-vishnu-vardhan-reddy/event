# Cloudinary Image Storage Setup

This guide will help you set up Cloudinary for image storage in your event management app.

## 🚀 Quick Setup

### 1. Create Cloudinary Account
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for a free account
- Verify your email

### 2. Get Your Credentials
After signing in, go to your Dashboard and copy:
- **Cloud Name** (found in the top right)
- **API Key** (under "API Environment variables")
- **API Secret** (under "API Environment variables")

### 3. Install Dependencies
```bash
cd backend
npm install cloudinary multer cd backend && npm install cloudinary multer multer-storage-cloudinary
```

### 4. Environment Variables
Add these to your `backend/.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 5. Restart Your Backend
```bash
npm run dev
```

## 📁 What's Been Added

### Backend
- **`/backend/config/cloudinary.js`** - Better Cloudinary configuration with multer-storage-cloudinary
- **`/backend/routes/uploadRoutes.js`** - Image upload endpoints
- **`/backend/routes/eventRoutes.js`** - Updated to handle image uploads
- **`/backend/controllers/eventController.js`** - Updated to process uploaded images
- **`/backend/server.js`** - Updated to include upload routes
- **`/backend/env.template`** - Environment variables template

### Frontend
- **`/frontend/src/lib/api.ts`** - Added `uploadImage`, `createEventWithImage`, and `updateEventWithImage` functions
- **`/frontend/src/components/ImageUpload.tsx`** - Reusable image upload component

## 🔧 API Endpoints

### Upload Image
```
POST /upload/image
Content-Type: multipart/form-data

Body: { image: File }
Response: { imageUrl: string, publicId: string }
```

### Create Event with Image
```
POST /events
Content-Type: multipart/form-data

Body: { title, description, date, location, capacity, price, image: File }
Response: Event object with image URL
```

### Update Event with Image
```
PUT /events/:id
Content-Type: multipart/form-data

Body: { title, description, date, location, capacity, price, image: File }
Response: Updated event object
```

### Delete Image
```
DELETE /upload/image/:publicId
```

## 💡 Usage in Components

```tsx
import ImageUpload from '../components/ImageUpload';

function EventForm() {
  const handleImageUpload = (imageUrl: string, publicId: string) => {
    // Store imageUrl in your form state
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  return (
    <ImageUpload 
      onImageUpload={handleImageUpload}
      currentImage={existingImage}
    />
  );
}
```

## 🎯 Features

- **Automatic Optimization**: Images are resized to 800x600 and optimized
- **File Validation**: Only accepts image files under 5MB
- **Progress Bar**: Visual feedback during upload
- **Error Handling**: Clear error messages for failed uploads
- **Image Preview**: Shows current image if editing
- **Cloudinary Folder**: All images are organized in an 'events' folder

## 🔒 Security

- File type validation (images only)
- File size limits (5MB max)
- Secure HTTPS URLs from Cloudinary
- No local file storage (memory-based processing)

## 📊 Free Tier Limits

- **25,000 image transformations/month**
- **2GB storage/month**
- **Perfect for small to medium event apps**

## 🚨 Troubleshooting

### "Cannot find module 'axios'"
- Make sure you're in the frontend directory
- Run `npm install` to ensure all dependencies are installed

### "Upload failed"
- Check your Cloudinary credentials in `.env`
- Verify your backend is running
- Check the backend console for detailed error messages

### Images not displaying
- Ensure the `imageUrl` is being stored in your database
- Check that the URL is accessible (try opening in browser)

## 🎉 You're All Set!

Your event app now has professional-grade image hosting with:
- Fast CDN delivery
- Automatic optimization
- Reliable storage
- Professional URLs

Images will persist even if you redeploy your backend/frontend!
