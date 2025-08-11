import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../lib/api";

export default function AdminBookings() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(["eventBookings", id], async () => {
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("token");
    const res = await API.get("/events/" + id + "/bookings", {
      headers: { Authorization: "Bearer " + token },
    });
    return res.data;
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl mb-4">Bookings for Event</h2>
      <div className="space-y-3">
        {data?.map((b: any) => (
          <div key={b._id} className="bg-white p-4 rounded shadow">
            <p>
              User: {b.user.name} ({b.user.email})
            </p>
            <p>Seats: {b.seats}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
