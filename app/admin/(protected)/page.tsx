import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getReservationVillaKeys, getReservations } from '@/lib/wp/availability';

export default async function AdminPage() {
  const villaKeys = await getReservationVillaKeys();
  const reservationsByVilla = await Promise.all(villaKeys.map((key) => getReservations(key)));
  const reservations = reservationsByVilla
    .flat()
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  return <AdminDashboard initialReservations={reservations} />;
}
