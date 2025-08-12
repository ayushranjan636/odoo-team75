import { type NextRequest, NextResponse } from "next/server"

// Bill generation types
interface BillItem {
  name: string
  description: string
  quantity: number
  rate: number
  amount: number
  tenure: string
  dates: string
}

interface BillData {
  billNumber: string
  orderId: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: BillItem[]
  subtotal: number
  discount: number
  taxes: number
  total: number
  paymentMethod: string
  paymentStatus: string
  billingDate: string
  dueDate?: string
  installmentInfo?: {
    plan: string
    currentInstallment: number
    totalInstallments: number
    nextDueDate?: string
  }
}

// Generate bill HTML template
const generateBillHTML = (billData: BillData) => {
  const { customerInfo, items, subtotal, discount, taxes, total, billNumber, orderId, billingDate, installmentInfo } = billData

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${billNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0D9488; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #0D9488; margin-bottom: 5px; }
        .company-info { font-size: 14px; color: #666; }
        .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .bill-to, .bill-details { flex: 1; }
        .bill-details { text-align: right; }
        .bill-number { font-size: 24px; font-weight: bold; color: #0D9488; margin-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; color: #555; }
        .table .amount { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals table { width: 100%; }
        .totals .total-row { font-weight: bold; font-size: 18px; background-color: #f8f9fa; }
        .installment-info { background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .status.paid { background-color: #d4edda; color: #155724; }
        .status.pending { background-color: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">RentKaro</div>
        <div class="company-info">Premium Rental Solutions<br>Email: support@rentkaro.com | Phone: +91 98765 43210</div>
    </div>

    <div class="bill-info">
        <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${customerInfo.name}</strong><br>
            ${customerInfo.email}<br>
            ${customerInfo.phone}<br>
            ${customerInfo.address}</p>
        </div>
        <div class="bill-details">
            <div class="bill-number">Invoice #${billNumber}</div>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date(billingDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Status:</strong> <span class="status ${billData.paymentStatus}">${billData.paymentStatus.toUpperCase()}</span></p>
        </div>
    </div>

    ${installmentInfo ? `
    <div class="installment-info">
        <h4>📅 Installment Plan Details</h4>
        <p><strong>Plan:</strong> ${installmentInfo.plan === '2-months' ? '2-Month Plan' : '3-Month Plan'}</p>
        <p><strong>Current Payment:</strong> ${installmentInfo.currentInstallment} of ${installmentInfo.totalInstallments}</p>
        ${installmentInfo.nextDueDate ? `<p><strong>Next Due Date:</strong> ${new Date(installmentInfo.nextDueDate).toLocaleDateString('en-IN')}</p>` : ''}
    </div>
    ` : ''}

    <table class="table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Tenure</th>
                <th>Rental Period</th>
                <th>Rate</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
            <tr>
                <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                </td>
                <td>${item.quantity}</td>
                <td>${item.tenure}</td>
                <td><small>${item.dates}</small></td>
                <td>₹${item.rate.toLocaleString('en-IN')}</td>
                <td class="amount">₹${item.amount.toLocaleString('en-IN')}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${discount > 0 ? `
            <tr style="color: #28a745;">
                <td>Discount:</td>
                <td class="amount">-₹${discount.toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            <tr>
                <td>Taxes (18% GST):</td>
                <td class="amount">₹${taxes.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
                <td>Total Amount:</td>
                <td class="amount">₹${total.toLocaleString('en-IN')}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>Payment Method:</strong> ${billData.paymentMethod}</p>
        <p>Thank you for choosing RentKaro! For any queries, contact us at support@rentkaro.com</p>
        <p style="font-size: 10px; margin-top: 15px;">
            This is a computer-generated invoice. No signature required.<br>
            Generated on ${new Date().toLocaleString('en-IN')}
        </p>
    </div>
</body>
</html>
  `
}

// Generate and send bill
export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      orderData,
      paymentInfo,
      customerInfo,
      appliedPromo,
      installmentInfo
    } = await request.json()

    // Generate bill number
    const billNumber = `BILL-${Date.now()}`

    // Prepare bill items
    const billItems: BillItem[] = orderData.items.map((item: any) => ({
      name: item.name,
      description: `Product ID: ${item.productId}`,
      quantity: item.qty,
      rate: item.pricePerUnit,
      amount: item.pricePerUnit * item.qty,
      tenure: item.tenure || 'daily',
      dates: `${new Date(item.startAt).toLocaleDateString('en-IN')} - ${new Date(item.endAt).toLocaleDateString('en-IN')}`
    }))

    // Calculate totals
    const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0)
    const discount = appliedPromo?.discountAmount || 0
    const discountedSubtotal = subtotal - discount
    const taxes = discountedSubtotal * 0.18 // 18% GST
    const total = discountedSubtotal + taxes

    // Prepare bill data
    const billData: BillData = {
      billNumber,
      orderId,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: `${customerInfo.address}, ${customerInfo.city} - ${customerInfo.pincode}`
      },
      items: billItems,
      subtotal,
      discount,
      taxes,
      total,
      paymentMethod: paymentInfo.method || 'Online Payment',
      paymentStatus: paymentInfo.status || 'paid',
      billingDate: new Date().toISOString(),
      installmentInfo
    }

    // Generate HTML bill
    const billHTML = generateBillHTML(billData)

    // Save bill to Odoo (mock for now)
    try {
      // In real implementation, save to Odoo
      console.log(`Bill ${billNumber} generated for order ${orderId}`)
      
      // Mock email sending
      console.log(`Sending bill to ${customerInfo.email}`)
      
      // In real implementation, integrate with email service
      // await sendEmail({
      //   to: customerInfo.email,
      //   subject: `Invoice ${billNumber} - RentKaro`,
      //   html: billHTML
      // })

    } catch (error) {
      console.error('Error saving bill to Odoo:', error)
    }

    return NextResponse.json({
      success: true,
      billNumber,
      billHTML,
      message: 'Bill generated and sent successfully',
      billData: {
        billNumber,
        total,
        customerEmail: customerInfo.email,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating bill:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate bill'
    }, { status: 500 })
  }
}
