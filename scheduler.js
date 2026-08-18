// ============================================================
// Peer Mock Interview Scheduler Logic
// ============================================================

const Scheduler = (function () {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const TIMES = ["9:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

  // Check if booking is active
  function isActive(booking) {
    return booking && booking.status !== "cancelled";
  }

  // Check if two names are the same person (case insensitive)
  function samePerson(name1, name2) {
    let a = String(name1 || "").trim().toLowerCase();
    let b = String(name2 || "").trim().toLowerCase();
    return a === b;
  }

  // Find active booking for a slot
  function slotBooking(bookings, slotId) {
    if (!bookings) return null;
    return bookings.find(function (booking) {
      return booking.slotId === slotId && isActive(booking);
    });
  }

  // Check if person has a scheduling conflict
  function personHasConflict(data, personName, day, time) {
    let slots = data.slots || [];
    let bookings = data.bookings || [];

    return bookings.some(function (booking) {
      if (!isActive(booking)) return false;

      let slot = slots.find(function (item) {
        return item.id === booking.slotId;
      });

      if (!slot || slot.day !== day || slot.time !== time) {
        return false;
      }

      let isHost = samePerson(slot.hostName, personName);
      let isRequester = samePerson(booking.requesterName, personName);
      return isHost || isRequester;
    });
  }

  // Check if host already offered a slot at this day and time
  function hasOfferedSlot(slots, hostName, day, time) {
    if (!slots) return false;
    return slots.some(function (slot) {
      return samePerson(slot.hostName, hostName) && slot.day === day && slot.time === time;
    });
  }

  // Get short weekday string for a date (Mon, Tue, etc.)
  function weekdayShort(date) {
    if (!date) {
      date = new Date();
    }
    const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysArr[date.getDay()];
  }

  return {
    DAYS: DAYS,
    TIMES: TIMES,
    samePerson: samePerson,
    slotBooking: slotBooking,
    personHasConflict: personHasConflict,
    hasOfferedSlot: hasOfferedSlot,
    weekdayShort: weekdayShort
  };
})();
