import { z } from "zod";

export const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 charecters long." })
    .max(50, { message: "Name must not exceed 50 charecters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(2)
    .max(50),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 charecters long." })
    .max(50, { message: "Password must not exceed 50 charecters." }),
});

export const signInFormSchema = formSchema.pick({
    email:true,
    password:true
});
  