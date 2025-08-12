import { z } from "zod"

export const contactAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
})

export const deliveryWindowSchema = z.object({
  deliveryDate: z.date({ required_error: "Please select a delivery date" }),
  deliveryTimeSlot: z.string().min(1, "Please select a delivery time slot"),
  returnDate: z.date({ required_error: "Please select a return date" }),
  returnTimeSlot: z.string().min(1, "Please select a return time slot"),
})

export type ContactAddressForm = z.infer<typeof contactAddressSchema>
export type DeliveryWindowForm = z.infer<typeof deliveryWindowSchema>
