import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MeterManual from '@/models/MeterManual';
import { requireAuth } from '@/lib/auth';

// POST - Upload image to ImageBB and attach to meter
export async function POST(request, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = await params;
    const meter = await MeterManual.findById(id);

    if (!meter) {
      return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Convert to base64 for ImageBB
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Upload to ImageBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', process.env.IMGBB_API_KEY);
    imgbbFormData.append('image', base64);

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData
    });

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }

    const user = authResult.user;

    meter.images.push({
      url: imgbbData.data.display_url,
      approved: false,
      uploadedBy: {
        username: user.username,
        fullName: user.fullName
      }
    });

    await meter.save();

    return NextResponse.json({
      success: true,
      imageUrl: imgbbData.data.display_url
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
