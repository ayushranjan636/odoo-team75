"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { contactAddressSchema, type ContactAddressForm } from "@/lib/checkout-schemas"

interface ContactAddressStepProps {
  onSubmit: (data: ContactAddressForm) => void
  initialData?: ContactAddressForm | null
}

export function ContactAddressStep({ onSubmit, initialData }: ContactAddressStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactAddressForm>({
    resolver: zodResolver(contactAddressSchema),
    defaultValues: initialData || undefined,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Contact & Address Information</h2>
        <p className="text-muted-foreground">Please provide your contact details and delivery address.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="Enter 10-digit mobile number"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter your email address"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Complete Address *</Label>
          <Textarea
            id="address"
            {...register("address")}
            placeholder="Enter your complete address including building, street, area"
            rows={3}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="Enter your city"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              {...register("pincode")}
              placeholder="Enter 6-digit pincode"
              className={errors.pincode ? "border-destructive" : ""}
            />
            {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Validating..." : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
