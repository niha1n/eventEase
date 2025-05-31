import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session){
        return redirect('/')
    }

    const user=session.user
  return (
    <div>
        <h1>Welcome to dashboard</h1>
    <ul>
        <li>Name: {user.name}</li>
        <li>Email: {user.email}</li>
    </ul>
    </div>
  )
}
