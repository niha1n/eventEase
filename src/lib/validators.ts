import { z } from "zod";

// Custom Field Schema
export const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "number", "email", "select", "checkbox", "date"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

// Event Schema
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: z.date().optional(),
  customFields: z.array(customFieldSchema).optional(),
  isPublished: z.boolean().default(false),
});

// RSVP Schema
export const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  responses: z.record(z.any()).optional(),
  eventId: z.string(),
});

// Create dynamic RSVP validator based on event custom fields
export const createDynamicRSVPValidator = (customFields: any[]) => {
  const dynamicFields: Record<string, any> = {};
  
  customFields?.forEach((field) => {
    let fieldValidator;
    
    switch (field.type) {
      case "email":
        fieldValidator = z.string().email("Please enter a valid email");
        break;
      case "number":
        fieldValidator = z.number();
        break;
      case "checkbox":
        fieldValidator = z.boolean();
        break;
      case "date":
        fieldValidator = z.date();
        break;
      case "select":
        fieldValidator = z.enum(field.options as [string, ...string[]]);
        break;
      default:
        fieldValidator = z.string();
    }
    
    if (field.required) {
      dynamicFields[field.id] = fieldValidator;
    } else {
      dynamicFields[field.id] = fieldValidator.optional();
    }
  });
  
  return z.object({
    ...rsvpSchema.shape,
    responses: z.object(dynamicFields),
  });
};