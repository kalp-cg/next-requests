import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { companyName } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('database_01');

    // Case-insensitive search for company name
    const query = { 
      name: { 
        $regex: new RegExp(companyName, 'i') 
      }
    };

    const companies = await db.collection('companies')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    if (companies.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No companies found matching "${companyName}"`
      }, { status: 404 });
    }

    const totalMatching = await db.collection('companies').countDocuments(query);
    const totalPages = Math.ceil(totalMatching / limit);

    return NextResponse.json({
      success: true,
      data: companies,
      searchTerm: companyName,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalMatching: totalMatching,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching company data',
      error: error.message
    }, { status: 500 });
  }
}