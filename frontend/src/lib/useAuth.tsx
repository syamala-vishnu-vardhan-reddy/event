import { useState, useEffect, useCallback } from 'react'

type User = { id:string, name:string, email:string, role:string } | null

export function useAuth(){
  const [user, setUser] = useState<User>(()=>{
    try{
      const s = localStorage.getItem('user')
      const t = localStorage.getItem('token')
      // Only restore user if both user and token exist
      const restoredUser = s && t ? JSON.parse(s) : null
      console.log('Restored user from localStorage:', restoredUser)
      return restoredUser
    }catch(e){ 
      console.error('Error parsing user from localStorage:', e)
      return null 
    }
  })

  useEffect(()=>{
    console.log('User state changed:', user)
    if(user) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', localStorage.getItem('token') || '') // Ensure token is preserved
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }, [user])

  const set = useCallback((u:User) => {
    console.log('Setting user in useAuth:', u)
    setUser(u)
  }, [])
  
  const logout = useCallback(() => {
    console.log('Logging out user')
    setUser(null)
  }, [])
  
  return { user, setUser:set, logout }
}