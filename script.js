// Global variables
let currentUser = null;

// Utility functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Authentication functions
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            // Store user info in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email
            }));
            
            // If on login page, redirect to main
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.href = './main.html';
            }
        } else {
            currentUser = null;
            localStorage.removeItem('currentUser');
            
            // If not on login page, redirect to login
            if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                window.location.href = './index.html';
            }
        }
    });
}

// Login page functionality
if (document.getElementById('loginFormElement')) {
    // Form switching
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });

    // Login form submission
    document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            showMessage('Login berhasil!');
            window.location.href = './main.html';
        } catch (error) {
            hideLoading();
            showMessage('Login gagal: ' + error.message, 'error');
        }
    });

    // Signup form submission
    document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const kelas = document.getElementById('signupClass').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save additional user info to Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                class: kelas,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('Pendaftaran berhasil!');
            window.location.href = './main.html';
        } catch (error) {
            hideLoading();
            showMessage('Pendaftaran gagal: ' + error.message, 'error');
        }
    });
}

// Main page functionality
if (document.getElementById('hamburger')) {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
            sidebar.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Navigation functionality
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') && item.getAttribute('href') !== '#') {
                return; // Let normal navigation happen
            }
            
            e.preventDefault();
            const page = item.getAttribute('data-page');
            
            if (page) {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Hide all content sections
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show selected content
                const contentId = page + 'Content';
                const content = document.getElementById(contentId);
                if (content) {
                    content.classList.remove('hidden');
                }
                
                // Close sidebar
                sidebar.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Admin modal functionality
    const adminModal = document.getElementById('adminModal');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    function showAdminModal() {
        adminModal.classList.remove('hidden');
        adminPasswordInput.focus();
    }
    
    function hideAdminModal() {
        adminModal.classList.add('hidden');
        adminPasswordInput.value = '';
    }
    
    function checkAdminPassword() {
        const password = adminPasswordInput.value;
        if (password === 'Tambaksari322') {
            hideAdminModal();
            window.location.href = './admin.html';
        } else {
            showMessage('Kata sandi salah!', 'error');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    // Admin access events
    document.getElementById('adminAccess').addEventListener('click', (e) => {
        e.preventDefault();
        showAdminModal();
    });

    document.getElementById('loginAdmin').addEventListener('click', (e) => {
        e.preventDefault();
        showAdminModal();
    });

    // Modal events
    document.getElementById('closeAdminModal').addEventListener('click', hideAdminModal);
    document.getElementById('cancelAdmin').addEventListener('click', hideAdminModal);
    document.getElementById('submitAdmin').addEventListener('click', checkAdminPassword);
    
    // Enter key support for admin password
    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAdminPassword();
        }
    });
    
    // Close modal when clicking outside
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            hideAdminModal();
        }
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            try {
                await auth.signOut();
                showMessage('Berhasil keluar');
                window.location.href = './index.html';
            } catch (error) {
                showMessage('Gagal keluar: ' + error.message, 'error');
            }
        }
    });

    // Load user info
    async function loadUserInfo() {
        if (currentUser) {
            try {
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    document.getElementById('userName').textContent = userData.name || 'Nama Siswa';
                    document.getElementById('userClass').textContent = userData.class || 'Kelas';
                    
                    // Pre-fill forms with user data
                    const izinNama = document.getElementById('izinNama');
                    if (izinNama) {
                        izinNama.value = userData.name || '';
                    }
                }
            } catch (error) {
                console.error('Error loading user info:', error);
            }
        }
    }

    // Izin/Sakit form submission
    const izinForm = document.getElementById('izinForm');
    if (izinForm) {
        izinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();

            const formData = {
                nama: document.getElementById('izinNama').value,
                jenis: document.getElementById('izinJenis').value,
                tanggal: document.getElementById('izinTanggal').value,
                deskripsi: document.getElementById('izinDeskripsi').value,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('izin_sakit').add(formData);
                hideLoading();
                showMessage('Formulir berhasil dikirim!');
                izinForm.reset();
                // Refresh stats after form submission
                setTimeout(() => {
                    loadStats();
                }, 1000);
            } catch (error) {
                hideLoading();
                showMessage('Gagal mengirim formulir: ' + error.message, 'error');
            }
        });
    }

    // Load stats function - FIXED VERSION
    async function loadStats() {
        console.log('Loading stats...');
        
        try {
            const today = new Date();
            const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // 1. Get today's attendance count (all students who marked "Hadir" today)
            console.log('Fetching today attendance for date:', todayString);
            const todayAttendanceQuery = await db.collection('absensi')
                .where('tanggal', '==', todayString)
                .where('keterangan', '==', 'Hadir')
                .get();
            
            const todayCount = todayAttendanceQuery.size;
            console.log('Today attendance count:', todayCount);
            document.getElementById('todayAttendance').textContent = todayCount;

            // 2. Get total izin/sakit forms (all students)
            console.log('Fetching total izin/sakit forms...');
            const izinSakitQuery = await db.collection('izin_sakit').get();
            const totalIzinSakit = izinSakitQuery.size;
            console.log('Total izin/sakit count:', totalIzinSakit);
            document.getElementById('totalAbsence').textContent = totalIzinSakit;

            // 3. Get current user's monthly attendance
            if (currentUser) {
                console.log('Fetching monthly attendance for user:', currentUser.uid);
                const monthlyAttendanceQuery = await db.collection('absensi')
                    .where('userId', '==', currentUser.uid)
                    .where('keterangan', '==', 'Hadir')
                    .get();
                
                // Filter by month manually since Firestore doesn't support date range with string dates
                let monthlyCount = 0;
                monthlyAttendanceQuery.forEach(doc => {
                    const data = doc.data();
                    if (data.createdAt && data.createdAt.toDate() >= startOfMonth) {
                        monthlyCount++;
                    } else if (data.tanggal) {
                        const attendanceDate = new Date(data.tanggal);
                        if (attendanceDate >= startOfMonth) {
                            monthlyCount++;
                        }
                    }
                });
                
                console.log('Monthly attendance count:', monthlyCount);
                document.getElementById('monthlyAttendance').textContent = monthlyCount;
            } else {
                document.getElementById('monthlyAttendance').textContent = '0';
            }
            
            console.log('Stats loaded successfully');
        } catch (error) {
            console.error('Error loading stats:', error);
            // Set default values on error
            document.getElementById('todayAttendance').textContent = '0';
            document.getElementById('totalAbsence').textContent = '0';
            document.getElementById('monthlyAttendance').textContent = '0';
        }
    }

    // Initialize main page with proper auth state handling
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            console.log('User authenticated:', user.uid);
            await loadUserInfo();
            await loadStats();
            
            // Set up real-time listeners for stats updates
            setupStatsListeners();
        } else {
            console.log('No user authenticated');
            // Set default values when no user
            document.getElementById('todayAttendance').textContent = '0';
            document.getElementById('totalAbsence').textContent = '0';
            document.getElementById('monthlyAttendance').textContent = '0';
        }
    });

    // Set up real-time listeners for automatic stats updates
    function setupStatsListeners() {
        const today = new Date().toISOString().split('T')[0];
        
        // Listen for changes in today's attendance
        db.collection('absensi')
            .where('tanggal', '==', today)
            .where('keterangan', '==', 'Hadir')
            .onSnapshot((snapshot) => {
                console.log('Today attendance updated:', snapshot.size);
                document.getElementById('todayAttendance').textContent = snapshot.size;
            });

        // Listen for changes in izin/sakit forms
        db.collection('izin_sakit')
            .onSnapshot((snapshot) => {
                console.log('Izin/sakit forms updated:', snapshot.size);
                document.getElementById('totalAbsence').textContent = snapshot.size;
            });

        // Listen for changes in current user's attendance
        if (currentUser) {
            db.collection('absensi')
                .where('userId', '==', currentUser.uid)
                .where('keterangan', '==', 'Hadir')
                .onSnapshot((snapshot) => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    
                    let monthlyCount = 0;
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.createdAt && data.createdAt.toDate() >= startOfMonth) {
                            monthlyCount++;
                        } else if (data.tanggal) {
                            const attendanceDate = new Date(data.tanggal);
                            if (attendanceDate >= startOfMonth) {
                                monthlyCount++;
                            }
                        }
                    });
                    
                    console.log('Monthly attendance updated:', monthlyCount);
                    document.getElementById('monthlyAttendance').textContent = monthlyCount;
                });
        }
    }
}

