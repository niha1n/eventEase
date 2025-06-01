"use client";

import { useState, useCallback } from "react";
import { useForm, type UseFormProps, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventSchema, customFieldSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/event-actions";
import { v4 as uuidv4 } from "uuid";
import { CustomField } from "@/types/event";
import { toast } from "sonner";

// Use the schema's inferred type
type EventFormData = z.infer<typeof eventSchema>;

type EventFormProps = {
    initialData?: EventFormData & {
        id?: string;
    };
};

export default function EventForm({ initialData }: EventFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?.id;

    const form = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            location: initialData?.location || "",
            startDate: initialData?.startDate || new Date(),
            endDate: initialData?.endDate,
            isPublished: initialData?.isPublished ?? false,
            customFields: initialData?.customFields || [],
        },
    });

    // Handler for custom fields
    const [customFields, setCustomFields] = useState<CustomField[]>(
        initialData?.customFields || []
    );

    const addCustomField = () => {
        const newField: CustomField = {
            id: uuidv4(),
            label: "",
            type: "text",
            required: false,
            options: [],
        };
        setCustomFields([...customFields, newField]);
    };

    const updateCustomField = (index: number, field: Partial<CustomField>) => {
        const updatedFields = [...customFields];
        updatedFields[index] = { ...updatedFields[index], ...field };
        setCustomFields(updatedFields);
    };

    const removeCustomField = (index: number) => {
        const updatedFields = [...customFields];
        updatedFields.splice(index, 1);
        setCustomFields(updatedFields);
    };

    const addFieldOption = (fieldIndex: number) => {
        const updatedFields = [...customFields];
        if (!updatedFields[fieldIndex].options) {
            updatedFields[fieldIndex].options = [];
        }
        updatedFields[fieldIndex].options?.push("");
        setCustomFields(updatedFields);
    };

    const updateFieldOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const updatedFields = [...customFields];
        if (updatedFields[fieldIndex].options) {
            updatedFields[fieldIndex].options![optionIndex] = value;
            setCustomFields(updatedFields);
        }
    };

    const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
        const updatedFields = [...customFields];
        if (updatedFields[fieldIndex].options) {
            updatedFields[fieldIndex].options!.splice(optionIndex, 1);
            setCustomFields(updatedFields);
        }
    };

    // Debounced submit handler
    const onSubmit = useCallback(async (data: EventFormData) => {
        // Prevent double submission
        if (isSubmitting) return;

        setIsSubmitting(true);
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.setAttribute('disabled', 'true');
        }

        try {
            // Validate custom fields
            const validatedCustomFields = customFields.map(field => {
                try {
                    return customFieldSchema.parse(field);
                } catch (error) {
                    throw new Error(`Invalid custom field: ${field.label || "Unnamed field"}`);
                }
            });

            // Prepare data with custom fields
            const formData = {
                ...data,
                customFields: validatedCustomFields,
            };

            // Submit the form
            const result = isEditing
                ? await updateEvent(initialData.id!, formData)
                : await createEvent(formData);

            if (result.success) {
                toast.success(isEditing ? "Event updated successfully" : "Event created successfully");
                // Use replace instead of push to prevent back navigation to the form
                router.replace("/dashboard/events");
                if (isEditing) {
                    router.refresh();
                }
            } else {
                toast.error(result.error as string || "Something went wrong");
                // Re-enable the submit button on error
                if (submitButton) {
                    submitButton.removeAttribute('disabled');
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
            // Re-enable the submit button on error
            if (submitButton) {
                submitButton.removeAttribute('disabled');
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, customFields, isEditing, initialData?.id, router]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                // Prevent double submission
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && isSubmitting) {
                        e.preventDefault();
                    }
                }}
            >
                {/* Basic Event Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Title*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter event title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter event description"
                                    className="min-h-32"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date*</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value || undefined}
                                            onSelect={field.onChange}
                                            initialFocus
                                            disabled={(date) =>
                                                date < form.getValues("startDate") ||
                                                date < new Date()
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Publish Event</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Make this event visible to the public and allow RSVPs
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                {/* Custom Fields Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Custom Fields</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomField}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                        </Button>
                    </div>

                    {customFields.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">
                            No custom fields added yet. Add fields to collect additional information from attendees.
                        </p>
                    )}

                    {customFields.map((field, index) => (
                        <Card key={field.id} className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustomField(index)}
                                className="absolute top-2 right-2 h-8 w-8 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    <Input
                                        placeholder="Field Label"
                                        value={field.label}
                                        onChange={(e) => updateCustomField(index, { label: e.target.value })}
                                        className="border-none p-0 text-lg font-semibold shadow-none"
                                    />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <FormLabel className="text-sm">Field Type</FormLabel>
                                        <Select
                                            value={field.type}
                                            onValueChange={(value) => updateCustomField(index, {
                                                type: value as "text" | "number" | "email" | "select" | "checkbox" | "date"
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select field type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="select">Dropdown</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`required-${field.id}`}
                                            checked={field.required}
                                            onCheckedChange={(checked) =>
                                                updateCustomField(index, { required: checked === true })
                                            }
                                        />
                                        <label
                                            htmlFor={`required-${field.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Required Field
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <FormLabel className="text-sm">Placeholder Text</FormLabel>
                                    <Input
                                        placeholder="Enter placeholder text"
                                        value={field.placeholder || ""}
                                        onChange={(e) => updateCustomField(index, { placeholder: e.target.value })}
                                    />
                                </div>

                                {field.type === "select" && (
                                    <div className="space-y-2">
                                        <FormLabel className="text-sm">Options</FormLabel>
                                        {field.options?.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center space-x-2">
                                                <Input
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) =>
                                                        updateFieldOption(index, optionIndex, e.target.value)
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFieldOption(index, optionIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addFieldOption(index)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Option
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="opacity-0">
                                    {isEditing ? "Update Event" : "Create Event"}
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                </span>
                            </>
                        ) : (
                            isEditing ? "Update Event" : "Create Event"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}