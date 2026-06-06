(function () {
  "use strict";

  var STORAGE_KEY = "zoes-vet-surgery-data";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeAppointmentStatus(status) {
    var value = String(status || "").trim().toLowerCase();

    if (value === "follow-up needed" || value === "follow up needed" || value === "follow-up") {
      return "follow up";
    }

    if (value === "booked" || value === "in progress" || value === "follow up" || value === "treated" || value === "cancelled") {
      return value;
    }

    return "booked";
  }

  function normalizeData(data) {
    var nextData = clone(data);

    if (Array.isArray(nextData.appointments)) {
      nextData.appointments.forEach(function (appointment) {
        appointment.status = normalizeAppointmentStatus(appointment.status);
      });
    }

    return nextData;
  }

  function readRaw() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function write(data) {
    var normalized = normalizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return clone(normalized);
  }

  function seed() {
    return write(window.ZoeVetSeed.create());
  }

  function read() {
    var data = readRaw();

    if (!data || data.version !== window.ZoeVetSeed.version) {
      return seed();
    }

    return write(data);
  }

  function reset() {
    return seed();
  }

  function update(mutator) {
    var data = read();
    mutator(data);
    return write(data);
  }

  window.ZoeVetData = {
    key: STORAGE_KEY,
    read: read,
    reset: reset,
    update: update,
    write: write
  };
}());
