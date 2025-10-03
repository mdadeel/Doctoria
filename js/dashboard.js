// Dashboard for patient, doctor, admin
(function(){
  function fmtDate(ts){
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function el(html){
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  function renderPatient(){
    const container = document.getElementById('dashboard-root');
    if (!container) return;

    const user = DOCTORIA_AUTH.getCurrentUser();
    const doctors = DOCTORIA_AUTH.listDoctors();
    const appts = DOCTORIA_AUTH.listMyAppointments();

    container.innerHTML = '';
    const total = appts.length;
    const pending = appts.filter(a=>a.status==='pending').length;
    const accepted = appts.filter(a=>a.status==='accepted').length;
    const rejected = appts.filter(a=>a.status==='rejected').length;

    container.appendChild(el(`<section>
      <h2>Welcome, ${user.name}</h2>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total</div></div>
        <div class="stat-card"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>
        <div class="stat-card"><div class="stat-value">${accepted}</div><div class="stat-label">Accepted</div></div>
        <div class="stat-card"><div class="stat-value">${rejected}</div><div class="stat-label">Rejected</div></div>
      </div>
      <h3>Book a new appointment</h3>
      <div class="doctor-grid" id="patient-doctor-grid"></div>
    </section>`));

    const grid = document.getElementById('patient-doctor-grid');
    doctors.forEach((d) => {
      grid.appendChild(el(`
        <div class="doctor-card">
          <div class="doctor-info">
            <span class="doctor-status">Available</span>
            <h3 class="doctor-name">${d.name}</h3>
            <p class="doctor-specialty">${d.specialty || ''}</p>
            <div style="display:flex; gap:.5rem; margin-top:.5rem;">
              <button class="btn-primary" data-doctor-id="${d.id}" data-doctor-name="${d.name}">Book</button>
              <button class="btn-primary" style="background:#4A5FE8" data-view="${d.id}">View</button>
            </div>
          </div>
        </div>`));
    });

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-doctor-id]');
      const view = e.target.closest('button[data-view]');
      if (btn){
        const id = btn.getAttribute('data-doctor-id');
        const name = btn.getAttribute('data-doctor-name');
        const url = new URL(window.location.origin + window.location.pathname.replace('patient-dashboard.html','appointment.html'));
        url.searchParams.set('doctorId', id);
        url.searchParams.set('doctorName', name);
        window.location.href = url.toString();
      }
      if (view){
        const id = view.getAttribute('data-view');
        const url = new URL(window.location.origin + window.location.pathname.replace('patient-dashboard.html','doctor.html'));
        url.searchParams.set('doctorId', id);
        window.location.href = url.toString();
      }
    });

    container.appendChild(el('<section><h2>My Appointments</h2><div id="my-appts"></div></section>'));
    const apptDiv = document.getElementById('my-appts');
    if (!appts.length){
      apptDiv.textContent = 'No appointments yet.';
    } else {
      appts.sort((a,b)=>b.createdAt-a.createdAt).forEach(a => {
        apptDiv.appendChild(el(`<div class="doctor-card" style="padding:1rem;">
          <div class="doctor-info">
            <strong>${a.doctorName}</strong>
            <p>${a.date} at ${a.time} (${a.mode})</p>
            <p>Status: <span class="doctor-status" style="background:${a.status==='accepted'?'#10B981':a.status==='rejected'?'#ef4444':'#f59e0b'}">${a.status}</span></p>
            <small>Requested: ${fmtDate(a.createdAt)}</small>
            ${a.status==='pending' ? `<div style=\"margin-top:.5rem;\"><button class=\"btn-primary\" style=\"background:#ef4444\" data-cancel=\"${a.id}\">Cancel</button></div>` : ''}
          </div>
        </div>`));
      });
      apptDiv.addEventListener('click', (e) => {
        const c = e.target.closest('button[data-cancel]');
        if (!c) return;
        const id = c.getAttribute('data-cancel');
        const all = JSON.parse(localStorage.getItem(DOCTORIA_AUTH.KEYS.appointments) || '[]');
        const idx = all.findIndex(x => x.id === id);
        if (idx !== -1){ all.splice(idx,1); localStorage.setItem(DOCTORIA_AUTH.KEYS.appointments, JSON.stringify(all)); location.reload(); }
      });
    }
  }

  function renderDoctor(){
    const container = document.getElementById('dashboard-root');
    if (!container) return;

    const user = DOCTORIA_AUTH.getCurrentUser();
    const appts = DOCTORIA_AUTH.listMyAppointments();

    container.innerHTML = `<h2>Welcome, ${user.name}</h2><p>Manage your appointment requests:</p>`;
    if (!appts.length){
      container.appendChild(el('<p>No appointment requests yet.</p>'));
      return;
    }

    appts.sort((a,b)=>b.createdAt-a.createdAt).forEach(a => {
      const card = el(`<div class="doctor-card" style="padding:1rem;">
        <div class="doctor-info">
          <strong>${a.patientName}</strong>
          <p>${a.date} at ${a.time} (${a.mode})</p>
          <p>Status: <span class="doctor-status">${a.status}</span></p>
          <div style="display:flex; gap:.5rem; margin-top:.5rem;">
            ${a.status==='accepted' ? '' : `<button class="btn-primary" data-accept="${a.id}">Accept</button>`}
            ${a.status==='rejected' ? '' : `<button class="btn-primary" style="background:#ef4444" data-reject="${a.id}">Reject</button>`}
          </div>
        </div>
      </div>`);
      container.appendChild(card);
    });

    container.addEventListener('click', (e) => {
      const acc = e.target.closest('button[data-accept]');
      const rej = e.target.closest('button[data-reject]');
      if (acc){ DOCTORIA_AUTH.updateAppointmentStatus(acc.getAttribute('data-accept'), 'accepted'); location.reload(); }
      if (rej){ DOCTORIA_AUTH.updateAppointmentStatus(rej.getAttribute('data-reject'), 'rejected'); location.reload(); }
    });
  }

  function renderAdmin(){
    const container = document.getElementById('dashboard-root');
    if (!container) return;

    const users = JSON.parse(localStorage.getItem(DOCTORIA_AUTH.KEYS.users) || '[]');
    const appts = DOCTORIA_AUTH.listMyAppointments();

    const total = appts.length;
    const pending = appts.filter(a=>a.status==='pending').length;
    const accepted = appts.filter(a=>a.status==='accepted').length;
    const rejected = appts.filter(a=>a.status==='rejected').length;

    container.innerHTML = '<h2>Admin Panel</h2>';
    container.appendChild(el(`<div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total</div></div>
      <div class="stat-card"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card"><div class="stat-value">${accepted}</div><div class="stat-label">Accepted</div></div>
      <div class="stat-card"><div class="stat-value">${rejected}</div><div class="stat-label">Rejected</div></div>
    </div>`));

    // Quick appointment status filter
    const filterBar = el('<div class="actions-row" style="margin:1rem 0;"><button class="btn-primary" data-filter="all">All</button><button class="btn-primary" data-filter="pending">Pending</button><button class="btn-primary" data-filter="accepted">Accepted</button><button class="btn-primary" data-filter="rejected">Rejected</button></div>');
    container.appendChild(filterBar);

    container.appendChild(el('<h3>Users</h3>'));
    const usersDiv = el('<div class="doctor-grid"></div>');
    users.forEach(u => {
      usersDiv.appendChild(el(`<div class="doctor-card" style="padding:1rem;"><div class="doctor-info"><strong>${u.name}</strong><p>${u.email}</p><p>Role: ${u.role}</p></div></div>`));
    });
    container.appendChild(usersDiv);

    container.appendChild(el('<h3 style="margin-top:2rem;">Appointments</h3>'));
    const apptDiv = el('<div></div>');
    function renderAppts(list){
      apptDiv.innerHTML = '';
      if (!list.length){ apptDiv.textContent = 'No appointments yet.'; return; }
      list.sort((a,b)=>b.createdAt-a.createdAt).forEach(a => {
        apptDiv.appendChild(el(`<div class="doctor-card" style="padding:1rem;">
          <div class="doctor-info">
            <strong>${a.patientName} → ${a.doctorName}</strong>
            <p>${a.date} at ${a.time} (${a.mode})</p>
            <p>Status: ${a.status}</p>
            <small>${fmtDate(a.createdAt)}</small>
            <div class="actions-row" style="margin-top:.5rem;">
              ${a.status==='accepted' ? '' : `<button class="btn-primary" data-accept="${a.id}">Accept</button>`}
              ${a.status==='rejected' ? '' : `<button class="btn-primary" style="background:#ef4444" data-reject="${a.id}">Reject</button>`}
            </div>
          </div>
        </div>`));
      });
    }
    renderAppts(appts);
    container.appendChild(apptDiv);

    filterBar.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-filter]'); if (!btn) return;
      const f = btn.getAttribute('data-filter');
      if (f==='all') renderAppts(appts);
      else renderAppts(appts.filter(a=>a.status===f));
    });

    container.addEventListener('click', (e) => {
      const acc = e.target.closest('button[data-accept]');
      const rej = e.target.closest('button[data-reject]');
      if (acc){ DOCTORIA_AUTH.updateAppointmentStatus(acc.getAttribute('data-accept'), 'accepted'); location.reload(); }
      if (rej){ DOCTORIA_AUTH.updateAppointmentStatus(rej.getAttribute('data-reject'), 'rejected'); location.reload(); }
    });
  }

  window.DOCTORIA_DASH = { renderPatient, renderDoctor, renderAdmin };
})();