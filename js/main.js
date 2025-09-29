// Main JS for Doctoria
// ...existing code...
// Doctor Data
        const doctors = [
            { name: "Dr. Richard James", specialty: "General Physician", status: "Available" },
            { name: "Dr. Emily Watson", specialty: "Dermatologist", status: "Available" },
            { name: "Dr. Michael Chen", specialty: "Neurologist", status: "Available" },
            { name: "Dr. Sarah Johnson", specialty: "Gynecologist", status: "Available" },
            { name: "Dr. David Miller", specialty: "Pediatrician", status: "Available" },
            { name: "Dr. Lisa Anderson", specialty: "Gastroenterologist", status: "Available" },
            { name: "Dr. James Wilson", specialty: "General Physician", status: "Available" },
            { name: "Dr. Maria Garcia", specialty: "Dermatologist", status: "Available" },
            { name: "Dr. Robert Taylor", specialty: "Neurologist", status: "Available" },
            { name: "Dr. Jennifer Lee", specialty: "Pediatrician", status: "Available" }
        ];

        let currentDoctorCount = 10;

        // Initialize doctors
        function loadDoctors() {
            const grid = document.getElementById('doctorGrid');
            grid.innerHTML = '';
            
            doctors.slice(0, currentDoctorCount).forEach((doctor, index) => {
                const card = createDoctorCard(doctor, index + 1);
                grid.innerHTML += card;
            });
        }

        function createDoctorCard(doctor, docNum) {
            return `
                <div class="doctor-card" onclick="bookAppointment('${doctor.name}')">
                    <img src="../assets/assets/assets_frontend/doc${docNum}.png" alt="${doctor.name}">
                    <div class="doctor-info">
                        <span class="doctor-status">${doctor.status}</span>
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                    </div>
                </div>
            `;
        }

        // Mobile menu toggle
        function toggleMenu() {
            const menu = document.getElementById('navMenu');
            menu.classList.toggle('active');
        }

        // Scroll to section
        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }

        // Filter doctors by specialty
        function filterDoctors(specialty) {
            alert(`Filtering doctors by: ${specialty}\n(Feature will show only ${specialty} doctors)`);
            scrollToSection('doctors');
        }

        // Book appointment
        function bookAppointment(doctorName) {
            alert(`Booking appointment with ${doctorName}\n(This will open appointment booking form)`);
        }

        // Load more doctors
        function loadMoreDoctors() {
            alert('Loading more doctors...\n(Feature will load additional doctors)');
        }

        // Open modal
        function openModal(type) {
            alert(`Opening ${type} form\n(This will show ${type} modal)`);
        }

        // Close menu on link click (mobile)
        document.querySelectorAll('.navbar-link a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navMenu').classList.remove('active');
            });
        });

        // Initialize
        loadDoctors();