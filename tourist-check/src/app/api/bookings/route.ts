import { NextResponse } from 'next/server';
import { getAllBookings, createBooking } from '@/lib/queries';

export async function GET() {
  try {
    const bookings = await getAllBookings();
    return NextResponse.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    return NextResponse.json({ error: 'Өгөгдөл татахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const booking = await createBooking({
      groupName: body.groupName,
      arrivalDate: body.arrivalDate,
      arrivalTime: body.arrivalTime,
      maleTourists: body.maleTourists,
      femaleTourists: body.femaleTourists,
      saunaMale: body.saunaMale,
      saunaFemale: body.saunaFemale,
      guideLastName: body.guide.lastName,
      guideFirstName: body.guide.firstName,
      guidePhone: body.guide.phone,
      busNumber: body.busNumber ?? '',
      guideId: body.guideId,
      guideName: body.guideName,
    });
    return NextResponse.json(booking, { status: 201 });
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
    }
    console.error('POST /api/bookings error:', err);
    return NextResponse.json({ error: 'Захиалга үүсгэхэд алдаа гарлаа' }, { status: 500 });
  }
}
