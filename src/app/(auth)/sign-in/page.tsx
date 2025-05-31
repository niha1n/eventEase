'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from 'sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signInFormSchema } from '@/lib/auth-schema'



export default function SignIn() {
    const form = useForm<z.infer<typeof signInFormSchema>>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof signInFormSchema>) {
        console.log(values)
    }

    return (
        <Card className="max-w-md w-full mx-auto">
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                    Welcome back! Please sign in to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className='w-full' type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
               
                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        href="/sign-up"
                        className="text-primary hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
