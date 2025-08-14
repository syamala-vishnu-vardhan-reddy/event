import React from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../lib/api";

export default function MyBookings() {
  const { data, isLoading, error } = useQuery(["bookings", "me"], async () => {
    // Check both admin and regular token storage
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("token");
    const res = await API.get("/bookings/me", {
      headers: { Authorization: "Bearer " + token },
    });
    return res.data;
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading your bookings...</div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600">
        Error loading bookings. Please try again.
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl mb-4">My Bookings</h2>
        <p className="text-gray-600">You haven't made any bookings yet.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((booking: any) => (
          <div
            key={booking._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {booking.event.image && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={booking.event.image}
                  alt={booking.event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const nextElement =
                      target.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No Image</span>
                </div>
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {booking.event.title}
              </h3>
              <div className="text-gray-600 text-sm mb-3" dangerouslySetInnerHTML={{ __html: booking.event.description }} />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {new Date(booking.event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">
                    {new Date(booking.event.date).toLocaleTimeString()}
                  </span>
                </div>
                {booking.event.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">
                      {booking.event.location}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Seats Booked:</span>
                  <span className="font-medium text-blue-600">
                    {booking.seats}
                  </span>
                </div>
                {booking.event.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Price:</span>
                    <span className="font-medium text-green-600">
                      ${(booking.event.price * booking.seats).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Booked On:</span>
                  <span className="font-medium">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
