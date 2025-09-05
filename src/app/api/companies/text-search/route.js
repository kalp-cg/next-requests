import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/companies/text-search?q=design&skill=Java
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q'); // general search term
    const skill = searchParams.get('skill'); // specific skill search
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    if (!q && !skill) {
      return NextResponse.json({
        success: false,
        message: 'Please provide either "q" or "skill" query parameter'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('Workbook');

    let query = { $or: [] };

    if (q) {
      // Search in name and other text fields
      query.$or.push(
        { name: { $regex: new RegExp(q, 'i') } },
        { location: { $regex: new RegExp(q, 'i') } },
        { 'hiringCriteria.skills': { $regex: new RegExp(q, 'i') } }
      );
    }

    if (skill) {
      // Specific skill search
      query.$or.push(
        { 'hiringCriteria.skills': { $regex: new RegExp(skill, 'i') } }
      );
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
      searchParams: { q, skill },
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