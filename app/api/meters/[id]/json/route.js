import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';

// GET - Public JSON endpoint for a meter
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const meter = await MeterManual.findById(id).lean();

    if (!meter || meter.status !== 'approved') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Return clean JSON without internal fields
    const publicData = {
      id: meter._id,
      manufacturer: meter.manufacturer,
      types: meter.types,
      item: meter.item,
      idNote: meter.idNote,
      accuracyClass: meter.accuracyClass,
      errorClass: meter.errorClass,
      terminalPoint: meter.terminalPoint,
      baseInfo: meter.baseInfo,
      standards: meter.standards,
      workOrders: meter.workOrders,
      manufacturerYears: meter.manufacturerYears,
      serialRanges: meter.serialRanges,
      warrantyPeriod: meter.warrantyPeriod,
      meterPrice: meter.meterPrice,
      rateInfo: meter.rateInfo,
      demandInfo: meter.demandInfo,
      kvarInfo: meter.kvarInfo,
      prepaidInfo: meter.prepaidInfo,
      networkInfo: meter.networkInfo,
      netMeterInfo: meter.netMeterInfo,
      images: meter.images?.filter(img => img.approved).map(img => img.url) || [],
      createdAt: meter.createdAt,
      updatedAt: meter.updatedAt
    };

    return NextResponse.json(publicData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