// Absensi page functionality
if (document.getElementById('absensiForm')) {
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        currentDateElement.textContent = formatDate(new Date());
    }

    // Show/hide reason field based on selection
    const keteranganSelect = document.getElementById('absensiKeterangan');
    const alasanGroup = document.getElementById('alasanGroup');
    
    keteranganSelect.addEventListener('change', () => {
        if (keteranganSelect.value === 'Izin' || keteranganSelect.value === 'Sakit' || keteranganSelect.value === 'Alpha') {
            alasanGroup.style.display = 'block';
        } else {
            alasanGroup.style.display = 'none';
        }
    });

    // Load user info for absensi form
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    document.getElementById('absensiNama').value = userData.name || '';
                    document.getElementById('absensiKelas').value = userData.class || '';
                }
            } catch (error) {
                console.error('Error loading user info:', error);
            }
        }
    });

    // Absensi form submission
    document.getElementById('absensiForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        const today = new Date().toISOString().split('T')[0];
        
        const formData = {
            nama: document.getElementById('absensiNama').value,
            kelas: document.getElementById('absensiKelas').value,
            keterangan: document.getElementById('absensiKeterangan').value,
            alasan: document.getElementById('absensiAlasan').value,
            tanggal: today, // Use consistent date format
            userId: currentUser ? currentUser.uid : null,
            userEmail: currentUser ? currentUser.email : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('absensi').add(formData);
            hideLoading();
            
            // Show success message
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('absensiForm').style.display = 'none';
            
            setTimeout(() => {
                window.location.href = './main.html';
            }, 2000);
        } catch (error) {
            hideLoading();
            showMessage('Gagal menyimpan absensi: ' + error.message, 'error');
        }
    });
}

