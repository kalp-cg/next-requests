import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/companies/paginate?page=2&limit=5
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('Workbook');

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
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Error paginating companies:', error);
    return NextResponse.json({
      success: false,
      message: 'Error paginating companies',
      error: error.message
    }, { status: 500 });
  }
}