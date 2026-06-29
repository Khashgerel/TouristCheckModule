import { NextResponse } from 'next/server';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/queries';



export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (err) {
    console.error('GET /api/bookings/[id] error:', err);
    return NextResponse.json({ error: 'Өгөгдөл татахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const booking = await updateBooking(id, {
      groupName: body.groupName,
      arrivalDate: body.arrivalDate,
      arrivalTime: body.arrivalTime,
      maleTourists: body.maleTourists,
      femaleTourists: body.femaleTourists,
      saunaMale: body.saunaMale,
      saunaFemale: body.saunaFemale,
      guideLastName: body.guide?.lastName,
      guideFirstName: body.guide?.firstName,
      guidePhone: body.guide?.phone,
      busNumber: body.busNumber,
      status: body.status,
    });
    if (!booking) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'DUPLICATE') {
        return NextResponse.json({ error: 'Энэ групп, өдөр, цагт захиалга давхардаж байна' }, { status: 409 });
      }
      if (err.message.startsWith('TIME_GAP:')) {
        const times = err.message.replace('TIME_GAP:', '').split(',');
        const timeList = times.join(', ');
        return NextResponse.json({
          error: `Захиалгуудын хооронд 3-аас доошгүй цагийн зай байх ёстой. Давхцаж буй цагууд: ${timeList}`,
          conflictingTimes: times,
        }, { status: 409 });
      }
      if (err.message === 'EDIT_WINDOW_EXPIRED') {
        return NextResponse.json({ error: '24 цагийн хугацаа дууссан тул захиалгыг шинэчлэх боломжгүй' }, { status: 403 });
      }
    }
    console.error('PUT /api/bookings/[id] error:', err);
    return NextResponse.json({ error: 'Захиалга шинэчлэхэд алдаа гарлаа' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBooking(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/bookings/[id] error:', err);
    return NextResponse.json({ error: 'Захиалга устгахад алдаа гарлаа' }, { status: 500 });
  }
}
