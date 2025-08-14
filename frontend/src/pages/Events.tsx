import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import API from '../lib/api'

export default function Events(){
  const { data, isLoading } = useQuery(['events'], async ()=>{
    const res = await API.get('/events')
    return res.data
  })

  if(isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading events...</div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((event: any) => (
          <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {event.image && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
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
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.isRegistrationOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {event.isRegistrationOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <div className="text-gray-600 text-sm mb-3" dangerouslySetInnerHTML={{ __html: event.description?.slice(0,100) + '...' }} />
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">{new Date(event.date).toLocaleTimeString()}</span>
                </div>
                {event.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Available:</span>
                  <span className={`font-medium ${
                    event.availableSeats > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {event.availableSeats} seats
                  </span>
                </div>
                {event.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium text-green-600">${event.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <Link 
                to={'/events/'+event._id} 
                className={`inline-block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                  event.isRegistrationOpen && event.availableSeats > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {event.isRegistrationOpen && event.availableSeats > 0 ? 'Book Now' : 'View Details'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}