// Admin page functionality
if (document.querySelector('.admin-page')) {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Load data for the selected tab
            if (tabName === 'absensi') {
                loadAbsensiData();
            } else if (tabName === 'izin') {
                loadIzinData();
            }
        });
    });

    // Load absensi data
    async function loadAbsensiData(filters = {}) {
        showLoading();
        try {
            let query = db.collection('absensi').orderBy('createdAt', 'desc');
            
            // Apply filters
            if (filters.date) {
                query = query.where('tanggal', '==', filters.date);
            }
            if (filters.status) {
                query = query.where('keterangan', '==', filters.status);
            }
            
            const snapshot = await query.get();
            const tbody = document.getElementById('absensiTableBody');
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">Tidak ada data</td></tr>';
            } else {
                tbody.innerHTML = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(data.tanggal)}</td>
                        <td>${data.nama}</td>
                        <td>${data.kelas}</td>
                        <td><span class="status-badge ${data.keterangan.toLowerCase()}">${data.keterangan}</span></td>
                        <td>${data.alasan || '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading absensi data:', error);
            showMessage('Gagal memuat data absensi', 'error');
        }
        hideLoading();
    }

    // Load izin/sakit data
    async function loadIzinData(filters = {}) {
        showLoading();
        try {
            let query = db.collection('izin_sakit').orderBy('createdAt', 'desc');
            
            // Apply filters
            if (filters.date) {
                query = query.where('tanggal', '==', filters.date);
            }
            if (filters.type) {
                query = query.where('jenis', '==', filters.type);
            }
            
            const snapshot = await query.get();
            const tbody = document.getElementById('izinTableBody');
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">Tidak ada data</td></tr>';
            } else {
                tbody.innerHTML = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${data.createdAt ? formatDateTime(data.createdAt.toDate()) : '-'}</td>
                        <td>${data.nama}</td>
                        <td><span class="status-badge ${data.jenis.toLowerCase()}">${data.jenis}</span></td>
                        <td>${formatDate(data.tanggal)}</td>
                        <td>${data.deskripsi}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading izin data:', error);
            showMessage('Gagal memuat data izin/sakit', 'error');
        }
        hideLoading();
    }

    // Filter functionality
    document.getElementById('filterBtn').addEventListener('click', () => {
        const filters = {
            date: document.getElementById('filterDate').value,
            status: document.getElementById('filterStatus').value
        };
        loadAbsensiData(filters);
    });

    document.getElementById('filterIzinBtn').addEventListener('click', () => {
        const filters = {
            date: document.getElementById('filterIzinDate').value,
            type: document.getElementById('filterIzinType').value
        };
        loadIzinData(filters);
    });

    // Initial data load
    loadAbsensiData();
}

// Initialize auth state checking
checkAuthState();
