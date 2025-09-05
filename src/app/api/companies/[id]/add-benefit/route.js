import clientPromise from '../../../../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// PATCH /api/companies/[id]/add-benefit
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid company ID format'
      }, { status: 400 });
    }

    if (!body.benefit) {
      return NextResponse.json({
        success: false,
        message: 'Benefit field is required'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    // Use $addToSet to avoid duplicates
    const result = await db.collection('companies')
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: { benefits: body.benefit },
          $set: { updatedAt: new Date() }
        }
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
      message: 'Benefit added successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Error adding benefit:', error);
    return NextResponse.json({
      success: false,
      message: 'Error adding benefit',
      error: error.message
    }, { status: 500 });
  }
}