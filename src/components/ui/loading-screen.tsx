"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingScreenProps {
    fullScreen?: boolean;
    message?: string;
    className?: string;
}

export function LoadingScreen({ fullScreen = false, message, className }: LoadingScreenProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const dotVariants = {
        hidden: { y: 0 },
        visible: {
            y: [-4, 0, -4],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const content = (
        <motion.div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "w-full h-full",
                className
            )}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-3 h-3 rounded-full bg-primary"
                        variants={dotVariants}
                        style={{ animationDelay: `${index * 0.2}s` }}
                    />
                ))}
            </div>
            {message && (
                <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {message}
                </motion.p>
            )}
        </motion.div>
    );

    return fullScreen ? (
        <div className="fixed inset-0 z-50">
            {content}
        </div>
    ) : content;
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