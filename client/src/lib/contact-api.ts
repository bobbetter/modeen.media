import { apiRequest } from "./queryClient";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

// Extended schema with more validation for frontend
export const contactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export async function submitContactForm(data: ContactFormData) {
  const response = await apiRequest("POST", "/api/contact", data);
  return response.json();
}
