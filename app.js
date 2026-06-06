(function () {
  "use strict";

  var SESSION_KEY = "zoes-vet-surgery-session";
  var app = document.getElementById("app");
  var dataApi = window.ZoeVetData;
  var models = window.ZoeVetModels;
  var noticeCounter = 0;
  var focusedNoticeId = null;
  var uiState = {
    clientsQuery: "",
    petsQuery: "",
    clientPanel: "detail",
    selectedClientId: "client-001",
    editingClientId: null,
    petPanel: "detail",
    selectedPetId: "pet-001",
    editingPetId: null,
    appointmentsQuery: "",
    appointmentPanel: "detail",
    selectedAppointmentId: "appt-001",
    editingAppointmentId: null,
    medicationsQuery: "",
    treatmentsQuery: "",
    medicationPanel: "detail",
    selectedMedicationId: "med-001",
    editingMedicationId: null,
    treatmentPanel: "detail",
    selectedTreatmentId: "treat-001",
    editingTreatmentId: null,
    calendarMode: "week",
    calendarDate: dateInputValue(new Date()),
    notice: null,
    invalidFields: []
  };

  var sections = [
    {
      id: "dashboard",
      key: "DB",
      label: "Dashboard",
      title: "Surgery Dashboard",
      intro: "The daily workspace for appointments, urgent cases, and quick actions.",
      emptyTitle: "Seed data is ready for play",
      emptyText: "The surgery now starts with clients, pets, catalogues, and appointments stored in this browser.",
      steps: ["Review today's bookings", "Open urgent cases", "Jump to common tasks"]
    },
    {
      id: "clients",
      key: "CL",
      label: "Clients",
      title: "Clients",
      intro: "Add and manage pet owners who visit the surgery.",
      emptyTitle: "Client records are seeded",
      emptyText: "Phase 3 will add the full add, edit, view, and delete workflows for these owners.",
      steps: ["Create an owner profile", "Link pets to the owner", "Review visit history"]
    },
    {
      id: "pets",
      key: "PT",
      label: "Pets",
      title: "Pets",
      intro: "Track pets, owners, notes, and future procedure history.",
      emptyTitle: "Pet records are linked to owners",
      emptyText: "The data layer now keeps pets attached to their clients for the workflows coming next.",
      steps: ["Choose an owner", "Add pet details", "Open clinical history"]
    },
    {
      id: "appointments",
      key: "AP",
      label: "Appointments",
      title: "Appointments",
      intro: "Book visits and triage pets by reason, time, and severity.",
      emptyTitle: "Appointments are seeded",
      emptyText: "The first appointment cases are ready, with reasons, severities, pets, owners, and times.",
      steps: ["Select a pet", "Set date and severity", "Record consultation notes"]
    },
    {
      id: "medications",
      key: "RX",
      label: "Medications",
      title: "Medication Catalogue",
      intro: "Browse and maintain playful medication records for pretend consultations.",
      emptyTitle: "Fictional medication catalogue is seeded",
      emptyText: "Medication names and usage notes are intentionally playful and not real veterinary advice.",
      steps: ["Browse medicines", "Add usage notes", "Attach to a procedure"]
    },
    {
      id: "treatments",
      key: "TR",
      label: "Treatments",
      title: "Treatment Catalogue",
      intro: "Manage treatment options that can be recorded against pets and appointments.",
      emptyTitle: "Treatment catalogue is seeded",
      emptyText: "Treatments are available as local data and will become editable in Phase 5.",
      steps: ["Browse treatments", "Edit treatment notes", "Record care given"]
    },
    {
      id: "calendar",
      key: "CA",
      label: "Calendar",
      title: "Calendar",
      intro: "Plan upcoming appointments by day, week, and month.",
      emptyTitle: "Appointment dates are ready",
      emptyText: "Seeded appointments now give the calendar real cases to display when the calendar workflow is implemented.",
      steps: ["Switch day view", "Switch week view", "Switch month view"],
      calendar: true
    }
  ];

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      return null;
    }
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      username: username,
      startedAt: new Date().toISOString()
    }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getActiveSection() {
    var hash = window.location.hash.replace("#", "");
    return sections.find(function (section) {
      return section.id === hash;
    }) || sections[0];
  }

  function getData() {
    return dataApi.read();
  }

  function renderLogin() {
    app.className = "app-shell";
    app.innerHTML = [
      '<main class="login-screen">',
      '  <section class="login-stage" aria-labelledby="app-title">',
      '    <div class="brand-block">',
      '      <span class="brand-mark" aria-hidden="true">ZV</span>',
      '      <h1 id="app-title">Zoe\'s Vet Surgery</h1>',
      '      <p>A pretend clinic workspace for booking pets, checking symptoms, and keeping patient notes tidy.</p>',
      "    </div>",
      "  </section>",
      '  <section class="login-panel" aria-labelledby="login-title">',
      '    <form class="login-form" id="login-form">',
      '      <p class="eyebrow">Clinic login</p>',
      '      <h2 id="login-title">Start a session</h2>',
      '      <p class="form-note">Use any username and password for this first phase.</p>',
      '      <div class="field">',
      '        <label for="username">Username</label>',
      '        <input id="username" name="username" autocomplete="username" placeholder="Zoe" required>',
      "      </div>",
      '      <div class="field">',
      '        <label for="password">Password</label>',
      '        <input id="password" name="password" type="password" autocomplete="current-password" placeholder="clinic" required>',
      "      </div>",
      '      <button class="primary-button" type="submit">Log in</button>',
      '      <p class="login-help">This only stores a local play session in this browser.</p>',
      "    </form>",
      "  </section>",
      "</main>"
    ].join("");

    document.getElementById("login-form").addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData(event.currentTarget);
      var username = String(formData.get("username") || "").trim();
      var password = String(formData.get("password") || "").trim();

      if (!username || !password) {
        return;
      }

      setSession(username);
      if (!window.location.hash) {
        window.location.hash = sections[0].id;
      }
      renderApp();
    });
  }

  function restoreFilterFocus(options) {
    if (!options || !options.focusFilter) {
      return;
    }

    var input = app.querySelector('[data-filter="' + options.focusFilter + '"]');

    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });

    if (typeof input.setSelectionRange === "function" && options.selectionStart !== null && options.selectionEnd !== null) {
      try {
        input.setSelectionRange(options.selectionStart, options.selectionEnd);
      } catch (error) {
        // Some search inputs do not support programmatic selection in every browser.
      }
    }
  }

  function renderApp(options) {
    var session = getSession();

    if (!session) {
      renderLogin();
      return;
    }

    var active = getActiveSection();
    var data = getData();
    app.className = "app-shell is-authenticated";
    app.innerHTML = [
      '<div class="workspace">',
      renderSidebar(session, active, data),
      renderTopbar(session, active),
      '  <main class="main-area" id="main-content">',
      renderView(active, data),
      "  </main>",
      "</div>",
      renderDataTransferControl()
    ].join("");

    bindNavigation();
    bindManagement();
    bindLogout();
    bindReset();
    restoreFilterFocus(options);
    focusNotice();
  }

  function focusNotice() {
    var notice = app.querySelector(".notice");

    if (notice && uiState.notice && uiState.notice.id !== focusedNoticeId) {
      notice.focus({ preventScroll: true });
      focusedNoticeId = uiState.notice.id;
    }
  }

  function renderSidebar(session, active, data) {
    var summary = models.summarize(data);
    var issues = models.validate(data);

    return [
      '  <aside class="sidebar" aria-label="Primary navigation">',
      '    <div class="sidebar-brand">',
      '      <span class="brand-mark" aria-hidden="true">ZV</span>',
      "      <div>",
      '        <span class="brand-name">Zoe\'s Vet Surgery</span>',
      '        <span class="session-name">Logged in as ' + escapeHtml(session.username) + "</span>",
      "      </div>",
      "    </div>",
      '    <nav class="nav-list">',
      sections.map(function (section) {
        return renderNavButton(section, active);
      }).join(""),
      "    </nav>",
      '    <div class="data-status">',
      '      <span class="status-dot ' + (issues.length ? "is-warning" : "is-ok") + '" aria-hidden="true"></span>',
      "      <span>" + summary.clients + " clients, " + summary.pets + " pets</span>",
      "    </div>",
      '    <div class="sidebar-footer">',
      '      <button class="secondary-button" type="button" data-action="quick-book">Book appointment</button>',
      '      <button class="ghost-button" type="button" data-action="export-data">Export data</button>',
      '      <button class="ghost-button" type="button" data-action="import-data">Import data</button>',
      '      <button class="ghost-button" type="button" data-action="reset-data">Reset seed data</button>',
      '      <button class="ghost-button" type="button" data-action="logout">Log out</button>',
      "    </div>",
      "  </aside>"
    ].join("");
  }

  function renderTopbar(session, active) {
    return [
      '  <header class="topbar">',
      '    <div class="mobile-brand-row">',
      '      <div class="mobile-brand">',
      "        <strong>Zoe's Vet Surgery</strong>",
      "        <span>" + escapeHtml(session.username) + "</span>",
      "      </div>",
      '      <button class="ghost-button" type="button" data-action="reset-data">Reset data</button>',
      '      <button class="ghost-button" type="button" data-action="logout">Log out</button>',
      "    </div>",
      '    <nav class="mobile-nav" aria-label="Primary navigation">',
      sections.map(function (section) {
        return renderNavButton(section, active);
      }).join(""),
      "    </nav>",
      "  </header>"
    ].join("");
  }

  function renderDataTransferControl() {
    return '<input class="sr-only" id="data-import-file" type="file" accept="application/json,.json" data-import-file tabindex="-1">';
  }

  function renderNavButton(section, active) {
    var current = section.id === active.id ? ' aria-current="page"' : "";
    return [
      '<button class="nav-button" type="button" data-route="' + section.id + '"' + current + ">",
      '  <span class="nav-key" aria-hidden="true">' + section.key + "</span>",
      "  <span>" + section.label + "</span>",
      "</button>"
    ].join("");
  }

  function renderView(section, data) {
    var summary = models.summarize(data);
    var issues = models.validate(data);

    if (section.id === "clients") {
      return renderClientManagementView(section, data, summary, issues);
    }

    if (section.id === "pets") {
      return renderPetManagementView(section, data, summary, issues);
    }

    if (section.id === "appointments") {
      return renderAppointmentManagementView(section, data, summary, issues);
    }

    if (section.id === "medications" || section.id === "treatments") {
      return renderCatalogueManagementView(section, data, summary, issues);
    }

    if (section.id === "dashboard") {
      return renderDashboardView(section, data, summary, issues);
    }

    if (section.id === "calendar") {
      return renderCalendarView(section, data, summary, issues);
    }

    return [
      '<section class="view" aria-labelledby="view-title">',
      '  <header class="view-header">',
      '    <div class="view-title">',
      '      <p class="eyebrow">Phase 2 data layer</p>',
      '      <h2 id="view-title">' + section.title + "</h2>",
      "      <p>" + section.intro + "</p>",
      "    </div>",
      '    <div class="view-actions">',
      renderActions(section),
      "    </div>",
      "  </header>",
      renderSummary(summary, issues),
      '  <div class="empty-layout">',
      '    <div class="empty-copy">',
      "      <h3>" + section.emptyTitle + "</h3>",
      "      <p>" + section.emptyText + "</p>",
      renderSteps(section.steps),
      "    </div>",
      renderPreview(section, data),
      "  </div>",
      "</section>"
    ].join("");
  }

  function renderSummary(summary, issues) {
    return [
      '<dl class="summary-strip" aria-label="Seed data summary">',
      renderMetric("Clients", summary.clients),
      renderMetric("Pets", summary.pets),
      renderMetric("Appointments", summary.appointments),
      renderMetric("Medications", summary.medications),
      renderMetric("Treatments", summary.treatments),
      renderMetric("Validation", issues.length ? issues.length + " issues" : "OK"),
      "</dl>"
    ].join("");
  }

  function renderMetric(label, value) {
    return [
      '<div class="summary-metric">',
      "  <dt>" + label + "</dt>",
      "  <dd>" + value + "</dd>",
      "</div>"
    ].join("");
  }

  function renderActions(section) {
    if (section.id === "calendar") {
      return [
        renderCalendarModeButton("day"),
        renderCalendarModeButton("week"),
        renderCalendarModeButton("month")
      ].join("");
    }

    if (section.id === "dashboard") {
      return [
        '<button class="secondary-button" type="button" data-route="appointments">Appointments</button>',
        '<button class="ghost-button" type="button" data-route="clients">Clients</button>'
      ].join("");
    }

    if (section.id === "clients") {
      return [
        '<button class="secondary-button" type="button" data-action="add-client">Add client</button>',
        '<button class="ghost-button" type="button" data-action="reset-data">Reset data</button>'
      ].join("");
    }

    if (section.id === "pets") {
      return [
        '<button class="secondary-button" type="button" data-action="add-pet">Add pet</button>',
        '<button class="ghost-button" type="button" data-action="reset-data">Reset data</button>'
      ].join("");
    }

    if (section.id === "appointments") {
      return [
        '<button class="secondary-button" type="button" data-action="add-appointment">Book appointment</button>',
        '<button class="ghost-button" type="button" data-action="generate-appointment">Generate case</button>'
      ].join("");
    }

    if (section.id === "medications") {
      return [
        '<button class="secondary-button" type="button" data-action="add-medication">Add medication</button>',
        '<button class="ghost-button" type="button" data-action="reset-data">Reset data</button>'
      ].join("");
    }

    if (section.id === "treatments") {
      return [
        '<button class="secondary-button" type="button" data-action="add-treatment">Add treatment</button>',
        '<button class="ghost-button" type="button" data-action="reset-data">Reset data</button>'
      ].join("");
    }

    return [
      '<button class="secondary-button" type="button">Add new</button>',
      '<button class="ghost-button" type="button">Search</button>'
    ].join("");
  }

  function renderClientManagementView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderSummary(summary, issues),
      renderNotice(),
      renderClientWorkspace(data),
      "</section>"
    ].join("");
  }

  function renderPetManagementView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderSummary(summary, issues),
      renderNotice(),
      renderPetWorkspace(data),
      "</section>"
    ].join("");
  }

  function renderAppointmentManagementView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderSummary(summary, issues),
      renderNotice(),
      renderAppointmentWorkspace(data),
      "</section>"
    ].join("");
  }

  function renderCatalogueManagementView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderSummary(summary, issues),
      renderNotice(),
      renderCatalogueWorkspace(data, section.id),
      "</section>"
    ].join("");
  }

  function renderDashboardView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderDashboardSummary(data, summary, issues),
      renderNotice(),
      renderDashboardWorkspace(data),
      "</section>"
    ].join("");
  }

  function renderCalendarView(section, data, summary, issues) {
    return [
      '<section class="view" aria-labelledby="view-title">',
      renderViewHeader(section),
      renderSummary(summary, issues),
      renderNotice(),
      renderCalendarWorkspace(data),
      "</section>"
    ].join("");
  }

  function renderViewHeader(section) {
    var eyebrow = "Phase 3 records";

    if (section.id === "dashboard" || section.id === "calendar") {
      eyebrow = "Phase 6 planning";
    }

    if (section.id === "appointments") {
      eyebrow = "Phase 4 appointments";
    }

    if (section.id === "medications" || section.id === "treatments") {
      eyebrow = "Phase 5 catalogues";
    }

    return [
      '  <header class="view-header">',
      '    <div class="view-title">',
      '      <p class="eyebrow">' + eyebrow + "</p>",
      '      <h2 id="view-title">' + section.title + "</h2>",
      "      <p>" + section.intro + "</p>",
      "    </div>",
      '    <div class="view-actions">',
      renderActions(section),
      "    </div>",
      "  </header>"
    ].join("");
  }

  function renderNotice() {
    if (!uiState.notice) {
      return "";
    }

    return [
      '<p class="notice notice-' + uiState.notice.type + '" role="alert" tabindex="-1">',
      escapeHtml(uiState.notice.message),
      "</p>"
    ].join("");
  }

  function renderDashboardSummary(data, summary, issues) {
    var appointments = buildAppointmentItems(data);
    var today = startOfDay(new Date());
    var treatedToday = appointments.filter(function (item) {
      return isSameDay(new Date(item.appointment.startsAt), today) && item.appointment.status === "treated";
    }).length;
    var openToday = appointments.filter(function (item) {
      return isSameDay(new Date(item.appointment.startsAt), today) && item.appointment.status !== "treated";
    }).length;

    return [
      '<dl class="summary-strip dashboard-summary" aria-label="Dashboard summary">',
      renderMetric("Today", summary.todaysAppointments),
      renderMetric("Open today", openToday),
      renderMetric("Treated today", treatedToday),
      renderMetric("Urgent", summary.urgentAppointments),
      renderMetric("Procedures", summary.procedures),
      renderMetric("Validation", issues.length ? issues.length + " issues" : "OK"),
      "</dl>"
    ].join("");
  }

  function renderDashboardWorkspace(data) {
    var appointments = buildAppointmentItems(data);
    var today = startOfDay(new Date());
    var todaysAppointments = appointments.filter(function (item) {
      return isSameDay(new Date(item.appointment.startsAt), today);
    });
    var urgentAppointments = appointments.filter(function (item) {
      return item.appointment.severity === "high" || item.appointment.status === "follow-up needed";
    }).slice(0, 5);
    var upcomingAppointments = appointments.filter(function (item) {
      return new Date(item.appointment.startsAt) >= today;
    }).slice(0, 5);

    return [
      '<div class="dashboard-layout">',
      '  <section class="dashboard-primary" aria-label="Today at the surgery">',
      '    <div class="section-heading">',
      "      <div>",
      '        <p class="eyebrow">Today</p>',
      "        <h3>Appointment Queue</h3>",
      "      </div>",
      '      <button class="secondary-button" type="button" data-route="appointments">Open appointments</button>',
      "    </div>",
      renderDashboardAppointmentList(todaysAppointments, "No appointments booked for today."),
      "  </section>",
      '  <aside class="dashboard-side" aria-label="Dashboard supporting panels">',
      renderUrgentPanel(urgentAppointments),
      renderRecentPatientsPanel(data),
      renderQuickActionsPanel(upcomingAppointments),
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderDashboardAppointmentList(items, emptyText) {
    if (!items.length) {
      return '<p class="empty-note">' + escapeHtml(emptyText) + "</p>";
    }

    return [
      '<div class="worklist">',
      items.map(renderAppointmentWorkItem).join(""),
      "</div>"
    ].join("");
  }

  function renderUrgentPanel(items) {
    return [
      '<section class="dashboard-panel">',
      '  <div class="section-heading compact-heading">',
      "    <div>",
      '      <p class="eyebrow">Priority</p>',
      "      <h3>Urgent Cases</h3>",
      "    </div>",
      "  </div>",
      renderDashboardAppointmentList(items, "No urgent or follow-up cases."),
      "</section>"
    ].join("");
  }

  function renderRecentPatientsPanel(data) {
    var recent = recentPatientItems(data);

    return [
      '<section class="dashboard-panel">',
      '  <div class="section-heading compact-heading">',
      "    <div>",
      '      <p class="eyebrow">Recent</p>',
      "      <h3>Patients</h3>",
      "    </div>",
      "  </div>",
      recent.length ? [
        '<div class="recent-patient-list">',
        recent.map(function (item) {
          return [
            '<button class="recent-patient" type="button" data-action="open-pet-from-client" data-id="' + item.pet.id + '">',
            "  <strong>" + escapeHtml(item.pet.name) + "</strong>",
            "  <span>" + escapeHtml(item.meta) + "</span>",
            "</button>"
          ].join("");
        }).join(""),
        "</div>"
      ].join("") : '<p class="empty-note">No recent patient activity yet.</p>',
      "</section>"
    ].join("");
  }

  function renderQuickActionsPanel(upcomingAppointments) {
    return [
      '<section class="dashboard-panel">',
      '  <div class="section-heading compact-heading">',
      "    <div>",
      '      <p class="eyebrow">Next</p>',
      "      <h3>Play Loop</h3>",
      "    </div>",
      "  </div>",
      '<div class="quick-action-list">',
      '  <button class="quick-action" type="button" data-action="add-appointment">',
      "    <strong>Book a visit</strong>",
      "    <span>Add a new appointment for any patient.</span>",
      "  </button>",
      '  <button class="quick-action" type="button" data-action="generate-appointment">',
      "    <strong>Generate a case</strong>",
      "    <span>Create a new triage story for play.</span>",
      "  </button>",
      '  <button class="quick-action" type="button" data-route="calendar">',
      "    <strong>Plan the week</strong>",
      "    <span>" + upcomingAppointments.length + " upcoming appointment" + (upcomingAppointments.length === 1 ? "" : "s") + " in view.</span>",
      "  </button>",
      "</div>",
      "</section>"
    ].join("");
  }

  function renderAppointmentWorkItem(item) {
    var appointment = item.appointment;
    var petName = item.pet ? item.pet.name : "Missing pet";
    var clientName = item.client ? item.client.name : "Missing owner";

    return [
      '<article class="work-item">',
      '  <button class="work-main" type="button" data-action="open-appointment-from-calendar" data-id="' + appointment.id + '">',
      "    <strong>" + escapeHtml(models.formatAppointmentTime(appointment.startsAt)) + " · " + escapeHtml(petName) + "</strong>",
      "    <span>" + escapeHtml(clientName) + " · " + escapeHtml(appointment.reason) + "</span>",
      "  </button>",
      '  <div class="work-badges">',
      renderBadge(appointment.severity, "severity"),
      renderBadge(appointment.status, "status"),
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderCalendarWorkspace(data) {
    var appointments = buildAppointmentItems(data);
    var anchor = getCalendarAnchor();
    var range = getCalendarRange(anchor, uiState.calendarMode);
    var visibleAppointments = appointments.filter(function (item) {
      var date = new Date(item.appointment.startsAt);
      return date >= range.start && date < range.end;
    });

    return [
      '<div class="calendar-workspace">',
      '  <div class="calendar-toolbar">',
      "    <div>",
      '      <p class="eyebrow">' + escapeHtml(titleCase(uiState.calendarMode)) + " View</p>",
      "      <h3>" + escapeHtml(formatCalendarRange(range, uiState.calendarMode)) + "</h3>",
      "    </div>",
      '    <div class="calendar-nav">',
      '      <button class="ghost-button" type="button" data-action="calendar-prev">Previous</button>',
      '      <button class="secondary-button" type="button" data-action="calendar-today">Today</button>',
      '      <button class="ghost-button" type="button" data-action="calendar-next">Next</button>',
      "    </div>",
      "  </div>",
      uiState.calendarMode === "month" ? renderMonthCalendar(appointments, anchor) : renderAgendaCalendar(visibleAppointments, range, uiState.calendarMode),
      "</div>"
    ].join("");
  }

  function renderAgendaCalendar(items, range, mode) {
    var days = daysInRange(range.start, range.end);

    return [
      '<div class="agenda-calendar agenda-mode-' + mode + '">',
      days.map(function (day) {
        var dayItems = items.filter(function (item) {
          return isSameDay(new Date(item.appointment.startsAt), day);
        });

        return [
          '<section class="agenda-day">',
          '  <div class="agenda-day-head">',
          "    <strong>" + escapeHtml(formatWeekday(day)) + "</strong>",
          "    <span>" + escapeHtml(formatDateOnly(day.toISOString())) + "</span>",
          "  </div>",
          dayItems.length ? dayItems.map(renderCalendarEntry).join("") : '<p class="empty-note">No appointments.</p>',
          "</section>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderMonthCalendar(items, anchor) {
    var monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var gridStart = startOfWeek(monthStart);
    var cells = [];

    for (var index = 0; index < 42; index += 1) {
      cells.push(addDays(gridStart, index));
    }

    return [
      '<div class="month-calendar" aria-label="Month appointment calendar">',
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (day) {
        return '<div class="month-weekday">' + day + "</div>";
      }).join(""),
      cells.map(function (day) {
        var dayItems = items.filter(function (item) {
          return isSameDay(new Date(item.appointment.startsAt), day);
        });
        var outside = day.getMonth() === anchor.getMonth() ? "" : " is-outside";
        var today = isSameDay(day, new Date()) ? " is-today" : "";

        return [
          '<section class="month-cell' + outside + today + '">',
          '  <div class="month-date">',
          "    <strong>" + day.getDate() + "</strong>",
          "    <span>" + dayItems.length + "</span>",
          "  </div>",
          dayItems.slice(0, 3).map(renderCalendarEntry).join(""),
          dayItems.length > 3 ? '<p class="more-count">+' + String(dayItems.length - 3) + " more</p>" : "",
          "</section>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderCalendarEntry(item) {
    var appointment = item.appointment;
    var petName = item.pet ? item.pet.name : "Missing pet";
    var time = timeInputValue(new Date(appointment.startsAt));

    return [
      '<button class="calendar-entry severity-border-' + escapeHtml(appointment.severity) + '" type="button" data-action="open-appointment-from-calendar" data-id="' + appointment.id + '">',
      "  <strong>" + escapeHtml(time) + " · " + escapeHtml(petName) + "</strong>",
      "  <span>" + escapeHtml(appointment.reason) + "</span>",
      "</button>"
    ].join("");
  }

  function renderCalendarModeButton(mode) {
    var active = uiState.calendarMode === mode ? " is-active" : "";
    return '<button class="secondary-button mode-button' + active + '" type="button" data-action="set-calendar-mode" data-mode="' + mode + '">' + titleCase(mode) + "</button>";
  }

  function renderClientWorkspace(data) {
    var clients = models.collection(data, "clients");
    var filteredClients = filterItems(clients, uiState.clientsQuery, ["name", "phone", "email", "address"]);
    var selectedClient = clients.find(function (client) {
      return client.id === uiState.selectedClientId;
    }) || filteredClients[0] || clients[0] || null;

    if (selectedClient && uiState.clientPanel === "detail") {
      uiState.selectedClientId = selectedClient.id;
    }

    return [
      '<div class="records-layout">',
      '  <section class="records-pane" aria-label="Client list">',
      renderSearch("clients", "Search clients", uiState.clientsQuery),
      renderClientList(data, filteredClients),
      "  </section>",
      '  <aside class="records-inspector" aria-label="Client details">',
      uiState.clientPanel === "form" ? renderClientForm(selectedClient) : renderClientDetail(data, selectedClient),
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderPetWorkspace(data) {
    var pets = models.collection(data, "pets");
    var filteredPets = filterItems(pets, uiState.petsQuery, ["name", "species", "description"]);
    var selectedPet = pets.find(function (pet) {
      return pet.id === uiState.selectedPetId;
    }) || filteredPets[0] || pets[0] || null;

    if (selectedPet && uiState.petPanel === "detail") {
      uiState.selectedPetId = selectedPet.id;
    }

    return [
      '<div class="records-layout">',
      '  <section class="records-pane" aria-label="Pet list">',
      renderSearch("pets", "Search pets", uiState.petsQuery),
      renderPetList(data, filteredPets),
      "  </section>",
      '  <aside class="records-inspector" aria-label="Pet details">',
      uiState.petPanel === "form" ? renderPetForm(data, selectedPet) : renderPetDetail(data, selectedPet),
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderAppointmentWorkspace(data) {
    var enriched = buildAppointmentItems(data);
    var appointments = enriched.map(function (item) {
      return item.appointment;
    });
    var filteredAppointments = filterAppointments(enriched, uiState.appointmentsQuery);
    var selectedAppointment = appointments.find(function (appointment) {
      return appointment.id === uiState.selectedAppointmentId;
    }) || (filteredAppointments[0] && filteredAppointments[0].appointment) || appointments[0] || null;

    if (selectedAppointment && uiState.appointmentPanel === "detail") {
      uiState.selectedAppointmentId = selectedAppointment.id;
    }

    return [
      '<div class="records-layout">',
      '  <section class="records-pane" aria-label="Appointment list">',
      renderSearch("appointments", "Search appointments", uiState.appointmentsQuery),
      renderAppointmentList(filteredAppointments),
      "  </section>",
      '  <aside class="records-inspector" aria-label="Appointment details">',
      uiState.appointmentPanel === "form" ? renderAppointmentForm(data, selectedAppointment) : renderAppointmentDetail(data, selectedAppointment),
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderCatalogueWorkspace(data, catalogueType) {
    var collectionName = catalogueType;
    var actionPrefix = catalogueType === "medications" ? "medication" : "treatment";
    var items = models.collection(data, collectionName);
    var query = catalogueType === "medications" ? uiState.medicationsQuery : uiState.treatmentsQuery;
    var panel = catalogueType === "medications" ? uiState.medicationPanel : uiState.treatmentPanel;
    var selectedId = catalogueType === "medications" ? uiState.selectedMedicationId : uiState.selectedTreatmentId;
    var filteredItems = filterItems(items, query, ["name", "category", "usageNotes"]);
    var selectedItem = items.find(function (item) {
      return item.id === selectedId;
    }) || filteredItems[0] || items[0] || null;

    if (selectedItem && panel === "detail") {
      if (catalogueType === "medications") {
        uiState.selectedMedicationId = selectedItem.id;
      } else {
        uiState.selectedTreatmentId = selectedItem.id;
      }
    }

    return [
      '<div class="records-layout">',
      '  <section class="records-pane" aria-label="' + actionPrefix + ' list">',
      renderSearch(catalogueType, "Search " + catalogueType, query),
      renderCatalogueList(filteredItems, actionPrefix, selectedItem),
      "  </section>",
      '  <aside class="records-inspector" aria-label="' + actionPrefix + ' details">',
      panel === "form" ? renderCatalogueForm(actionPrefix, selectedItem) : renderCatalogueDetail(data, actionPrefix, selectedItem),
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderSearch(kind, label, value) {
    return [
      '<label class="search-field">',
      '  <span>' + label + "</span>",
      '  <input type="search" value="' + escapeHtml(value) + '" data-filter="' + kind + '" placeholder="' + label + '">',
      "</label>"
    ].join("");
  }

  function renderClientList(data, clients) {
    if (!clients.length) {
      return '<p class="empty-note">No clients match this search.</p>';
    }

    return [
      '<div class="record-list">',
      clients.map(function (client) {
        var pets = models.collection(data, "pets").filter(function (pet) {
          return pet.clientId === client.id;
        });
        var selected = client.id === uiState.selectedClientId ? " is-selected" : "";

        return [
          '<article class="record-row' + selected + '">',
          '  <button class="record-main" type="button" data-action="view-client" data-id="' + client.id + '">',
          "    <strong>" + escapeHtml(client.name) + "</strong>",
          "    <span>" + pets.length + " pet" + (pets.length === 1 ? "" : "s") + " · " + escapeHtml(client.phone) + "</span>",
          "  </button>",
          '  <div class="record-actions">',
          '    <button class="ghost-button compact-button" type="button" data-action="edit-client" data-id="' + client.id + '">Edit</button>',
          '    <button class="ghost-button compact-button danger-button" type="button" data-action="delete-client" data-id="' + client.id + '">Delete</button>',
          "  </div>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderPetList(data, pets) {
    if (!pets.length) {
      return '<p class="empty-note">No pets match this search.</p>';
    }

    return [
      '<div class="record-list">',
      pets.map(function (pet) {
        var owner = findById(models.collection(data, "clients"), pet.clientId);
        var selected = pet.id === uiState.selectedPetId ? " is-selected" : "";

        return [
          '<article class="record-row' + selected + '">',
          '  <button class="record-main" type="button" data-action="view-pet" data-id="' + pet.id + '">',
          "    <strong>" + escapeHtml(pet.name) + " the " + escapeHtml(pet.species) + "</strong>",
          "    <span>" + escapeHtml(owner ? owner.name : "Owner missing") + " · " + escapeHtml(pet.description) + "</span>",
          "  </button>",
          '  <div class="record-actions">',
          '    <button class="ghost-button compact-button" type="button" data-action="edit-pet" data-id="' + pet.id + '">Edit</button>',
          '    <button class="ghost-button compact-button danger-button" type="button" data-action="delete-pet" data-id="' + pet.id + '">Delete</button>',
          "  </div>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderAppointmentList(items) {
    if (!items.length) {
      return '<p class="empty-note">No appointments match this search.</p>';
    }

    return [
      '<div class="record-list">',
      items.map(function (item) {
        var appointment = item.appointment;
        var petName = item.pet ? item.pet.name : "Missing pet";
        var clientName = item.client ? item.client.name : "Missing client";
        var selected = appointment.id === uiState.selectedAppointmentId ? " is-selected" : "";

        return [
          '<article class="record-row' + selected + '">',
          '  <button class="record-main" type="button" data-action="view-appointment" data-id="' + appointment.id + '">',
          "    <strong>" + escapeHtml(models.formatAppointmentTime(appointment.startsAt)) + " · " + escapeHtml(petName) + "</strong>",
          "    <span>" + escapeHtml(clientName) + " · " + escapeHtml(appointment.reason) + "</span>",
          "  </button>",
          '  <div class="record-actions">',
          renderBadge(appointment.severity, "severity"),
          renderBadge(appointment.status, "status"),
          '    <button class="ghost-button compact-button" type="button" data-action="edit-appointment" data-id="' + appointment.id + '">Edit</button>',
          "  </div>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderCatalogueList(items, actionPrefix, selectedItem) {
    if (!items.length) {
      return '<p class="empty-note">No catalogue items match this search.</p>';
    }

    return [
      '<div class="record-list">',
      items.map(function (item) {
        var selected = selectedItem && item.id === selectedItem.id ? " is-selected" : "";

        return [
          '<article class="record-row' + selected + '">',
          '  <button class="record-main" type="button" data-action="view-' + actionPrefix + '" data-id="' + item.id + '">',
          "    <strong>" + escapeHtml(item.name) + "</strong>",
          "    <span>" + escapeHtml(item.category) + " · " + escapeHtml(item.usageNotes) + "</span>",
          "  </button>",
          '  <div class="record-actions">',
          '    <button class="ghost-button compact-button" type="button" data-action="edit-' + actionPrefix + '" data-id="' + item.id + '">Edit</button>',
          '    <button class="ghost-button compact-button danger-button" type="button" data-action="delete-' + actionPrefix + '" data-id="' + item.id + '">Delete</button>',
          "  </div>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderClientDetail(data, client) {
    if (!client) {
      return '<p class="empty-note">Add a client to start building the surgery records.</p>';
    }

    var pets = models.collection(data, "pets").filter(function (pet) {
      return pet.clientId === client.id;
    });
    var appointments = models.collection(data, "appointments").filter(function (appointment) {
      return appointment.clientId === client.id;
    });

    return [
      '<div class="inspector-header">',
      "  <div>",
      "    <p class=\"eyebrow\">Client detail</p>",
      "    <h3>" + escapeHtml(client.name) + "</h3>",
      "  </div>",
      '  <button class="secondary-button" type="button" data-action="edit-client" data-id="' + client.id + '">Edit</button>',
      "</div>",
      '<dl class="detail-grid">',
      renderDetail("Phone", client.phone),
      renderDetail("Email", client.email),
      renderDetail("Address", client.address),
      renderDetail("Pets", String(pets.length)),
      "</dl>",
      '<h4>Pets</h4>',
      renderLinkedPets(pets),
      '<h4>Appointment History</h4>',
      renderAppointmentHistory(data, appointments)
    ].join("");
  }

  function renderPetDetail(data, pet) {
    if (!pet) {
      return '<p class="empty-note">Add a pet to start building patient records.</p>';
    }

    var owner = findById(models.collection(data, "clients"), pet.clientId);
    var appointments = models.collection(data, "appointments").filter(function (appointment) {
      return appointment.petId === pet.id;
    });
    var procedures = models.collection(data, "procedures").filter(function (procedure) {
      return procedure.petId === pet.id;
    });

    return [
      '<div class="inspector-header">',
      "  <div>",
      "    <p class=\"eyebrow\">Pet detail</p>",
      "    <h3>" + escapeHtml(pet.name) + "</h3>",
      "  </div>",
      '  <button class="secondary-button" type="button" data-action="edit-pet" data-id="' + pet.id + '">Edit</button>',
      "</div>",
      '<dl class="detail-grid">',
      renderDetail("Species", pet.species),
      renderDetail("Description", pet.description),
      renderDetail("Age", pet.age + " year" + (Number(pet.age) === 1 ? "" : "s")),
      renderDetail("Owner", owner ? owner.name : "Owner missing"),
      renderDetail("Procedures", String(procedures.length)),
      "</dl>",
      '<h4>Appointment History</h4>',
      renderAppointmentHistory(data, appointments),
      '<h4>Record Procedure</h4>',
      renderProcedureForm(data, pet, null),
      '<h4>Notes And Procedures</h4>',
      procedures.length ? renderProcedureHistory(procedures) : '<p class="empty-note">No procedures recorded yet.</p>'
    ].join("");
  }

  function renderAppointmentDetail(data, appointment) {
    if (!appointment) {
      return '<p class="empty-note">Book an appointment to start the clinic queue.</p>';
    }

    var pet = findById(models.collection(data, "pets"), appointment.petId);
    var client = findById(models.collection(data, "clients"), appointment.clientId);
    var notes = Array.isArray(appointment.notes) ? appointment.notes : [];

    return [
      '<div class="inspector-header">',
      "  <div>",
      '    <p class="eyebrow">Appointment detail</p>',
      "    <h3>" + escapeHtml(pet ? pet.name : "Missing pet") + "</h3>",
      "  </div>",
      '  <button class="secondary-button" type="button" data-action="edit-appointment" data-id="' + appointment.id + '">Edit</button>',
      "</div>",
      '<dl class="detail-grid">',
      renderDetail("When", models.formatAppointmentTime(appointment.startsAt)),
      renderDetail("Owner", client ? client.name : "Missing owner"),
      renderDetail("Severity", appointment.severity),
      renderDetail("Status", appointment.status),
      renderDetail("Reason", appointment.reason),
      renderDetail("Notes", String(notes.length)),
      "</dl>",
      '<h4>Status</h4>',
      renderStatusControls(appointment),
      '<h4>Procedure</h4>',
      renderProcedureForm(data, pet, appointment),
      '<h4>Procedure History</h4>',
      renderAppointmentProcedureHistory(data, appointment),
      '<h4>Consultation Notes</h4>',
      renderNotes(notes),
      renderNoteForm()
    ].join("");
  }

  function renderCatalogueDetail(data, actionPrefix, item) {
    if (!item) {
      return '<p class="empty-note">Add a catalogue item to start building the reference list.</p>';
    }

    var procedures = models.collection(data, "procedures").filter(function (procedure) {
      return procedure.itemKind === actionPrefix && procedure.itemId === item.id;
    });

    return [
      '<div class="inspector-header">',
      "  <div>",
      '    <p class="eyebrow">' + titleCase(actionPrefix) + " detail</p>",
      "    <h3>" + escapeHtml(item.name) + "</h3>",
      "  </div>",
      '  <button class="secondary-button" type="button" data-action="edit-' + actionPrefix + '" data-id="' + item.id + '">Edit</button>',
      "</div>",
      '<dl class="detail-grid">',
      renderDetail("Category", item.category),
      renderDetail("Used in procedures", String(procedures.length)),
      renderDetail("Usage notes", item.usageNotes),
      "</dl>",
      '<h4>Procedure References</h4>',
      procedures.length ? renderProcedureHistory(procedures) : '<p class="empty-note">No procedures reference this item yet.</p>'
    ].join("");
  }

  function renderCatalogueForm(actionPrefix, item) {
    var isMedication = actionPrefix === "medication";
    var editingId = isMedication ? uiState.editingMedicationId : uiState.editingTreatmentId;
    var isEditing = Boolean(editingId && item);
    var record = isEditing ? item : { name: "", category: "", usageNotes: "" };

    return [
      '<form class="record-form" data-form="' + actionPrefix + '" novalidate>',
      '  <div class="inspector-header">',
      "    <div>",
      '      <p class="eyebrow">' + (isEditing ? "Edit " + actionPrefix : "New " + actionPrefix) + "</p>",
      "      <h3>" + (isEditing ? escapeHtml(record.name) : "Add " + actionPrefix) + "</h3>",
      "    </div>",
      '    <button class="ghost-button" type="button" data-action="cancel-' + actionPrefix + '-form">Cancel</button>',
      "  </div>",
      renderInput(actionPrefix + "-name", "Name", "name", record.name, "text", true),
      renderInput(actionPrefix + "-category", "Category", "category", record.category, "text", true),
      renderTextarea(actionPrefix + "-usage", "Usage notes", "usageNotes", record.usageNotes, true),
      '<button class="primary-button form-submit" type="submit">' + (isEditing ? "Save " + actionPrefix : "Create " + actionPrefix) + "</button>",
      "</form>"
    ].join("");
  }

  function renderAppointmentForm(data, appointment) {
    var isEditing = Boolean(uiState.editingAppointmentId && appointment);
    var pets = models.collection(data, "pets");
    var firstPet = pets[0] || null;
    var startsAt = isEditing ? new Date(appointment.startsAt) : new Date();
    var record = isEditing ? appointment : {
      petId: firstPet ? firstPet.id : "",
      startsAt: startsAt.toISOString(),
      reason: "",
      severity: "medium",
      status: "booked"
    };

    return [
      '<form class="record-form" data-form="appointment" novalidate>',
      '  <div class="inspector-header">',
      "    <div>",
      '      <p class="eyebrow">' + (isEditing ? "Edit appointment" : "New appointment") + "</p>",
      "      <h3>" + (isEditing ? "Update booking" : "Book appointment") + "</h3>",
      "    </div>",
      '    <button class="ghost-button" type="button" data-action="cancel-appointment-form">Cancel</button>',
      "  </div>",
      renderPetAppointmentSelect(data, record.petId),
      renderInput("appointment-date", "Date", "date", dateInputValue(startsAt), "date", true),
      renderInput("appointment-time", "Time", "time", timeInputValue(startsAt), "time", true),
      renderTextarea("appointment-reason", "Reason", "reason", record.reason, true),
      renderOptionSelect("appointment-severity", "Severity", "severity", ["low", "medium", "high"], record.severity),
      renderOptionSelect("appointment-status", "Status", "status", ["booked", "in progress", "treated", "follow-up needed"], record.status),
      '<button class="primary-button form-submit" type="submit">' + (isEditing ? "Save appointment" : "Book appointment") + "</button>",
      "</form>"
    ].join("");
  }

  function renderClientForm(client) {
    var isEditing = Boolean(uiState.editingClientId && client);
    var record = isEditing ? client : { name: "", phone: "", email: "", address: "" };

    return [
      '<form class="record-form" data-form="client" novalidate>',
      '  <div class="inspector-header">',
      "    <div>",
      '      <p class="eyebrow">' + (isEditing ? "Edit client" : "New client") + "</p>",
      "      <h3>" + (isEditing ? escapeHtml(record.name) : "Add client") + "</h3>",
      "    </div>",
      '    <button class="ghost-button" type="button" data-action="cancel-client-form">Cancel</button>',
      "  </div>",
      renderInput("client-name", "Name", "name", record.name, "text", true),
      renderInput("client-phone", "Phone", "phone", record.phone, "tel", true),
      renderInput("client-email", "Email", "email", record.email, "email", true),
      renderInput("client-address", "Address", "address", record.address, "text", true),
      '<button class="primary-button form-submit" type="submit">' + (isEditing ? "Save client" : "Create client") + "</button>",
      "</form>"
    ].join("");
  }

  function renderPetForm(data, pet) {
    var isEditing = Boolean(uiState.editingPetId && pet);
    var clients = models.collection(data, "clients");
    var record = isEditing ? pet : {
      name: "",
      clientId: uiState.selectedClientId || (clients[0] && clients[0].id) || "",
      species: "",
      description: "",
      age: 1
    };

    return [
      '<form class="record-form" data-form="pet" novalidate>',
      '  <div class="inspector-header">',
      "    <div>",
      '      <p class="eyebrow">' + (isEditing ? "Edit pet" : "New pet") + "</p>",
      "      <h3>" + (isEditing ? escapeHtml(record.name) : "Add pet") + "</h3>",
      "    </div>",
      '    <button class="ghost-button" type="button" data-action="cancel-pet-form">Cancel</button>',
      "  </div>",
      renderInput("pet-name", "Name", "name", record.name, "text", true),
      renderSelect("pet-owner", "Owner", "clientId", clients, record.clientId),
      renderInput("pet-species", "Species", "species", record.species, "text", true),
      renderInput("pet-description", "Breed or description", "description", record.description, "text", true),
      renderInput("pet-age", "Age", "age", record.age, "number", true),
      '<button class="primary-button form-submit" type="submit">' + (isEditing ? "Save pet" : "Create pet") + "</button>",
      "</form>"
    ].join("");
  }

  function renderInput(id, label, name, value, type, required) {
    var invalid = isFieldInvalid(id);

    return [
      '<label class="field" for="' + id + '">',
      "  <span>" + label + "</span>",
      '  <input id="' + id + '" name="' + name + '" type="' + type + '" value="' + escapeHtml(value) + '"' + (required ? " required" : "") + renderInvalidAttributes(id, invalid) + ">",
      invalid ? renderFieldError(id, label) : "",
      "</label>"
    ].join("");
  }

  function renderSelect(id, label, name, options, value) {
    var invalid = isFieldInvalid(id);

    return [
      '<label class="field" for="' + id + '">',
      "  <span>" + label + "</span>",
      '  <select id="' + id + '" name="' + name + '" required' + renderInvalidAttributes(id, invalid) + ">",
      options.map(function (option) {
        var selected = option.id === value ? " selected" : "";
        return '<option value="' + option.id + '"' + selected + ">" + escapeHtml(option.name) + "</option>";
      }).join(""),
      "  </select>",
      invalid ? renderFieldError(id, label) : "",
      "</label>"
    ].join("");
  }

  function renderPetAppointmentSelect(data, value) {
    var pets = models.collection(data, "pets");
    var clients = models.collection(data, "clients");

    return [
      '<label class="field" for="appointment-pet">',
      "  <span>Pet</span>",
      '  <select id="appointment-pet" name="petId" required' + renderInvalidAttributes("appointment-pet", isFieldInvalid("appointment-pet")) + ">",
      pets.map(function (pet) {
        var client = findById(clients, pet.clientId);
        var selected = pet.id === value ? " selected" : "";
        return '<option value="' + pet.id + '"' + selected + ">" + escapeHtml(pet.name + " - " + (client ? client.name : "Missing owner")) + "</option>";
      }).join(""),
      "  </select>",
      isFieldInvalid("appointment-pet") ? renderFieldError("appointment-pet", "Pet") : "",
      "</label>"
    ].join("");
  }

  function renderOptionSelect(id, label, name, options, value) {
    var invalid = isFieldInvalid(id);

    return [
      '<label class="field" for="' + id + '">',
      "  <span>" + label + "</span>",
      '  <select id="' + id + '" name="' + name + '" required' + renderInvalidAttributes(id, invalid) + ">",
      options.map(function (option) {
        var selected = option === value ? " selected" : "";
        return '<option value="' + option + '"' + selected + ">" + escapeHtml(titleCase(option)) + "</option>";
      }).join(""),
      "  </select>",
      invalid ? renderFieldError(id, label) : "",
      "</label>"
    ].join("");
  }

  function renderTextarea(id, label, name, value, required) {
    var invalid = isFieldInvalid(id);

    return [
      '<label class="field" for="' + id + '">',
      "  <span>" + label + "</span>",
      '  <textarea id="' + id + '" name="' + name + '"' + (required ? " required" : "") + renderInvalidAttributes(id, invalid) + ">" + escapeHtml(value || "") + "</textarea>",
      invalid ? renderFieldError(id, label) : "",
      "</label>"
    ].join("");
  }

  function isFieldInvalid(id) {
    return uiState.notice && uiState.notice.type === "error" && uiState.invalidFields.indexOf(id) !== -1;
  }

  function renderInvalidAttributes(id, invalid) {
    return invalid ? ' aria-invalid="true" aria-describedby="' + id + '-error"' : "";
  }

  function renderFieldError(id, label) {
    return '<span class="field-error" id="' + id + '-error">' + escapeHtml(label) + " is required.</span>";
  }

  function renderDetail(label, value) {
    return [
      "<div>",
      "  <dt>" + label + "</dt>",
      "  <dd>" + escapeHtml(value || "Not set") + "</dd>",
      "</div>"
    ].join("");
  }

  function renderLinkedPets(pets) {
    if (!pets.length) {
      return '<p class="empty-note">No pets are linked to this client yet.</p>';
    }

    return [
      '<div class="linked-list">',
      pets.map(function (pet) {
        return [
          '<button class="linked-item" type="button" data-action="open-pet-from-client" data-id="' + pet.id + '">',
          "  <strong>" + escapeHtml(pet.name) + "</strong>",
          "  <span>" + escapeHtml(pet.species) + "</span>",
          "</button>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderAppointmentHistory(data, appointments) {
    if (!appointments.length) {
      return '<p class="empty-note">No appointments recorded yet.</p>';
    }

    return [
      '<div class="history-list">',
      appointments.map(function (appointment) {
        var pet = findById(models.collection(data, "pets"), appointment.petId);
        return [
          '<div class="history-item">',
          "  <strong>" + escapeHtml(models.formatAppointmentTime(appointment.startsAt)) + "</strong>",
          "  <span>" + escapeHtml(pet ? pet.name + ": " + appointment.reason : appointment.reason) + "</span>",
          "</div>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderProcedureHistory(procedures) {
    return [
      '<div class="history-list">',
      procedures.map(function (procedure) {
        return [
          '<div class="history-item">',
          "  <strong>" + escapeHtml(titleCase(procedure.type || "Procedure")) + " · " + escapeHtml(formatDateOnly(procedure.performedAt)) + "</strong>",
          "  <span>" + escapeHtml(procedure.itemName || "No catalogue item") + " · " + escapeHtml(procedure.notes || "No notes") + "</span>",
          "</div>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderAppointmentProcedureHistory(data, appointment) {
    var procedures = models.collection(data, "procedures").filter(function (procedure) {
      return procedure.appointmentId === appointment.id;
    });

    if (!procedures.length) {
      return '<p class="empty-note">No procedures recorded for this appointment yet.</p>';
    }

    return renderProcedureHistory(procedures);
  }

  function renderProcedureForm(data, pet, appointment) {
    if (!pet) {
      return '<p class="empty-note">Choose a pet before recording a procedure.</p>';
    }

    var idSuffix = appointment ? "appointment" : "pet";
    var today = dateInputValue(new Date());

    return [
      '<form class="record-form procedure-form" data-form="procedure" novalidate>',
      '  <input type="hidden" name="petId" value="' + escapeHtml(pet.id) + '">',
      appointment ? '  <input type="hidden" name="appointmentId" value="' + escapeHtml(appointment.id) + '">' : "",
      renderOptionSelect("procedure-type-" + idSuffix, "Procedure type", "type", ["checkup", "operation", "medication", "treatment"], "checkup"),
      renderCatalogueChoice(data),
      renderInput("procedure-date-" + idSuffix, "Date", "performedAt", today, "date", true),
      renderTextarea("procedure-notes-" + idSuffix, "Notes", "notes", "", true),
      '<button class="primary-button form-submit" type="submit">Record procedure</button>',
      "</form>"
    ].join("");
  }

  function renderCatalogueChoice(data) {
    var medications = models.collection(data, "medications");
    var treatments = models.collection(data, "treatments");

    return [
      '<label class="field" for="procedure-item">',
      "  <span>Catalogue item</span>",
      '  <select id="procedure-item" name="catalogueRef">',
      '    <option value="">None</option>',
      medications.map(function (item) {
        return '<option value="medication:' + item.id + '">' + escapeHtml("Medication - " + item.name) + "</option>";
      }).join(""),
      treatments.map(function (item) {
        return '<option value="treatment:' + item.id + '">' + escapeHtml("Treatment - " + item.name) + "</option>";
      }).join(""),
      "  </select>",
      "</label>"
    ].join("");
  }

  function renderStatusControls(appointment) {
    var statuses = ["booked", "in progress", "treated", "follow-up needed"];

    return [
      '<div class="status-actions">',
      statuses.map(function (status) {
        var active = appointment.status === status ? " is-active" : "";
        return '<button class="status-button' + active + '" type="button" data-action="set-appointment-status" data-id="' + appointment.id + '" data-status="' + status + '">' + escapeHtml(titleCase(status)) + "</button>";
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderNotes(notes) {
    if (!notes.length) {
      return '<p class="empty-note">No consultation notes recorded yet.</p>';
    }

    return [
      '<div class="note-list">',
      notes.map(function (note) {
        return [
          '<article class="note-item">',
          "  <strong>" + escapeHtml(models.formatAppointmentTime(note.createdAt)) + "</strong>",
          renderNoteLine("Symptoms", note.symptoms),
          renderNoteLine("Diagnosis", note.diagnosis),
          renderNoteLine("Checkup", note.checkup),
          renderNoteLine("Vet notes", note.vetNotes),
          renderNoteLine("Follow-up", note.followUp),
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderNoteLine(label, value) {
    if (!value) {
      return "";
    }

    return "<p><span>" + label + ":</span> " + escapeHtml(value) + "</p>";
  }

  function renderNoteForm() {
    return [
      '<form class="record-form note-form" data-form="appointment-note" novalidate>',
      renderTextarea("note-symptoms", "Symptoms", "symptoms", "", true),
      renderTextarea("note-diagnosis", "Diagnosis", "diagnosis", "", true),
      renderTextarea("note-checkup", "Basic checkup", "checkup", "", true),
      renderTextarea("note-vet-notes", "Vet notes", "vetNotes", "", false),
      renderTextarea("note-follow-up", "Follow-up", "followUp", "", false),
      '<button class="primary-button form-submit" type="submit">Save consultation note</button>',
      "</form>"
    ].join("");
  }

  function renderSteps(steps) {
    return [
      '<ol class="empty-steps">',
      steps.map(function (step, index) {
        return [
          "<li>",
          '  <span class="step-number">' + String(index + 1) + "</span>",
          "  <span>" + step + "</span>",
          "</li>"
        ].join("");
      }).join(""),
      "</ol>"
    ].join("");
  }

  function renderPreview(section, data) {
    var previewItems = models.previewForSection(data, section.id);

    if (section.calendar) {
      return [
        '<aside class="preview-panel" aria-label="Calendar preview">',
        '  <div class="preview-head">',
        "    <strong>Month preview</strong>",
        '    <span class="status-dot" aria-hidden="true"></span>',
        "  </div>",
        '  <div class="calendar-grid" aria-hidden="true">',
        renderCalendarCells(data),
        "  </div>",
        "</aside>"
      ].join("");
    }

    return [
      '<aside class="preview-panel" aria-label="' + section.title + ' preview">',
      '  <div class="preview-head">',
      "    <strong>Seed preview</strong>",
      '    <span class="status-dot is-ok" aria-hidden="true"></span>',
      "  </div>",
      '  <div class="preview-list">',
      previewItems.map(function (item) {
        return [
          '    <div class="preview-item">',
          "      <strong>" + escapeHtml(item.title) + "</strong>",
          "      <span>" + escapeHtml(item.meta) + "</span>",
          "    </div>"
        ].join("");
      }).join(""),
      "  </div>",
      "</aside>"
    ].join("");
  }

  function renderCalendarCells(data) {
    var appointmentsByDay = models.collection(data, "appointments").reduce(function (index, appointment) {
      var day = new Date(appointment.startsAt).getDate();
      index[day] = true;
      return index;
    }, {});
    var cells = [];

    for (var index = 1; index <= 21; index += 1) {
      cells.push([
        '<div class="calendar-cell">',
        "<strong>" + index + "</strong>",
        appointmentsByDay[index] ? '<span class="calendar-pill"></span>' : "",
        "</div>"
      ].join(""));
    }

    return cells.join("");
  }

  function bindNavigation() {
    app.querySelectorAll("[data-route]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.location.hash = button.getAttribute("data-route");
      });
    });

    var quickBook = app.querySelector('[data-action="quick-book"]');
    if (quickBook) {
      quickBook.addEventListener("click", function () {
        window.location.hash = "appointments";
      });
    }
  }

  function bindManagement() {
    app.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        handleRecordAction(button.getAttribute("data-action"), button.getAttribute("data-id"), button);
      });
    });

    app.querySelectorAll("[data-filter]").forEach(function (input) {
      input.addEventListener("input", function () {
        var filter = input.getAttribute("data-filter");
        var selectionStart = input.selectionStart;
        var selectionEnd = input.selectionEnd;

        if (filter === "clients") {
          uiState.clientsQuery = input.value;
        } else if (filter === "pets") {
          uiState.petsQuery = input.value;
        } else if (filter === "appointments") {
          uiState.appointmentsQuery = input.value;
        } else if (filter === "medications") {
          uiState.medicationsQuery = input.value;
        } else if (filter === "treatments") {
          uiState.treatmentsQuery = input.value;
        }

        renderApp({
          focusFilter: filter,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd
        });
      });
    });

    var clientForm = app.querySelector('[data-form="client"]');
    if (clientForm) {
      clientForm.addEventListener("submit", saveClient);
    }

    var petForm = app.querySelector('[data-form="pet"]');
    if (petForm) {
      petForm.addEventListener("submit", savePet);
    }

    var appointmentForm = app.querySelector('[data-form="appointment"]');
    if (appointmentForm) {
      appointmentForm.addEventListener("submit", saveAppointment);
    }

    var appointmentNoteForm = app.querySelector('[data-form="appointment-note"]');
    if (appointmentNoteForm) {
      appointmentNoteForm.addEventListener("submit", saveAppointmentNote);
    }

    var medicationForm = app.querySelector('[data-form="medication"]');
    if (medicationForm) {
      medicationForm.addEventListener("submit", saveCatalogueItem);
    }

    var treatmentForm = app.querySelector('[data-form="treatment"]');
    if (treatmentForm) {
      treatmentForm.addEventListener("submit", saveCatalogueItem);
    }

    app.querySelectorAll('[data-form="procedure"]').forEach(function (procedureForm) {
      procedureForm.addEventListener("submit", saveProcedure);
    });

    var importFile = app.querySelector("[data-import-file]");
    if (importFile) {
      importFile.addEventListener("change", importDataFromFile);
    }
  }

  function handleRecordAction(action, id, button) {
    if (action === "add-client") {
      uiState.clientPanel = "form";
      uiState.editingClientId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "view-client") {
      uiState.clientPanel = "detail";
      uiState.selectedClientId = id;
      uiState.editingClientId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "edit-client") {
      uiState.clientPanel = "form";
      uiState.selectedClientId = id;
      uiState.editingClientId = id;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "cancel-client-form") {
      uiState.clientPanel = "detail";
      uiState.editingClientId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "delete-client") {
      deleteClient(id);
      return;
    }

    if (action === "add-pet") {
      uiState.petPanel = "form";
      uiState.editingPetId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "view-pet") {
      uiState.petPanel = "detail";
      uiState.selectedPetId = id;
      uiState.editingPetId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "edit-pet") {
      uiState.petPanel = "form";
      uiState.selectedPetId = id;
      uiState.editingPetId = id;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "cancel-pet-form") {
      uiState.petPanel = "detail";
      uiState.editingPetId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "delete-pet") {
      deletePet(id);
      return;
    }

    if (action === "open-pet-from-client") {
      uiState.selectedPetId = id;
      uiState.petPanel = "detail";
      uiState.notice = null;
      window.location.hash = "pets";
      return;
    }

    if (action === "add-appointment") {
      uiState.appointmentPanel = "form";
      uiState.editingAppointmentId = null;
      uiState.notice = null;
      if (getActiveSection().id === "appointments") {
        renderApp();
      } else {
        window.location.hash = "appointments";
      }
      return;
    }

    if (action === "view-appointment") {
      uiState.appointmentPanel = "detail";
      uiState.selectedAppointmentId = id;
      uiState.editingAppointmentId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "edit-appointment") {
      uiState.appointmentPanel = "form";
      uiState.selectedAppointmentId = id;
      uiState.editingAppointmentId = id;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "cancel-appointment-form") {
      uiState.appointmentPanel = "detail";
      uiState.editingAppointmentId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "set-appointment-status") {
      setAppointmentStatus(id, button ? button.getAttribute("data-status") : null);
      return;
    }

    if (action === "generate-appointment") {
      generateAppointment();
      return;
    }

    if (action === "open-appointment-from-calendar") {
      uiState.appointmentPanel = "detail";
      uiState.selectedAppointmentId = id;
      uiState.editingAppointmentId = null;
      uiState.notice = null;
      window.location.hash = "appointments";
      return;
    }

    if (action === "set-calendar-mode") {
      uiState.calendarMode = button ? button.getAttribute("data-mode") || "week" : "week";
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "calendar-prev" || action === "calendar-next") {
      moveCalendar(action === "calendar-next" ? 1 : -1);
      return;
    }

    if (action === "calendar-today") {
      uiState.calendarDate = dateInputValue(new Date());
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "export-data") {
      exportData();
      return;
    }

    if (action === "import-data") {
      var importFile = app.querySelector("[data-import-file]");
      if (importFile) {
        importFile.click();
      }
      return;
    }

    if (action === "add-medication") {
      uiState.medicationPanel = "form";
      uiState.editingMedicationId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "view-medication") {
      uiState.medicationPanel = "detail";
      uiState.selectedMedicationId = id;
      uiState.editingMedicationId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "edit-medication") {
      uiState.medicationPanel = "form";
      uiState.selectedMedicationId = id;
      uiState.editingMedicationId = id;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "cancel-medication-form") {
      uiState.medicationPanel = "detail";
      uiState.editingMedicationId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "delete-medication") {
      deleteCatalogueItem("medication", id);
      return;
    }

    if (action === "add-treatment") {
      uiState.treatmentPanel = "form";
      uiState.editingTreatmentId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "view-treatment") {
      uiState.treatmentPanel = "detail";
      uiState.selectedTreatmentId = id;
      uiState.editingTreatmentId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "edit-treatment") {
      uiState.treatmentPanel = "form";
      uiState.selectedTreatmentId = id;
      uiState.editingTreatmentId = id;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "cancel-treatment-form") {
      uiState.treatmentPanel = "detail";
      uiState.editingTreatmentId = null;
      uiState.notice = null;
      renderApp();
      return;
    }

    if (action === "delete-treatment") {
      deleteCatalogueItem("treatment", id);
    }
  }

  function bindLogout() {
    app.querySelectorAll('[data-action="logout"]').forEach(function (button) {
      button.addEventListener("click", function () {
        clearSession();
        window.location.hash = "";
        renderLogin();
      });
    });
  }

  function bindReset() {
    app.querySelectorAll('[data-action="reset-data"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var confirmed = window.confirm("Reset clients, pets, appointments, medications, and treatments to the seeded data?");

        if (!confirmed) {
          return;
        }

        dataApi.reset();
        renderApp();
      });
    });
  }

  function saveClient(event) {
    event.preventDefault();

    var formData = new FormData(event.currentTarget);
    var record = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim()
    };

    if (!record.name || !record.phone || !record.email || !record.address) {
      setNotice("error", "Please complete every client field.", ["client-name", "client-phone", "client-email", "client-address"]);
      renderApp();
      return;
    }

    dataApi.update(function (data) {
      if (uiState.editingClientId) {
        var existing = findById(data.clients, uiState.editingClientId);
        if (existing) {
          Object.assign(existing, record);
        }
      } else {
        record.id = nextId("client", data.clients);
        data.clients.push(record);
        uiState.selectedClientId = record.id;
      }
    });

    uiState.clientPanel = "detail";
    uiState.editingClientId = null;
    setNotice("success", "Client saved.");
    renderApp();
  }

  function savePet(event) {
    event.preventDefault();

    var formData = new FormData(event.currentTarget);
    var age = Number(formData.get("age"));
    var record = {
      name: String(formData.get("name") || "").trim(),
      clientId: String(formData.get("clientId") || "").trim(),
      species: String(formData.get("species") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      age: Number.isFinite(age) && age > 0 ? age : 1
    };

    if (!record.name || !record.clientId || !record.species || !record.description) {
      setNotice("error", "Please complete every pet field.", ["pet-name", "pet-owner", "pet-species", "pet-description"]);
      renderApp();
      return;
    }

    dataApi.update(function (data) {
      if (uiState.editingPetId) {
        var existing = findById(data.pets, uiState.editingPetId);
        if (existing) {
          Object.assign(existing, record);
        }
      } else {
        record.id = nextId("pet", data.pets);
        data.pets.push(record);
        uiState.selectedPetId = record.id;
      }
    });

    uiState.petPanel = "detail";
    uiState.editingPetId = null;
    setNotice("success", "Pet saved.");
    renderApp();
  }

  function saveAppointment(event) {
    event.preventDefault();

    var formData = new FormData(event.currentTarget);
    var petId = String(formData.get("petId") || "").trim();
    var date = String(formData.get("date") || "").trim();
    var time = String(formData.get("time") || "").trim();
    var reason = String(formData.get("reason") || "").trim();
    var severity = String(formData.get("severity") || "medium").trim();
    var status = String(formData.get("status") || "booked").trim();
    var data = dataApi.read();
    var pet = findById(data.pets, petId);

    if (!pet || !date || !time || !reason) {
      setNotice("error", "Please choose a pet, date, time, and appointment reason.", ["appointment-pet", "appointment-date", "appointment-time", "appointment-reason"]);
      renderApp();
      return;
    }

    var startsAt = localDateTime(date, time);
    var record = {
      petId: petId,
      clientId: pet.clientId,
      startsAt: startsAt.toISOString(),
      reason: reason,
      severity: severity,
      status: status
    };

    dataApi.update(function (nextData) {
      if (uiState.editingAppointmentId) {
        var existing = findById(nextData.appointments, uiState.editingAppointmentId);
        if (existing) {
          Object.assign(existing, record);
          existing.notes = Array.isArray(existing.notes) ? existing.notes : [];
        }
      } else {
        record.id = nextId("appt", nextData.appointments);
        record.notes = [];
        nextData.appointments.push(record);
        uiState.selectedAppointmentId = record.id;
      }
    });

    uiState.appointmentPanel = "detail";
    uiState.editingAppointmentId = null;
    setNotice("success", "Appointment saved.");
    renderApp();
  }

  function saveAppointmentNote(event) {
    event.preventDefault();

    var appointmentId = uiState.selectedAppointmentId;
    var formData = new FormData(event.currentTarget);
    var note = {
      symptoms: String(formData.get("symptoms") || "").trim(),
      diagnosis: String(formData.get("diagnosis") || "").trim(),
      checkup: String(formData.get("checkup") || "").trim(),
      vetNotes: String(formData.get("vetNotes") || "").trim(),
      followUp: String(formData.get("followUp") || "").trim()
    };

    if (!note.symptoms || !note.diagnosis || !note.checkup) {
      setNotice("error", "Please record symptoms, diagnosis, and basic checkup results.", ["note-symptoms", "note-diagnosis", "note-checkup"]);
      renderApp();
      return;
    }

    dataApi.update(function (data) {
      var appointment = findById(data.appointments, appointmentId);
      if (!appointment) {
        return;
      }

      appointment.notes = Array.isArray(appointment.notes) ? appointment.notes : [];
      note.id = nextId("note", appointment.notes);
      note.createdAt = new Date().toISOString();
      appointment.notes.push(note);
    });

    setNotice("success", "Consultation note saved.");
    renderApp();
  }

  function setAppointmentStatus(id, status) {
    if (!id || !status) {
      return;
    }

    dataApi.update(function (data) {
      var appointment = findById(data.appointments, id);
      if (appointment) {
        appointment.status = status;
      }
    });

    setNotice("success", "Appointment marked " + status + ".");
    renderApp();
  }

  function generateAppointment() {
    var caseTemplates = [
      { reason: "has a sore paw after jumping from the sofa.", severity: "medium" },
      { reason: "has been quiet and needs a gentle check.", severity: "low" },
      { reason: "is not eating breakfast and seems tired.", severity: "high" },
      { reason: "needs a tooth peek after chewing a toy.", severity: "low" },
      { reason: "has a scratch that needs cleaning.", severity: "medium" },
      { reason: "is moving slowly and needs triage.", severity: "high" }
    ];

    dataApi.update(function (data) {
      var pets = data.pets;
      if (!pets.length) {
        return;
      }

      var template = caseTemplates[data.appointments.length % caseTemplates.length];
      var pet = pets[(data.appointments.length * 5) % pets.length];
      var startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + (data.appointments.length % 9) + 1);
      startsAt.setHours(9 + (data.appointments.length % 7), data.appointments.length % 2 ? 30 : 0, 0, 0);

      var appointment = {
        id: nextId("appt", data.appointments),
        petId: pet.id,
        clientId: pet.clientId,
        startsAt: startsAt.toISOString(),
        reason: pet.name + " " + template.reason,
        severity: template.severity,
        status: "booked",
        notes: []
      };

      data.appointments.push(appointment);
      uiState.selectedAppointmentId = appointment.id;
    });

    uiState.appointmentPanel = "detail";
    setNotice("success", "Generated a new appointment case.");
    renderApp();
  }

  function saveCatalogueItem(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var actionPrefix = form.getAttribute("data-form");
    var isMedication = actionPrefix === "medication";
    var collectionName = isMedication ? "medications" : "treatments";
    var editingId = isMedication ? uiState.editingMedicationId : uiState.editingTreatmentId;
    var formData = new FormData(form);
    var record = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      usageNotes: String(formData.get("usageNotes") || "").trim()
    };

    if (!record.name || !record.category || !record.usageNotes) {
      setNotice("error", "Please complete every catalogue field.", [actionPrefix + "-name", actionPrefix + "-category", actionPrefix + "-usage"]);
      renderApp();
      return;
    }

    dataApi.update(function (data) {
      if (editingId) {
        var existing = findById(data[collectionName], editingId);
        if (existing) {
          Object.assign(existing, record);
        }
      } else {
        record.id = nextId(isMedication ? "med" : "treat", data[collectionName]);
        data[collectionName].push(record);

        if (isMedication) {
          uiState.selectedMedicationId = record.id;
        } else {
          uiState.selectedTreatmentId = record.id;
        }
      }
    });

    if (isMedication) {
      uiState.medicationPanel = "detail";
      uiState.editingMedicationId = null;
    } else {
      uiState.treatmentPanel = "detail";
      uiState.editingTreatmentId = null;
    }

    setNotice("success", titleCase(actionPrefix) + " saved.");
    renderApp();
  }

  function saveProcedure(event) {
    event.preventDefault();

    var formData = new FormData(event.currentTarget);
    var petId = String(formData.get("petId") || "").trim();
    var appointmentId = String(formData.get("appointmentId") || "").trim();
    var type = String(formData.get("type") || "").trim();
    var performedAt = String(formData.get("performedAt") || "").trim();
    var notes = String(formData.get("notes") || "").trim();
    var catalogueRef = String(formData.get("catalogueRef") || "").trim();
    var catalogueParts = catalogueRef ? catalogueRef.split(":") : [];

    if (!petId || !type || !performedAt || !notes) {
      setNotice("error", "Please choose a procedure type, date, and notes.", [
        "procedure-type-" + (appointmentId ? "appointment" : "pet"),
        "procedure-date-" + (appointmentId ? "appointment" : "pet"),
        "procedure-notes-" + (appointmentId ? "appointment" : "pet")
      ]);
      renderApp();
      return;
    }

    dataApi.update(function (data) {
      var itemKind = catalogueParts[0] || "";
      var itemId = catalogueParts[1] || "";
      var collectionName = itemKind === "medication" ? "medications" : itemKind === "treatment" ? "treatments" : "";
      var item = collectionName ? findById(data[collectionName], itemId) : null;
      var procedure = {
        id: nextId("proc", data.procedures),
        petId: petId,
        appointmentId: appointmentId || "",
        type: type,
        itemKind: itemKind,
        itemId: itemId,
        itemName: item ? item.name : "No catalogue item",
        performedAt: localDateTime(performedAt, "12:00").toISOString(),
        notes: notes
      };

      data.procedures.push(procedure);
    });

    setNotice("success", "Procedure recorded.");
    renderApp();
  }

  function deleteCatalogueItem(actionPrefix, id) {
    var isMedication = actionPrefix === "medication";
    var collectionName = isMedication ? "medications" : "treatments";
    var data = dataApi.read();
    var item = findById(data[collectionName], id);

    if (!item) {
      return;
    }

    if (!window.confirm("Delete " + item.name + " from the " + actionPrefix + " catalogue? Existing procedure history will keep its saved name.")) {
      return;
    }

    dataApi.update(function (nextData) {
      nextData[collectionName] = nextData[collectionName].filter(function (entry) {
        return entry.id !== id;
      });
    });

    if (isMedication) {
      uiState.selectedMedicationId = null;
    } else {
      uiState.selectedTreatmentId = null;
    }

    setNotice("success", titleCase(actionPrefix) + " deleted.");
    renderApp();
  }

  function deleteClient(id) {
    var data = dataApi.read();
    var client = findById(data.clients, id);

    if (!client) {
      return;
    }

    var pets = data.pets.filter(function (pet) {
      return pet.clientId === id;
    });
    var appointments = data.appointments.filter(function (appointment) {
      return appointment.clientId === id;
    });

    if (pets.length || appointments.length) {
      setNotice("error", client.name + " cannot be deleted while linked to " + pets.length + " pet(s) and " + appointments.length + " appointment(s).");
      renderApp();
      return;
    }

    if (!window.confirm("Delete " + client.name + " from the client list?")) {
      return;
    }

    dataApi.update(function (nextData) {
      nextData.clients = nextData.clients.filter(function (item) {
        return item.id !== id;
      });
    });

    uiState.selectedClientId = null;
    setNotice("success", "Client deleted.");
    renderApp();
  }

  function deletePet(id) {
    var data = dataApi.read();
    var pet = findById(data.pets, id);

    if (!pet) {
      return;
    }

    var appointments = data.appointments.filter(function (appointment) {
      return appointment.petId === id;
    });

    if (appointments.length) {
      setNotice("error", pet.name + " cannot be deleted while linked to " + appointments.length + " appointment(s).");
      renderApp();
      return;
    }

    if (!window.confirm("Delete " + pet.name + " from the pet list?")) {
      return;
    }

    dataApi.update(function (nextData) {
      nextData.pets = nextData.pets.filter(function (item) {
        return item.id !== id;
      });
    });

    uiState.selectedPetId = null;
    setNotice("success", "Pet deleted.");
    renderApp();
  }

  function exportData() {
    var payload = {
      app: "zoes-vet-surgery",
      exportedAt: new Date().toISOString(),
      data: dataApi.read()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = "zoes-vet-surgery-" + dateInputValue(new Date()) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("success", "Play data exported.");
    renderApp();
  }

  function importDataFromFile(event) {
    var input = event.currentTarget;
    var file = input.files && input.files[0];

    if (!file) {
      return;
    }

    var reader = new FileReader();

    reader.addEventListener("load", function () {
      try {
        var payload = JSON.parse(String(reader.result || "{}"));
        var data = normalizeImportedData(payload);
        var issues = models.validate(data);

        if (issues.length) {
          setNotice("error", "Import blocked: " + issues[0]);
          renderApp();
          return;
        }

        if (!window.confirm("Importing this file will replace the current local play data. Continue?")) {
          input.value = "";
          return;
        }

        dataApi.write(data);
        setNotice("success", "Play data imported.");
        renderApp();
      } catch (error) {
        setNotice("error", "Import blocked: choose a valid Zoe's Vet Surgery JSON file.");
        renderApp();
      } finally {
        input.value = "";
      }
    });

    reader.readAsText(file);
  }

  function normalizeImportedData(payload) {
    var data = payload && payload.data ? payload.data : payload;
    var collections = ["clients", "pets", "appointments", "medications", "treatments", "procedures"];

    if (!data || data.version !== window.ZoeVetSeed.version) {
      throw new Error("Unsupported data version.");
    }

    collections.forEach(function (name) {
      if (!Array.isArray(data[name])) {
        throw new Error("Missing " + name + " collection.");
      }
    });

    return JSON.parse(JSON.stringify(data));
  }

  function buildAppointmentItems(data) {
    var pets = models.collection(data, "pets");
    var clients = models.collection(data, "clients");

    return models.collection(data, "appointments").slice().sort(function (a, b) {
      return new Date(a.startsAt) - new Date(b.startsAt);
    }).map(function (appointment) {
      return {
        appointment: appointment,
        pet: findById(pets, appointment.petId),
        client: findById(clients, appointment.clientId)
      };
    });
  }

  function recentPatientItems(data) {
    var pets = models.collection(data, "pets");
    var clients = models.collection(data, "clients");
    var activity = [];

    models.collection(data, "appointments").forEach(function (appointment) {
      activity.push({
        petId: appointment.petId,
        at: appointment.startsAt,
        label: "Appointment"
      });
    });

    models.collection(data, "procedures").forEach(function (procedure) {
      activity.push({
        petId: procedure.petId,
        at: procedure.performedAt,
        label: titleCase(procedure.type || "Procedure")
      });
    });

    return activity.sort(function (a, b) {
      return new Date(b.at) - new Date(a.at);
    }).reduce(function (items, entry) {
      if (items.some(function (item) {
        return item.pet.id === entry.petId;
      })) {
        return items;
      }

      var pet = findById(pets, entry.petId);
      var client = pet ? findById(clients, pet.clientId) : null;

      if (pet) {
        items.push({
          pet: pet,
          meta: entry.label + " · " + formatDateOnly(entry.at) + (client ? " · " + client.name : "")
        });
      }

      return items;
    }, []).slice(0, 5);
  }

  function getCalendarAnchor() {
    var anchor = localDateTime(uiState.calendarDate || dateInputValue(new Date()), "12:00");

    if (Number.isNaN(anchor.getTime())) {
      return new Date();
    }

    return anchor;
  }

  function getCalendarRange(anchor, mode) {
    if (mode === "day") {
      return {
        start: startOfDay(anchor),
        end: addDays(startOfDay(anchor), 1)
      };
    }

    if (mode === "month") {
      return {
        start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
        end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
      };
    }

    var weekStart = startOfWeek(anchor);

    return {
      start: weekStart,
      end: addDays(weekStart, 7)
    };
  }

  function moveCalendar(direction) {
    var anchor = getCalendarAnchor();
    var next;

    if (uiState.calendarMode === "day") {
      next = addDays(anchor, direction);
    } else if (uiState.calendarMode === "month") {
      next = new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
    } else {
      next = addDays(anchor, direction * 7);
    }

    uiState.calendarDate = dateInputValue(next);
    uiState.notice = null;
    renderApp();
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function startOfWeek(date) {
    var start = startOfDay(date);
    var day = start.getDay();
    var offset = day === 0 ? -6 : 1 - day;
    return addDays(start, offset);
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function daysInRange(start, end) {
    var days = [];
    var current = startOfDay(start);

    while (current < end) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  }

  function isSameDay(first, second) {
    return first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate();
  }

  function formatWeekday(date) {
    return date.toLocaleDateString([], {
      weekday: "short"
    });
  }

  function formatCalendarRange(range, mode) {
    if (mode === "day") {
      return range.start.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    if (mode === "month") {
      return range.start.toLocaleDateString([], {
        month: "long",
        year: "numeric"
      });
    }

    return formatDateOnly(range.start.toISOString()) + " - " + formatDateOnly(addDays(range.end, -1).toISOString());
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function filterItems(items, query, fields) {
    var normalQuery = String(query || "").trim().toLowerCase();

    if (!normalQuery) {
      return items;
    }

    return items.filter(function (item) {
      return fields.some(function (field) {
        return String(item[field] || "").toLowerCase().includes(normalQuery);
      });
    });
  }

  function filterAppointments(items, query) {
    var normalQuery = String(query || "").trim().toLowerCase();

    if (!normalQuery) {
      return items;
    }

    return items.filter(function (item) {
      var appointment = item.appointment;
      var petName = item.pet ? item.pet.name : "";
      var clientName = item.client ? item.client.name : "";
      var haystack = [
        appointment.reason,
        appointment.severity,
        appointment.status,
        petName,
        clientName,
        models.formatAppointmentTime(appointment.startsAt)
      ].join(" ").toLowerCase();

      return haystack.includes(normalQuery);
    });
  }

  function renderBadge(value, type) {
    return '<span class="record-badge ' + type + '-' + String(value).replace(/\s+/g, "-") + '">' + escapeHtml(titleCase(value)) + "</span>";
  }

  function titleCase(value) {
    return String(value || "").replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function dateInputValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function timeInputValue(date) {
    return [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join(":");
  }

  function formatDateOnly(value) {
    var date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date not set";
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function localDateTime(date, time) {
    var dateParts = date.split("-").map(Number);
    var timeParts = time.split(":").map(Number);
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1] || 0, 0, 0);
  }

  function findById(items, id) {
    return items.find(function (item) {
      return item.id === id;
    }) || null;
  }

  function nextId(prefix, items) {
    var matcher = new RegExp("^" + prefix + "-(\\d+)$");
    var max = items.reduce(function (highest, item) {
      var match = matcher.exec(item.id);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    return prefix + "-" + String(max + 1).padStart(3, "0");
  }

  function setNotice(type, message, invalidFields) {
    noticeCounter += 1;
    uiState.notice = { id: noticeCounter, type: type, message: message };
    uiState.invalidFields = invalidFields || [];
  }

  window.addEventListener("hashchange", renderApp);
  renderApp();
}());
