import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('Workbook');

    const companies = await db.collection('companies')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCompanies = await db.collection('companies').countDocuments();

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCompanies / limit),
        totalCompanies: totalCompanies,
        limit: limit
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

// POST /api/companies - Create a new company
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.location) {
      return NextResponse.json({
        success: false,
        message: 'Name and location are required fields'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    const newCompany = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('companies').insertOne(newCompany);

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      data: {
        _id: result.insertedId,
        ...newCompany
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({
      success: false,
      message: 'Error creating company',
      error: error.message
    }, { status: 500 });
  }
}