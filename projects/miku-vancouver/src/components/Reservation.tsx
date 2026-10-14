import { useEffect, useState } from 'react';
import { official } from '../data/site';
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export default function Reservation() {
  const [date, setDate] = useState('');
  const [minimum, setMinimum] = useState('');
  const [time, setTime] = useState('19:00');
  const [party, setParty] = useState('2');
  useEffect(() => { const today = localDate(); setDate(today); setMinimum(today); }, []);
  const booking = new URL(official.booking);
  if (date) booking.searchParams.set('datetime', `${date}T${time}`);
  booking.searchParams.set('covers', party);
  return <form className="booking-form" onSubmit={e => { e.preventDefault(); window.open(booking.href, '_blank', 'noopener,noreferrer'); }}><p className="eyebrow">PLAN YOUR VISIT</p><div className="booking-fields"><label>Date<input aria-label="Preferred dining date" type="date" required min={minimum} value={date} onChange={e => setDate(e.target.value)} /></label><label>Preferred time<input aria-label="Preferred dining time" type="time" required value={time} onChange={e => setTime(e.target.value)} /></label><label>Guests<select aria-label="Party size" value={party} onChange={e => setParty(e.target.value)}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>)}</select></label></div><button className="button button-dark" type="submit">Continue to OpenTable</button><p className="booking-note">Preferences only, not live availability. Continue to Miku’s official booking provider to check availability and complete a reservation. You may be asked to select your preferences again.</p></form>;
}
