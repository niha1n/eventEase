import { z } from "zod";
import { Role } from "@prisma/client";

const baseUserSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(2)
    .max(50),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(50, { message: "Password must not exceed 50 characters." })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});

export const signUpFormSchema = z.object({
  email: baseUserSchema.shape.email,
  password: baseUserSchema.shape.password,
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name must not exceed 50 characters." }),
  role: z.nativeEnum(Role),
});

export const signInFormSchema = baseUserSchema.pick({
  email: true,
  password: true,
});

// For admin/staff user creation
export const adminSignUpFormSchema = signUpFormSchema.extend({
  role: z
    .nativeEnum(Role)
    .refine(
      (role) => role === Role.ADMIN || role === Role.STAFF,
      "Only ADMIN or STAFF roles are allowed for admin signup"
    ),
});
