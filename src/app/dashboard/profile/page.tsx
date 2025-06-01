'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { format } from "date-fns";
import { MailIcon, CalendarIcon, ShieldIcon, UserIcon, TentIcon, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AnimatedProfileCard, AnimatedProfileHeader } from "@/components/ui/animated";

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    createdAt: Date;
    _count: {
        events: number;
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/dashboard/profile');
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                const data = await response.json();
                setProfile(data.profile);
                setNewName(data.profile.name || "");
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleUpdateProfile = async () => {
        if (!profile) return;

        try {
            setIsLoading(true);
            const response = await fetch('/api/dashboard/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setProfile(data.profile);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
                <AnimatedProfileCard className="text-center space-y-4 max-w-md">
                    <div className="rounded-full bg-destructive/10 p-3 w-fit mx-auto">
                        <XIcon className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-semibold">Error Loading Profile</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </AnimatedProfileCard>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <AnimatedProfileHeader className="flex flex-col space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground text-lg">
                    Manage your account settings and preferences
                </p>
            </AnimatedProfileHeader>

            <div className="grid gap-8">
                {/* Profile Overview Card */}
                <AnimatedProfileCard index={0}>
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl">Account Overview</CardTitle>
                            <CardDescription className="text-base">
                                Your personal account information and statistics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Skeleton className="h-24" />
                                        <Skeleton className="h-24" />
                                        <Skeleton className="h-24" />
                                    </div>
                                </div>
                            ) : profile ? (
                                <div className="space-y-8">
                                    {/* Profile Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="rounded-full bg-primary/10 p-3">
                                                <UserIcon className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">
                                                    {profile.name || "Unnamed User"}
                                                </h3>
                                                <div className="flex items-center space-x-2 text-muted-foreground">
                                                    <MailIcon className="h-4 w-4" />
                                                    <span>{profile.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="hidden md:flex"
                                        >
                                            <PencilIcon className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </div>

                                    <Separator />

                                    {/* Profile Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <AnimatedProfileCard index={1} className="rounded-lg border bg-card p-6">
                                            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                                                <ShieldIcon className="h-4 w-4" />
                                                <span className="text-sm font-medium">Role</span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-base px-3 py-1",
                                                    profile.role === Role.ADMIN && "bg-red-500/10 text-red-500 border-red-500/20",
                                                    profile.role === Role.STAFF && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                                    profile.role === Role.EVENT_OWNER && "bg-green-500/10 text-green-500 border-green-500/20"
                                                )}
                                            >
                                                {profile.role.replace("_", " ")}
                                            </Badge>
                                        </AnimatedProfileCard>
                                        <AnimatedProfileCard index={2} className="rounded-lg border bg-card p-6">
                                            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span className="text-sm font-medium">Member Since</span>
                                            </div>
                                            <p className="text-lg font-medium">
                                                {format(new Date(profile.createdAt), "MMMM d, yyyy")}
                                            </p>
                                        </AnimatedProfileCard>
                                        <AnimatedProfileCard index={3} className="rounded-lg border bg-card p-6">
                                            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                                                <TentIcon className="h-4 w-4" />
                                                <span className="text-sm font-medium">Events Created</span>
                                            </div>
                                            <p className="text-2xl font-bold">{profile._count.events}</p>
                                        </AnimatedProfileCard>
                                    </div>

                                    {isEditing && (
                                        <AnimatedProfileCard index={4} className="rounded-lg border bg-muted/50 p-6">
                                            <h4 className="font-medium mb-4">Edit Profile Information</h4>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Display Name</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="name"
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            placeholder="Enter your name"
                                                            className="max-w-md"
                                                        />
                                                        <Button
                                                            onClick={handleUpdateProfile}
                                                            disabled={isLoading || newName === profile.name}
                                                            className="min-w-[100px]"
                                                        >
                                                            {isLoading ? (
                                                                "Saving..."
                                                            ) : (
                                                                <>
                                                                    <CheckIcon className="h-4 w-4 mr-2" />
                                                                    Save
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setNewName(profile.name || "");
                                                                setIsEditing(false);
                                                            }}
                                                        >
                                                            <XIcon className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimatedProfileCard>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </AnimatedProfileCard>

                {/* Additional Settings Card */}
                <AnimatedProfileCard index={5}>
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>
                                Manage your account preferences and security settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <p>More settings coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </AnimatedProfileCard>
            </div>
        </div>
    );
} 