import axios from "axios";

const API = axios.create({
  baseURL: "https://event-nmfv.onrender.com",
  withCredentials: true, // optional if backend needs cookies
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config: any) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Image upload function
export const uploadImage = async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await API.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return {
    imageUrl: response.data.imageUrl,
    publicId: response.data.publicId,
  };
};

// Create event with image upload
export const createEventWithImage = async (eventData: any, imageFile?: File): Promise<any> => {
  const formData = new FormData();
  
  // Add all event data
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== undefined && eventData[key] !== null) {
      formData.append(key, eventData[key]);
    }
  });
  
  // Add image if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  // Get auth token
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  
  const response = await API.post('/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.data;
};

// Update event with image upload
export const updateEventWithImage = async (eventId: string, eventData: any, imageFile?: File): Promise<any> => {
  const formData = new FormData();
  
  // Add all event data
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== undefined && eventData[key] !== null) {
      formData.append(key, eventData[key]);
    }
  });
  
  // Add image if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  // Get auth token
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  
  const response = await API.put(`/events/${eventId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.data;
};

export default API;
