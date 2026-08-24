const Scheduler = (function () {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DEFAULT_TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];
  const PRESET_TIMES = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  // Parses any time string (e.g. "9:00", "14:15", "2:30 PM") into minutes from midnight
  function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let s = String(timeStr).trim();

    let isPM = /pm/i.test(s);
    let isAM = /am/i.test(s);
    let clean = s.replace(/[^\d:]/g, "");
    let parts = clean.split(":");
    let hours = parseInt(parts[0], 10) || 0;
    let minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return Math.max(0, Math.min(23 * 60 + 59, hours * 60 + minutes));
  }

  // Normalizes a time string to 24-hour HH:MM format
  function normalizeTime(timeStr) {
    let totalMinutes = timeToMinutes(timeStr);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Formats time for readable 12-hour display (e.g. "09:00" -> "9:00 AM")
  function formatDisplayTime(timeStr) {
    let totalMinutes = timeToMinutes(timeStr);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    let ampm = hours >= 12 ? "PM" : "AM";
    let displayHour = hours % 12 || 12;
    let minuteStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
    return `${displayHour}${minuteStr} ${ampm}`;
  }

  // Returns all unique, sorted time slots for the weekly grid rows
  function getAllScheduleTimes(slots) {
    let timeSet = new Set(DEFAULT_TIMES.map(normalizeTime));

    if (Array.isArray(slots)) {
      slots.forEach(function (slot) {
        if (slot && slot.time) {
          timeSet.add(normalizeTime(slot.time));
        }
      });
    }

    return Array.from(timeSet).sort(function (a, b) {
      return timeToMinutes(a) - timeToMinutes(b);
    });
  }

  // Checks whether a booking is active (not cancelled)
  function isActive(booking) {
    return booking && booking.status !== "cancelled";
  }

  // Compares two user names case-insensitively
  function samePerson(name1, name2) {
    let a = String(name1 || "").trim().toLowerCase();
    let b = String(name2 || "").trim().toLowerCase();
    return a === b;
  }

  // Finds an active booking associated with a specific slot ID
  function slotBooking(bookings, slotId) {
    if (!bookings) return null;
    return bookings.find(function (booking) {
      return booking.slotId === slotId && isActive(booking);
    });
  }

  // Checks if a user already has an active session at the given day and time
  function personHasConflict(data, personName, day, time) {
    let slots = data.slots || [];
    let bookings = data.bookings || [];
    let targetNormTime = normalizeTime(time);

    return bookings.some(function (booking) {
      if (!isActive(booking)) return false;

      let slot = slots.find(function (item) {
        return item.id === booking.slotId;
      });

      if (!slot || slot.day !== day || normalizeTime(slot.time) !== targetNormTime) {
        return false;
      }

      let isHost = samePerson(slot.hostName, personName);
      let isRequester = samePerson(booking.requesterName, personName);
      return isHost || isRequester;
    });
  }

  // Checks if a host has already offered a slot at the same day and time
  function hasOfferedSlot(slots, hostName, day, time) {
    if (!slots) return false;
    let targetNormTime = normalizeTime(time);
    return slots.some(function (slot) {
      return samePerson(slot.hostName, hostName) && slot.day === day && normalizeTime(slot.time) === targetNormTime;
    });
  }

  // Returns short 3-letter weekday name for a date
  function weekdayShort(date) {
    if (!date) {
      date = new Date();
    }
    const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysArr[date.getDay()];
  }

  // Determines if a scheduled weekly session has already ended
  function isSessionPast(day, timeStr, durationMinutes) {
    if (!day || !timeStr) return true;
    let now = new Date();
    let dayMap = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    let currentDayIndex = dayMap[now.getDay()];
    let slotDayIndex = DAYS.indexOf(day);

    if (slotDayIndex === -1) return true;

    if (currentDayIndex > slotDayIndex) {
      return true;
    }
    if (currentDayIndex < slotDayIndex) {
      return false;
    }

    let currentMinutes = now.getHours() * 60 + now.getMinutes();
    let startMinutes = timeToMinutes(timeStr);
    let dur = parseInt(durationMinutes, 10) || 60;
    let endMinutes = startMinutes + dur;

    return currentMinutes >= endMinutes;
  }

  // Computes the display end time given a start time and duration in minutes
  function getEndTimeDisplay(timeStr, durationMinutes) {
    let startMinutes = timeToMinutes(timeStr);
    let dur = parseInt(durationMinutes, 10) || 60;
    return formatDisplayTime(startMinutes + dur);
  }

  return {
    DAYS: DAYS,
    TIMES: DEFAULT_TIMES,
    PRESET_TIMES: PRESET_TIMES,
    timeToMinutes: timeToMinutes,
    normalizeTime: normalizeTime,
    formatDisplayTime: formatDisplayTime,
    getEndTimeDisplay: getEndTimeDisplay,
    getAllScheduleTimes: getAllScheduleTimes,
    samePerson: samePerson,
    slotBooking: slotBooking,
    personHasConflict: personHasConflict,
    hasOfferedSlot: hasOfferedSlot,
    weekdayShort: weekdayShort,
    isSessionPast: isSessionPast
  };
})();

if (typeof window !== "undefined") {
  window.Scheduler = Scheduler;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Scheduler;
}
