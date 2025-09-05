import clientPromise from '../../../../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// PATCH /api/companies/[id]/push-round
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

    if (!body.round || !body.type) {
      return NextResponse.json({
        success: false,
        message: 'Both round and type fields are required'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    const newRound = {
      round: body.round,
      type: body.type,
      duration: body.duration || null,
      description: body.description || null
    };

    // Use $push to add to array
    const result = await db.collection('companies')
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { interviewRounds: newRound },
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
      message: 'Interview round added successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Error adding interview round:', error);
    return NextResponse.json({
      success: false,
      message: 'Error adding interview round',
      error: error.message
    }, { status: 500 });
  }
}