import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// POST /api/companies/bulk - Insert many companies
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Request body must be a non-empty array of companies'
      }, { status: 400 });
    }

    // Validate each company has required fields
    for (let i = 0; i < body.length; i++) {
      if (!body[i].name || !body[i].location) {
        return NextResponse.json({
          success: false,
          message: `Company at index ${i} is missing required fields (name, location)`
        }, { status: 400 });
      }
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    // Add timestamps to all companies
    const companiesWithTimestamps = body.map(company => ({
      ...company,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await db.collection('companies').insertMany(companiesWithTimestamps);

    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${result.insertedCount} companies`,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    }, { status: 201 });
  } catch (error) {
    console.error('Error bulk inserting companies:', error);
    return NextResponse.json({
      success: false,
      message: 'Error bulk inserting companies',
      error: error.message
    }, { status: 500 });
  }
}