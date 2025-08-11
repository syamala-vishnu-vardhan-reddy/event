import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../lib/api";

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery(["users"], async () => {
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("token");
    const res = await API.get("/users", {
      headers: { Authorization: "Bearer " + token },
    });
    return res.data;
  });

  const { data: userBookings } = useQuery(
    ["user-bookings", selectedUser?._id],
    async () => {
      if (!selectedUser) return null;
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const res = await API.get(`/users/${selectedUser._id}/bookings`, {
        headers: { Authorization: "Bearer " + token },
      });
      return res.data;
    },
    { enabled: !!selectedUser }
  );

  const deleteUserM = useMutation(
    async (userId: string) => {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      await API.delete(`/users/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      });
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["users"]);
        setSelectedUser(null);
      },
    }
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading users...</div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Manage Users</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">All Users</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users?.map((user: any) => (
                <div
                  key={user._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?._id === user._id
                      ? "bg-blue-100 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.role !== "admin" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete user ${user.name}?`)) {
                              deleteUserM.mutate(user._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedUser.role}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">User's Bookings</h4>
                {userBookings && userBookings.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.map((booking: any) => (
                      <div key={booking._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">
                              {booking.event.title}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                booking.event.date
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                booking.event.date
                              ).toLocaleTimeString()}
                            </p>
                            {booking.event.location && (
                              <p className="text-sm text-gray-500">
                                {booking.event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">
                              {booking.seats} seats
                            </p>
                            {booking.event.price > 0 && (
                              <p className="text-sm text-green-600">
                                $
                                {(booking.event.price * booking.seats).toFixed(
                                  2
                                )}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Booked:{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No bookings found for this user.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
              <p className="text-gray-500">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
