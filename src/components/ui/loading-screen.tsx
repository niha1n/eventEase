"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingScreenProps {
    className?: string;
    fullScreen?: boolean;
    message?: string;
}

export function LoadingScreen({
    className,
    fullScreen = false,
    message = "Loading..."
}: LoadingScreenProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
                fullScreen ? "fixed inset-0 z-50" : "absolute inset-0",
                className
            )}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                    }}
                >
                    <motion.div
                        className="h-16 w-16 rounded-xl bg-primary"
                        animate={{
                            boxShadow: [
                                "0 0 0 0 rgba(var(--primary) / 0.4)",
                                "0 0 0 10px rgba(var(--primary) / 0)",
                            ],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold text-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            E
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Loading Bar */}
                <div className="relative h-1 w-48 overflow-hidden rounded-full bg-muted">
                    <motion.div
                        className="absolute inset-y-0 left-0 w-1/2 bg-primary"
                        animate={{
                            x: ["0%", "100%"],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                {/* Loading Message */}
                <motion.p
                    className="mt-4 text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {message}
                </motion.p>
            </div>
        </div>
    );
}

// A smaller version for inline loading states
export function LoadingIndicator({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <motion.div
                className="h-4 w-4 rounded-full bg-primary"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="h-4 w-4 rounded-full bg-primary"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                }}
            />
            <motion.div
                className="h-4 w-4 rounded-full bg-primary"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                }}
            />
        </div>
    );
} 