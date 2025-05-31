import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import NavbarClient from './common/navbarClient'

export default async function Navbar() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user


    return (
        <NavbarClient user={user} />
      )
}
