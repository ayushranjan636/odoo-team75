import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billNumber = searchParams.get('billNumber')
    const orderId = searchParams.get('orderId')
    
    if (!billNumber || !orderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Generate PDF-ready HTML for download
    const pdfHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${billNumber}</title>
    <style>
        @page { 
            size: A4; 
            margin: 1cm; 
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            color: #333; 
            line-height: 1.5;
            font-size: 12pt;
        }
        .invoice-container { 
            width: 100%; 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
        }
        .header { 
            background: #2c3e50; 
            color: white; 
            padding: 20px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .company-info h1 { font-size: 24pt; margin-bottom: 5px; }
        .invoice-details { text-align: right; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-box { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 4px; 
            background: #f8f9fa; 
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }
        .table th, .table td { 
            padding: 8px 12px; 
            text-align: left; 
            border: 1px solid #ddd; 
        }
        .table th { 
            background: #f8f9fa; 
            font-weight: bold; 
        }
        .totals { 
            margin-top: 20px; 
            float: right; 
            width: 300px; 
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0; 
            border-bottom: 1px solid #eee; 
        }
        .total-final { 
            font-weight: bold; 
            font-size: 14pt; 
            border-top: 2px solid #2c3e50; 
            padding-top: 10px; 
            margin-top: 10px; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
        }
        .download-button { 
            background: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14pt; 
            margin: 20px 0; 
        }
        @media print {
            .download-button { display: none; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <h1>RentKro</h1>
                <p>Premium Furniture Rental Solutions</p>
                <p>support@rentkro.com | +91-8000000000</p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>${billNumber}</strong></p>
                <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
        </div>

        <div class="content">
            <button class="download-button no-print" onclick="window.print()">
                📄 Download PDF
            </button>

            <div class="section grid">
                <div class="info-box">
                    <h3>Customer Information</h3>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Bill Number:</strong> ${billNumber}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
                </div>
                <div class="info-box">
                    <h3>Payment Details</h3>
                    <p><strong>Status:</strong> Processing</p>
                    <p><strong>Method:</strong> Digital Payment</p>
                    <p><strong>Reference:</strong> ${billNumber}</p>
                </div>
            </div>

            <div class="section">
                <h3>Order Summary</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Furniture Rental Service</td>
                            <td>1</td>
                            <td>₹12,000</td>
                            <td>₹12,000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹12,000</span>
                </div>
                <div class="total-row">
                    <span>GST (18%):</span>
                    <span>₹2,160</span>
                </div>
                <div class="total-row total-final">
                    <span>Total Amount:</span>
                    <span>₹14,160</span>
                </div>
            </div>

            <div style="clear: both;"></div>

            <div class="footer">
                <p><strong>Thank you for choosing RentKro!</strong></p>
                <p>This is a computer generated invoice. No signature required.</p>
                <p>For queries: support@rentkro.com | +91-8000000000</p>
            </div>
        </div>
    </div>

    <script>
        // Auto-trigger download on load
        window.onload = function() {
            if (window.location.search.includes('auto=true')) {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }
    </script>
</body>
</html>`

    return new NextResponse(pdfHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice_${billNumber}.html"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
