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
import { signUpFormSchema } from '@/lib/auth-schema'
import { authClient } from '@/lib/auth-client'
import { Role } from '@prisma/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Mail, Lock, User, UserCog } from 'lucide-react'
import { LoadingScreen } from '@/components/ui/loading-screen'

type SignUpFormData = z.infer<typeof signUpFormSchema>

export default function SignUp() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: Role.EVENT_OWNER,
        },
    })

    async function onSubmit(data: SignUpFormData) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const loadingToast = toast.loading("Creating your account...");

        try {
            console.log("Submitting sign-up with data:", {
                email: data.email,
                name: data.name,
                role: data.role,
                password: "[REDACTED]",
            });

            // First create the user account
            const { data: result, error } = await authClient.signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                callbackURL: '/sign-in'
            });

            if (error) {
                throw error;
            }

            // If we have a role specified and it's not the default EVENT_OWNER role,
            // update it using the admin endpoint
            if (data.role && result?.user?.id && data.role !== Role.EVENT_OWNER) {
                try {
                    const updateResponse = await fetch("/api/admin/users/update-role", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: result.user.id,
                            role: data.role,
                        }),
                    });

                    if (!updateResponse.ok) {
                        console.warn("Failed to set initial role, but account was created");
                        toast.warning("Account created, but role assignment failed. Please contact an administrator.");
                    }
                } catch (roleError) {
                    console.error("Error updating role:", roleError);
                    toast.warning("Account created, but role assignment failed. Please contact an administrator.");
                }
            }

            // Success!
            toast.dismiss(loadingToast);
            toast.success("Account created successfully!");
            form.reset();

            // Prefetch sign-in before redirect
            await router.prefetch('/sign-in');
            router.push('/sign-in');
        } catch (error: any) {
            console.error("Sign-up exception:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Failed to create account");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {isSubmitting && (
                <LoadingScreen
                    fullScreen
                    message="Creating your account..."
                />
            )}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl" />
                <div className="relative space-y-8 p-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                        <p className="text-muted-foreground">
                            Enter your information to get started
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="John Doe"
                                                    {...field}
                                                    className="h-12 pl-10"
                                                    autoComplete="name"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                                    {...field}
                                                    className="h-12 pl-10"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    autoCorrect="off"
                                                    disabled={isSubmitting}
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    placeholder="Create a password"
                                                    {...field}
                                                    className="h-12 pl-10"
                                                    autoComplete="new-password"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Type</FormLabel>
                                        <Select
                                            onValueChange={(value: Role) => {
                                                console.log("Role selected:", value)
                                                field.onChange(value)
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <div className="relative">
                                                    <UserCog className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <SelectTrigger className="h-12 pl-10">
                                                        <SelectValue placeholder="Select account type" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={Role.EVENT_OWNER}>
                                                    Event Organizer
                                                </SelectItem>
                                                <SelectItem value={Role.STAFF}>
                                                    Staff Member
                                                </SelectItem>
                                                <SelectItem value={Role.ADMIN}>
                                                    Administrator
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-full h-12 text-base"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    "Creating account..."
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="text-primary hover:underline font-medium"
                            onClick={(e) => {
                                if (isSubmitting) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}