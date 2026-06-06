(function () {
  "use strict";

  function collection(data, name) {
    return Array.isArray(data && data[name]) ? data[name] : [];
  }

  function byId(items) {
    return items.reduce(function (index, item) {
      index[item.id] = item;
      return index;
    }, {});
  }

  function getClientForPet(data, pet) {
    var clientsById = byId(collection(data, "clients"));
    return clientsById[pet.clientId] || null;
  }

  function getPetForAppointment(data, appointment) {
    var petsById = byId(collection(data, "pets"));
    return petsById[appointment.petId] || null;
  }

  function getClientForAppointment(data, appointment) {
    var clientsById = byId(collection(data, "clients"));
    return clientsById[appointment.clientId] || null;
  }

  function formatAppointmentTime(value) {
    var date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Time not set";
    }

    return date.toLocaleString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short"
    });
  }

  function summarize(data) {
    var appointments = collection(data, "appointments");
    var today = new Date();

    function sameDay(value) {
      var date = new Date(value);
      return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    }

    return {
      clients: collection(data, "clients").length,
      pets: collection(data, "pets").length,
      medications: collection(data, "medications").length,
      treatments: collection(data, "treatments").length,
      appointments: appointments.length,
      procedures: collection(data, "procedures").length,
      todaysAppointments: appointments.filter(function (appointment) {
        return sameDay(appointment.startsAt);
      }).length,
      urgentAppointments: appointments.filter(function (appointment) {
        return appointment.severity === "high";
      }).length
    };
  }

  function previewForSection(data, sectionId) {
    if (sectionId === "clients") {
      return collection(data, "clients").slice(0, 3).map(function (client) {
        var pets = collection(data, "pets").filter(function (pet) {
          return pet.clientId === client.id;
        });

        return {
          title: client.name,
          meta: pets.length + " pet" + (pets.length === 1 ? "" : "s")
        };
      });
    }

    if (sectionId === "pets") {
      return collection(data, "pets").slice(0, 3).map(function (pet) {
        var client = getClientForPet(data, pet);

        return {
          title: pet.name + " the " + pet.species,
          meta: client ? "Owner: " + client.name : "Owner missing"
        };
      });
    }

    if (sectionId === "appointments" || sectionId === "calendar" || sectionId === "dashboard") {
      return collection(data, "appointments").slice(0, 3).map(function (appointment) {
        var pet = getPetForAppointment(data, appointment);
        var client = getClientForAppointment(data, appointment);

        return {
          title: pet ? pet.name + ": " + appointment.reason : appointment.reason,
          meta: formatAppointmentTime(appointment.startsAt) + (client ? " with " + client.name : "")
        };
      });
    }

    if (sectionId === "medications") {
      return collection(data, "medications").slice(0, 3).map(function (medication) {
        return {
          title: medication.name,
          meta: medication.category
        };
      });
    }

    if (sectionId === "treatments") {
      return collection(data, "treatments").slice(0, 3).map(function (treatment) {
        return {
          title: treatment.name,
          meta: treatment.category
        };
      });
    }

    return [];
  }

  function validate(data) {
    var issues = [];
    var clientsById = byId(collection(data, "clients"));
    var petsById = byId(collection(data, "pets"));
    var appointmentsById = byId(collection(data, "appointments"));

    collection(data, "pets").forEach(function (pet) {
      if (!pet.clientId || !clientsById[pet.clientId]) {
        issues.push("Pet " + pet.id + " has no matching client.");
      }
    });

    collection(data, "appointments").forEach(function (appointment) {
      if (!appointment.petId || !petsById[appointment.petId]) {
        issues.push("Appointment " + appointment.id + " has no matching pet.");
      }

      if (!appointment.clientId || !clientsById[appointment.clientId]) {
        issues.push("Appointment " + appointment.id + " has no matching client.");
      }
    });

    collection(data, "procedures").forEach(function (procedure) {
      if (!procedure.petId || !petsById[procedure.petId]) {
        issues.push("Procedure " + procedure.id + " has no matching pet.");
      }

      if (procedure.appointmentId && !appointmentsById[procedure.appointmentId]) {
        issues.push("Procedure " + procedure.id + " has no matching appointment.");
      }
    });

    return issues;
  }

  window.ZoeVetModels = {
    collection: collection,
    formatAppointmentTime: formatAppointmentTime,
    previewForSection: previewForSection,
    summarize: summarize,
    validate: validate
  };
}());
