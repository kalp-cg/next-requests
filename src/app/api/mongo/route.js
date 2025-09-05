import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('database_01');

    const companies = await db.collection('companies')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCompanies = await db.collection('companies').countDocuments();
    const totalPages = Math.ceil(totalCompanies / limit);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCompanies: totalCompanies,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    }, { status: 500 });
  }
}