"use client"

import Link from "next/link"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { Facebook, Instagram, Twitter } from "lucide-react" // Social icons

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold font-sans">RentKaro</h3>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            Your trusted partner for flexible and sustainable rentals.
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={showComingSoonToast}
              className="hover:text-secondary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </button>
            <button
              onClick={showComingSoonToast}
              className="hover:text-secondary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </button>
            <button
              onClick={showComingSoonToast}
              className="hover:text-secondary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">About Us</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Support & Policies</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="#"
                onClick={showComingSoonToast}
                className="hover:text-secondary transition-colors"
                prefetch={false}
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Get in Touch</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>Email: support@rentify.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Address: 123 Rental St, City, State, 12345</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 text-center text-xs text-primary-foreground/60">
        &copy; {new Date().getFullYear()} Rentify. All rights reserved.
      </div>
    </footer>
  )
}
