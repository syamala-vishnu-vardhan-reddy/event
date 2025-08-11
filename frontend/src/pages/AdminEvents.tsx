import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../lib/api";
import { Link } from "react-router-dom";

export default function AdminEvents() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(["events"], async () => {
    const res = await API.get("/events");
    return res.data;
  });

  const deleteM = useMutation(
    async (id: string) => {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      await API.delete("/events/" + id, {
        headers: { Authorization: "Bearer " + token },
      });
      return id;
    },
    {
      onMutate: async (id: string) => {
        await qc.cancelQueries(["events"]);
        const prev = qc.getQueryData<any[]>(["events"]);
        qc.setQueryData(["events"], (old: any) =>
          old?.filter((e: any) => e._id !== id)
        );
        return { prev };
      },
      onError: (err, vars, ctx) => {
        if (ctx?.prev) qc.setQueryData(["events"], ctx.prev);
        alert("Delete failed");
      },
      onSettled: () => qc.invalidateQueries(["events"]),
    }
  );

  if (isLoading) return <div>Loading...</div>;

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteM.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Admin - Events</h2>
        <Link
          to="/admin/events/create"
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          Create Event
        </Link>
      </div>
      <div className="space-y-3">
        {data?.map((e: any) => (
          <div
            key={e._id}
            className="bg-white p-4 rounded shadow flex justify-between"
          >
            <div>
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm">{new Date(e.date).toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to={"/admin/events/" + e._id + "/bookings"}
                className="text-indigo-600"
              >
                View Bookings
              </Link>
              <Link
                to={"/admin/events/" + e._id + "/edit"}
                className="text-yellow-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(e._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
