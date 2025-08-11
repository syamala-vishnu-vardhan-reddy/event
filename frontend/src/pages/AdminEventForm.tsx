import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import API from '../lib/api'
import { eventSchema, EventInput } from '../validation/eventSchema'

export default function AdminEventForm({ edit=false }: { edit?: boolean }){
  const { id } = useParams()
  const qc = useQueryClient()
  const nav = useNavigate()

  const { register, handleSubmit, reset, formState:{ errors } } = useForm<EventInput>({ resolver: zodResolver(eventSchema) })

  const { data } = useQuery(['event', id], async ()=>{
    if(!edit || !id) return null
    const res = await API.get('/events/'+id)
    return res.data
  }, { enabled: !!edit && !!id })

  useEffect(()=>{
    if(data) {
      reset({ 
        title: data.title, 
        description: data.description, 
        date: new Date(data.date).toISOString().slice(0,16), 
        closingDate: new Date(data.closingDate).toISOString().slice(0,16),
        location: data.location||'', 
        capacity: data.capacity, 
        price: data.price||0,
        image: data.image || ''
      })
    }
  }, [data, reset])

  const createM = useMutation(async (vals:EventInput)=>{
    const token = localStorage.getItem('token')
    const res = await API.post('/events', vals, { headers: { Authorization: 'Bearer '+token } })
    return res.data
  }, { onSuccess: ()=> qc.invalidateQueries(['events']) })

  const updateM = useMutation(async (vals:EventInput)=>{
    const token = localStorage.getItem('token')
    const res = await API.put('/events/'+id, vals, { headers: { Authorization: 'Bearer '+token } })
    return res.data
  }, { onSuccess: ()=> qc.invalidateQueries(['events']) })

  const onSubmit = async (vals:EventInput) => {
    try{
      if(edit) {
        await updateM.mutateAsync(vals)
      } else {
        await createM.mutateAsync(vals)
      }
      nav('/admin/events')
    }catch(err:any){
      alert(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">{edit? 'Edit Event' : 'Create Event'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input {...register('title')} placeholder="Title" className="w-full p-2 border rounded" />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <textarea {...register('description')} placeholder="Description" className="w-full p-2 border rounded" />
          {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time</label>
          <input {...register('date')} type="datetime-local" className="w-full p-2 border rounded" />
          {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Closing Date & Time</label>
          <input {...register('closingDate')} type="datetime-local" className="w-full p-2 border rounded" />
          {errors.closingDate && <p className="text-sm text-red-600">{errors.closingDate.message}</p>}
        </div>
        <div>
          <input {...register('location')} placeholder="Location" className="w-full p-2 border rounded" />
        </div>
        <div>
          <input {...register('capacity')} placeholder="Capacity" type="number" className="w-full p-2 border rounded" />
          {errors.capacity && <p className="text-sm text-red-600">{errors.capacity.message}</p>}
        </div>
        <div>
          <input {...register('price')} placeholder="Price" type="number" step="0.01" className="w-full p-2 border rounded" />
        </div>
        <div>
          <input {...register('image')} placeholder="Image URL (optional)" className="w-full p-2 border rounded" />
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">{edit? 'Update' : 'Create'}</button>
          <button type="button" onClick={()=>nav('/admin/events')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}