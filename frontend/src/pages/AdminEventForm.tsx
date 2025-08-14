import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API, { createEventWithImage, updateEventWithImage } from "../lib/api";
import { eventSchema, EventInput } from "../validation/eventSchema";

const CATEGORIES = [
  "Conference",
  "Workshop",
  "Concert",
  "Meetup",
  "Webinar",
  "Seminar",
  "Festival",
  "Other",
];

export default function AdminEventForm({ edit = false }: { edit?: boolean }) {
  const { id } = useParams();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({ resolver: zodResolver(eventSchema) });

  const watchAll = watch();

  const { data } = useQuery(
    ["event", id],
    async () => {
      if (!edit || !id) return null;
      const res = await API.get("/events/" + id);
      return res.data;
    },
    { enabled: !!edit && !!id }
  );

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString().slice(0, 16),
        closingDate: new Date(data.closingDate).toISOString().slice(0, 16),
        location: data.location || "",
        capacity: data.capacity,
        price: data.price || 0,
        image: data.image || "",
        category: data.category || "",
        tags: data.tags ? data.tags.join(", ") : "",
        speaker: data.speaker || "",
        website: data.website || "",
        maxTicketsPerUser: data.maxTicketsPerUser || "",
      });
      setImagePreview(data.image || null);
    }
  }, [data, reset]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a temporary blob URL for preview (this will be cleaned up)
      const blobUrl = URL.createObjectURL(file);
      setImagePreview(blobUrl);
      setValue("image", ""); // Clear URL field if uploading
      
      // Clean up the blob URL when component unmounts or when file changes
      return () => URL.revokeObjectURL(blobUrl);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload image to Cloudinary
  async function uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await API.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }

  const createM = useMutation(
    async (vals: EventInput) => {
      // Prepare event data (exclude image field since we handle it separately)
      const { image, ...eventDataWithoutImage } = vals;
      const eventData = {
        ...eventDataWithoutImage,
        tags: vals.tags ? vals.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        description: vals.description,
      };
      
      // Use the new API function that handles image uploads
      const res = await createEventWithImage(eventData, imageFile || undefined);
      return res;
    },
    { onSuccess: () => qc.invalidateQueries(["events"]) }
  );

  const updateM = useMutation(
    async (vals: EventInput) => {
      // Prepare event data (exclude image field since we handle it separately)
      const { image, ...eventDataWithoutImage } = vals;
      const eventData = {
        ...eventDataWithoutImage,
        tags: vals.tags ? vals.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        description: vals.description,
      };
      
      // Use the new API function that handles image uploads
      const res = await updateEventWithImage(id!, eventData, imageFile || undefined);
      return res;
    },
    { onSuccess: () => qc.invalidateQueries(["events"]) }
  );

  const onSubmit = async (vals: EventInput) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      if (showPreview) {
        setShowPreview(false);
        return;
      }
      if (edit) {
        await updateM.mutateAsync(vals);
        setSuccessMsg("Event updated successfully!");
      } else {
        await createM.mutateAsync(vals);
        setSuccessMsg("Event created successfully!");
      }
      setTimeout(() => nav("/admin/events"), 1200);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Save failed");
    }
  };



  // Preview summary
  const renderPreview = () => (
    <div className="bg-gray-50 p-4 rounded border mb-4">
      <h3 className="text-lg font-bold mb-2">Event Preview</h3>
      <div className="mb-2"><b>Title:</b> {watchAll.title}</div>
      <div className="mb-2"><b>Category:</b> {watchAll.category}</div>
      <div className="mb-2"><b>Tags:</b> {watchAll.tags}</div>
      <div className="mb-2"><b>Speaker:</b> {watchAll.speaker}</div>
      <div className="mb-2"><b>Website:</b> {watchAll.website}</div>
      <div className="mb-2"><b>Date:</b> {watchAll.date}</div>
      <div className="mb-2"><b>Closing Date:</b> {watchAll.closingDate}</div>
      <div className="mb-2"><b>Location:</b> {watchAll.location}</div>
      <div className="mb-2"><b>Capacity:</b> {watchAll.capacity}</div>
      <div className="mb-2"><b>Price:</b> {watchAll.price}</div>
      <div className="mb-2"><b>Max Tickets Per User:</b> {watchAll.maxTicketsPerUser}</div>
      <div className="mb-2"><b>Description:</b> {watchAll.description}</div>
      {imagePreview && <img src={imagePreview} alt="Preview" className="h-24 mt-2 rounded border" />}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">{edit ? "Edit Event" : "Create Event"}</h2>
      {successMsg && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{successMsg}</div>}
      {errorMsg && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{errorMsg}</div>}
      {showPreview && renderPreview()}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            {...register("title")}
            placeholder="Event title"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select {...register("category")}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            <option value="">Select category</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input
            {...register("tags")}
            placeholder="e.g. tech, networking, free"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Speaker/Host</label>
          <input
            {...register("speaker")}
            placeholder="Speaker or host name"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Website (optional)</label>
          <input
            {...register("website")}
            placeholder="https://example.com"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.website && (
            <p className="text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Date & Time</label>
          <input
            {...register("date")}
            type="datetime-local"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Registration Closing Date & Time</label>
          <input
            {...register("closingDate")}
            type="datetime-local"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.closingDate && (
            <p className="text-sm text-red-600">{errors.closingDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            {...register("location")}
            placeholder="Event location"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Capacity</label>
          <input
            {...register("capacity")}
            placeholder="Number of seats"
            type="number"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.capacity && (
            <p className="text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (optional)</label>
          <input
            {...register("price")}
            placeholder="Ticket price"
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Tickets Per User (optional)</label>
          <input
            {...register("maxTicketsPerUser")}
            placeholder="e.g. 5"
            type="number"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register("description")}
            placeholder="Event description (plain text only)"
            className="w-full min-h-[80px] p-2 border rounded resize-y"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Image</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="flex-1"
            />
            {imageFile && (
              <button 
                type="button" 
                onClick={handleRemoveImage} 
                className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mb-2">
              <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded border" />
              <p className="text-xs text-gray-500 mt-1">
                {imageFile ? 'New image to upload' : 'Current image'}
              </p>
            </div>
          )}
          {!imageFile && !imagePreview && (
            <p className="text-sm text-gray-500">No image selected</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded border"
            onClick={() => setShowPreview(!showPreview)}
            disabled={isSubmitting}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? (edit ? "Updating..." : "Creating...") : (edit ? "Update" : "Create")}
          </button>
          <button
            type="button"
            onClick={() => nav("/admin/events")}
            className="px-4 py-2 border rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
