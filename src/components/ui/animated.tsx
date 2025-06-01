"use client";

import { motion, HTMLMotionProps, useInView } from "framer-motion"
import { ReactNode, useRef } from "react"
import {
    fadeIn,
    slideUp,
    staggerContainer,
    scaleIn,
    buttonHover,
    iconRotate,
    formField,
    errorMessage
} from "@/lib/animations"

interface AnimatedProps extends HTMLMotionProps<"div"> {
    children: ReactNode
}

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode
}

export function AnimatedPage({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedCard({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedForm({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedFormField({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            variants={formField}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedErrorMessage({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={errorMessage}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
    return (
        <motion.button
            variants={buttonHover}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            {...props}
        >
            {children}
        </motion.button>
    )
}

export function AnimatedIcon({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            variants={iconRotate}
            initial="initial"
            whileHover="hover"
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedText({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            variants={slideUp}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedEventCard({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.1 // Stagger the animations
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedHeader({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedFilters({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedEmptyState({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedDashboardCard({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.1 // Stagger the animations
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedDashboardSection({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.2 + (index * 0.15) // Stagger sections with a longer delay
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedDashboardHeader({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedDashboardTabs({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedProfileCard({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.1
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedProfileHeader({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedAdminCard({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.1
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedAdminSection({ children, className, index = 0, ...props }: AnimatedProps & { index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.2 + (index * 0.15)
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedAdminHeader({ children, ...props }: AnimatedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedLandingHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedLandingSection({ children, className, index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedFeatureCard({ children, className, index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
} 