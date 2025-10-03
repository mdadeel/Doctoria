// Main JS 


        let ALL_DOCTORS = [];
        let FILTERED_DOCTORS = [];
        let currentDoctorCount = 8;

        async function fetchDoctors() {
            if (ALL_DOCTORS.length) return ALL_DOCTORS;
            try {
                const res = await fetch('../data/doctors.json');
                const data = await res.json();
                ALL_DOCTORS = data;
                return ALL_DOCTORS;
            } catch (e) {
                console.error('Failed to load doctors.json', e);
                return [];
            }
        }

        function getQueryParam(name){
            const params = new URLSearchParams(location.search);
            return params.get(name);
        }

        // Initialize doctors grid if present
        async function loadDoctors() {
            const grid = document.getElementById('doctorGrid');
            if (!grid) return;
            const all = await fetchDoctors();

            const spec = getQueryParam('specialty');
            FILTERED_DOCTORS = spec ? all.filter(d => d.specialty.toLowerCase() === spec.toLowerCase()) : all.slice();

            setupDoctorsFilters(all, spec);
            renderDoctorGrid();
        }

        function setupDoctorsFilters(allDoctors, spec){
            const searchEl = document.getElementById('searchInput');
            const specEl = document.getElementById('specialtySelect');
            const clearBtn = document.getElementById('clearFilters');
            if (!searchEl || !specEl) return;
            // Populate specialties
            const specs = Array.from(new Set(allDoctors.map(d=>d.specialty))).sort();
            specs.forEach(s=>{ const opt = document.createElement('option'); opt.value = s; opt.textContent = s; specEl.appendChild(opt); });
            if (spec) specEl.value = spec;

            function applyFilters(){
                const q = (searchEl.value || '').toLowerCase();
                const s = specEl.value;
                FILTERED_DOCTORS = allDoctors.filter(d => {
                    const matchesSpec = !s || d.specialty === s;
                    const hay = `${d.name} ${d.location || ''}`.toLowerCase();
                    const matchesQ = !q || hay.includes(q);
                    return matchesSpec && matchesQ;
                });
                currentDoctorCount = 12;
                renderDoctorGrid();
            }
            searchEl.addEventListener('input', applyFilters);
            specEl.addEventListener('change', applyFilters);
            if (clearBtn) clearBtn.addEventListener('click', () => { searchEl.value=''; specEl.value=''; applyFilters(); history.replaceState({}, '', 'doctors.html'); });
        }

        function renderDoctorGrid(){
            const grid = document.getElementById('doctorGrid');
            if (!grid) return;
            grid.innerHTML = '';
            const items = FILTERED_DOCTORS.slice(0, currentDoctorCount);
            items.forEach((doctor) => {
                const card = createDoctorCard(doctor);
                grid.insertAdjacentHTML('beforeend', card);
            });
        }

        function createDoctorCard(doctor) {
            return `
                <div class="doctor-card" onclick="goToDoctor('${doctor.id}')">
                    <img src="${doctor.image}" alt="${doctor.name}">
                    <div class="doctor-info">
                        <span class="doctor-status">${doctor.status || 'Available'}</span>
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                        <p style="margin-top:.5rem; color:#777;">${doctor.location} • ⭐ ${doctor.rating ?? ''}</p>
                    </div>
                </div>
            `;
        }

        // Mobile menu toggle
        function toggleMenu() {
            const menu = document.getElementById('navMenu');
            if (menu) menu.classList.toggle('active');
        }

        // Scroll to section
        function scrollToSection(sectionId) {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        // Filter doctors by specialty -> navigate to doctors page with filter
        function filterDoctors(specialty) {
            const url = new URL(location.origin + location.pathname.replace(/[^/]+$/, 'doctors.html'));
            url.searchParams.set('specialty', specialty);
            location.href = url.toString();
        }

        // Go to doctor details page
        function goToDoctor(doctorId){
            const url = new URL(location.origin + location.pathname.replace(/[^/]+$/, 'doctor.html'));
            url.searchParams.set('doctorId', doctorId);
            location.href = url.toString();
        }

        // Load more doctors
        function loadMoreDoctors() {
            currentDoctorCount += 8;
            renderDoctorGrid();
        }

        // Open login/register page
        function openModal(type) {
            location.href = 'login.html';
        }

        // Close menu on link click (mobile)
        document.addEventListener('DOMContentLoaded', () => {
            const links = document.querySelectorAll('.navbar-link a');
            if (links && links.length) {
                links.forEach(link => {
                    link.addEventListener('click', () => {
                        const menu = document.getElementById('navMenu');
                        if (menu) menu.classList.remove('active');
                    });
                });
            }

            const grid = document.getElementById('doctorGrid');
            if (grid) {
                loadDoctors();
            }

            // Render user menu in header if present
            if (window.DOCTORIA_AUTH){
                renderUserMenu();
            } else {
                // If auth not yet loaded, try once after a short delay
                setTimeout(()=>{ if (window.DOCTORIA_AUTH) renderUserMenu(); }, 100);
            }
        });

        function renderUserMenu(){
            const mount = document.getElementById('userMenu');
            if (!mount) return;
            const u = DOCTORIA_AUTH.getCurrentUser ? DOCTORIA_AUTH.getCurrentUser() : null;
            if (!u){
                mount.innerHTML = `<button class="btn-primary" onclick="location.href='login.html'">Create Account</button>`;
                return;
            }
            const initials = (u.name || u.email || 'U').trim().split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
            const label = u.role === 'admin' ? 'Admin' : (u.name || 'User');
            mount.innerHTML = `
              <div class="user-menu" id="userMenuRoot">
                <div class="user-btn" onclick="toggleUserDropdown()">
                  <span class="avatar">${initials}</span>
                  <span class="user-name">${label}</span>
                </div>
                <div class="user-dropdown">
                  <button onclick="headerLogout()">Logout</button>
                </div>
              </div>`;
            document.addEventListener('click', (e)=>{
                const root = document.getElementById('userMenuRoot');
                if (!root) return;
                if (root.contains(e.target)) return;
                root.classList.remove('open');
            });
        }
        function toggleUserDropdown(){
            const root = document.getElementById('userMenuRoot');
            if (root) root.classList.toggle('open');
        }
        function headerLogout(){
            try { DOCTORIA_AUTH.logout(); } catch(e){}
            const u = DOCTORIA_AUTH.getCurrentUser && DOCTORIA_AUTH.getCurrentUser();
            const to = (u && u.role==='admin') ? 'admin/index.html' : 'login.html';
            location.href = to;
        }

        // Expose needed functions globally
        window.filterDoctors = filterDoctors;
        window.toggleMenu = toggleMenu;
        window.scrollToSection = scrollToSection;
        window.loadMoreDoctors = loadMoreDoctors;
        window.goToDoctor = goToDoctor;
        window.openModal = openModal;
        window.toggleUserDropdown = toggleUserDropdown;
        window.headerLogout = headerLogout;
