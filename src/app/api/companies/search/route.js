import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/companies/search?city=Bangalore&minBase=25&skill=React
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minBase = searchParams.get('minBase');
    const skill = searchParams.get('skill');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('Workbook');

    // Build query dynamically
    let query = {};

    if (city) {
      query.location = { $regex: new RegExp(city, 'i') };
    }

    if (minBase) {
      query['salaryBand.base'] = { $gte: parseInt(minBase) };
    }

    if (skill) {
      query['hiringCriteria.skills'] = { $regex: new RegExp(skill, 'i') };
    }

    const companies = await db.collection('companies')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalMatching = await db.collection('companies').countDocuments(query);

    return NextResponse.json({
      success: true,
      data: companies,
      filters: { city, minBase, skill },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMatching / limit),
        totalMatching: totalMatching,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error searching companies:', error);
    return NextResponse.json({
      success: false,
      message: 'Error searching companies',
      error: error.message
    }, { status: 500 });
  }
}