import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/companies/count?location=Bangalore
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const client = await clientPromise;
    const db = client.db('Workbook');

    let result = {
      success: true,
      total: 0,
      byLocation: {}
    };

    // Get total count
    result.total = await db.collection('companies').countDocuments();

    if (location) {
      // Count by specific location
      const locationCount = await db.collection('companies')
        .countDocuments({ location: { $regex: new RegExp(location, 'i') } });
      
      result.byLocation[location] = locationCount;
    } else {
      // Get count by all locations
      const locationCounts = await db.collection('companies').aggregate([
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).toArray();

      locationCounts.forEach(item => {
        if (item._id) {
          result.byLocation[item._id] = item.count;
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error counting companies:', error);
    return NextResponse.json({
      success: false,
      message: 'Error counting companies',
      error: error.message
    }, { status: 500 });
  }
}