/* Pure availability and booking checks, intended to be reusable by Phase 2 routes. */
const Scheduler = (() => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TIMES = ['9:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
  const active = booking => booking && booking.status !== 'cancelled';
  const samePerson = (one, two) => String(one || '').trim().toLocaleLowerCase() === String(two || '').trim().toLocaleLowerCase();
  function slotBooking(bookings, slotId) { return (bookings || []).find(booking => booking.slotId === slotId && active(booking)); }
  function personHasConflict({ slots = [], bookings = [] }, personName, day, time) {
    return (bookings || []).some(booking => {
      if (!active(booking)) return false;
      const slot = slots.find(item => item.id === booking.slotId);
      if (!slot || slot.day !== day || slot.time !== time) return false;
      return samePerson(slot.hostName, personName) || samePerson(booking.requesterName, personName);
    });
  }
  function hasOfferedSlot(slots, hostName, day, time) { return (slots || []).some(slot => samePerson(slot.hostName, hostName) && slot.day === day && slot.time === time); }
  function weekdayShort(date = new Date()) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]; }
  return { DAYS, TIMES, samePerson, slotBooking, personHasConflict, hasOfferedSlot, weekdayShort };
})();
