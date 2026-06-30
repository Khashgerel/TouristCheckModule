import { query } from './db';

export interface BookingRow {
  id: string;
  guide_id: string;
  guide_name: string;
  group_name: string;
  arrival_date: string;
  arrival_time: string;
  male_tourists: number;
  female_tourists: number;
  sauna_male: number;
  sauna_female: number;
  guide_last_name: string;
  guide_first_name: string;
  guide_phone: string;
  bus_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function rowToBooking(row: BookingRow) {
  const raw: unknown = row.arrival_date;
  const dateStr = raw instanceof Date
    ? `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`
    : String(raw ?? '').slice(0, 10);
  return {
    id: row.id,
    guideId: row.guide_id,
    guideName: row.guide_name,
    groupName: row.group_name,
    arrivalDate: dateStr,
    arrivalTime: typeof row.arrival_time === 'string'
      ? row.arrival_time.slice(0, 5)
      : new Date(row.arrival_time).toTimeString().slice(0, 5),
    maleTourists: row.male_tourists,
    femaleTourists: row.female_tourists,
    saunaMale: row.sauna_male,
    saunaFemale: row.sauna_female,
    guide: {
      lastName: row.guide_last_name,
      firstName: row.guide_first_name,
      phone: row.guide_phone,
    },
    busNumber: row.bus_number,
    status: row.status as 'pending' | 'confirmed' | 'completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function checkDuplicate(
  arrivalDate: string,
  arrivalTime: string,
  groupName: string,
  excludeId?: string
): Promise<boolean> {
  const result = await query(
    `SELECT id FROM bookings
     WHERE arrival_date = $1 AND arrival_time = $2 AND group_name = $3
       AND ($4::uuid IS NULL OR id != $4)`,
    [arrivalDate, arrivalTime, groupName, excludeId ?? null]
  );
  return result.rows.length === 0;
}

export function isWithinEditWindow(arrivalDate: string, arrivalTime: string): boolean {
  const arrival = new Date(`${arrivalDate}T${arrivalTime}`);
  const now = new Date();
  return now.getTime() - arrival.getTime() < 24 * 60 * 60 * 1000;
}

export async function autoCompleteExpired(): Promise<void> {
  await query(
    `UPDATE bookings SET status = 'completed', updated_at = NOW()
     WHERE status != 'completed'
       AND (arrival_date || 'T' || arrival_time)::timestamptz < NOW() - INTERVAL '24 hours'`
  );
}

export async function getAllBookings() {
  await autoCompleteExpired();
  const result = await query(
    'SELECT * FROM bookings ORDER BY arrival_date ASC, arrival_time ASC'
  );
  return result.rows.map(rowToBooking);
}

export async function getBookingById(id: string) {
  const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
  return result.rows.length > 0 ? rowToBooking(result.rows[0]) : null;
}

export async function createBooking(data: {
  groupName: string;
  arrivalDate: string;
  arrivalTime: string;
  maleTourists: number;
  femaleTourists: number;
  saunaMale: number;
  saunaFemale: number;
  guideLastName: string;
  guideFirstName: string;
  guidePhone: string;
  busNumber: string;
  guideId?: string;
  guideName?: string;
}) {
  const dupOk = await checkDuplicate(data.arrivalDate, data.arrivalTime, data.groupName);
  if (!dupOk) throw new Error('DUPLICATE');

  const result = await query(
    `INSERT INTO bookings (guide_id, guide_name, group_name, arrival_date, arrival_time,
      male_tourists, female_tourists, sauna_male, sauna_female,
      guide_last_name, guide_first_name, guide_phone, bus_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      data.guideId ?? 'anonymous',
      data.guideName ?? `${data.guideLastName} ${data.guideFirstName}`,
      data.groupName,
      data.arrivalDate,
      data.arrivalTime,
      data.maleTourists,
      data.femaleTourists,
      data.saunaMale,
      data.saunaFemale,
      data.guideLastName,
      data.guideFirstName,
      data.guidePhone,
      data.busNumber,
    ]
  );
  return rowToBooking(result.rows[0]);
}

export async function updateBooking(id: string, data: {
  groupName?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  maleTourists?: number;
  femaleTourists?: number;
  saunaMale?: number;
  saunaFemale?: number;
  guideLastName?: string;
  guideFirstName?: string;
  guidePhone?: string;
  busNumber?: string;
  status?: string;
}) {
  const existing = await getBookingById(id);
  if (!existing) return null;

  const finalDate = data.arrivalDate ?? existing.arrivalDate;
  const finalTime = data.arrivalTime ?? existing.arrivalTime;

  if (!isWithinEditWindow(finalDate, finalTime)) {
    throw new Error('EDIT_WINDOW_EXPIRED');
  }

  if (data.arrivalDate || data.arrivalTime || data.groupName) {
    const finalGroup = data.groupName ?? existing.groupName;
    const dupOk = await checkDuplicate(finalDate, finalTime, finalGroup, id);
    if (!dupOk) throw new Error('DUPLICATE');
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.groupName !== undefined) { fields.push(`group_name = $${idx++}`); values.push(data.groupName); }
  if (data.arrivalDate !== undefined) { fields.push(`arrival_date = $${idx++}`); values.push(data.arrivalDate); }
  if (data.arrivalTime !== undefined) { fields.push(`arrival_time = $${idx++}`); values.push(data.arrivalTime); }
  if (data.maleTourists !== undefined) { fields.push(`male_tourists = $${idx++}`); values.push(data.maleTourists); }
  if (data.femaleTourists !== undefined) { fields.push(`female_tourists = $${idx++}`); values.push(data.femaleTourists); }
  if (data.saunaMale !== undefined) { fields.push(`sauna_male = $${idx++}`); values.push(data.saunaMale); }
  if (data.saunaFemale !== undefined) { fields.push(`sauna_female = $${idx++}`); values.push(data.saunaFemale); }
  if (data.guideLastName !== undefined) { fields.push(`guide_last_name = $${idx++}`); values.push(data.guideLastName); }
  if (data.guideFirstName !== undefined) { fields.push(`guide_first_name = $${idx++}`); values.push(data.guideFirstName); }
  if (data.guidePhone !== undefined) { fields.push(`guide_phone = $${idx++}`); values.push(data.guidePhone); }
  if (data.busNumber !== undefined) { fields.push(`bus_number = $${idx++}`); values.push(data.busNumber); }
  if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows.length > 0 ? rowToBooking(result.rows[0]) : null;
}

export async function deleteBooking(id: string) {
  const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}
