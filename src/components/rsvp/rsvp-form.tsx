"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, User, Mail, Phone, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitRSVP } from "@/lib/rsvp-actions";
import { rsvpSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { CustomField } from "@/types/event";

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
    eventId: string;
    customFields: CustomField[];
}

export default function RSVPForm({ eventId, customFields }: RSVPFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<RSVPFormData>({
        resolver: zodResolver(rsvpSchema),
        defaultValues: {
            eventId,
            responses: {},
        },
    });

    const onSubmit = async (data: RSVPFormData) => {
        try {
            setIsSubmitting(true);
            const result = await submitRSVP(data);
            if (result.success) {
                setIsSuccess(true);
                toast.success("RSVP submitted successfully!");
            } else {
                toast.error(result.error as string || "Failed to submit RSVP");
            }
        } catch (error) {
            console.error("RSVP submission error:", error);
            toast.error("Failed to submit RSVP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                >
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">Thank You for Your RSVP!</h3>
                <p className="text-muted-foreground">
                    We've received your registration and look forward to seeing you at the event.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <div className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="name"
                            {...register("name")}
                            className={cn(
                                "pl-9",
                                errors.name && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder="Enter your full name"
                        />
                    </div>
                    {errors.name && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                        >
                            {errors.name.message}
                        </motion.p>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            className={cn(
                                "pl-9",
                                errors.email && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder="Enter your email address"
                        />
                    </div>
                    {errors.email && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                        >
                            {errors.email.message}
                        </motion.p>
                    )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phone"
                            type="tel"
                            {...register("phone")}
                            className={cn(
                                "pl-9",
                                errors.phone && "border-destructive focus-visible:ring-destructive"
                            )}
                            placeholder="Enter your phone number"
                        />
                    </div>
                    {errors.phone && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                        >
                            {errors.phone.message}
                        </motion.p>
                    )}
                </div>

                {/* Custom Fields */}
                <AnimatePresence>
                    {customFields.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t"
                        >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>Additional Information</span>
                            </div>
                            {customFields.map((field: CustomField) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-2"
                                >
                                    <Label
                                        htmlFor={field.id}
                                        className="text-sm font-medium flex items-center gap-2"
                                    >
                                        {field.label}
                                        {field.required && (
                                            <span className="text-destructive">*</span>
                                        )}
                                    </Label>
                                    {field.type === "text" && (
                                        <Input
                                            id={field.id}
                                            {...register(`responses.${field.id}`)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    )}
                                    {field.type === "number" && (
                                        <Input
                                            id={field.id}
                                            type="number"
                                            {...register(`responses.${field.id}`)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    )}
                                    {field.type === "email" && (
                                        <Input
                                            id={field.id}
                                            type="email"
                                            {...register(`responses.${field.id}`)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    )}
                                    {field.type === "checkbox" && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={field.id}
                                                onCheckedChange={(checked) =>
                                                    setValue(`responses.${field.id}`, checked)
                                                }
                                                required={field.required}
                                            />
                                            <Label
                                                htmlFor={field.id}
                                                className="text-sm font-normal"
                                            >
                                                {field.placeholder}
                                            </Label>
                                        </div>
                                    )}
                                    {field.type === "select" && field.options && field.options.length > 0 && (
                                        <Select
                                            onValueChange={(value) =>
                                                setValue(`responses.${field.id}`, value)
                                            }
                                            required={field.required}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option: string) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {field.type === "date" && (
                                        <Input
                                            id={field.id}
                                            type="date"
                                            {...register(`responses.${field.id}`)}
                                            required={field.required}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Button
                type="submit"
                className="w-full relative"
                disabled={isSubmitting}
            >
                <AnimatePresence mode="wait">
                    {isSubmitting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="submit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Submit RSVP
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </motion.form>
    );
}