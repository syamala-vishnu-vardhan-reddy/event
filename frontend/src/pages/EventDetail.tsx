import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API from '../lib/api'

export default function EventDetail(){
  const { id } = useParams()
  const qc = useQueryClient()
  const [seatsToBook, setSeatsToBook] = useState(1)
  
  const { data, isLoading } = useQuery(['event', id], async ()=>{
    const res = await API.get('/events/'+id)
    return res.data
  })

  const bookM = useMutation(async (vars:{seats:number})=>{
    const token = localStorage.getItem('token')
    const res = await API.post('/bookings', { eventId: id, seats: vars.seats }, { headers: { Authorization: 'Bearer '+token } })
    return res.data
  }, { onSuccess: ()=> qc.invalidateQueries(['bookings','me']) })

  if(isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading event details...</div>
    </div>
  )
  
  const ev = data
  if (!ev) return <div>Event not found</div>

  const handleBooking = () => {
    if (seatsToBook > ev.availableSeats) {
      alert(`Only ${ev.availableSeats} seats available`);
      return;
    }
    bookM.mutate({ seats: seatsToBook });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {ev.image && (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img 
              src={ev.image} 
              alt={ev.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-full items-center justify-center bg-gray-300">
              <span className="text-gray-500">No Image</span>
            </div>
          </div>
        )}
        
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{ev.title}</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-gray-600 mb-6 text-lg" dangerouslySetInnerHTML={{ __html: ev.description }} />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Date:</span>
                  <span className="font-medium">{new Date(ev.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Time:</span>
                  <span className="font-medium">{new Date(ev.date).toLocaleTimeString()}</span>
                </div>
                {ev.location && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Location:</span>
                    <span className="font-medium">{ev.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Price:</span>
                  <span className="font-medium text-green-600">
                    {ev.price > 0 ? `$${ev.price.toFixed(2)}` : 'Free'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Book Your Seats</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats: <span className="text-blue-600 font-bold">{ev.availableSeats}</span>
                  </label>
                  <div className="text-sm text-gray-500 mb-4">
                    Total Capacity: {ev.capacity} | Booked: {ev.bookedSeats}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={ev.availableSeats}
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {ev.price > 0 && (
                  <div className="text-lg font-semibold text-green-600">
                    Total: ${(ev.price * seatsToBook).toFixed(2)}
                  </div>
                )}
                
                <button 
                  onClick={handleBooking}
                  disabled={bookM.isLoading || ev.availableSeats === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    bookM.isLoading || ev.availableSeats === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {bookM.isLoading ? 'Booking...' : ev.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                </button>
                
                {bookM.isError && (
                  <div className="text-red-600 text-sm">
                    {bookM.error?.response?.data?.message || 'Booking failed. Please try again.'}
                  </div>
                )}
                
                {bookM.isSuccess && (
                  <div className="text-green-600 text-sm">
                    Booking successful! Check your bookings page.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}