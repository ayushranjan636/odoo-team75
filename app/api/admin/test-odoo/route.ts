import { NextRequest, NextResponse } from 'next/server'
import { ensureOdooConnected, createOdooProduct } from '@/lib/odoo'

export async function GET() {
  try {
    await ensureOdooConnected()
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Odoo',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Odoo connection test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    
    const result = await createOdooProduct(productData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Product created successfully in Odoo',
        odooId: result.odooId,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Product creation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
