require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

console.log('Testing Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Test if cloudinary is configured
if (cloudinary.config().cloud_name) {
  console.log('✅ Cloudinary is configured');
} else {
  console.log('❌ Cloudinary is not configured');
}
