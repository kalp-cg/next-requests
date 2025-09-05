import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/companies/[id] - Get company by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid company ID format'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    const company = await db.collection('companies')
      .findOne({ _id: new ObjectId(id) });

    if (!company) {
      return NextResponse.json({
        success: false,
        message: 'Company not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching company',
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/companies/[id] - Update company by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid company ID format'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    const result = await db.collection('companies')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Company not found'
      }, { status: 404 });
    }

    // Get updated company
    const updatedCompany = await db.collection('companies')
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({
      success: false,
      message: 'Error updating company',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/companies/[id] - Delete company by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid company ID format'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    const result = await db.collection('companies')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Company not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    }, { status: 500 });
  }
}