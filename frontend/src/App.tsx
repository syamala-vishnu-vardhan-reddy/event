import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import MyBookings from './pages/MyBookings'
import AdminEvents from './pages/AdminEvents'
import AdminBookings from './pages/AdminBookings'
import AdminUsers from './pages/AdminUsers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminCreateEvent from './pages/AdminCreateEvent'
import AdminEditEvent from './pages/AdminEditEvent'
import { useAuth } from './lib/useAuth'

function NotAdmin() {
  return <div className="text-center text-red-600 mt-10 text-lg font-bold">You must be an admin to access this page.</div>;
}

export default function App(){
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to='/events' />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/events" element={<Events/>} />
            <Route path="/events/:id" element={<EventDetail/>} />
            <Route path="/my-bookings" element={ user ? <MyBookings/> : <Navigate to='/login' /> } />
            <Route path="/admin/events" element={ user?.role==='admin' ? <AdminEvents/> : <NotAdmin /> } />
            <Route path="/admin/events/create" element={ user?.role==='admin' ? <AdminCreateEvent/> : <NotAdmin /> } />
            <Route path="/admin/events/:id/edit" element={ user?.role==='admin' ? <AdminEditEvent/> : <NotAdmin /> } />
            <Route path="/admin/events/:id/bookings" element={ user?.role==='admin' ? <AdminBookings/> : <NotAdmin /> } />
            <Route path="/admin/users" element={ user?.role==='admin' ? <AdminUsers/> : <NotAdmin /> } />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}