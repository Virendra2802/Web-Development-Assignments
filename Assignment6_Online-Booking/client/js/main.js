document.addEventListener('DOMContentLoaded', () => {
    // API base URL - adjust if needed
    const API_URL = '/api';

    // UI Elements
    const servicesContainer = document.getElementById('services-container');
    const bookingModal = document.getElementById('booking-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingForm = document.getElementById('booking-form');
    const bookingSuccess = document.getElementById('booking-success');
    
    const viewBookingsBtn = document.getElementById('view-bookings-btn');
    const viewBookingsModal = document.getElementById('view-bookings-modal');
    const closeBookingsModalBtn = document.getElementById('close-bookings-modal');
    const bookingsList = document.getElementById('bookings-list');

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Fetch and display services
    async function fetchServices() {
        try {
            const response = await fetch(`${API_URL}/services`);
            const services = await response.json();
            renderServices(services);
        } catch (error) {
            console.error('Error fetching services:', error);
            servicesContainer.innerHTML = '<p>Failed to load services. Please try again later.</p>';
        }
    }

    function renderServices(services) {
        servicesContainer.innerHTML = '';
        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card fade-in';
            card.innerHTML = `
                <div class="service-icon">
                    <i data-lucide="${service.icon || 'settings'}"></i>
                </div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="service-price">₹${service.price}</span>
                    <button class="btn btn-primary btn-sm book-btn" data-id="${service._id}" data-name="${service.name}" data-price="${service.price}">
                        Book Now
                    </button>
                </div>
            `;
            servicesContainer.appendChild(card);
        });
        lucide.createIcons();

        // Add event listeners to book buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceId = btn.getAttribute('data-id');
                const serviceName = btn.getAttribute('data-name');
                const servicePrice = btn.getAttribute('data-price');
                openBookingModal(serviceId, serviceName, servicePrice);
            });
        });
    }

    // Modal Functions
    function openBookingModal(id, name, price) {
        document.getElementById('service-id-input').value = id;
        document.getElementById('service-price-input').value = price;
        document.getElementById('modal-service-name').innerText = name;
        bookingModal.style.display = 'flex';
        bookingForm.style.display = 'grid';
        bookingSuccess.style.display = 'none';
    }

    closeModalBtn.addEventListener('click', () => {
        bookingModal.style.display = 'none';
    });

    // Booking Submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookingData = {
            serviceId: document.getElementById('service-id-input').value,
            userName: document.getElementById('user-name').value,
            userEmail: document.getElementById('user-email').value,
            userPhone: document.getElementById('user-phone').value, // Corrected key to match model
            phone: document.getElementById('user-phone').value, // Backup for model field 'phone'
            address: document.getElementById('user-address').value,
            bookingDate: document.getElementById('booking-date').value,
            bookingTime: document.getElementById('booking-time').value,
            totalPrice: parseFloat(document.getElementById('service-price-input').value)
        };

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                bookingForm.style.display = 'none';
                bookingSuccess.style.display = 'block';
                lucide.createIcons();
            } else {
                alert('Booking failed. Please check your details.');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('An error occurred. Please try again.');
        }
    });

    // View Bookings
    viewBookingsBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        viewBookingsModal.style.display = 'flex';
        await fetchBookings();
    });

    closeBookingsModalBtn.addEventListener('click', () => {
        viewBookingsModal.style.display = 'none';
    });

    async function fetchBookings() {
        bookingsList.innerHTML = '<p>Loading your bookings...</p>';
        try {
            const response = await fetch(`${API_URL}/bookings`);
            const bookings = await response.json();
            renderBookings(bookings);
        } catch (error) {
            bookingsList.innerHTML = '<p>Error loading bookings.</p>';
        }
    }

    function renderBookings(bookings) {
        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>No bookings found.</p>';
            return;
        }

        bookingsList.innerHTML = bookings.map(b => `
            <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${b.serviceId ? b.serviceId.name : 'Unknown Service'}</strong>
                    <span style="color: var(--primary); font-weight: 600;">₹${b.totalPrice}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">
                    <p><i data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${b.bookingDate} at ${b.bookingTime}</p>
                    <p><i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${b.address}</p>
                    <p><i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle;"></i> Status: ${b.status}</p>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    // Initialize
    fetchServices();
});
