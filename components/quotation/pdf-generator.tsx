"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface QuotationItem {
  productId: string
  name: string
  pricePerUnit: number
  qty: number
  tenureType: string
  startDate: Date
  endDate: Date
  deposit: number
}

interface QuotationData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes: string
  validUntil: string
  quotationNumber: string
}

interface PDFGeneratorProps {
  items: QuotationItem[]
  quotationData: QuotationData
  subtotal: number
  totalDeposit: number
  taxes: number
  total: number
}

export function PDFGenerator({ items, quotationData, subtotal, totalDeposit, taxes, total }: PDFGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      if (!printRef.current) return

      // Create canvas from the quotation content
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = 297
      const imgWidth = pdfWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add the image to PDF
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight)

      // If content is longer than one page, add more pages
      if (imgHeight > pdfHeight - 20) {
        let remainingHeight = imgHeight - (pdfHeight - 20)
        let yPosition = -(pdfHeight - 20)

        while (remainingHeight > 0) {
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight)
          remainingHeight -= pdfHeight - 20
          yPosition -= pdfHeight - 20
        }
      }

      // Save the PDF
      pdf.save(`Quotation-${quotationData.quotationNumber}.pdf`)
      toast.success("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <>
      <Button onClick={generatePDF} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>

      {/* Hidden printable content */}
      <div ref={printRef} className="fixed -left-[9999px] top-0 bg-white">
        <div className="w-[794px] min-h-[1123px] p-12 font-sans text-gray-900">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-teal-600 mb-2">RentKaro</h1>
              <p className="text-gray-600">Premium Rental Solutions</p>
              <div className="mt-4 text-sm text-gray-600">
                <p>Email: info@rentkaro.com</p>
                <p>Phone: +91 98765 43210</p>
                <p>Website: www.rentkaro.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">QUOTATION</h2>
              <p className="text-lg font-semibold text-teal-600">#{quotationData.quotationNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Date: {new Date().toLocaleDateString("en-IN")}</p>
              <p className="text-sm text-gray-600">
                Valid Until: {new Date(quotationData.validUntil).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">Bill To:</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">{quotationData.customerName}</p>
              {quotationData.customerEmail && <p>Email: {quotationData.customerEmail}</p>}
              {quotationData.customerPhone && <p>Phone: {quotationData.customerPhone}</p>}
              {quotationData.customerAddress && (
                <p className="mt-2 whitespace-pre-line">{quotationData.customerAddress}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-teal-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-800">
                    Item Description
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800">
                    Qty
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800">
                    Tenure
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800">
                    Rental Period
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-800">
                    Rate
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-800">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Deposit: {formatCurrency(item.deposit)} per unit</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">{item.qty}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700 capitalize">
                      {item.tenureType}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                      <div>
                        <p>{item.startDate.toLocaleDateString("en-IN")}</p>
                        <p className="text-xs text-gray-500">to</p>
                        <p>{item.endDate.toLocaleDateString("en-IN")}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(item.pricePerUnit)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-700 font-medium">
                      {formatCurrency(item.pricePerUnit * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(totalDeposit)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Taxes & Fees (18% GST):</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(taxes)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between py-1">
                    <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                    <span className="text-lg font-bold text-teal-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotationData.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                Additional Notes:
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{quotationData.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              Terms & Conditions:
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• This quotation is valid until {new Date(quotationData.validUntil).toLocaleDateString("en-IN")}</p>
              <p>• Security deposit is refundable upon return of items in good condition</p>
              <p>• Delivery and pickup charges may apply based on location</p>
              <p>• Items are subject to availability at the time of booking</p>
              <p>• Prices include 18% GST as applicable</p>
              <p>• Late return charges may apply beyond agreed rental period</p>
              <p>• Any damage to rented items will be charged separately</p>
              <p>• Payment terms: 50% advance, balance on delivery</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Thank you for choosing RentKaro!</p>
            <p className="text-xs text-gray-500">
              This is a computer-generated quotation and does not require a signature.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
