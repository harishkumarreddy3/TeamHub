import { z } from "zod";

// Zod schema for validation
export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "guest"]),
});

export const createUserSchema = userSchema.omit({ id: true });

// TypeScript types inferred from Zod
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

