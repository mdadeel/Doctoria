//  auth and data layer localStorage
(function(){
  const KEYS = {
    users: 'ms_users',
    currentUser: 'ms_current_user',
    appointments: 'ms_appointments',
    redirect: 'ms_redirect'
  };

  function read(key){
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; }
  }
  function write(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }
  function getUsers(){ return read(KEYS.users); }
  function setUsers(users){ write(KEYS.users, users); }
  function getAppointments(){ return read(KEYS.appointments); }
  function setAppointments(appts){ write(KEYS.appointments, appts); }
  function getCurrentUser(){
    try { return JSON.parse(localStorage.getItem(KEYS.currentUser)) || null; } catch(e){ return null; }
  }
  function setCurrentUser(user){ localStorage.setItem(KEYS.currentUser, JSON.stringify(user)); }
  function clearCurrentUser(){ localStorage.removeItem(KEYS.currentUser); }

  function seed(){
    const users = getUsers();
    if (!users.length){
      // Seed admin
      users.push({ id: 'u-admin', role: 'admin', name: 'Administrator', email: 'admin@doctoria.local', password: 'admin123' });
      // Seed a few doctors
      const seedDoctors = [
        { id: 'd1', role: 'doctor', name: 'Dr. Richard James', email: 'richard.james@doctoria.local', password: 'doctor123', specialty: 'General Physician' },
        { id: 'd2', role: 'doctor', name: 'Dr. Emily Watson', email: 'emily.watson@doctoria.local', password: 'doctor123', specialty: 'Dermatologist' },
        { id: 'd3', role: 'doctor', name: 'Dr. Michael Chen', email: 'michael.chen@doctoria.local', password: 'doctor123', specialty: 'Neurologist' }
      ];
      users.push(...seedDoctors);
      setUsers(users);
    }
  }

  function register({role, name, email, password}){
    // Only patients can self-register
    role = 'patient';
    const users = getUsers();
    if (users.some(u => u.email === email)){
      throw new Error('Email already registered');
    }
    const id = 'u-' + Math.random().toString(36).slice(2,9);
    const user = { id, role, name, email, password };
    users.push(user);
    setUsers(users);
    setCurrentUser({ id, role, name, email });
    return user;
  }

  function login({email, password, role}){
    if (role === 'doctor') throw new Error('Doctors cannot login via this portal.');
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!found) throw new Error('Invalid credentials');
    setCurrentUser({ id: found.id, role: found.role, name: found.name, email: found.email });
    return found;
  }

  function logout(){ clearCurrentUser(); }

  function requireRole(role){
    const u = getCurrentUser();
    if (!u || u.role !== role){
      window.location.href = 'login.html';
    }
  }

  function bookAppointment({doctorId, doctorName, date, time, mode}){
    const u = getCurrentUser();
    if (!u || u.role !== 'patient') throw new Error('Only patients can book');
    const appts = getAppointments();
    const id = 'a-' + Math.random().toString(36).slice(2,9);
    appts.push({ id, status: 'pending', patientId: u.id, patientName: u.name, doctorId, doctorName, date, time, mode, createdAt: Date.now() });
    setAppointments(appts);
    return id;
  }

  function listMyAppointments(){
    const u = getCurrentUser();
    if (!u) return [];
    const appts = getAppointments();
    if (u.role === 'patient') return appts.filter(a => a.patientId === u.id);
    if (u.role === 'doctor') return appts.filter(a => a.doctorId && (a.doctorId === u.id || a.doctorName === u.name));
    if (u.role === 'admin') return appts;
    return [];
  }

  function updateAppointmentStatus(id, status){
    const appts = getAppointments();
    const idx = appts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    appts[idx].status = status;
    setAppointments(appts);
    return true;
  }

  function listDoctors(){
    const users = getUsers();
    return users.filter(u => u.role === 'doctor');
  }

  function updateProfile({name, email}){
    const u = getCurrentUser();
    if (!u) throw new Error('Not authenticated');
    const users = getUsers();
    if (email && users.some(x => x.email === email && x.id !== u.id)){
      throw new Error('Email already in use');
    }
    const idx = users.findIndex(x => x.id === u.id);
    if (idx === -1) throw new Error('User not found');
    if (name) users[idx].name = name;
    if (email) users[idx].email = email;
    setUsers(users);
    setCurrentUser({ id: users[idx].id, role: users[idx].role, name: users[idx].name, email: users[idx].email });
    return { id: users[idx].id, name: users[idx].name, email: users[idx].email };
  }

  function changePassword({oldPassword, newPassword}){
    const u = getCurrentUser();
    if (!u) throw new Error('Not authenticated');
    const users = getUsers();
    const idx = users.findIndex(x => x.id === u.id);
    if (idx === -1) throw new Error('User not found');
    if (users[idx].password !== oldPassword) throw new Error('Old password is incorrect');
    users[idx].password = newPassword;
    setUsers(users);
    return true;
  }

  function setRedirect(url){ localStorage.setItem(KEYS.redirect, url); }
  function popRedirect(){ const u = localStorage.getItem(KEYS.redirect); if (u) localStorage.removeItem(KEYS.redirect); return u; }

  // Expose
  window.DOCTORIA_AUTH = {
    KEYS,
    seed,
    getCurrentUser,
    register,
    login,
    logout,
    requireRole,
    bookAppointment,
    listMyAppointments,
    updateAppointmentStatus,
    listDoctors,
    updateProfile,
    changePassword,
    setRedirect,
    popRedirect
  };

  // Auto seed
  seed();
})();