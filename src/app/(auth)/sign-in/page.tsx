'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signInFormSchema } from '@/lib/auth-schema'
import { authClient } from '@/lib/auth-client'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ArrowRight, Mail, Lock } from 'lucide-react'

export default function SignIn() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof signInFormSchema>>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof signInFormSchema>) {
        if (isLoading) return;

        const { email, password } = values
        setIsLoading(true)

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: '/dashboard'
            });

            if (error) {
                throw error;
            }

            form.reset()
            toast.success("Welcome back!")

            // Prefetch dashboard before redirect
            await router.prefetch('/dashboard')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {isLoading && (
                <LoadingScreen
                    fullScreen
                    message="Signing you in..."
                />
            )}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl" />
                <div className="relative space-y-8 p-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="name@example.com"
                                                    type="email"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    autoCorrect="off"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-12 pl-10"
                                                />
                                            </div>
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Enter your password"
                                                    type="password"
                                                    autoComplete="current-password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full h-12 text-base"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="text-primary hover:underline font-medium"
                            onClick={(e) => {
                                if (isLoading) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}
