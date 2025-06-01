export interface CustomField {
    id: string;
    label: string;
    type: "text" | "number" | "email" | "select" | "checkbox" | "date";
    required: boolean;
    options?: string[]; // For select fields
    placeholder?: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    userId: string;
    isPublished: boolean;
    customFields?: CustomField[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface RSVP {
    id: string;
    name: string;
    email: string;
    phone?: string;
    responses?: Record<string, any>; // Responses to custom fields
    eventId: string;
    createdAt: Date;
    updatedAt: Date;
  }