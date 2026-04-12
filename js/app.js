/* =============================================
   app.js — Branch Management SPA
   ============================================= */

// -------------------------
// State & Data Store
// -------------------------
const AppState = {
    currentPage: 'dashboard',
    currentBranch: 'all',
    theme: localStorage.getItem('theme') || 'light',
    reports: JSON.parse(localStorage.getItem('bms_reports') || '[]'),
    expenses: JSON.parse(localStorage.getItem('bms_expenses') || '[]'),
    budgets: JSON.parse(localStorage.getItem('bms_budgets') || '[]'),
    userRole: localStorage.getItem('bms_role'),   // 'developer' | 'manager' | 'branch'
    userBranch: localStorage.getItem('bms_branch'),
    managerName: localStorage.getItem('bms_manager_name') || 'المدير العام',
    masterPassword: localStorage.getItem('bms_master_pass') || 'admin#135',
    backupPath: localStorage.getItem('bms_backup_path') || 'D:\\\\Backups-Report',
    ledgers: JSON.parse(localStorage.getItem('bms_ledgers') || '{}'), 
    systemSecret: 'ReportV2_SecurePath_882', // Dynamic path for cloud data
    isInitialSyncComplete: false // Nitro-Block Protection
};

// Default data (used for seeding if no localStorage)
const DEFAULT_BRANCHES = {

    miami:    { name: 'فرع ميامي',    city: 'الإسكندرية', color: '#1a5276' },
    mandara:  { name: 'فرع المندرة', city: 'الإسكندرية', color: '#512e5f' },
    soyouf:   { name: 'فرع السيوف',   city: 'الإسكندرية', color: '#8B0000' },
    smouha:   { name: 'فرع سموحة',    city: 'الإسكندرية', color: '#1d6a3e' },
    agamy:    { name: 'فرع العجمي',   city: 'الإسكندرية', color: '#7d6608' },
    branch6:  { name: 'الفرع السادس', city: 'الإسكندرية', color: '#2c3e50' },
};
const DEFAULT_EMPLOYEES = [

    { id: 'E001', name: 'ريهام',    role: 'مديرة الفرع', branch: 'miami' },
    { id: 'E002', name: 'نورهان',   role: 'سكرتيرة',    branch: 'miami' },
    { id: 'E003', name: 'سارة',     role: 'سكرتيرة',    branch: 'miami' },

    { id: 'E004', name: 'روان',     role: 'مديرة الفرع', branch: 'mandara' },
    { id: 'E005', name: 'منة خليل', role: 'سكرتيرة',    branch: 'mandara' },
    { id: 'E006', name: 'دينا',     role: 'سكرتيرة',    branch: 'mandara' },

    { id: 'E007', name: 'راوية',    role: 'مديرة الفرع', branch: 'soyouf' },
    { id: 'E008', name: 'دعاء',     role: 'سكرتيرة',    branch: 'soyouf' },
    { id: 'E009', name: 'روان',     role: 'سكرتيرة',    branch: 'soyouf' },

    { id: 'E010', name: 'هدى',      role: 'مديرة الفرع', branch: 'smouha' },
    { id: 'E011', name: 'حبيبة صلاح',    role: 'سكرتيرة',    branch: 'smouha' },
    { id: 'E012', name: 'حبيبة خليل', role: 'سكرتيرة',  branch: 'smouha' },

    { id: 'E013', name: 'رضوى',     role: 'مديرة الفرع', branch: 'agamy' },
    { id: 'E014', name: 'بسمة',     role: 'سكرتيرة',    branch: 'agamy' },
    { id: 'E015', name: 'أروى',     role: 'سكرتيرة',    branch: 'agamy' },

    { id: 'E016', name: 'ريهام',    role: 'مديرة الفرع', branch: 'branch6' },
    { id: 'E017', name: 'س1',       role: 'سكرتيرة',    branch: 'branch6' },
    { id: 'E018', name: 'س2',       role: 'سكرتيرة',    branch: 'branch6' },
];

// Dynamic data — load from localStorage or seed from defaults
let BRANCHES = JSON.parse(localStorage.getItem('bms_branches') || 'null') || {...DEFAULT_BRANCHES};
let EMPLOYEES = JSON.parse(localStorage.getItem('bms_employees') || 'null') || [...DEFAULT_EMPLOYEES];

// -------------------------
// Firebase Sync & Cloud Storage
// -------------------------
window.syncWithCloud = function() {
    if (!window.db) {
        // Try again in 500ms if not ready yet
        setTimeout(syncWithCloud, 500);
        return console.warn("⏳ Waiting for Firebase initialization...");
    }
    console.log("☁️ Syncing with cloud...");
    
    // Real-time branches
    db.ref(AppState.systemSecret + '/bms/branches').on('value', snap => {
        if (!AppState.userRole) return;
        if (snap.exists()) {
            BRANCHES = snap.val();
            localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
            console.log("✅ Branches synced");
        }
    });

    // Real-time employees
    db.ref(AppState.systemSecret + '/bms/employees').on('value', snap => {
        if (!AppState.userRole) return;
        if (snap.exists()) {
            EMPLOYEES = snap.val();
            localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
            console.log("✅ Employees synced");
        }
    });

    // Real-time reports
    db.ref(AppState.systemSecret + '/bms/reports').on('value', snap => {
        if (!AppState.userRole) return;
        if (snap.exists()) {
            const raw = snap.val();
            AppState.reports = Array.isArray(raw) ? raw : Object.values(raw);
            localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
            console.log("✅ Reports synced");
            if (AppState.currentPage === 'dashboard') navigate('dashboard');
        }
    });

    // Real-time budgets
    db.ref(AppState.systemSecret + '/bms/budgets').on('value', snap => {
        if (!AppState.userRole) return;
        if (snap.exists()) {
            const raw = snap.val();
            AppState.budgets = Array.isArray(raw) ? raw : Object.values(raw);
            localStorage.setItem('bms_budgets', JSON.stringify(AppState.budgets));
            console.log("✅ Budgets synced");
            if (AppState.currentPage === 'dailybudget') navigate('dailybudget');
        }
    });

    // Real-time ledgers
    db.ref(AppState.systemSecret + '/bms/ledgers').on('value', snap => {
        if (!AppState.userRole) return;
        if (snap.exists()) {
            AppState.ledgers = snap.val();
            localStorage.setItem('bms_ledgers', JSON.stringify(AppState.ledgers));
            console.log("✅ Ledgers synced");
            
            // Mark sync as complete on first data arrival
            if (!AppState.isInitialSyncComplete) {
                AppState.isInitialSyncComplete = true;
                const syncBtn = document.querySelector('.refresh-btn');
                if (syncBtn) {
                    syncBtn.innerHTML = '✅ تمت المزامنة';
                    syncBtn.classList.add('synced-pulse');
                    setTimeout(() => syncBtn.innerHTML = '🔄 تحديث البيانات سحابياً', 3000);
                }
                // REFRESH UI to remove standard load shield
                if (AppState.currentPage) navigate(AppState.currentPage);
            }

            if (AppState.currentPage === 'dailybudget') renderDailyBudget(document.getElementById('pageContent'));
            if (AppState.currentPage === 'dashboard') renderDashboard(document.getElementById('pageContent'));
            // Removal of automatic report re-render to prevent UI freezing during sync
        } else {
            // Even if empty, connection established
            if (!AppState.isInitialSyncComplete) {
                AppState.isInitialSyncComplete = true;
                // REFRESH UI to remove standard load shield
                if (AppState.currentPage) navigate(AppState.currentPage);
            }
        }
    });

    // Monitor Connection Status
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
        const statusDiv = document.getElementById('cloudStatus');
        const statusText = statusDiv?.querySelector('.status-text');
        if (snap.val() === true) {
            statusDiv?.classList.remove('disconnected');
            statusDiv?.classList.add('connected');
            if (statusText) statusText.textContent = 'متصل سحابياً';
            console.log("☁️ Connected to Firebase");
        } else {
            statusDiv?.classList.remove('connected');
            statusDiv?.classList.add('disconnected');
            if (statusText) statusText.textContent = 'فشل الاتصال';
            console.warn("☁️ Disconnected from Firebase");
        }
    });
};



function saveData() {
    // 1. Update Local Storage
    localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
    localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
    localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
    localStorage.setItem('bms_budgets', JSON.stringify(AppState.budgets));
    localStorage.setItem('bms_ledgers', JSON.stringify(AppState.ledgers));
    
    // 2. NITRO-BLOCK: Safety check before pushing to cloud
    if (window.db) {
        if (!AppState.isInitialSyncComplete) {
            console.warn("🛑 Prevented Cloud Overwrite: Sync not yet finished.");
            return; // Exit to prevent wiping cloud with empty local state
        }

        // Use ATOMIC UPDATES to prevent deleting other branches' data
        const updates = {};
        updates['/reports'] = AppState.reports || [];
        updates['/branches'] = BRANCHES || {};
        updates['/employees'] = EMPLOYEES || [];
        updates['/budgets'] = AppState.budgets || [];
        
        // Specially update ledgers to MERGE branch entries
        db.ref(AppState.systemSecret + '/bms/ledgers').update(AppState.ledgers || {});
        
        // Push bulk updates for other categories
        db.ref(AppState.systemSecret + '/bms').update(updates);
        
        console.log("☁️ Nitro-Sync: Cloud updated atomically.");
    }
}

// Seed logic (only if Firebase is totally empty)
function checkSeeding() {
    db.ref(AppState.systemSecret + '/bms').once('value', snap => {
        if (!snap.exists()) {
            console.log("🌱 Initial seeding to cloud...");
            db.ref(AppState.systemSecret + '/bms/branches').set(DEFAULT_BRANCHES);
            db.ref(AppState.systemSecret + '/bms/employees').set(DEFAULT_EMPLOYEES);
            db.ref(AppState.systemSecret + '/bms/reports').set([]);
            db.ref(AppState.systemSecret + '/bms/budgets').set([]);
        }
    });
}

// -------------------------
// Utilities
// -------------------------
function formatNumber(n) {
    return Number(n || 0).toLocaleString('en-US'); // Force English numerals
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function arabicDate(dateStr) {
    let d;
    if (dateStr) {
        const [y, m, day] = dateStr.split('-').map(Number);
        d = new Date(y, m - 1, day);
    } else {
        d = new Date();
    }
    return d.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

window.customPrompt = function(title, defaultValue, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;';
    
    const box = document.createElement('div');
    box.className = 'form-section animate-glow-in';
    box.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:24px;width:90%;max-width:400px;box-shadow:0 15px 35px rgba(0,0,0,0.4);border-top:4px solid var(--primary);';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = 'color:var(--text-primary);margin-bottom:16px;font-size:16px;font-weight:bold;';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue || '';
    input.className = 'form-input';
    input.style.cssText = 'width:100%;padding:12px;background:var(--bg-input);border:1px solid var(--border-color);color:var(--text-primary);border-radius:8px;font-family:Cairo;font-size:15px;margin-bottom:20px; outline:none; transition:0.3s;';
    input.onfocus = () => input.style.borderColor = 'var(--primary)';
    input.onblur = () => input.style.borderColor = 'var(--border-color)';
    
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;justify-content:flex-end;';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'حفظ التعديل';
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.padding = '8px 24px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'إلغاء';
    cancelBtn.style.cssText = 'padding:8px 20px;background:transparent;border:1px solid var(--border-color);color:var(--text-secondary);border-radius:8px;cursor:pointer;';
    
    const close = (val) => {
        overlay.remove();
        if (val !== null) callback(val);
    };
    
    saveBtn.onclick = () => close(input.value);
    cancelBtn.onclick = () => close(null);
    input.onkeyup = (e) => { if (e.key === 'Enter') close(input.value); if (e.key === 'Escape') close(null); };
    
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    box.appendChild(titleEl);
    box.appendChild(input);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        input.focus();
        input.setSelectionRange(0, input.value.length);
    }, 100);
};

function animateCount(el, target, duration = 1000) {
    const start = 0;
    const step = (timestamp) => {
        if (!el._startTime) el._startTime = timestamp;
        const progress = Math.min((timestamp - el._startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatNumber(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// -------------------------
// Login Screen
// -------------------------
function showLoginScreen() {
    // Hide UI
    const sidebar = document.getElementById('sidebar');
    const topbar = document.querySelector('.topbar');
    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';

    const container = document.getElementById('pageContent');
    if (!container) return;
    
    container.style.padding = '0';
    const savedRole = localStorage.getItem('bms_saved_role');
    const savedBranch = localStorage.getItem('bms_saved_branch');
    const savedPass = localStorage.getItem('bms_saved_pass') || '';
    const shouldRemember = localStorage.getItem('bms_remember_checked') === 'true';

    container.innerHTML = `
    <div class="login-wrapper">
        <div class="login-card animate-glow-in">
            <div class="login-logo-circle">💰</div>
            <h1 class="login-title">Report</h1>
            <p class="login-subtitle">التقرير اليومي والماليات</p>

            <button class="login-btn-admin" onclick="setLoginRole('manager')">
                <span>📦</span> إدارة النظام (الرئيسي)
            </button>

            <div class="login-select-wrapper">
                <span class="login-select-icon">🏢</span>
                <select id="loginBranch" class="login-select" onchange="setLoginRole('branch')">
                    <option value="">فروع Report المتاحة</option>
                    ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${savedBranch === k ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
            </div>

            <div id="loginPassArea" style="display:block; transition: all 0.3s ease;">
                <div class="login-input-group">
                    <input type="password" id="loginPass" class="login-input" placeholder="كلمة المرور" value="${savedPass}"
                        onkeydown="if(event.key==='Enter') handleLoginSubmit()">
                    <span id="passToggle" class="login-eye-btn" onclick="togglePassView()">👁️</span>
                </div>

                <div class="login-checkbox-row">
                    <input type="checkbox" id="loginRemember" ${shouldRemember ? 'checked' : ''}>
                    <label for="loginRemember">تذكر بيانات الدخول</label>
                </div>

                <button class="btn btn-primary" onclick="handleLoginSubmit()" style="width:100%; justify-content:center; padding:16px; background:#0062cc; border:none; border-radius:16px; font-weight:900; font-size:16px; color:white; transition: 0.3s;"
                    onmouseover="this.style.boxShadow='0 10px 30px rgba(0, 98, 204, 0.4)'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.boxShadow='none'; this.style.transform='none'">
                    دخول النظام
                </button>
            </div>

            <div class="login-footer-links">
                <a href="javascript:void(0)" class="login-link" onclick="setLoginRole('developer')">دخول المبرمج</a>
                <a href="javascript:void(0)" class="login-link" onclick="handleForgotPass()">هل نسيت كلمة المرور؟</a>
            </div>
        </div>
    </div>`;

    window._currentLoginRole = savedRole || null;
}

window.togglePassView = function() {
    const input = document.getElementById('loginPass');
    const icon = document.getElementById('passToggle');
    if (input.type === 'password') {
        input.type = 'text';
        icon.style.opacity = '1';
        icon.style.color = '#0062cc';
    } else {
        input.type = 'password';
        icon.style.opacity = '0.5';
        icon.style.color = 'inherit';
    }
};

window.setLoginRole = function(role) {
    // Independent Developer Login Path
    if (role === 'developer') {
        customPrompt('🔐 دخول المبرمج — أدخل الكود الماستر', '', function(pass) {
            if (!pass) return;
            const master = (AppState.masterPassword || '').trim();
            if (pass.trim() === master || pass.trim() === 'admin135') {
                const remember = document.getElementById('loginRemember')?.checked || false;
                loginAs('developer', null, remember, pass.trim());
            } else {
                showToast('كود المبرمج غير صحيح!', 'error');
            }
        });
        return;
    }

    window._currentLoginRole = role;
    
    // Visual toggling
    document.querySelectorAll('.login-btn-admin, .login-select-wrapper').forEach(el => el.classList.remove('active'));
    if (role === 'manager') document.querySelector('.login-btn-admin').classList.add('active');
    if (role === 'branch') document.querySelector('.login-select-wrapper').classList.add('active');

    const area = document.getElementById('loginPassArea');
    const subtitle = document.querySelector('.login-subtitle');
    if (!area) return;
    
    if (role === 'developer' && subtitle) subtitle.textContent = 'تسجيل دخول: المبرمج';
    if (role === 'manager' && subtitle) subtitle.textContent = 'تسجيل دخول: الإدارة الرئيسية';
    
    if (role === 'branch') {
        const sel = document.getElementById('loginBranch');
        if (sel && sel.selectedIndex > 0 && subtitle) {
            subtitle.textContent = 'تسجيل دخول: ' + sel.options[sel.selectedIndex].text;
        } else if (subtitle) {
            subtitle.textContent = 'التقرير اليومي والماليات';
        }
        const b = sel ? sel.value : null;
        if (!b) {
            area.style.display = 'none';
            return;
        }
    }
    
    area.style.display = 'block';
    area.style.animation = 'none';
    setTimeout(() => area.style.animation = 'slideUp 0.3s ease both', 10);
    setTimeout(() => document.getElementById('loginPass')?.focus(), 150);
};

window.handleForgotPass = function() {
    const role = window._currentLoginRole;
    if (!role) {
        return showToast('يرجى تحديد فرع أو حساب أولاً لمعرفة كلمة سره', 'error');
    }
    
    const input = prompt('🛡️ استعادة الوصول:\nيرجى إدخال كلمة السر الماستر لمعرفة كلمة المرور الخاصة بهذا الحساب:');
    
    if (input === AppState.masterPassword) {
        let passToShow = '';
        if (role === 'developer') passToShow = AppState.masterPassword;
        else if (role === 'manager') passToShow = 'admin';
        else if (role === 'branch') passToShow = '1111';
        
        alert(`✅ الكود السري الصحيح للحساب هو:\n\n[ ${passToShow} ]`);
    } else if (input) {
        showToast('كلمة السر الماستر غير صحيحة!', 'error');
    }
};

window.handleLoginSubmit = function() {
    let role = window._currentLoginRole;
    const pass = document.getElementById('loginPass').value.trim();
    const remember = document.getElementById('loginRemember').checked;
    const master = (AppState.masterPassword || '').trim();

    // 1. Password-First Global Logic
    if (pass === master || pass === 'admin#135') {
        loginAs('developer', null, remember, pass);
        return;
    }
    
    if (pass === 'admin_2026') {
        loginAs('manager', null, remember, pass);
        return;
    }

    // 2. Standard Role Login
    if (!role) {
        return showToast('يرجى اختيار الفرع أو الضغط على "إدارة النظام" أولاً', 'error');
    }

    if (role === 'branch') {
        const branch = document.getElementById('loginBranch').value;
        if (!branch) return showToast('يرجى اختيار الفرع من القائمة', 'error');
        if (pass === '7788') {
            loginAs('branch', branch, remember, pass);
        } else {
            showToast('كلمة مرور الفرع غير صحيحة!', 'error');
        }
    } else if (role === 'manager') {
        // This handles cases where they change admin pass (if we ever allow it) or re-confirm
        if (pass === 'admin_2026') {
            loginAs('manager', null, remember, pass);
        } else {
            showToast('كلمة مرور الإدارة غير صحيحة!', 'error');
        }
    }
};

window.loginAs = function(role, branchKey, remember, pass) {
    AppState.userRole = role;
    AppState.userBranch = branchKey || null;

    localStorage.setItem('bms_role', role);
    localStorage.setItem('bms_branch', branchKey || '');

    if (remember) {
        localStorage.setItem('bms_saved_role', role);
        localStorage.setItem('bms_saved_branch', branchKey || '');
        if (pass) localStorage.setItem('bms_saved_pass', pass);
        localStorage.setItem('bms_remember_checked', 'true');
        localStorage.setItem('bms_auto_login', 'true');
    } else {
        localStorage.removeItem('bms_saved_role');
        localStorage.removeItem('bms_saved_branch');
        localStorage.removeItem('bms_saved_pass');
        localStorage.setItem('bms_remember_checked', 'false');
        localStorage.setItem('bms_auto_login', 'false');
    }

    document.getElementById('sidebar').style.display = '';
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = '';
    document.getElementById('pageContent').style.padding = '';
    updateNavVisibility();
    updateUserDisplay();
    syncWithCloud();
    navigate('dashboard');
};

// --- IndexedDB Local Backup Folder Storage ---
const initBackupDB = () => new Promise((resolve, reject) => {
    const req = indexedDB.open('BMS_BackupDB', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('settings');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

async function getSavedDirHandle() {
    try {
        const db = await initBackupDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readonly');
            const req = tx.objectStore('settings').get('backupDirHandle');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    } catch(e) { return null; }
}

async function saveDirHandle(handle) {
    try {
        const db = await initBackupDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readwrite');
            const req = tx.objectStore('settings').put(handle, 'backupDirHandle');
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    } catch(e) { return false; }
}

window.createLocalBackup = async function(isSilent = false) {
    try {
        const payload = {
            reports: AppState.reports,
            branches: BRANCHES,
            employees: EMPLOYEES,
            budgets: AppState.budgets,
            exportDate: new Date().toISOString(),
            branchAccount: AppState.userBranch || 'admin'
        };
        const fileName = `BMS_Backup_${today()}.json`;

        if (window.showDirectoryPicker) {
            let dirHandle = await getSavedDirHandle();
            
            // If not linked and not silent, force link now
            if (!dirHandle && !isSilent) {
                const confirmLink = confirm('⚠️ لم يتم ربط مجلد النسخ الاحتياطية بعد!\n\nيجب تحديد المجلد (D:\\Backups-Report) الآن ليتم الحفظ بداخله تلقائياً.');
                if (confirmLink) {
                    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                    await saveDirHandle(dirHandle);
                    updateFolderStatusUI();
                }
            }
            
            if (dirHandle) {
                // Verify/Request permission explicitly
                if (await dirHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                    if (!isSilent) {
                        alert('يرجى الموافقة على صلاحية الوصول للمجلد لإتمام عملية الحفظ التلقائي.');
                        if (await dirHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                            throw new Error('Permission denied');
                        }
                    } else {
                        throw new Error('No user gesture for permission');
                    }
                }
                
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(payload, null, 2));
                await writable.close();
                showToast('تم حفظ النسخة بنجاح في المجلد الإجباري 📁', 'success');
                return;
            }
        }
        
        if (!isSilent) fallbackDownload(payload, fileName);
    } catch(e) {
        console.error('Backup fail:', e);
        if (!isSilent) fallbackDownload(payload, `BMS_Backup_${today()}.json`);
    }
};

function fallbackDownload(payload, fileName) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", fileName);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    showToast('تم الحفظ في مسار التنزيلات الافتراضي', 'success');
}

window.forceSyncData = async function() {
    if (!window.db) return showToast('تعذر الاتصال بقاعدة البيانات', 'error');
    
    showToast('جاري سحب البيانات العميقة من السحابة... ⏳');
    
    try {
        const snap = await db.ref(AppState.systemSecret + '/bms').once('value');
        if (snap.exists()) {
            const data = snap.val();
            
            // Core Data Sync with Array Correction
            if (data.reports) AppState.reports = Array.isArray(data.reports) ? data.reports : Object.values(data.reports);
            if (data.ledgers) AppState.ledgers = data.ledgers;
            if (data.budgets) AppState.budgets = Array.isArray(data.budgets) ? data.budgets : Object.values(data.budgets);
            if (data.branches) BRANCHES = data.branches;
            if (data.employees) EMPLOYEES = Array.isArray(data.employees) ? data.employees : Object.values(data.employees);
            
            // Save to local storage
            localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
            localStorage.setItem('bms_ledgers', JSON.stringify(AppState.ledgers));
            localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
            localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
            
            // Update Nitro Flag
            AppState.isInitialSyncComplete = true;
            
            showToast('تم تحديث البيانات من السحابة بنجاح ✅', 'success');
            
            // Force Full UI Refresh
            navigate(AppState.currentPage);
        }
    } catch (err) {
        console.error(err);
        showToast('فشل في سحب البيانات', 'error');
    }
};

window.logout = function() {
    // 1. Save data before clearing if we have a role
    if (AppState.userRole) {
        saveData();
        // Trigger a silent backup attempt
        try { createLocalBackup(true); } catch(e) {}
    }
    
    // 2. Clear Session State
    AppState.userRole = null;
    AppState.userBranch = null;
    
    // 3. Clear Login Credentials from persistence
    localStorage.removeItem('bms_role');
    localStorage.removeItem('bms_branch');
    localStorage.setItem('bms_auto_login', 'false');
    
    // 4. Force reload to clear all active Firebase listeners and reset memory
    window.location.reload();
};

function updateNavVisibility() {
    const isDev = AppState.userRole === 'developer';
    const isManager = AppState.userRole === 'manager';
    const isBranch = AppState.userRole === 'branch';

    // Dev: Everything
    // Manager: Dashboard, Finance, Employees (ALL READ ONLY)
    // Branch: Dashboard, Report, Finance (OWN)

    document.getElementById('nav-report').style.setProperty('display', (isBranch) ? '' : 'none', 'important');
    document.getElementById('nav-branches').style.setProperty('display', (isDev) ? '' : 'none', 'important');
    document.getElementById('nav-employees').style.setProperty('display', (isDev) ? '' : 'none', 'important'); 
    document.getElementById('nav-finance').style.setProperty('display', (isDev || isManager || isBranch) ? '' : 'none', 'important');
    const navDailyBudget = document.getElementById('nav-dailybudget');
    if(navDailyBudget) navDailyBudget.style.setProperty('display', (isDev || isManager || isBranch) ? '' : 'none', 'important');
    document.getElementById('nav-admin').style.setProperty('display', (isDev) ? '' : 'none', 'important');
    
    // Branch selector in topbar — only for dev/manager
    const branchSel = document.querySelector('.branch-selector');
    if (branchSel) {
        branchSel.style.display = (!isBranch) ? '' : 'none';
        const sel = document.getElementById('branchSelect');
        if (sel) sel.value = AppState.currentBranch || 'all';
    }
}

function updateUserDisplay() {
    const avatar = document.getElementById('userAvatar');
    if (AppState.userRole === 'developer') {
        avatar.innerHTML = '<span>💰</span>';
        avatar.title = 'المبرمج';
    } else if (AppState.userRole === 'manager') {
        avatar.innerHTML = '<span>👔</span>';
        avatar.title = AppState.managerName;
    } else {
        const branch = BRANCHES[AppState.userBranch];
        avatar.innerHTML = `<span>${branch?.name?.[4] || 'ف'}</span>`;
        avatar.title = branch?.name || '';
        avatar.style.background = `linear-gradient(135deg, ${branch?.color || '#333'} 0%, ${branch?.color || '#333'}cc 100%)`;
    }
}

// -------------------------
// Router / Navigation
// -------------------------
function navigate(page) {
    const isDev = AppState.userRole === 'developer';
    const isManager = AppState.userRole === 'manager';
    const isBranch = AppState.userRole === 'branch';

    // Permission check
    if (isBranch && ['branches','employees','admin'].includes(page)) {
        page = 'dashboard';
    }
    if (isManager && ['branches','admin','report', 'employees'].includes(page)) {
        page = 'dashboard';
    }
    if (!isDev && page === 'admin') {
        page = 'dashboard';
    }

    AppState.currentPage = page;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    const titles = {
        dashboard: isManager ? `لوحة التحكم — ${AppState.managerName}` : (isDev ? 'لوحة التحكم (كاملة)' : 'لوحة التحكم'),
        report: 'التقرير اليومي',
        branches: 'إدارة الفروع',
        employees: 'الموظفين',
        finance: 'المالية',
        dailybudget: 'الميزانية اليومية',
        admin: 'الأدمن إديتور',
    };
    document.getElementById('pageTitle').textContent = titles[page] || '';

     AppState.currentPage = page;
     localStorage.setItem('bms_page', page);

    // Render selected page
    const container = document.getElementById('pageContent');
    container.innerHTML = '';
    container.style.animation = 'none';
    void container.offsetWidth; // reflow
    container.style.animation = '';

    switch (page) {
        case 'dashboard': renderDashboard(container); break;
        case 'report':    renderReport(container);    break;
        case 'branches':  renderBranches(container);  break;
        case 'employees': renderEmployees(container); break;
        case 'finance':   renderFinance(container);   break;
        case 'dailybudget': renderDailyBudget(container); break;
        case 'admin':     renderAdmin(container);     break;
    }
}

// -------------------------
// Page: Dashboard
// -------------------------
function renderDashboard(el) {
    const isDev = AppState.userRole === 'developer';
    const isManager = AppState.userRole === 'manager';
    const isBranch = AppState.userRole === 'branch';

    // Role-specific filtering
    const allReports = AppState.reports;
    const userReports = isBranch ? allReports.filter(r => r.branch === AppState.userBranch) : allReports;

    if (isManager) {
        renderManagerDashboard(el);
        return;
    }

    if (isDev) {
        el.innerHTML = `
        <div class="page-header animate-in">
            <h1>⚙️ مرحباً بك 👋</h1>
            <p>أنت مسجل الدخول كمبرمج (التحكم الكامل والواجهة الخلفية)</p>
        </div>
        <div class="empty-state animate-in">
            <span class="empty-icon">⚙️</span>
            <p>تم تخصيص هذه الواجهة للتحرير وصيانة النظام.<br>يرجى التوجه إلى (الأدمن إديتور) لإدارة الفروع والإعدادات.</p>
            <button class="btn btn-primary" onclick="navigate('admin')" style="margin-top:15px;padding:12px 25px;">الانتقال للأدمن إديتور</button>
        </div>
        `;
        return;
    }

    // Fallback-safe aggregation
    const getInc = (r) => r?.financials?.dailyInflow ?? ((r?.morning?.revenue || 0) + (r?.evening?.revenue || 0));
    const getExp = (r) => r?.financials?.dailyOutflow ?? (r?.expenses?.reduce((s, e) => s + (parseFloat(e?.amount) || 0), 0) || 0);

    // --- Today's Metrics (Ledger-First) ---
    const tDate = today();
    let totalRevenue = 0;
    let totalExpenses = 0;
    let currentBalance = 0;

    if (isBranch) {
        const lKey = `${AppState.userBranch}_${tDate}`;
        if (isLedgerActive(lKey)) {
            totalRevenue = calculateLedgerInflow(lKey);
            totalExpenses = calculateLedgerOutflow(lKey);
            currentBalance = calculateLedgerEndBalance(lKey);
        } else {
            // Fallback to today's report
            const tRep = allReports.find(r => r.branch === AppState.userBranch && r.date === tDate);
            if (tRep) {
                totalRevenue = getInc(tRep);
                totalExpenses = getExp(tRep);
                currentBalance = tRep.currentBalance || 0;
            } else {
                // Second Fallback: Last known historical balance
                const lastRep = userReports[userReports.length - 1];
                currentBalance = lastRep?.currentBalance || 0;
            }
        }
    } else {
        // Manager/Dev "Total" for all branches today
        Object.keys(BRANCHES).forEach(bKey => {
            const lKey = `${bKey}_${tDate}`;
            if (isLedgerActive(lKey)) {
                totalRevenue += calculateLedgerInflow(lKey);
                totalExpenses += calculateLedgerOutflow(lKey);
                currentBalance += calculateLedgerEndBalance(lKey);
            } else {
                const tRep = allReports.find(r => r.branch === bKey && r.date === tDate);
                if (tRep) {
                    totalRevenue += getInc(tRep);
                    totalExpenses += getExp(tRep);
                    currentBalance += tRep.currentBalance || 0;
                }
            }
        });
    }
    const netRevenue = totalRevenue - totalExpenses;

    const branchEntries = Object.entries(BRANCHES).filter(([k]) => k === AppState.userBranch);

    const branchData = branchEntries.map(([key, branch]) => {
        const bReports = allReports.filter(r => r?.branch === key);
        const bRev = bReports.reduce((s, r) => s + getInc(r), 0);
        const bExp = bReports.reduce((s, r) => s + getExp(r), 0);
        const bCalls = bReports.reduce((s,r) => s + (r?.morning?.calls||0) + (r?.evening?.calls||0), 0);
        const bBookings = bReports.reduce((s,r) => s + (r?.morning?.bookings||0) + (r?.evening?.bookings||0), 0);
        const bStaff = EMPLOYEES.filter(e => e.branch === key);
        const bManager = bStaff.find(e => e.role === 'مديرة الفرع');
        const bSecretaries = bStaff.filter(e => e.role !== 'مديرة الفرع');
        const lastReport = bReports[bReports.length - 1];

        // Today's details for the card
        const lKey = `${key}_${tDate}`;
        let tRev = 0, tExp = 0, tBal = 0;
        if (isLedgerActive(lKey)) {
            tRev = calculateLedgerInflow(lKey);
            tExp = calculateLedgerOutflow(lKey);
            tBal = calculateLedgerEndBalance(lKey);
        } else {
            const tRep = allReports.find(r => r.branch === key && r.date === tDate);
            if (tRep) {
                tRev = getInc(tRep);
                tExp = getExp(tRep);
                tBal = tRep.currentBalance || 0;
            } else {
                tBal = lastReport?.currentBalance || 0;
            }
        }

        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport, tRev, tExp, tBal };
    });

    const roleLabel = isDev
        ? '<span class="badge badge-morning" style="font-size:12px;">🛠️ المبرمج</span>'
        : `<span class="badge badge-success" style="font-size:12px;">🏢 ${BRANCHES[AppState.userBranch]?.name || ''}</span>`;

    el.innerHTML = `
    ${!AppState.isInitialSyncComplete ? `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:Cairo;">
        <div class="loader-nitro" style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid var(--primary); border-radius:50%; animation: spin 1s linear infinite; margin-bottom:20px;"></div>
        <h2 style="color:var(--primary); font-weight:900;">Nitro-Sync: جاري جلب البيانات...</h2>
        <p style="color:var(--text-secondary); margin-top:10px;">يرجى الانتظار ثوانٍ للتأكد من مزامنة آخر تقارير الفروع</p>
    </div>
    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    ` : ''}

    <div class="page-header animate-in" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
            <h1>مرحباً بك 👋</h1>
            <p>${isDev ? 'نظرة عامة كاملة على النظام' : 'بيانات فرعك الحالي'}</p>
        </div>
        <button class="official-btn refresh-btn ${AppState.isInitialSyncComplete ? 'synced' : ''}" onclick="forceSyncData()" style="padding:10px 20px; width:auto; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); border-radius:12px; font-weight:700;">
            ${AppState.isInitialSyncComplete ? '✅ تمت المزامنة' : '🔄 تحديث البيانات سحابياً'}
        </button>
    </div>

    <div class="official-summary-banner animate-in">
        <div class="official-summary-item">
            <div class="label">مجموع ايراد اليوم</div>
            <div class="value">${formatNumber(totalRevenue)}</div>
        </div>
        <div class="official-summary-item">
            <div class="label">مجموع منصرف</div>
            <div class="value">${formatNumber(totalExpenses)}</div>
        </div>
        <div class="official-summary-item">
            <div class="label">صافي ايراد اليوم</div>
            <div class="value">${formatNumber(netRevenue)}</div>
        </div>
        <div class="official-summary-item highlight">
            <div class="label">الرصيد الحالي</div>
            <div class="value">${formatNumber(currentBalance)}</div>
        </div>
    </div>

    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">📊 ${isDev ? 'بيانات الفروع المستقلة' : 'بيانات فرعك'}</h2>
    </div>

    <div class="branches-grid">
        ${branchData.map((bd, i) => `
        <div class="official-dashboard-card animate-in" style="animation-delay:${i*0.07}s">
            <div class="official-card-header">
                <div class="name">${bd.branch.name}</div>
                <div class="loc">📍 ${bd.branch.city} ${bd.bManager ? '· مديرة: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="official-card-body">
                <div class="official-stat-row">
                    <span class="official-stat-label">مجموع الإيراد اليوم</span>
                    <span class="official-stat-value">${formatNumber(bd.tRev || 0)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">مجموع المنصرف اليوم</span>
                    <span class="official-stat-value">${formatNumber(bd.tExp || 0)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">صافي إيراد اليوم</span>
                    <span class="official-stat-value" style="color:var(--primary) !important;">${formatNumber(bd.tRev - bd.tExp)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">السكرتارية المختصة</span>
                    <span class="official-stat-value" style="font-size:13px;">${bd.bSecretaries.map(s => s.name).join(' · ') || '—'}</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">الاتصالات / الحجوزات</span>
                    <span class="official-stat-value">${bd.bCalls} / ${bd.bBookings}</span>
                </div>
                <div class="official-stat-row" style="background: rgba(231, 76, 60, 0.08); border-top: 2px solid #e74c3c;">
                    <span class="official-stat-label" style="font-weight: 900; color: #e74c3c;">الرصيد الفعلي الحالي</span>
                    <span class="official-stat-value" style="color: #c0392b !important; font-size: 18px; font-weight: 950; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">${formatNumber(bd.tBal || 0)} ج.م</span>
                </div>
            </div>
            ${isBranch ? `
            <div class="official-card-footer">
                <button class="official-btn" onclick="navigate('report')">
                    ${bd.bReports.some(r => r.date === today()) ? '✏️ تعديل تقرير اليوم' : '📝 تقرير جديد'}
                </button>
            </div>` : ''}
        </div>`).join('')}
    </div>
    `;

    // Animate counters
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        setTimeout(() => animateCount(el, target), 200);
    });
}

// -------------------------
// Manager Specialized Dashboard
// -------------------------
function renderManagerDashboard(el) {
    const allReports = AppState.reports;
    let branchEntries = Object.entries(BRANCHES);
    if (AppState.currentBranch && AppState.currentBranch !== 'all') {
        branchEntries = branchEntries.filter(([key]) => key === AppState.currentBranch);
    }

    const getInc = (r) => r?.financials?.dailyInflow ?? ((r?.morning?.revenue || 0) + (r?.evening?.revenue || 0));
    const getExp = (r) => r?.financials?.dailyOutflow ?? (r?.expenses?.reduce((s, e) => s + (parseFloat(e?.amount) || 0), 0) || 0);

    const branchData = branchEntries.map(([key, branch]) => {
        const bReports = allReports.filter(r => r?.branch === key);
        const bRev = bReports.reduce((s, r) => s + getInc(r), 0);
        const bExp = bReports.reduce((s, r) => s + getExp(r), 0);
        const bCalls = bReports.reduce((s, r) => s + (r?.morning?.calls || 0) + (r?.evening?.calls || 0), 0);
        const bBookings = bReports.reduce((s, r) => s + (r?.morning?.bookings || 0) + (r?.evening?.bookings || 0), 0);
        const bStaff = EMPLOYEES.filter(e => e.branch === key);
        const bManager = bStaff.find(e => e.role === 'مديرة الفرع');
        const bSecretaries = bStaff.filter(e => e.role !== 'مديرة الفرع');
        const lastReport = bReports[bReports.length - 1];
        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport };
    });

    const selectedBranchName = (AppState.currentBranch && AppState.currentBranch !== 'all') 
        ? BRANCHES[AppState.currentBranch]?.name 
        : 'جميع الفروع المستقلة';

    // --- Aggregate Manager Metrics for Today ---
    const tDate = today();
    let totalManagerRev = 0;
    let totalManagerExp = 0;
    let totalManagerBal = 0;

    branchData.forEach(bd => {
        const lKey = `${bd.key}_${tDate}`;
        if (isLedgerActive(lKey)) {
            bd.tRev = calculateLedgerInflow(lKey);
            bd.tExp = calculateLedgerOutflow(lKey);
            bd.tBal = calculateLedgerEndBalance(lKey);
        } else {
            const tRep = allReports.find(r => r.branch === bd.key && r.date === tDate);
            bd.tRev = tRep ? getInc(tRep) : 0;
            bd.tExp = tRep ? getExp(tRep) : 0;
            bd.tBal = tRep ? (tRep.currentBalance || 0) : (bd.lastReport?.currentBalance || 0);
        }
        totalManagerRev += bd.tRev;
        totalManagerExp += bd.tExp;
        totalManagerBal += bd.tBal;
    });
    const totalManagerNet = totalManagerRev - totalManagerExp;

    const summaryBannerHTML = `
    <div class="official-summary-banner animate-in">
        <div class="official-summary-item" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #fff; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div class="label" style="color:#fff; font-weight:800;">مجموع ايراد اليوم</div>
            <div class="value" style="color:#fff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${formatNumber(totalManagerRev)}</div>
        </div>
        <div class="official-summary-item" style="background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color: #fff; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div class="label" style="color:#fff; font-weight:800;">مجموع منصرف</div>
            <div class="value" style="color:#fff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${formatNumber(totalManagerExp)}</div>
        </div>
        <div class="official-summary-item" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: #fff; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div class="label" style="color:#fff; font-weight:800;">صافي ايراد اليوم</div>
            <div class="value" style="color:#fff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${formatNumber(totalManagerNet)}</div>
        </div>
        <div class="official-summary-item highlight" style="background: linear-gradient(135deg, #f39c12 0%, #d35400 100%); color: #fff; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div class="label" style="color:#fff !important; font-weight:800; opacity:1;">إجمالي الرصيد الحالي</div>
            <div class="value" style="color:#fff !important; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${formatNumber(totalManagerBal)}</div>
        </div>
    </div>`;

    const branchesGridHTML = `
    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">📊 بيانات الفروع (نظرة عامة)</h2>
    </div>
    <div class="branches-grid" style="margin-bottom:30px;">
        ${branchData.map((bd, i) => `
        <div class="official-dashboard-card animate-in" style="animation-delay:${i*0.07}s; border:1px solid rgba(0,0,0,0.05); box-shadow:0 6px 15px rgba(0,0,0,0.05);">
            <div class="official-card-header" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-bottom:none;">
                <div class="name" style="color:#fff;">${bd.branch.name}</div>
                <div class="loc" style="color:rgba(255,255,255,0.8);">📍 ${bd.branch.city} ${bd.bManager ? '· مديرة: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="official-card-body">
                <div class="official-stat-row">
                    <span class="official-stat-label">مجموع الإيراد اليوم</span>
                    <span class="official-stat-value">${formatNumber(bd.tRev)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">مجموع المنصرف اليوم</span>
                    <span class="official-stat-value">${formatNumber(bd.tExp)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">الصافي النهائي اليوم</span>
                    <span class="official-stat-value" style="color:var(--primary) !important;">${formatNumber(bd.tRev - bd.tExp)} ج.م</span>
                </div>
                <div class="official-stat-row">
                    <span class="official-stat-label">السكرتارية المختصة</span>
                    <span class="official-stat-value" style="font-size:13px;">${bd.bSecretaries.map(s => s.name).join(' · ') || '—'}</span>
                </div>
                <div class="official-stat-row" style="background: rgba(231, 76, 60, 0.08); border-top: 2px solid #e74c3c;">
                    <span class="official-stat-label" style="font-weight: 900; color: #e74c3c;">الرصيد الفعلي الحالي</span>
                    <span class="official-stat-value" style="color: #c0392b !important; font-size: 18px; font-weight: 950; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">${formatNumber(bd.tBal)} ج.م</span>
                </div>
            </div>
        </div>`).join('')}
    </div>`;

    el.innerHTML = `
    ${!AppState.isInitialSyncComplete ? `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:Cairo;">
        <div class="loader-nitro" style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid var(--primary); border-radius:50%; animation: spin 1s linear infinite; margin-bottom:20px;"></div>
        <h2 style="color:var(--primary); font-weight:900;">Nitro-Sync: جاري جلب البيانات...</h2>
        <p style="color:var(--text-secondary); margin-top:10px;">يرجى الانتظار ثوانٍ للتأكد من مزامنة آخر تقارير الفروع</p>
    </div>
    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    ` : ''}

    <div class="page-header animate-in" style="display:flex;align-items:center;justify-content:space-between;">
        <div>
            <h1>مرحباً ${AppState.managerName} 👋</h1>
            <p>استعراض التقارير اليومية للفروع</p>
        </div>
        <button class="official-btn refresh-btn ${AppState.isInitialSyncComplete ? 'synced' : ''}" onclick="forceSyncData()" style="padding:10px 20px; width:auto; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-primary); border-radius:12px; font-weight:700;">
            ${AppState.isInitialSyncComplete ? '✅ تمت المزامنة' : '🔄 تحديث البيانات سحابياً'}
        </button>
    </div>
    ${summaryBannerHTML}
    ${branchesGridHTML}

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon morning">🔍</div>
            <h3>تصفية التقارير التفصيلية</h3>
        </div>
        <div class="section-card-body" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; align-items:end;">
            <div class="form-group">
                <label>اختر التاريخ</label>
                <div style="display:flex; gap:8px;">
                    <input type="date" id="mDateFilter" class="form-input" value="${today()}">
                    <button class="btn btn-outline" style="padding:8px 12px; min-width:unset; border-radius:10px; background:var(--bg-input);" onclick="resetManagerDate()" title="العودة لليوم">🔄</button>
                </div>
            </div>
            <div class="form-group">
                <label>اختر الفرع</label>
                <select id="mBranchFilter" class="form-input">
                    <option value="all">جميع الفروع (تقرير مجمع)</option>
                    ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
                </select>
            </div>
            <button class="btn btn-primary" onclick="searchManagerReport()" style="padding:12px;">إظهار التقرير</button>
        </div>
    </div>

    <div id="mReportResult" class="animate-in" style="margin-top:20px;">
        <div class="empty-state">
            <span class="empty-icon">📂</span>
            <p>اختر التاريخ والفرع ثُم اضغط على "إظهار التقرير"</p>
        </div>
    </div>
    `;
}

window.resetManagerDate = function() {
    const picker = document.getElementById('mDateFilter');
    if (picker) {
        picker.value = today();
        searchManagerReport();
    }
};

window.searchManagerReport = function() {
    const date = document.getElementById('mDateFilter').value;
    const branchKey = document.getElementById('mBranchFilter').value;
    const res = document.getElementById('mReportResult');

    const reports = (branchKey === 'all') 
        ? AppState.reports.filter(r => r.date === date)
        : AppState.reports.filter(r => r?.branch === branchKey && r.date === date);

    if (reports.length === 0) {
        res.innerHTML = `
        <div class="empty-state animate-in">
            <span class="empty-icon">❌</span>
            <p>لا توجد تقارير مسجلة لهذا التاريخ ${branchKey === 'all' ? 'لجميع الفروع' : 'للفرع المحدد'}</p>
        </div>`;
        return;
    }

    if (branchKey === 'all') {
        const totalRev = reports.reduce((s, r) => s + (r?.financials?.dailyInflow || 0), 0);
        const totalExp = reports.reduce((s, r) => s + (r?.financials?.dailyOutflow || 0), 0);
        const totalBucks = reports.reduce((s, r) => s + (r?.morning?.bookings || 0) + (r?.evening?.bookings || 0), 0);

        res.innerHTML = `
        <div class="summary-grid animate-in" style="margin-bottom:20px;">
            <div class="summary-card red" style="padding:15px;">
                <div class="card-label">إجمالي إيراد الفروع</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalRev)} <small>ج.م</small></div>
            </div>
            <div class="summary-card gold" style="padding:15px;">
                <div class="card-label">إجمالي المصروفات</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalExp)} <small>ج.م</small></div>
            </div>
            <div class="summary-card green" style="padding:15px;">
                <div class="card-label">صافي إجمالي اليوم</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalRev - totalExp)} <small>ج.م</small></div>
            </div>
            <div class="summary-card blue" style="padding:15px;">
                <div class="card-label">إجمالي الحجوزات</div>
                <div class="card-value" style="font-size:20px;">${totalBucks} <span style="font-size:12px;">حجز</span></div>
            </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:40px; padding-bottom:50px;">
            ${reports.map(report => renderOfficialTable(report)).join('')}
        </div>`;
    } else {
        res.innerHTML = reports.map(report => renderOfficialTable(report)).join('');
    }
};

window.renderOfficialTable = function(report) {
    const b = BRANCHES[report.branch] || { name: 'فرع مجهول', color: '#b20000', city: '—' };
    const morningSecs = report.morning?.secretaries || [];
    const eveningSecs = report.evening?.secretaries || [];
    
    return `
    <div class="official-report-container animate-in" style="background:var(--bg-card); border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.08); overflow:hidden; border:1px solid rgba(0,0,0,0.05); margin-bottom: 25px;">
        <!-- HEADER -->
        <div class="official-header-red" style="font-size:20px; padding:15px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border:none; color:#fff;">
            تقرير فرع (( ${b.name} يوم ${report.dayName || new Date(report.date).toLocaleDateString('ar-EG', { weekday: 'long' })} ${report.date} ))
        </div>

        <!-- MORNING SECTION -->
        <div class="official-header-red" style="background: linear-gradient(135deg, #f39c12 0%, #d35400 100%); border:none; border-top:1px solid rgba(255,255,255,0.2); color:#fff; font-size:18px;">☀️ الفترة الصباحية</div>
        <div class="official-full-row" style="background: var(--bg-hover); border:1px solid rgba(0,0,0,0.05); border-top:none;">بداية العمل (فتح المقر) في ${report.morning?.openTime || '10:00'}</div>

        <div class="official-table-grid">
            <!-- Row 1: Secretaries -->
            ${morningSecs.length > 0 ? morningSecs.map((s) => `
                <div class="official-cell" style="text-align:right; padding-right:15px;">السكرتاريه المختصه: ${s.name}</div>
                <div class="official-cell">${s.start || '-'}</div>
                <div class="official-cell">${s.end || '-'}</div>
            `).join('') : `
                <div class="official-full-row">لا يوجد بيانات سكرتارية صباحية</div>
            `}
            
            <!-- Row 2: Stats -->
            <div class="official-cell">عدد الاتصالات : ${report.morning?.calls || 0}</div>
            <div class="official-cell">حجوزات الفتره الصباحيه : ${report.morning?.bookings || 0}</div>
            <div class="official-cell" style="background:var(--bg-input);">ايراد الفترة الصباحية : ${formatNumber(report.morning?.inflow || 0)}</div>
        </div>

        <!-- EVENING SECTION -->
        <div class="official-header-red" style="background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); border:none; color:#fff; font-size:18px;">🌙 الفترة المسائية</div>
        <div class="official-full-row" style="background: var(--bg-hover); border:1px solid rgba(0,0,0,0.05); border-top:none;">نهاية العمل (اغلاق المقر) في ${report.evening?.closeTime || '22:00'}</div>

        <div class="official-table-grid">
            <!-- Row 1: Secretaries -->
            ${eveningSecs.length > 0 ? eveningSecs.map((s) => `
                <div class="official-cell" style="text-align:right; padding-right:15px;">السكرتاريه المختصه:${s.name}</div>
                <div class="official-cell">${s.start || '-'}</div>
                <div class="official-cell">${s.end || '-'}</div>
            `).join('') : `
                <div class="official-full-row">لا يوجد بيانات سكرتارية مسائية</div>
            `}
            
            <!-- Row 2: Stats -->
            <div class="official-cell">عدد الاتصالات: ${report.evening?.calls || 0}</div>
            <div class="official-cell">عدد حجوزات الفتره المسائيه: ${report.evening?.bookings || 0}</div>
            <div class="official-cell">ايراد الفترة المسائيه: ${formatNumber(report.evening?.inflow || 0)}</div>
        </div>

        <!-- TEACHER BOOKINGS -->
        <div class="official-full-row" style="background:var(--bg-input);">
            حجوزات خاصة لمدرس : ${report.teacherBookings || '-'}
        </div>

        <!-- FINANCIAL SUMMARY -->
        <div class="official-table-grid" style="border:1px solid rgba(0,0,0,0.05);">
            <div class="official-header-red" style="grid-column: span 1; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border:none; color:#fff;">مجموع ايراد اليوم:</div>
            <div class="official-header-red" style="grid-column: span 1; background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); border:none; border-right:1px solid rgba(0,0,0,0.05); color:#fff;">مجموع منصرف:</div>
            <div class="official-header-red" style="grid-column: span 1; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border:none; border-right:1px solid rgba(0,0,0,0.05); color:#fff;">صافي ايراد اليوم:</div>
            
            <div class="official-cell" style="background:var(--bg-card); font-size:22px; color:#11998e; border:none; border-top:1px solid rgba(0,0,0,0.05);">${formatNumber(report.financials?.dailyInflow || 0)}</div>
            <div class="official-cell" style="background:var(--bg-card); font-size:22px; color:#cb2d3e; border:none; border-right:1px solid rgba(0,0,0,0.05); border-top:1px solid rgba(0,0,0,0.05);">${formatNumber(report.financials?.dailyOutflow || 0)}</div>
            <div class="official-cell" style="background:var(--bg-card); font-size:22px; color:#1e3c72; border:none; border-right:1px solid rgba(0,0,0,0.05); border-top:1px solid rgba(0,0,0,0.05);">${formatNumber(report.financials?.totalNet || 0)}</div>
        </div>

        <!-- BALANCE BAR -->
        <div class="official-header-red" style="margin-top:2px; font-size:22px; background: linear-gradient(135deg, #f39c12 0%, #d35400 100%); border:none; color:#fff; text-shadow:0 2px 4px rgba(0,0,0,0.2);">
            الحالي : ${formatNumber(report.currentBalance || 0)}
        </div>

        <!-- EXPENSE TABLE -->
        <div class="official-table-grid" style="border:1px solid rgba(0,0,0,0.05);">
            <div class="official-cell" style="background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color:#fff; border:none; font-size:16px;">المنصرف</div>
            <div class="official-cell" style="background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color:#fff; border:none; border-right:1px solid rgba(255,255,255,0.2); font-size:16px;">نوعه</div>
            <div class="official-cell" style="background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color:#fff; border:none; border-right:1px solid rgba(255,255,255,0.2); font-size:16px;">المستفيد</div>
            
            ${(report.financials?.outflowList || []).length > 0 ? (report.financials.outflowList.map(item => `
                <div class="official-cell" style="background:var(--bg-card); border:none; border-top:1px solid rgba(0,0,0,0.05); color:#cb2d3e;">${formatNumber(item.amount)}</div>
                <div class="official-cell" style="background:var(--bg-card); border:none; border-right:1px solid rgba(0,0,0,0.05); border-top:1px solid rgba(0,0,0,0.05);">${item.statement}</div>
                <div class="official-cell" style="background:var(--bg-card); border:none; border-right:1px solid rgba(0,0,0,0.05); border-top:1px solid rgba(0,0,0,0.05);">-</div>
            `).join('')) : `
                <div class="official-full-row" style="color:var(--text-muted); font-style:italic; background:var(--bg-card); border:none; border-top:1px dashed rgba(0,0,0,0.1);">لا يوجد منصرفات تفصيلية</div>
            `}
        </div>

        <!-- FOOTER -->
        <div class="official-header-red" style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); border:none; color:#fff;">الغيابات والالغاءات</div>
        <div class="official-table-grid">
             <div class="official-cell" style="background:var(--bg-input);">المدرس</div>
             <div class="official-cell" style="background:var(--bg-input);">عدد المجموعات الملغاه</div>
             <div class="official-cell" style="background:var(--bg-input);">سبب الالغاء</div>
             
             <div class="official-full-row" style="background:var(--bg-card); font-size:13px;">${report.cancellations || 'لا يوجد جروبات ملغيه علي مدار اليوم'}</div>
        </div>
        
        <div class="official-cell" style="grid-column:span 3; background:var(--bg-input); border-top:none; border-bottom:3px solid var(--primary); font-size:18px;">
            كتابه التقرير : ${report.evening?.reportedBy || report.morning?.secretaries?.[0]?.name || '—'}
        </div>
    </div>
    `;
};

// -------------------------
// Page: Admin
// -------------------------


window.updateManagerName = function() {
    AppState.managerName = document.getElementById('adminManagerName').value;
    saveData();
    showToast('تم تحديث اسم المدير بنجاح', 'success');
};

// -------------------------
// Page: Daily Report Form
// -------------------------
function renderReport(el, existingData = null) {
    // Current bKey logic moved inside for dynamic updating
    const getReportContext = () => {
        const branchSelect = document.getElementById('branchSelect2');
        const bKey = branchSelect ? branchSelect.value : (AppState.userBranch || AppState.currentBranch || 'soyouf');
        const reportDate = document.getElementById('reportDate')?.value || today();
        return { bKey, reportDate };
    };

    // Auto-detect existing report for today if none passed
    if (!existingData) {
        const ctx = getReportContext();
        existingData = AppState.reports.find(r => r.branch === ctx.bKey && r.date === ctx.reportDate) || null;
    }
    const bKey = existingData?.branch || AppState.userBranch || AppState.currentBranch || 'soyouf';
    const data = existingData || {};
    const morning = data.morning || {};
    const evening = data.evening || {};
    const financials = data.financials || {};

    el.innerHTML = `
    <!-- Report Metadata Top-Header (Glassmorphism Style) -->
    <div class="report-meta-header animate-in" style="margin-bottom:30px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:20px; padding:20px; box-shadow:var(--shadow-md); position:relative; overflow:hidden;">
         <!-- Vertical Title Accent -->
         <div style="position:absolute; right:0; top:0; bottom:0; width:4px; background:var(--gradient-primary);"></div>
         
         <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:20px; align-items:flex-end;">
            <div class="form-group">
                <label>الفرع</label>
                ${AppState.userRole === 'branch' 
                    ? `<div style="padding:12px; background:var(--bg-input); border-radius:12px; font-weight:bold; color:var(--primary); font-size:16px;">${BRANCHES[AppState.userBranch]?.name}</div>
                       <input type="hidden" id="branchSelect2" value="${AppState.userBranch}">`
                    : `<select id="branchSelect2" style="padding:12px; border-radius:12px;">
                        ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${k===(data.branch || AppState.userBranch || 'soyouf')?'selected':''}>${v.name}</option>`).join('')}
                       </select>`
                }
            </div>
            <div class="form-group">
                <label>التاريخ</label>
                <div style="display:flex; gap:10px; align-items:center;">
                    <input type="date" id="reportDate" value="${data.date || today()}" style="padding:12px; border-radius:12px; flex:1;">
                    <button class="official-btn" onclick="reloadReportByDate()" title="مزامنة بيانات التاريخ المحدد" style="padding:12px; width:45px; height:45px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:var(--primary); color:#fff; border:none; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        🔄
                    </button>
                    <button class="official-btn" onclick="reloadReportByDate(true)" title="العودة لليوم" style="padding:12px; width:45px; height:45px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:var(--accent); color:#fff; border:none; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        🏠
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>الرصيد الفعلي بالخزنة (ج.م)</label>
                <input type="text" id="currentBalance" readonly value="${data.currentBalance || financials.totalNet || '0'}" style="padding:12px; border-color:var(--primary); font-weight:900; font-size:18px; background:rgba(41,128,185,0.05) !important; cursor:not-allowed; border-radius:12px;">
            </div>
            <div class="form-group">
                <label>حرر التقرير بواسطة</label>
                <select id="reportedBy" style="padding:12px; border-radius:12px; font-weight:bold; color:var(--primary);">
                    <option value="">اختر الاسم...</option>
                </select>
            </div>
         </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:25px;">
        <!-- Morning Shift Masterpiece -->
        <div class="official-dashboard-card shift-card animate-in" style="border:none; background:var(--bg-card); box-shadow:0 10px 30px rgba(0,0,0,0.08); overflow:visible; border-radius:20px;">
            <div class="shift-pill-header morning-pill" style="background:linear-gradient(135deg, #f39c12, #e67e22); padding:14px 30px; border-radius:100px; margin:15px 15px 0; text-align:center; font-weight:900; font-size:17px; color:#fff; box-shadow:0 6px 20px rgba(243,156,18,0.4); letter-spacing:0.5px;">
                ☀️ الفترة الصباحية
            </div>
            <div class="official-card-body" style="padding:25px;">
                <div class="form-group">
                    <label>السكرتارية المتواجدة</label>
                    <div id="morningSecretaryChecklist" class="secretary-checklist"></div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:20px;">
                    <div class="form-group">
                        <label>وقت الفتح</label>
                        <input type="time" id="morningOpenTime" value="${morning.openTime || '10:00'}">
                    </div>
                    <div class="form-group">
                        <label>وقت الإغلاق</label>
                        <input type="time" id="morningCloseTime" value="${morning.closeTime || '18:00'}">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
                    <div class="form-group">
                        <label>عدد الاتصالات</label>
                        <input type="text" inputmode="numeric" id="morningCalls" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="${morning.calls || ''}">
                    </div>
                    <div class="form-group">
                        <label>الحجوزات</label>
                        <input type="text" inputmode="numeric" id="morningBookings" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="${morning.bookings || ''}">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label>ملاحظات (الصباحية)</label>
                    <input type="text" id="morningBookingNote" class="compact-input" placeholder="مثال: كورس PH1" value="${morning.bookingNote || ''}">
                </div>
                
                <div style="margin-top:25px; border-top: 2px dashed rgba(0,0,0,0.05); padding-top:20px;">
                    <div style="background:linear-gradient(135deg, #11998e, #38ef7d); padding:12px 20px; color:#fff; border-radius:100px; margin-bottom:15px; font-weight:800; font-size:15px; text-align:center; box-shadow:0 4px 15px rgba(17,153,142,0.3);">📥 وارد الصباح (دخول)</div>
                    <div id="morningInflowRows" class="transaction-list inflow-list"></div>
                    <button class="btn btn-add-row inflow" style="padding:10px; margin-bottom:20px; width:100%; border-radius:100px; font-weight:bold; background:rgba(17,153,142,0.1); color:#11998e; border:1px dashed #11998e;" onclick="addInflowRow('morningInflowRows')">+ إضافة وارد صباحي</button>

                    <div style="background:linear-gradient(135deg, #cb2d3e, #ef473a); padding:12px 20px; color:#fff; border-radius:100px; margin-bottom:15px; font-weight:800; font-size:15px; text-align:center; box-shadow:0 4px 15px rgba(203,45,62,0.3);">📤 منصرف الصباح (خروج)</div>
                    <div id="morningOutflowRows" class="transaction-list outflow-list"></div>
                    <button class="btn btn-add-row outflow" style="padding:10px; width:100%; border-radius:100px; font-weight:bold; background:rgba(203,45,62,0.1); color:#cb2d3e; border:1px dashed #cb2d3e;" onclick="addOutflowRow('morningOutflowRows')">+ إضافة منصرف صباحي</button>
                </div>
            </div>
        </div>

        <!-- Evening Shift Masterpiece -->
        <div class="official-dashboard-card shift-card animate-in" style="border:none; background:var(--bg-card); box-shadow:0 10px 30px rgba(0,0,0,0.08); overflow:visible; border-radius:20px;">
            <div class="shift-pill-header evening-pill" style="background:linear-gradient(135deg, #2980b9, #1a5276); padding:14px 30px; border-radius:100px; margin:15px 15px 0; text-align:center; font-weight:900; font-size:17px; color:#fff; box-shadow:0 6px 20px rgba(41,128,185,0.4); letter-spacing:0.5px;">
                🌙 الفترة المسائية
            </div>
            <div class="official-card-body" style="padding:25px;">
                <div class="form-group">
                    <label>السكرتارية المتواجدة</label>
                    <div id="eveningSecretaryChecklist" class="secretary-checklist"></div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:20px;">
                    <div class="form-group">
                        <label>وقت الفتح</label>
                        <input type="time" id="eveningOpenTime" value="${evening.openTime || '14:00'}">
                    </div>
                    <div class="form-group">
                        <label>وقت الإغلاق</label>
                        <input type="time" id="eveningCloseTime" value="${evening.closeTime || '22:00'}">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
                    <div class="form-group">
                        <label>عدد الاتصالات</label>
                        <input type="text" inputmode="numeric" id="eveningCalls" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="${evening.calls || ''}">
                    </div>
                    <div class="form-group">
                        <label>الحجوزات</label>
                        <input type="text" inputmode="numeric" id="eveningBookings" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="${evening.bookings || ''}">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label>ملاحظات (المسائية)</label>
                    <input type="text" id="eveningBookingNote" class="compact-input" placeholder="مثال: كورس PH1" value="${evening.bookingNote || ''}">
                </div>
                
                <div style="margin-top:25px; border-top: 2px dashed rgba(0,0,0,0.05); padding-top:20px;">
                    <div style="background:linear-gradient(135deg, #11998e, #38ef7d); padding:12px 20px; color:#fff; border-radius:100px; margin-bottom:15px; font-weight:800; font-size:15px; text-align:center; box-shadow:0 4px 15px rgba(17,153,142,0.3);">📥 وارد المساء (دخول)</div>
                    <div id="eveningInflowRows" class="transaction-list inflow-list"></div>
                    <button class="btn btn-add-row inflow" style="padding:10px; margin-bottom:20px; width:100%; border-radius:100px; font-weight:bold; background:rgba(17,153,142,0.1); color:#11998e; border:1px dashed #11998e;" onclick="addInflowRow('eveningInflowRows')">+ إضافة وارد مسائي</button>

                    <div style="background:linear-gradient(135deg, #cb2d3e, #ef473a); padding:12px 20px; color:#fff; border-radius:100px; margin-bottom:15px; font-weight:800; font-size:15px; text-align:center; box-shadow:0 4px 15px rgba(203,45,62,0.3);">📤 منصرف المساء (خروج)</div>
                    <div id="eveningOutflowRows" class="transaction-list outflow-list"></div>
                    <button class="btn btn-add-row outflow" style="padding:10px; width:100%; border-radius:100px; font-weight:bold; background:rgba(203,45,62,0.1); color:#cb2d3e; border:1px dashed #cb2d3e;" onclick="addOutflowRow('eveningOutflowRows')">+ إضافة منصرف مسائي</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Combined Statements logic has been integrated above into Morning and Evening shifts -->

    <div class="official-dashboard-card animate-in" style="margin-top:25px; border:none; background:#fff;">
         <div class="official-card-header" style="background:linear-gradient(90deg, #34495e, #2c3e50); padding:12px 20px;">
            <div class="name" style="color:#fff; font-size:16px;">📋 ملاحظات المدرسين والغيابات</div>
        </div>
        <div class="official-card-body" style="padding:20px; display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div class="form-group">
                <label>حجوزات خاصة لمدرس</label>
                <textarea id="teacherBookings" placeholder="تفاصيل حجوزات المدرسين...">${data.teacherBookings || ''}</textarea>
            </div>
            <div class="form-group">
                <label>الغيابات والإلغاءات</label>
                <textarea id="cancellations" placeholder="تفاصيل الغيابات والإلغاءات...">${data.cancellations || ''}</textarea>
            </div>
        </div>
    </div>

    <!-- Financial Masterpiece Card -->
    <div class="financial-summary-card animate-in" style="margin-top:25px; background:linear-gradient(135deg, #001f3f 0%, #004d40 100%);">
        <div class="summary-title-bar" style="background:rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.1);">
            💰 ملخص مالية اليوم بالكامل
        </div>
        <div class="summary-grid">
            <div class="summary-box prev-balance-box" style="background:linear-gradient(135deg, rgba(243,156,18,0.2), rgba(230,126,34,0.1)); border:2px solid rgba(243,156,18,0.5); border-radius:16px; box-shadow:0 0 20px rgba(243,156,18,0.15); position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 10px;">
                    <span class="label" style="color:#ffd93d; font-weight:700; margin-bottom:0;">✏️ الرصيد السابق (المتبقي من أمس)</span>
                    <button type="button" onclick="syncPreviousBalance()" style="background:rgba(255,217,61,0.2); border:1px solid #ffd93d; color:#ffd93d; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; font-weight:bold; transition:all 0.2s;" title="جلب الرصيد من التقرير السابق مباشرة">🔄 مزامنة</button>
                </div>
                <input type="text" inputmode="decimal" id="previousBalance" placeholder="اكتب المبلغ هنا..." 
                       oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,''); calculateGlobalBalance();" 
                       style="width: 100%; border: none; background: transparent; text-align: center; font-size: 28px; font-weight: 900; color: #ffd93d; outline: none; cursor:text; margin-top:8px;" 
                       value="${financials.previousBalance || ''}">
                <div style="text-align:center; font-size:11px; color:rgba(255,217,61,0.5); margin-top:4px;">⬆ اضغط هنا للإدخال أو استخدم زر المزامنة 🔄</div>
            </div>
            <div class="summary-box inflow-box" style="background:rgba(39,174,96,0.15); border:1px solid rgba(39,174,96,0.3);">
                <span class="label" style="color:#2ecc71;">إجمالي الوارد (محسوب)</span>
                <input type="text" id="dailyInflow" readonly 
                       style="width: 100%; border: none; background: transparent; text-align: center; font-size: 28px; font-weight: 900; color: #2ecc71; outline: none;" 
                       value="${financials.dailyInflow || '0'}">
            </div>
            <div class="summary-box outflow-box" style="background:rgba(231,76,60,0.15); border:1px solid rgba(231,76,60,0.3);">
                <span class="label" style="color:#ff7675;">إجمالي المنصرف (محسوب)</span>
                <input type="text" id="dailyOutflow" readonly 
                       style="width: 100%; border: none; background: transparent; text-align: center; font-size: 28px; font-weight: 900; color: #ff7675; outline: none;" 
                       value="${financials.dailyOutflow || '0'}">
            </div>
        </div>
        <div class="net-balance-container" style="background:rgba(255,255,255,0.05);">
            <div class="net-balance-label" style="opacity:0.8; font-size:14px;">📊 الصافي النهائي لليوم (شامل الرصيد السابق)</div>
            <div class="net-balance-highlight" id="totalDailyNetDisplay" style="text-shadow:0 0 20px rgba(0,229,255,0.5);">
                ${formatNumber(financials.totalNet || 0)}
            </div>
            <input type="hidden" id="totalDailyNet" value="${financials.totalNet || '0'}">
        </div>
    </div>

    <!-- Submission and Actions -->
    <div class="form-actions animate-in" style="margin-top:40px; display:flex; flex-direction:column; align-items:center; gap:20px;">
        <button class="btn btn-primary" onclick="saveReport()" ${!AppState.isInitialSyncComplete ? 'disabled' : ''} style="padding:18px 80px; border-radius:100px; font-size:20px; font-weight:bold; box-shadow:0 10px 30px rgba(0,96,100,0.3); background:var(--gradient-primary); border:none; color:#fff; ${!AppState.isInitialSyncComplete ? 'opacity:0.5; cursor:not-allowed;' : ''}">
            ${!AppState.isInitialSyncComplete ? '⏳ جاري المزامنة مع السحابة...' : `💾 ${existingData ? 'تحديث التقرير النهائي' : 'حفظ وإرسال التقرير'}`}
        </button>
        <button class="btn btn-outline" onclick="navigate('dashboard')" style="padding:12px 40px; border-radius:100px; border:1px solid var(--border-color); color:var(--text-secondary);">
            ↩ إلغاء والعودة للوحة التحكم
        </button>
    </div>
    `;
    
    // Initial population
    const currentBKey = (AppState.userRole === 'branch') ? AppState.userBranch : document.getElementById('branchSelect2').value;
    
    // Set saved value for reporter dropdown first
    const reporterSelect = document.getElementById('reportedBy');
    if (reporterSelect) reporterSelect.dataset.savedVal = data.reportedBy || "";

    updateSecretaryLists(bKey, morning.secretaries, evening.secretaries);

    // Restore per-shift inflow/outflow rows
    const morningInflows = financials.morningInflowList || [];
    const morningOutflows = financials.morningOutflowList || [];
    const eveningInflows = financials.eveningInflowList || [];
    const eveningOutflows = financials.eveningOutflowList || [];

    // Check if we have per-shift data (new format) or legacy global data
    if (morningInflows.length || eveningInflows.length || morningOutflows.length || eveningOutflows.length) {
        // New per-shift format
        if (morningInflows.length) morningInflows.forEach(item => addInflowRow('morningInflowRows', item));
        else addInflowRow('morningInflowRows');
        
        if (eveningInflows.length) eveningInflows.forEach(item => addInflowRow('eveningInflowRows', item));
        else addInflowRow('eveningInflowRows');
        
        if (morningOutflows.length) morningOutflows.forEach(item => addOutflowRow('morningOutflowRows', item));
        else addOutflowRow('morningOutflowRows');
        
        if (eveningOutflows.length) eveningOutflows.forEach(item => addOutflowRow('eveningOutflowRows', item));
        else addOutflowRow('eveningOutflowRows');
    } else if (financials.inflowList && financials.inflowList.length > 0) {
        // Legacy format — dump in morning for backward compatibility
        financials.inflowList.forEach(item => addInflowRow('morningInflowRows', item));
        addInflowRow('eveningInflowRows');
        if (financials.outflowList && financials.outflowList.length > 0) {
            financials.outflowList.forEach(item => addOutflowRow('morningOutflowRows', item));
        } else {
            addOutflowRow('morningOutflowRows');
        }
        addOutflowRow('eveningOutflowRows');
    } else {
        // Brand new report — one empty row each
        addInflowRow('morningInflowRows');
        addInflowRow('eveningInflowRows');
        addOutflowRow('morningOutflowRows');
        addOutflowRow('eveningOutflowRows');
    }

    // Auto-fetch/Sync previous balance
    const currentLedgerKey = `${bKey}_${data.date || today()}`;
    const ledger = AppState.ledgers[currentLedgerKey];
    if (ledger && ledger.previousBalance) {
        const prevInput = document.getElementById('previousBalance');
        if (prevInput) {
            prevInput.value = ledger.previousBalance;
            calculateGlobalBalance();
        }
    } else if (!existingData || !financials.previousBalance) {
        fetchLastBalance(bKey);
    }

    // Sync checklists and handle dynamic re-fetching for branch/date changes
    const bSel = document.getElementById('branchSelect2');
    if (bSel) {
        bSel.addEventListener('change', (e) => {
            const newBranch = e.target.value;
            const targetDate = document.getElementById('reportDate').value;
            // Check if we have a report for this new combination
            const existing = AppState.reports.find(r => r.branch === newBranch && r.date === targetDate);
            renderReport(el, existing); // Re-render with new data
        });
    }
}

window.updateSecretaryLists = function(branchKey, morningData = [], eveningData = []) {
    const morningContainer = document.getElementById('morningSecretaryChecklist');
    const eveningContainer = document.getElementById('eveningSecretaryChecklist');
    if (!morningContainer || !eveningContainer) return;

    const branchStaff = EMPLOYEES.filter(e => e.branch === branchKey);
    
    const renderList = (shift) => {
        const defStart = (shift === 'morning') ? document.getElementById('morningOpenTime').value : document.getElementById('eveningOpenTime').value;
        const defEnd = (shift === 'morning') ? document.getElementById('morningCloseTime').value : document.getElementById('eveningCloseTime').value;
        
        return branchStaff.map(emp => `
            <div class="presence-card animate-in" onclick="togglePresence(this, '${shift}')">
                <div class="check-icon">✓</div>
                <div class="avatar-circle">${emp.name[0]}</div>
                <div class="emp-name">${emp.name}</div>
                <div class="emp-role">${emp.role}</div>
                
                <div class="card-times" onclick="event.stopPropagation()">
                    <div class="time-input-group">
                        <label>الحضور</label>
                        <input type="time" class="time-in" value="${defStart}">
                    </div>
                    <div class="time-input-group">
                        <label>الانصراف</label>
                        <input type="time" class="time-out" value="${defEnd}">
                    </div>
                </div>
                <input type="checkbox" style="display:none;" data-name="${emp.name}">
            </div>
        `).join('') || '<p style="color:var(--text-secondary); padding:10px;">لا يوجد موظفين مسجلين هذا الفرع</p>';
    };

    morningContainer.innerHTML = renderList('morning');
    eveningContainer.innerHTML = renderList('evening');

    // Update 'Reported By' dropdown
    const reportedBySelect = document.getElementById('reportedBy');
    if (reportedBySelect) {
        const currentVal = reportedBySelect.dataset.savedVal || ""; 
        reportedBySelect.innerHTML = '<option value="">اختر الاسم...</option>' + 
            branchStaff.map(emp => `<option value="${emp.name}" ${emp.name === currentVal ? 'selected' : ''}>${emp.name}</option>`).join('');
    }
};

window.togglePresence = function(el, shift) {
    el.classList.toggle('active');
    const cb = el.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = el.classList.contains('active');
    
    // Auto-sync times from shift defaults if becoming active
    if (el.classList.contains('active')) {
        const shiftIn = document.getElementById(`${shift}OpenTime`)?.value;
        const shiftOut = document.getElementById(`${shift}CloseTime`)?.value;
        if (shiftIn) el.querySelector('.time-in').value = shiftIn;
        if (shiftOut) el.querySelector('.time-out').value = shiftOut;
    }
};


window.addInflowRow = function(containerId = 'morningInflowRows', item = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ledger-row-premium animate-in';
    row.innerHTML = `
        <div class="capsule-input capsule-wide">
            <input type="text" placeholder="بيان الدخول (الوارد)..." value="${item.statement || ''}" oninput="calculateGlobalBalance()">
        </div>
        <div class="capsule-input capsule-small inflow-accent">
            <input type="text" inputmode="decimal" placeholder="المبلغ" value="${item.amount || ''}" 
                   oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,''); calculateGlobalBalance()">
        </div>
        <button class="btn-remove" style="width:35px; height:35px; flex-shrink:0; border-radius:50%;" onclick="this.closest('.ledger-row-premium').remove(); calculateGlobalBalance();">✕</button>
    `;
    container.appendChild(row);
    calculateGlobalBalance();
};

window.addOutflowRow = function(containerId = 'morningOutflowRows', item = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ledger-row-premium animate-in';
    row.innerHTML = `
        <div class="capsule-input capsule-wide">
            <input type="text" placeholder="بيان الخروج (المنصرف)..." value="${item.statement || ''}" oninput="calculateGlobalBalance()">
        </div>
        <div class="capsule-input capsule-small outflow-accent">
            <input type="text" inputmode="decimal" placeholder="المبلغ" value="${item.amount || ''}" 
                   oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,''); calculateGlobalBalance()">
        </div>
        <button class="btn-remove" style="width:35px; height:35px; flex-shrink:0; border-radius:50%;" onclick="this.closest('.ledger-row-premium').remove(); calculateGlobalBalance();">✕</button>
    `;
    container.appendChild(row);
    calculateGlobalBalance();
};



window.calculateGlobalBalance = function() {
    const getListSum = (selector) => {
        return [...document.querySelectorAll(selector)].reduce((sum, row) => {
            const input = row.querySelector('input[placeholder="المبلغ"]');
            const val = parseFloat(input?.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
            return sum + val;
        }, 0);
    };
    
    const inflowTotal = getListSum('.inflow-list .ledger-row-premium');
    const outflowTotal = getListSum('.outflow-list .ledger-row-premium');
    const prevBalance = parseFloat(document.getElementById('previousBalance')?.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
    
    const netTotal = prevBalance + inflowTotal - outflowTotal;
    
    // Update data inputs
    const inEl = document.getElementById('dailyInflow');
    const outEl = document.getElementById('dailyOutflow');
    const netEl = document.getElementById('totalDailyNet');
    
    if (inEl) inEl.value = inflowTotal;
    if (outEl) outEl.value = outflowTotal;
    if (netEl) netEl.value = netTotal;
    
    // Update decorative highlights
    const netDisplay = document.getElementById('totalDailyNetDisplay');
    if (netDisplay) netDisplay.innerText = formatNumber(netTotal);
    
    const curBalEl = document.getElementById('currentBalance');
    if (curBalEl) {
        curBalEl.value = netTotal;
    }

    // [Sync Logic] Update AppState.ledgers if we are in the report view
    const branchKey = document.getElementById('branchSelect2')?.value;
    const reportDate = document.getElementById('reportDate')?.value;
    if (branchKey && reportDate) {
        const ledgerKey = `${branchKey}_${reportDate}`;
        if (AppState.ledgers[ledgerKey]) {
            AppState.ledgers[ledgerKey].previousBalance = prevBalance;
        } else {
             // Create ledger if it doesn't exist to maintain sync
             AppState.ledgers[ledgerKey] = {
                previousBalance: prevBalance,
                rows: [{ bookingType: 'رصيد مرحل من التقرير', value: 0, receiptNo: '', clientName: '', expense: 0, type: '', notes: '' }]
            };
        }
    }
};


// Auto-fetch the last report's closing balance for this branch
window.fetchLastBalance = function(branchKey) {
    const todayDate = today();
    
    // 1. Check past ledgers first (as it's the daily record)
    const ledgerDates = Object.keys(AppState.ledgers)
        .filter(k => k.startsWith(branchKey + '_'))
        .map(k => k.split('_')[1])
        .filter(d => d < todayDate)
        .sort((a,b) => b.localeCompare(a));

    if (ledgerDates.length > 0) {
        const lastDate = ledgerDates[0];
        const lastBalance = calculateLedgerEndBalance(`${branchKey}_${lastDate}`);
        if (lastBalance > 0) {
            const prevInput = document.getElementById('previousBalance');
            if (prevInput && !prevInput.value) {
                prevInput.value = lastBalance;
                calculateGlobalBalance();
                showToast(`تم سحب رصيد ${formatNumber(lastBalance)} ج.م من يومية ${lastDate} بنجاح`, 'success');
                return;
            }
        }
    }

    // 2. Fallback: Check past reports
    const pastReports = AppState.reports
        .filter(r => r.branch === branchKey && r.date !== todayDate)
        .sort((a, b) => b.date.localeCompare(a.date));
    
    if (pastReports.length > 0) {
        const lastReport = pastReports[0];
        const lastBalance = lastReport.currentBalance || lastReport.financials?.totalNet || 0;
        
        if (lastBalance > 0) {
            const prevInput = document.getElementById('previousBalance');
            if (prevInput && !prevInput.value) {
                prevInput.value = lastBalance;
                calculateGlobalBalance();
                showToast(`تم سحب رصيد ${formatNumber(lastBalance)} ج.م من تقرير ${lastReport.date} تلقائياً`, 'success');
            }
        }
    }
};

// Sync Previous Balance manually to specific active date
window.syncPreviousBalance = function() {
    const branchSelect = document.getElementById('branchSelect2');
    const branchKey = branchSelect ? branchSelect.value : (AppState.userBranch || AppState.currentBranch || 'soyouf');
    const activeDate = document.getElementById('reportDate')?.value || today();
    
    // Check past reports for this specific date chronologically
    const pastReports = AppState.reports
        .filter(r => r.branch === branchKey && r.date < activeDate)
        .sort((a, b) => b.date.localeCompare(a.date));
    
    if (pastReports.length > 0) {
        const lastReport = pastReports[0];
        const lastBalance = lastReport.currentBalance || lastReport.financials?.totalNet || 0;
        
        const prevInput = document.getElementById('previousBalance');
        if (prevInput) {
            prevInput.value = lastBalance;
            calculateGlobalBalance();
            showToast(`تم جلب الرصيد المرحل ${formatNumber(lastBalance)} ج.م من آخر تقرير بتاريخ (${lastReport.date})`, 'success');
        }
    } else {
        showToast('لا يوجد تقرير سابق لليوم المحدد لسحب الرصيد منه، يرجى الإدخال يدوياً', 'warning');
    }
};

// Reload report when date or branch is changed manually and "Refresh" is clicked
window.reloadReportByDate = function(resetToToday = false) {
    const dateInput = document.getElementById('reportDate');
    const branchInput = document.getElementById('branchSelect2');
    
    if (resetToToday) {
        dateInput.value = today();
    }
    
    const selectedDate = dateInput.value;
    const selectedBranch = branchInput.value;
    
    // Find if a report exists for this combo
    const existing = AppState.reports.find(r => r.branch === selectedBranch && r.date === selectedDate);
    
    const container = document.getElementById('pageContent');
    if (container) {
        renderReport(container, existing || { branch: selectedBranch, date: selectedDate });
        showToast(existing ? `تم تحميل بيانات تقرير ${selectedDate}` : `البدء في تقرير جديد لتاريخ ${selectedDate}`, 'info');
    }
};

window.saveReport = function() {
    const morningSecretaryRows = [...document.querySelectorAll('#morningSecretaryChecklist .presence-card.active')].map(item => {
        const name = item.querySelector('input[type="checkbox"]').getAttribute('data-name');
        const times = item.querySelectorAll('input[type="time"]');
        return { name, start: times[0].value, end: times[1].value };
    });

    const eveningSecretaryRows = [...document.querySelectorAll('#eveningSecretaryChecklist .presence-card.active')].map(item => {
        const name = item.querySelector('input[type="checkbox"]').getAttribute('data-name');
        const times = item.querySelectorAll('input[type="time"]');
        return { name, start: times[0].value, end: times[1].value };
    });

    const collectList = (containerId, type) => {
        return [...document.querySelectorAll(`#${containerId} .transaction-row`)].map(row => {
            const stmt = row.querySelector('input[placeholder*="بيان"]')?.value || '';
            const amtInput = row.querySelector('input[placeholder="المبلغ"]');
            const amount = parseFloat(amtInput?.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
            return { statement: stmt, amount };
        }).filter(i => i.statement || i.amount);
    };

    const morningInflowList = collectList('morningInflowRows');
    const morningOutflowList = collectList('morningOutflowRows');
    const eveningInflowList = collectList('eveningInflowRows');
    const eveningOutflowList = collectList('eveningOutflowRows');

    // Combined for global totals (backward compatible)
    const inflowList = [...morningInflowList, ...eveningInflowList];
    const outflowList = [...morningOutflowList, ...eveningOutflowList];


    const branchKey = document.getElementById('branchSelect2').value;
    const reportDate = document.getElementById('reportDate').value;
    const reportedBy = document.getElementById('reportedBy')?.value || '';
    const existingIndex = AppState.reports.findIndex(r => r.branch === branchKey && r.date === reportDate);


    const report = {
        id: existingIndex >= 0 ? AppState.reports[existingIndex].id : 'R' + Date.now(),
        branch: branchKey,
        date: reportDate,
        morning: {
            secretaries: morningSecretaryRows,
            openTime: document.getElementById('morningOpenTime').value,
            closeTime: document.getElementById('morningCloseTime').value,
            bookingNote: document.getElementById('morningBookingNote').value || '',
            calls: parseInt(document.getElementById('morningCalls').value) || 0,
            bookings: parseInt(document.getElementById('morningBookings').value) || 0
        },
        evening: {
            secretaries: eveningSecretaryRows,
            openTime: document.getElementById('eveningOpenTime').value,
            closeTime: document.getElementById('eveningCloseTime').value,
            bookingNote: document.getElementById('eveningBookingNote').value || '',
            calls: parseInt(document.getElementById('eveningCalls').value) || 0,
            bookings: parseInt(document.getElementById('eveningBookings').value) || 0,
            reportedBy: reportedBy
        },
        financials: {
            previousBalance: parseFloat(document.getElementById('previousBalance').value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0,
            dailyInflow: parseFloat(document.getElementById('dailyInflow').value) || 0,
            dailyOutflow: parseFloat(document.getElementById('dailyOutflow').value) || 0,
            totalNet: parseFloat(document.getElementById('totalDailyNet').value) || 0,
            inflowList: inflowList,
            outflowList: outflowList,
            morningInflowList: morningInflowList,
            morningOutflowList: morningOutflowList,
            eveningInflowList: eveningInflowList,
            eveningOutflowList: eveningOutflowList
        },
        expenses: [],
        teacherBookings: document.getElementById('teacherBookings').value,
        cancellations: document.getElementById('cancellations').value,
        currentBalance: parseFloat(document.getElementById('currentBalance').value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0,
    };

    if (existingIndex >= 0) {
        AppState.reports[existingIndex] = report;
    } else {
        AppState.reports.push(report);
    }
    
    saveReportEntry(report);
    showToast('تم حفظ التقرير بنجاح!', 'success');
    setTimeout(() => navigate('dashboard'), 1000);
};

// New Atomic Report Sync Function
function saveReportEntry(reportObject) {
    // Determine the index to sync
    const index = AppState.reports.findIndex(r => r.id === reportObject.id);
    if (index === -1) return;
    
    // Update local storage
    localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
    
    // Atomic Cloud Update
    if (window.db && AppState.isInitialSyncComplete) {
        // Send ONLY this specific report to its array index in Firebase to prevent overwriting others
        db.ref(AppState.systemSecret + '/bms/reports/' + index).set(reportObject);
        console.log(`☁️ Granular Sync: Report [${index}] updated.`);
    } else {
        console.warn("⏳ Sync Pending or offline - local save only.");
    }
}


// -------------------------
// Page: Branches
// -------------------------
function renderBranches(el) {
    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>🏢 إدارة الفروع</h1>
        <p>عرض وإدارة جميع الفروع</p>
    </div>
    <div class="branches-grid">
        ${Object.entries(BRANCHES).map(([key, branch], i) => {
            const bReports = AppState.reports.filter(r => r?.branch === key);
            const getInc = (r) => r?.financials?.dailyInflow ?? ((r?.morning?.revenue || 0) + (r?.evening?.revenue || 0));
            const getExp = (r) => r?.financials?.dailyOutflow ?? (r?.expenses?.reduce((s, e) => s + (parseFloat(e?.amount) || 0), 0) || 0);
            const bRev = bReports.reduce((s, r) => s + getInc(r), 0);
            const bExp = bReports.reduce((s, r) => s + getExp(r), 0);
            return `
            <div class="branch-card animate-in" style="animation-delay:${i*0.08}s">
                <div class="branch-card-top" style="background: linear-gradient(135deg, ${branch.color} 0%, ${branch.color}cc 100%);">
                    <div class="branch-name">${branch.name}</div>
                    <div class="branch-location">📍 ${branch.city}</div>
                </div>
                <div class="branch-card-body">
                    <div class="branch-stat-row">
                        <span class="bsr-label">إجمالي الإيرادات</span>
                        <span class="bsr-val">${formatNumber(bRev)} ج.م</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">إجمالي المصروفات</span>
                        <span class="bsr-val">${formatNumber(bExp)} ج.م</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">صافي الإيراد</span>
                        <span class="bsr-val" style="color:var(--primary)">${formatNumber(bRev-bExp)} ج.م</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">عدد التقارير</span>
                        <span class="bsr-val">${bReports.length} تقرير</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">الموظفين</span>
                        <span class="bsr-val">${EMPLOYEES.filter(e=>e.branch===key).length} موظف</span>
                    </div>
                </div>
                <div class="branch-card-footer">
                    <button class="btn btn-outline" style="flex:1;font-size:13px;padding:8px 12px;" onclick="navigate('report')">📝 تقرير جديد</button>
                </div>
            </div>`;
        }).join('')}
    </div>
    `;
}

// -------------------------
// Page: Employees
// -------------------------
function renderEmployees(el) {
    const isBranch = AppState.userRole === 'branch';
    let employees = EMPLOYEES;
    
    if (isBranch) {
        employees = EMPLOYEES.filter(e => e.branch === AppState.userBranch);
    } else if (AppState.currentBranch && AppState.currentBranch !== 'all') {
        employees = EMPLOYEES.filter(e => e.branch === AppState.currentBranch);
    }

    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>👥 الموظفين</h1>
        <p>${isBranch ? 'قائمة موظفي فرعك' : 'قائمة بجميع الموظفين في كافة الفروع'}</p>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">👤</div>
            <h3>${isBranch ? 'موظفي الفرع' : 'جميع الموظفين'} (${employees.length})</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>الكود</th>
                        <th>الوظيفة</th>
                        <th>الفرع</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map((emp, i) => {
                        const isManager = AppState.userRole === 'manager';
                        const displayName = isManager ? `موظف #${emp.id.slice(-3)}` : emp.name;
                        const displayInitial = isManager ? '👤' : emp.name[0];
                        
                        return `
                    <tr style="animation:fadeIn 0.3s ease ${i*0.05}s both;">
                        <td>
                            <div class="employee-card">
                                <div class="emp-avatar">${displayInitial}</div>
                                <div>
                                    <div class="emp-name" style="${isManager ? 'filter: blur(4px); opacity: 0.5;' : ''}">${displayName}</div>
                                    <div class="emp-role">${emp.role}</div>
                                </div>
                            </div>
                        </td>
                        <td><code style="background:var(--bg-input);padding:3px 8px;border-radius:4px;font-size:12px;">${emp.id}</code></td>
                        <td><span class="badge ${emp.role === 'مديرة الفرع' ? 'badge-manager' : (emp.role === 'سكرتيرة' ? 'badge-secretary' : 'badge-morning')}">${emp.role}</span></td>
                        <td>${BRANCHES[emp.branch]?.name || emp.branch}</td>
                    </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// -------------------------
// Page: Finance
// -------------------------
function renderFinance(el) {
    const isBranch = AppState.userRole === 'branch';
    let reports = AppState.reports || [];
    
    if (isBranch) {
        reports = reports.filter(r => r.branch === AppState.userBranch);
    } else if (AppState.currentBranch && AppState.currentBranch !== 'all') {
        reports = reports.filter(r => r.branch === AppState.currentBranch);
    }
    
    // Aggregation using the current financials structure
    const totalRevenue = reports.reduce((s, r) => s + (r.financials?.dailyInflow || 0), 0);
    const totalExpenses = reports.reduce((s, r) => s + (r.financials?.dailyOutflow || 0), 0);
    const netRevenue = totalRevenue - totalExpenses;
    const latestBalance = reports.length ? (reports[reports.length - 1].currentBalance || 0) : 0;

    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>💰 المالية</h1>
        <p>${isBranch ? 'ملخص مالي لفرعك' : 'ملخص مالي تفصيلي لجميع الفروع'}</p>
    </div>

    <div class="financial-summary animate-in">
        <div class="fin-stat">
            <div class="fin-stat-label">إجمالي الإيرادات</div>
            <div class="fin-stat-value" data-count="${totalRevenue}">0</div>
            <div class="fin-stat-unit">جنيه مصري</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">إجمالي المصروفات</div>
            <div class="fin-stat-value" data-count="${totalExpenses}">0</div>
            <div class="fin-stat-unit">جنيه مصري</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">صافي الإيراد</div>
            <div class="fin-stat-value" data-count="${netRevenue}">0</div>
            <div class="fin-stat-unit">جنيه مصري</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">الرصيد الحالي</div>
            <div class="fin-stat-value" data-count="${latestBalance}">0</div>
            <div class="fin-stat-unit">جنيه مصري</div>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon expense">📋</div>
            <h3>سجل المصروفات المجمع</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>التاريخ</th><th>الفرع</th><th>البيان</th><th>المبلغ</th></tr>
                </thead>
                <tbody>
                    ${(() => {
                        const allExpenses = reports.flatMap(r => {
                            const mOut = r.financials?.morningOutflowList || [];
                            const eBookOut = r.financials?.eveningOutflowList || [];
                            // Backwards compatibility for legacy reports
                            const legacyOut = r.expenses || [];
                            
                            return [...mOut, ...eBookOut, ...legacyOut].map(e => ({
                                date: r.date,
                                branch: r.branch,
                                statement: e.statement || e.beneficiary || 'منصرف',
                                amount: e.amount || 0
                            }));
                        });

                        if (allExpenses.length === 0) {
                            return `<tr><td colspan="4"><div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد مصروفات مسجلة</p></div></td></tr>`;
                        }

                        return allExpenses.map(e => `
                            <tr>
                                <td>${e.date}</td>
                                <td>${BRANCHES[e.branch]?.name || e.branch}</td>
                                <td>${e.statement}</td>
                                <td class="amount-cell expense">${formatNumber(e.amount)} ج.م</td>
                            </tr>
                        `).join('');
                    })()}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">📊</div>
            <h3>سجل حركات التقارير اليومية</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>التاريخ</th><th>الفرع</th><th>الإيراد</th><th>المصروف</th><th>الصافي</th><th>الرصيد النهائي</th><th>إجراءات</th></tr>
                </thead>
                <tbody>
                    ${reports.length > 0 ? reports.map(r => `
                    <tr>
                        <td>${r.date}</td>
                        <td>${BRANCHES[r.branch]?.name || r.branch}</td>
                        <td class="amount-cell">${formatNumber(r.financials?.dailyInflow || 0)}</td>
                        <td class="amount-cell expense">${formatNumber(r.financials?.dailyOutflow || 0)}</td>
                        <td class="amount-cell" style="color:var(--primary)">${formatNumber((r.financials?.dailyInflow || 0) - (r.financials?.dailyOutflow || 0))}</td>
                        <td><strong>${formatNumber(r.currentBalance || 0)}</strong></td>
                        <td>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:12px;" onclick="editReport('${r.id}')">✏️ تعديل</button>
                            <button class="btn-remove" onclick="deleteReport('${r.id}')">🗑️</button>
                        </td>
                    </tr>`).reverse().join('') : `<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد تقارير</p></div></td></tr>`}
                </tbody>
            </table>
        </div>
    </div>
    `;

    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        setTimeout(() => animateCount(el, target), 200);
    });
}

window.editReport = function(id) {
    const report = AppState.reports.find(r => r.id === id);
    if (!report) return;
    
    AppState.currentBranch = report.branch;
    navigate('report');
    
    setTimeout(() => {
        const dateInput = document.getElementById('reportDate');
        const branchInput = document.getElementById('branchSelect2');
        if (dateInput) dateInput.value = report.date;
        if (branchInput) branchInput.value = report.branch;
        
        if (window.reloadReportByDate) {
            window.reloadReportByDate();
        }
    }, 50);
};

window.deleteReport = function(id) {
    if (!confirm('⚠️ تحذير: هل أنت متأكد من حذف هذا التقرير نهائياً؟')) return;
    
    AppState.reports = AppState.reports.filter(r => r.id !== id);
    saveData();
    showToast('تم حذف التقرير بنجاح', 'error');
    navigate('finance');
};

// -------------------------
// Page: Daily Budget
// -------------------------
function renderDailyBudget(el) {
    const isBranch = AppState.userRole === 'branch';
    let budgets = AppState.budgets || [];
    
    if (isBranch) {
        budgets = budgets.filter(b => b.branch === AppState.userBranch);
    } else if (AppState.currentBranch && AppState.currentBranch !== 'all') {
        budgets = budgets.filter(b => b.branch === AppState.currentBranch);
    }

    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>📊 الميزانية اليومية للطلاب</h1>
        <p>متابعة مدفوعات الطلاب، الأقساط، والمتبقي</p>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon morning">➕</div>
            <h3>إضافة ميزانية طالب جديد</h3>
        </div>
        <div class="section-card-body">
            <div class="form-grid">
                <div class="form-group">
                    <label>اسم الطالب</label>
                    <input type="text" id="budgetStudentName" placeholder="الاسم رباعي">
                </div>
                <div class="form-group">
                    <label>الكورس / المادة</label>
                    <input type="text" id="budgetCourse" placeholder="مثال: فيزياء 3 ث">
                </div>
                <div class="form-group">
                    <label>إجمالي المبلغ</label>
                    <input type="number" id="budgetTotal" placeholder="المبلغ الكلي">
                </div>
                <div class="form-group">
                    <label>المدفوع</label>
                    <input type="number" id="budgetPaid" placeholder="المبلغ المدفوع">
                </div>
                ${!isBranch ? `
                <div class="form-group">
                    <label>الفرع</label>
                    <select id="budgetBranch">
                        ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
                    </select>
                </div>` : ''}
            </div>
            <button class="btn btn-primary" style="margin-top:15px;" onclick="addStudentBudget()">💾 حفظ البيانات</button>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">📋</div>
            <h3>سجل الميزانيات</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الطالب</th>
                        <th>الكورس</th>
                        <th>الفرع</th>
                        <th>الإجمالي</th>
                        <th>المدفوع</th>
                        <th>المتبقي</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${budgets.length === 0 ? `<tr><td colspan="8"><div class="empty-state"><p>لا توجد ميزانيات مسجلة</p></div></td></tr>` : 
                    budgets.map(b => `
                    <tr>
                        <td>${b.date}</td>
                        <td><strong>${b.studentName}</strong></td>
                        <td>${b.course}</td>
                        <td>${BRANCHES[b.branch]?.name || b.branch}</td>
                        <td style="color:var(--primary);font-weight:bold;">${b.total} ج.م</td>
                        <td style="color:#27ae60;">${b.paid} ج.م</td>
                        <td style="color:#e74c3c;font-weight:bold;">${b.total - b.paid} ج.م</td>
                        <td>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:12px;" onclick="addPaymentPrompt('${b.id}')">➕ دفعة</button>
                            <button class="btn-remove" onclick="deleteBudget('${b.id}')">🗑️</button>
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

window.addStudentBudget = function() {
    const studentName = document.getElementById('budgetStudentName').value.trim();
    const course = document.getElementById('budgetCourse').value.trim();
    const total = parseFloat(document.getElementById('budgetTotal').value) || 0;
    const paid = parseFloat(document.getElementById('budgetPaid').value) || 0;
    const branch = AppState.userRole === 'branch' ? AppState.userBranch : (document.getElementById('budgetBranch') ? document.getElementById('budgetBranch').value : Object.keys(BRANCHES)[0]);

    if (!studentName || !course) {
        return showToast('يرجى إدخال اسم الطالب والكورس', 'error');
    }

    if (!AppState.budgets) AppState.budgets = [];

    AppState.budgets.push({
        id: 'B' + Date.now(),
        date: today(),
        studentName,
        course,
        total,
        paid,
        branch
    });

    saveData();
    showToast('تمت إضافة ميزانية الطالب بنجاح', 'success');
    navigate('dailybudget');
};

window.addPaymentPrompt = function(id) {
    const budget = AppState.budgets.find(b => b.id === id);
    if (!budget) return;
    
    window.customPrompt(`إضافة دفعة للطالب ${budget.studentName} (المتبقي: ${budget.total - budget.paid})`, '0', (val) => {
        const payment = parseFloat(val);
        if (payment && payment > 0) {
            budget.paid += payment;
            saveData();
            showToast('تم تحديث المدفوع بنجاح', 'success');
            navigate('dailybudget');
        }
    });
};

window.deleteBudget = function(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الميزانية؟')) return;
    AppState.budgets = AppState.budgets.filter(b => b.id !== id);
    saveData();
    showToast('تم الحذف', 'error');
    navigate('dailybudget');
};

// -------------------------
// Page: Admin Editor
// -------------------------
function renderAdmin(el) {
    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>⚙️ الأدمن إديتور</h1>
        <p>إدارة الفروع والموظفين — إضافة وتعديل وحذف</p>
    </div>

    <!-- ====== SYSTEM SETTINGS ====== -->
    <div class="form-section animate-in" style="border-color:#3498db;">
        <div class="form-section-header" style="background:#ebf5fb;color:#2980b9;">⚙️ إعدادات النظام</div>
        <div class="form-section-body">
            <div class="form-group" style="margin-bottom:0;">
                <label>اسم المدير العام الحالي</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="adminManagerName" class="form-input" value="${AppState.managerName}" style="flex:1;">
                    <button class="btn btn-primary" onclick="adminSaveManagerName()">حفظ الاسم</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">هذا الاسم سيظهر في واجهة المدير العام وعند تسجيل الخروج.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>المفتاح السري (الماستر)</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="adminMasterPass" class="form-input" value="${AppState.masterPassword}" style="flex:1;">
                    <button class="btn btn-primary" onclick="adminSaveMasterPass()">حفظ المفتاح</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">هذا المفتاح يتيح اختراق أي فرع والدخول كمبرمج وكشف الباسووردات.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>مسار حفظ النسخ الاحتياطية الإجباري للفروع</label>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div id="folderStatusBadge" style="padding: 10px; background: #fdf2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; color: #991b1b; display: flex; align-items: center; gap: 8px;">
                        <span id="folderStatusDot" style="width:10px; height:10px; background:#ef4444; border-radius:50%"></span>
                        <span id="folderStatusText">المجلد غير مرتبط</span>
                    </div>
                    <input type="text" id="adminBackupPath" class="form-input" value="${AppState.backupPath || 'D:\\Backups-Report'}" style="flex:1;" dir="ltr" readonly>
                    <button class="btn btn-primary" onclick="adminSaveBackupPath()">ربط المجلد الآن</button>
                    <button class="btn btn-outline" style="padding:10px;" onclick="createLocalBackup()" title="اختبار الحفظ الآن">📁 اختبار</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">توجيه إجباري للسيستم لمسار الحفظ. عند الربط، سيتم الحفظ تلقائياً في الفولدر دون تحميلات يدوية.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>تغيير حجم الخط (لتحسين وضوح الأرقام والبيانات)</label>
                <div style="display:flex; align-items:center; gap:20px;">
                    <input type="range" min="14" max="22" step="1" id="fontSizeSlider" 
                           value="${localStorage.getItem('bms_font_size') || 16}" 
                           oninput="changeAppFontSize(this.value); this.nextElementSibling.textContent = this.value + 'px'" style="flex:1;">
                    <span style="font-weight:bold; color:var(--primary); font-size:18px; min-width:40px;">${localStorage.getItem('bms_font_size') || 16}px</span>
                    <button class="btn btn-secondary" onclick="resetFontSize()" style="padding:6px 12px; font-size:12px;">إرجاع للوضع الأصلي</button>
                </div>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>تغيير الثيم اللوني (اللون الأساسي)</label>
                <div style="display:flex; align-items:center; gap:15px;">
                    <input type="color" id="primaryColorPicker" 
                           value="${localStorage.getItem('bms_primary_color') || '#008080'}" 
                           oninput="changeAppColor(this.value)" style="width:100%; max-width:300px; height:45px; border:none; cursor:pointer; border-radius:8px;">
                    <button class="btn btn-secondary" onclick="resetAppColor()" style="padding:6px 12px; font-size:12px;">إرجاع للوضع الأصلي</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ====== BRANCHES SECTION ====== -->
    <div class="form-section animate-in">
        <div class="form-section-header">🏢 إدارة الفروع</div>
        <div class="form-section-body">
            <div id="adminBranchList"></div>
            <div style="border-top:1px solid var(--border-color);margin-top:20px;padding-top:20px;">
                <h4 style="margin-bottom:14px;font-size:15px;color:var(--text-primary);">➕ إضافة فرع جديد</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>معرّف الفرع (بالإنجليزية)</label>
                        <input type="text" id="newBranchKey" placeholder="مثال: maadi">
                    </div>
                    <div class="form-group">
                        <label>اسم الفرع</label>
                        <input type="text" id="newBranchName" placeholder="مثال: فرع المعادي">
                    </div>
                    <div class="form-group">
                        <label>المدينة</label>
                        <input type="text" id="newBranchCity" placeholder="الإسكندرية" value="الإسكندرية">
                    </div>
                    <div class="form-group">
                        <label>اللون</label>
                        <input type="color" id="newBranchColor" value="#2c3e50">
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:14px;" onclick="adminAddBranch()">➕ إضافة الفرع</button>
            </div>
        </div>
    </div>

    <!-- ====== EMPLOYEES SECTION ====== -->
    <div class="form-section animate-in">
        <div class="form-section-header">👥 إدارة الموظفين</div>
        <div class="form-section-body">
            <div id="adminEmployeeList"></div>
            <div style="border-top:1px solid var(--border-color);margin-top:20px;padding-top:20px;">
                <h4 style="margin-bottom:14px;font-size:15px;color:var(--text-primary);">➕ إضافة موظف جديد</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>اسم الموظف</label>
                        <input type="text" id="newEmpName" placeholder="الاسم">
                    </div>
                    <div class="form-group">
                        <label>الوظيفة</label>
                        <select id="newEmpRole">
                            <option value="مديرة الفرع">مديرة الفرع</option>
                            <option value="سكرتيرة" selected>سكرتيرة</option>
                            <option value="أستاذ">أستاذ</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>الفرع</label>
                        <select id="newEmpBranch">
                            ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:14px;" onclick="adminAddEmployee()">➕ إضافة الموظف</button>
            </div>
        </div>
    </div>

    <!-- ====== DANGER ZONE ====== -->
    <div class="form-section animate-in" style="border-color:#ffe3e3;">
        <div class="form-section-header" style="background:#fff5f5;color:#c92a2a;">⚠️ تصفير البيانات</div>
        <div class="form-section-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:20px;">
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">📝</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">حذف جميع التقارير اليومية</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearReports()">🗑️ تصفير التقارير</button>
                </div>
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">👥</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">حذف جميع الموظفين من كل الفروع</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearEmployees()">🗑️ تصفير الموظفين</button>
                </div>
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">🏢</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">حذف جميع الفروع والموظفين</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearBranches()">🗑️ تصفير الفروع</button>
                </div>
            </div>
            <div style="border-top:2px dashed #ffe3e3;padding-top:20px;text-align:center;">
                <p style="color:#c92a2a;font-weight:700;margin-bottom:6px;">⛔ تصفير شامل</p>
                <p style="color:var(--text-secondary);font-size:13px;margin-bottom:14px;">حذف كل شيء (الفروع + الموظفين + التقارير) وإعادتها للإعدادات الافتراضية</p>
                <button class="btn" style="background:#c92a2a;color:white;padding:12px 28px;" onclick="adminResetAll()">🔄 إعادة ضبط المصنع الكامل</button>
            </div>
        </div>
    </div>
    `;

    renderAdminBranchList();
    renderAdminEmployeeList();
    updateFolderStatusUI();
}

async function updateFolderStatusUI() {
    const badge = document.getElementById('folderStatusBadge');
    const dot = document.getElementById('folderStatusDot');
    const text = document.getElementById('folderStatusText');
    const input = document.getElementById('adminBackupPath');
    if (!badge) return;

    const handle = await getSavedDirHandle();
    if (handle) {
        badge.style.background = '#f0fdf4';
        badge.style.borderColor = '#bbf7d0';
        badge.style.color = '#15803d';
        dot.style.background = '#22c55e';
        text.textContent = 'المجلد مـرتبـط ✅';
        input.value = handle.name || AppState.backupPath;
    } else {
        badge.style.background = '#fdf2f2';
        badge.style.borderColor = '#fecaca';
        badge.style.color = '#991b1b';
        dot.style.background = '#ef4444';
        text.textContent = 'المجلد غير مرتبط ❌';
    }
}

function renderAdminBranchList() {
    const container = document.getElementById('adminBranchList');
    if (!container) return;
    const entries = Object.entries(BRANCHES);
    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">🏢</span><p>لا توجد فروع</p></div>';
        return;
    }
    container.innerHTML = `
    <div class="table-wrapper"><table>
        <thead><tr><th>المعرّف</th><th>الاسم</th><th>المدينة</th><th>اللون</th><th>المديرة</th><th>السكرتارية</th><th>إجراءات</th></tr></thead>
        <tbody>
            ${entries.map(([key, b]) => {
                const manager = EMPLOYEES.find(e => e.branch === key && e.role === 'مديرة الفرع');
                const secretaries = EMPLOYEES.filter(e => e.branch === key && e.role !== 'مديرة الفرع');
                return `<tr>
                    <td><code style="background:var(--bg-input);padding:3px 8px;border-radius:4px;font-size:12px;">${key}</code></td>
                    <td>${b.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="تعديل الاسم" onclick="editBranchPrompt('${key}','name','الاسم')">✏️</span></td>
                    <td>${b.city} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="تعديل المدينة" onclick="editBranchPrompt('${key}','city','المدينة')">✏️</span></td>
                    <td><input type="color" value="${b.color}" onchange="adminEditBranch('${key}','color',this.value)" style="width:36px;height:32px;border:none;cursor:pointer;background:transparent;"></td>
                    <td>${manager ? `${manager.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="تعديل مدير الفرع" onclick="editEmpPrompt('${manager.id}')">✏️</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
                    <td>${secretaries.map(s => `${s.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="تعديل السكرتارية" onclick="editEmpPrompt('${s.id}')">✏️</span>`).join(' &nbsp;،&nbsp; ') || '<span style="color:var(--text-muted)">—</span>'}</td>
                    <td><button class="btn-remove" onclick="adminDeleteBranch('${key}')">🗑️</button></td>
                </tr>`;
            }).join('')}
        </tbody>
    </table></div>`;
}

function renderAdminEmployeeList() {
    const container = document.getElementById('adminEmployeeList');
    if (!container) return;
    if (EMPLOYEES.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">👤</span><p>لا يوجد موظفين</p></div>';
        return;
    }

    // Group by branch
    const grouped = {};
    Object.entries(BRANCHES).forEach(([k,v]) => { grouped[k] = { branch: v, employees: [] }; });
    EMPLOYEES.forEach(emp => {
        if (grouped[emp.branch]) grouped[emp.branch].employees.push(emp);
    });

    container.innerHTML = Object.entries(grouped).map(([key, g]) => {
        if (g.employees.length === 0) return '';
        return `
        <div style="margin-bottom:20px;">
            <h4 style="font-size:14px;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:8px;">
                <span style="width:12px;height:12px;border-radius:50%;background:${g.branch.color};display:inline-block;"></span>
                ${g.branch.name}
            </h4>
            <div class="table-wrapper"><table>
                <thead><tr><th>الكود</th><th>الاسم</th><th>الوظيفة</th><th>إجراءات</th></tr></thead>
                <tbody>
                    ${g.employees.map(emp => `<tr>
                        <td><code style="background:var(--bg-input);padding:3px 8px;border-radius:4px;font-size:12px;">${emp.id}</code></td>
                        <td>${emp.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="تعديل اسم الموظف" onclick="editEmpPrompt('${emp.id}')">✏️</span></td>
                        <td>
                            <select onchange="adminEditEmployee('${emp.id}','role',this.value)" style="padding:6px 10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;font-family:Cairo;font-size:13px;color:var(--text-primary);">
                                <option value="مديرة الفرع" ${emp.role==='مديرة الفرع'?'selected':''}>مديرة الفرع</option>
                                <option value="سكرتيرة" ${emp.role==='سكرتيرة'?'selected':''}>سكرتيرة</option>
                                <option value="أستاذ" ${emp.role==='أستاذ'?'selected':''}>أستاذ</option>
                                <option value="أخرى" ${!['مديرة الفرع','سكرتيرة','أستاذ'].includes(emp.role)?'selected':''}>أخرى</option>
                            </select>
                        </td>
                        <td><button class="btn-remove" onclick="adminDeleteEmployee('${emp.id}')">🗑️</button></td>
                    </tr>`).join('')}
                </tbody>
            </table></div>
        </div>`;
    }).join('');
}

// Admin CRUD Operations
window.adminEditBranch = function(key, field, value) {
    if (BRANCHES[key]) {
        BRANCHES[key][field] = value;
        saveData();
        showToast('تم تحديث الفرع بنجاح');
    }
};

window.adminSaveManagerName = function() {
    const val = document.getElementById('adminManagerName').value.trim();
    if (!val) return showToast('يرجى إدخال اسم صحيح', 'error');
    AppState.managerName = val;
    localStorage.setItem('bms_manager_name', val);
    showToast('تم حفظ اسم المدير الجديد ✅');
    // Refresh avatar display
    updateUserDisplay();
};

window.adminSaveMasterPass = function() {
    const val = document.getElementById('adminMasterPass').value.trim();
    if (!val) return showToast('يرجى إدخال مفتاح صحيح', 'error');
    AppState.masterPassword = val;
    localStorage.setItem('bms_master_pass', val);
    showToast('تم حفظ المفتاح الماستر بنجاح 🔒');
};

window.adminSaveBackupPath = async function() {
    if (window.showDirectoryPicker) {
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            await saveDirHandle(dirHandle);
            
            AppState.backupPath = dirHandle.name;
            localStorage.setItem('bms_backup_path', dirHandle.name);
            
            updateFolderStatusUI();
            showToast('تم ربط المجلد الإجباري للنظام بنجاح 📁', 'success');
        } catch (e) {
            console.error(e);
            showToast('تم إلغاء اختيار المجلد', 'error');
        }
    } else {
        showToast('متصفحك لا يدعم الربط المباشر بالمجلدات، سيتم استخدام التحميل التقليدي', 'error');
    }
};

window.adminDeleteBranch = function(key) {
    if (!confirm(`هل أنت متأكد من حذف ${BRANCHES[key]?.name || key}؟`)) return;
    delete BRANCHES[key];
    EMPLOYEES = EMPLOYEES.filter(e => e.branch !== key);
    saveData();
    renderAdminBranchList();
    renderAdminEmployeeList();
    showToast('تم حذف الفرع وجميع موظفيه', 'error');
};

window.adminAddBranch = function() {
    const key = document.getElementById('newBranchKey').value.trim().toLowerCase();
    const name = document.getElementById('newBranchName').value.trim();
    const city = document.getElementById('newBranchCity').value.trim();
    const color = document.getElementById('newBranchColor').value;

    if (!key || !name) { showToast('يرجى إدخال المعرّف والاسم', 'error'); return; }
    if (BRANCHES[key]) { showToast('هذا المعرّف موجود بالفعل', 'error'); return; }

    BRANCHES[key] = { name, city, color };
    saveData();
    document.getElementById('newBranchKey').value = '';
    document.getElementById('newBranchName').value = '';
    renderAdminBranchList();
    showToast('تم إضافة الفرع بنجاح! 🎉');
};

window.adminEditEmployee = function(id, field, value) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (emp) {
        emp[field] = value;
        saveData();
        showToast('تم تحديث بيانات الموظف بنجاح ✅');
    }
};

window.editEmpPrompt = function(id) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (!emp) return;
    window.customPrompt('✏️ تعديل اسم الموظف:', emp.name, (newName) => {
        if (newName && newName.trim() !== '' && newName.trim() !== emp.name) {
            adminEditEmployee(id, 'name', newName.trim());
            renderAdminBranchList();
            renderAdminEmployeeList();
        }
    });
};

window.editBranchPrompt = function(key, field, label) {
    const b = BRANCHES[key];
    if (!b) return;
    window.customPrompt(`✏️ تعديل ${label}:`, b[field], (newVal) => {
        if (newVal && newVal.trim() !== '' && newVal.trim() !== b[field]) {
            adminEditBranch(key, field, newVal.trim());
            renderAdminBranchList();
        }
    });
};

window.adminDeleteEmployee = function(id) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`هل أنت متأكد من حذف ${emp.name}؟`)) return;
    EMPLOYEES = EMPLOYEES.filter(e => e.id !== id);
    saveData();
    renderAdminEmployeeList();
    showToast('تم حذف الموظف', 'error');
};

window.changeAppColor = function(val) {
    document.documentElement.style.setProperty('--primary', val);
    document.documentElement.style.setProperty('--primary-light', val + '99');
    localStorage.setItem('bms_primary_color', val);
};

window.resetAppColor = function() {
    const defaultColor = '#008080';
    changeAppColor(defaultColor);
    const picker = document.getElementById('primaryColorPicker');
    if(picker) picker.value = defaultColor;
};

window.changeAppFontSize = function(val) {
    document.documentElement.style.fontSize = val + 'px';
    localStorage.setItem('bms_font_size', val);
};

window.resetFontSize = function() {
    const defaultSize = 16;
    changeAppFontSize(defaultSize);
    const slider = document.getElementById('fontSizeSlider');
    if(slider) {
        slider.value = defaultSize;
        slider.nextElementSibling.textContent = defaultSize + 'px';
    }
};

window.adminAddEmployee = function() {
    const name = document.getElementById('newEmpName').value.trim();
    const role = document.getElementById('newEmpRole').value;
    const branch = document.getElementById('newEmpBranch').value;

    if (!name) { showToast('يرجى إدخال اسم الموظف', 'error'); return; }

    const id = 'E' + Date.now();
    EMPLOYEES.push({ id, name, role, branch });
    saveData();
    document.getElementById('newEmpName').value = '';
    renderAdminEmployeeList();
    renderAdminBranchList();
    showToast('تم إضافة الموظف بنجاح! 🎉');
};

window.adminClearReports = function() {
    if (!confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع التقارير اليومية نهائياً!')) return;
    AppState.reports = [];
    localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
    showToast('تم تصفير جميع التقارير', 'error');
};

window.adminClearEmployees = function() {
    if (!confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع الموظفين من كل الفروع!')) return;
    EMPLOYEES = [];
    saveData();
    renderAdminEmployeeList();
    renderAdminBranchList();
    showToast('تم تصفير جميع الموظفين', 'error');
};

window.adminClearBranches = function() {
    if (!confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع الفروع وجميع الموظفين معهم!')) return;
    BRANCHES = {};
    EMPLOYEES = [];
    saveData();
    renderAdminBranchList();
    renderAdminEmployeeList();
    showToast('تم تصفير جميع الفروع والموظفين', 'error');
};

window.adminResetAll = function() {
    if (!confirm('⛔ هل أنت متأكد من إعادة ضبط المصنع الكامل؟\n\nسيتم حذف:\n• جميع الفروع\n• جميع الموظفين\n• جميع التقارير\n\nوإعادتها للإعدادات الافتراضية!')) return;
    BRANCHES = {...DEFAULT_BRANCHES};
    EMPLOYEES = [...DEFAULT_EMPLOYEES];
    AppState.reports = [];
    saveData();
    renderAdmin(document.getElementById('pageContent'));
    showToast('تم إعادة ضبط المصنع بالكامل ✅');
};

// -------------------------
// Page: Daily Budget Ledger
// -------------------------
window.renderDailyBudget = function(el) {
    const isBranch = AppState.userRole === 'branch';
    const activeBranch = isBranch ? AppState.userBranch : (AppState.currentBranch !== 'all' ? AppState.currentBranch : Object.keys(BRANCHES)[0]);
    const activeDate = AppState.activeLedgerDate || today();
    const ledgerKey = `${activeBranch}_${activeDate}`;
    
    // Ensure ledger object exists
    if (!AppState.ledgers[ledgerKey]) {
        AppState.ledgers[ledgerKey] = {
            previousBalance: 0,
            rows: [{ bookingType: '', value: 0, receiptNo: '', clientName: '', expense: 0, type: '', notes: '' }]
        }
    }
    
    // [Continuity Logic] Auto-fetch last balance if current is 0
    if (AppState.ledgers[ledgerKey].previousBalance === 0) {
        fetchLastLedgerBalance(activeBranch, activeDate);
    }
    
    const ledger = AppState.ledgers[ledgerKey];
    const dayName = arabicDate(activeDate).split('،')[0];

    el.innerHTML = `
    <div class="page-header animate-in" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <div>
            <h1 style="color:var(--primary); font-weight:900;">📊 اليومية والميزانية</h1>
            <p style="opacity:0.7;">إدارة الحركات المالية لفرع ${BRANCHES[activeBranch]?.name || activeBranch}</p>
        </div>
        <div style="display:flex; gap:15px; align-items:center; background:var(--bg-card); padding:8px 15px; border-radius:100px; border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
            <!-- TODAY BUTTON -->
            <button class="official-btn" style="width:auto; padding:8px 20px; margin:0; border-radius:100px; background:var(--primary); color:#fff; border:none; font-weight:bold;" onclick="resetLedgerToToday()">📅 اليوم</button>
            
            <!-- DATE SELECTOR -->
            <input type="date" id="ledgerDateSelector" class="form-input" value="${activeDate}" onchange="changeLedgerDate(this.value)" style="border:none; background:transparent; font-weight:900; color:var(--text-primary); outline:none; width:130px;">
            
            <!-- PREVIOUS BALANCE CAPSULE -->
            <div class="capsule-input" style="background:#f1c40f22 !important; border-color:#f1c40f !important; padding:5px 15px !important; min-width:160px;">
                <label style="font-size:11px; color:#d35400; font-weight:bold; margin-left:8px;">الإيراد السابق:</label>
                <input type="number" value="${ledger.previousBalance||0}" onchange="updateLedgerPreviousBalance('${ledgerKey}', this.value)" style="color:#d35400 !important; font-size:16px !important; width:90px;">
            </div>

            ${!isBranch ? `
            <select class="form-input" onchange="changeLedgerBranch(this.value)" style="border:none; background:transparent; font-weight:900; border-right:1px solid var(--border-color); padding-right:15px; color:var(--text-primary); outline:none;">
                ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${k===activeBranch?'selected':''}>${v.name}</option>`).join('')}
            </select>` : ''}
        </div>
    </div>

        <!-- MODERN LEDGER TABLE HEADER -->
        <div class="official-table-grid" style="grid-template-columns: 45px 2.2fr 95px 95px 1.5fr 95px 1fr 1.2fr; background: linear-gradient(135deg, #34495e, #2c3e50); color:#fff; font-weight:950; font-size:13px; text-align:center; border-radius:100px; margin-bottom:15px; padding:12px; box-shadow:0 8px 15px rgba(0,0,0,0.1);">
            <div>م</div>
            <div>نوع الحجز والبيان</div>
            <div>الوارد (+)</div>
            <div>رقم الإيصال</div>
            <div>اسم العميل</div>
            <div>المنصرف (-)</div>
            <div>نوع المنصرف</div>
            <div>ملاحظات</div>
        </div>

        <div id="ledgerRowsContainer" style="display:flex; flex-direction:column; gap:5px;">
            ${ledger.rows.map((row, idx) => `
            <div class="ledger-row-premium animate-in">
                <!-- Index Capsule -->
                <div class="capsule-input capsule-idx">${idx + 1}</div>
                
                <!-- Statement Capsule (Large) -->
                <div class="capsule-input capsule-large">
                    <input type="text" placeholder="نوع الحجز والبيان..." value="${row.bookingType||''}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'bookingType', this.value)">
                </div>

                <!-- Inflow Capsule (Small/Green) -->
                <div class="capsule-input capsule-small inflow-accent">
                    <input type="number" placeholder="الوارد" value="${row.value||0}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'value', this.value)">
                </div>

                <!-- Receipt Capsule (Small) -->
                <div class="capsule-input capsule-small">
                    <input type="text" placeholder="إيصال" value="${row.receiptNo||''}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'receiptNo', this.value)">
                </div>

                <!-- Client Capsule (Wide) -->
                <div class="capsule-input capsule-wide">
                    <input type="text" placeholder="اسم العميل" value="${row.clientName||''}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'clientName', this.value)">
                </div>

                <!-- Outflow Capsule (Small/Red) -->
                <div class="capsule-input capsule-small outflow-accent">
                    <input type="number" placeholder="المنصرف" value="${row.expense||0}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'expense', this.value)">
                </div>

                <!-- Exp Type Capsule (Medium) -->
                <div class="capsule-input capsule-medium">
                    <input type="text" placeholder="نوع المنصرف" value="${row.type||''}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'type', this.value)">
                </div>

                <!-- Notes Capsule (Medium) -->
                <div class="capsule-input capsule-medium">
                    <input type="text" placeholder="ملاحظات" value="${row.notes || row.signature || ''}" onchange="updateLedgerRow('${ledgerKey}', ${idx}, 'notes', this.value)">
                </div>
            </div>
            `).join('')}
        </div>

        <!-- FOOTER NEON CARDS -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-top:30px;">
            <div class="neon-summary-card" style="background:rgba(39,174,96,0.1); border:1px solid rgba(39,174,96,0.3); border-radius:20px; padding:20px; text-align:center; box-shadow: 0 0 15px rgba(39,174,96,0.1);">
                <div style="color:#2ecc71; font-size:13px; font-weight:700; margin-bottom:10px;">🟢 إجمالي الوارد اليوم</div>
                <div id="ledgerTotalInflow" style="font-size:28px; font-weight:950; color:#2ecc71;">${formatNumber(calculateLedgerInflow(ledgerKey))}</div>
            </div>
            <div class="neon-summary-card" style="background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); border-radius:20px; padding:20px; text-align:center; box-shadow: 0 0 15px rgba(231,76,60,0.1);">
                <div style="color:#e74c3c; font-size:13px; font-weight:700; margin-bottom:10px;">🔴 إجمالي المنصرف اليوم</div>
                <div id="ledgerTotalOutflow" style="font-size:28px; font-weight:950; color:#e74c3c;">${formatNumber(calculateLedgerOutflow(ledgerKey))}</div>
            </div>
            <div class="neon-summary-card" style="background:var(--gradient-primary); border-radius:20px; padding:20px; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="color:rgba(255,255,255,0.8); font-size:13px; font-weight:700; margin-bottom:10px;">📊 الرصيد النهائي لليوم</div>
                <div id="ledgerEndBalance" style="font-size:32px; font-weight:950; color:#fff; text-shadow: 0 0 15px rgba(255,255,255,0.3);">${formatNumber(calculateLedgerEndBalance(ledgerKey))}</div>
            </div>
        </div>
    </div>

    <!-- ACTIONS BUTTONS -->
    <div style="padding:30px; display:flex; justify-content:center; gap:25px; flex-wrap:wrap;">
        <button class="official-btn" style="padding:15px 40px; border-radius:100px; background:var(--gradient-primary); color:#fff; border:none; font-size:16px; font-weight:900; box-shadow:0 10px 30px rgba(0,0,0,0.15);" onclick="saveLedger('${ledgerKey}')">💾 حفظ الحركات</button>
        <button class="official-btn" style="padding:15px 40px; border-radius:100px; background:linear-gradient(135deg, #34495e, #2c3e50); color:#fff; border:none; font-size:16px; font-weight:900; box-shadow:0 10px 30px rgba(0,0,0,0.15);" onclick="exportLedgerPDF('${ledgerKey}')">🖨️ تصدير كـ PDF</button>
        <button class="official-btn" style="padding:15px 40px; border-radius:100px; background:rgba(0,0,0,0.05); color:var(--text-secondary); border:1px dashed var(--border-color); font-size:16px; font-weight:900;" onclick="addLedgerRow('${ledgerKey}')">+ إضافة سطر جديد</button>
    </div>
    `;
};

window.resetLedgerToToday = function() {
    AppState.activeLedgerDate = today();
    renderDailyBudget(document.getElementById('pageContent'));
};

window.exportLedgerPDF = async function(key) {
    const element = document.getElementById('ledgerCaptureArea');
    if (!element) return;

    const parts = key.split('_');
    const bKey = parts[0];
    const date = parts[1];
    const branchName = BRANCHES[bKey]?.name || 'فرع';

    // IMPORTANT: Sync UI values to DOM attributes for html2canvas
    const inputs = element.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) input.setAttribute('checked', '');
            else input.removeAttribute('checked');
        } else {
            input.setAttribute('value', input.value);
            input.style.color = '#000'; // Force solid black text for PDF
            input.style.fontWeight = '900';
            if (input.style.background === 'transparent' || input.style.background === '') {
                input.style.background = '#fff';
            }
        }
    });

    // Force solid backgrounds for gradients to prevent html2canvas fading
    const gradientEls = element.querySelectorAll('[style*="linear-gradient"]');
    const oldGradients = [];
    gradientEls.forEach(el => {
        oldGradients.push({ el, bg: el.style.background });
        if (el.style.background.includes('#11998e')) el.style.background = '#11998e'; // Solid green
        else if (el.style.background.includes('#cb2d3e')) el.style.background = '#cb2d3e'; // Solid red
        else if (el.style.background.includes('#1e3c72')) el.style.background = '#1e3c72'; // Solid blue
        else if (el.style.background.includes('#232526')) el.style.background = '#232526'; // Solid dark
        else el.style.background = '#555';
    });

    const opt = {
        margin: 5,
        filename: `يومية_${branchName}_${date}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast('⏳ جاري استخراج التقرير بصيغة PDF...', 'info');
    
    // Tiny delay to ensure styles and sync are applied
    setTimeout(async () => {
        try {
            await html2pdf().set(opt).from(element).save();
            showToast('✅ تم تحميل تقرير PDF بنجاح!', 'success');
        } catch (err) {
            showToast('❌ فشل تصدير PDF', 'error');
            console.error(err);
        } finally {
            // Cleanup
            inputs.forEach(input => {
                input.removeAttribute('value');
                input.removeAttribute('checked');
                input.style.color = '';
                input.style.fontWeight = '';
                input.style.background = 'transparent';
            });
            oldGradients.forEach(item => {
                item.el.style.background = item.bg;
            });
        }
    }, 500);
};

window.changeLedgerDate = function(val) {
    AppState.activeLedgerDate = val;
    renderDailyBudget(document.getElementById('pageContent'));
};

window.changeLedgerBranch = function(val) {
    AppState.currentBranch = val;
    renderDailyBudget(document.getElementById('pageContent'));
};

window.updateLedgerMeta = function(key, field, val) {
    if (!AppState.ledgers[key]) return;
    AppState.ledgers[key][field] = parseFloat(val) || 0;
    saveLedgerEntry(key);
    renderDailyBudget(document.getElementById('pageContent'));
};

window.updateLedgerPreviousBalance = function(key, val) {
    if (!AppState.ledgers[key]) return;
    const numericVal = parseFloat(val) || 0;
    AppState.ledgers[key].previousBalance = numericVal;
    
    // [Sync Logic] Update Report financials if report exists for the same branch and date
    const parts = key.split('_');
    const bKey = parts[0];
    const dStr = parts[1];
    const report = AppState.reports.find(r => r.branch === bKey && r.date === dStr);
    if (report) {
        if (!report.financials) report.financials = {};
        report.financials.previousBalance = numericVal;
        // Recalculate report balance
        const inTotal = report.financials.dailyInflow || 0;
        const outTotal = report.financials.dailyOutflow || 0;
        report.financials.totalNet = numericVal + inTotal - outTotal;
        report.currentBalance = report.financials.totalNet;
    }

    saveLedgerEntry(key);
    renderDailyBudget(document.getElementById('pageContent'));
};

window.fetchLastLedgerBalance = function(branchKey, activeDate) {
    // Find previous ledger entry
    const dates = Object.keys(AppState.ledgers)
        .filter(k => k.startsWith(branchKey + '_'))
        .map(k => k.split('_')[1])
        .filter(d => d < activeDate)
        .sort((a,b) => b.localeCompare(a));

    if (dates.length > 0) {
        const lastDate = dates[0];
        const lastKey = `${branchKey}_${lastDate}`;
        const lastBalance = calculateLedgerEndBalance(lastKey);
        
        if (lastBalance > 0) {
            AppState.ledgers[`${branchKey}_${activeDate}`].previousBalance = lastBalance;
            showToast(`تم ترحيل رصيد ${formatNumber(lastBalance)} من يوم ${lastDate} بنجاح`, 'success');
        }
    } else {
        // Fallback: Try to fetch from reports if no ledger exists
        const pastReports = AppState.reports
            .filter(r => r.branch === branchKey && r.date < activeDate)
            .sort((a, b) => b.date.localeCompare(a.date));
        
        if (pastReports.length > 0) {
            const lastReport = pastReports[0];
            const lastBalance = lastReport.currentBalance || lastReport.financials?.totalNet || 0;
            if (lastBalance > 0) {
                AppState.ledgers[`${branchKey}_${activeDate}`].previousBalance = lastBalance;
                showToast(`تم سحب رصيد ${formatNumber(lastBalance)} من تقرير ${lastReport.date} تلقائياً`, 'success');
            }
        }
    }
};

window.updateLedgerRow = function(key, idx, field, val) {
    if (!AppState.ledgers[key]) return;
    if (field === 'value' || field === 'expense') val = parseFloat(val) || 0;
    AppState.ledgers[key].rows[idx][field] = val;
    saveLedgerEntry(key);
    // Instant update
    document.getElementById('ledgerTotalInflow').textContent = formatNumber(calculateLedgerInflow(key));
    document.getElementById('ledgerTotalOutflow').textContent = formatNumber(calculateLedgerOutflow(key));
    document.getElementById('ledgerEndBalance').textContent = formatNumber(calculateLedgerEndBalance(key));
};

window.addLedgerRow = function(key) {
    if (!AppState.ledgers[key]) return;
    AppState.ledgers[key].rows.push({ bookingType: '', value: 0, receiptNo: '', clientName: '', expense: 0, type: '', notes: '' });
    saveLedgerEntry(key);
    renderDailyBudget(document.getElementById('pageContent'));
};

window.saveLedger = function(key) {
    saveLedgerEntry(key);
    showToast('تم حفظ اليومية بنجاح 💾', 'success');
};

// New Atomic Ledger Sync Function
function saveLedgerEntry(key) {
    if (!AppState.ledgers[key]) return;
    
    // Update local storage
    localStorage.setItem('bms_ledgers', JSON.stringify(AppState.ledgers));
    
    // Atomic Cloud Update
    if (window.db && AppState.isInitialSyncComplete) {
        db.ref(AppState.systemSecret + '/bms/ledgers/' + key).set(AppState.ledgers[key]);
        console.log(`☁️ Granular Sync: Ledger ${key} updated.`);
    } else {
        console.warn("⏳ Sync Pending or offline - local save only.");
    }
}

window.isLedgerActive = function(key) {
    const l = AppState.ledgers[key];
    if (!l) return false;
    if (parseFloat(l.previousBalance) > 0) return true;
    return l.rows.some(r => parseFloat(r.value) > 0 || parseFloat(r.expense) > 0);
};

window.calculateLedgerInflow = function(key) {
    const l = AppState.ledgers[key];
    if (!l) return 0;
    return l.rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0);
};

window.calculateLedgerOutflow = function(key) {
    const l = AppState.ledgers[key];
    if (!l) return 0;
    return l.rows.reduce((s, r) => s + (parseFloat(r.expense) || 0), 0);
};

window.calculateLedgerEndBalance = function(key) {
    const l = AppState.ledgers[key];
    if (!l) return 0;
    const inflow = calculateLedgerInflow(key);
    const outflow = calculateLedgerOutflow(key);
    return (parseFloat(l.previousBalance) || 0) + inflow - outflow;
};

// -------------------------
// Theme Toggle
// -------------------------
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function startClock() {
    const hrsEl = document.getElementById('hrs');
    const minEl = document.getElementById('min');
    const secEl = document.getElementById('sec');
    if (!hrsEl || !minEl || !secEl) return;
    
    function update() {
        const now = new Date();
        hrsEl.textContent = String(now.getHours()).padStart(2, '0');
        minEl.textContent = String(now.getMinutes()).padStart(2, '0');
        secEl.textContent = String(now.getSeconds()).padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
}

// -------------------------
// App Init
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Ensure fresh operational start BEFORE any other logic
    if (!localStorage.getItem('bms_fresh_start_v3')) {
        console.log("🧹 Clearing legacy test data...");
        AppState.reports = [];
        BRANCHES = {...DEFAULT_BRANCHES};
        EMPLOYEES = [...DEFAULT_EMPLOYEES];
        saveData();
        localStorage.setItem('bms_fresh_start_v3', 'true');
    }

    // Toast container
    const toast = document.createElement('div');
    toast.id = 'toastContainer';
    toast.className = 'toast-container';
    document.body.appendChild(toast);

    // Date in topbar
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = arabicDate(today());

    // Apply saved theme
    applyTheme(AppState.theme);

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        AppState.theme = newTheme;
        applyTheme(newTheme);
    });

    // Nav links
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (!AppState.userRole) return; // not logged in
            navigate(item.dataset.page);
            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('mobileOverlay').classList.remove('show');
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    mobileMenuBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });

    // Branch selector in topbar
    document.getElementById('branchSelect')?.addEventListener('change', (e) => {
        AppState.currentBranch = e.target.value;
        if (AppState.userRole) {
            navigate(AppState.currentPage);
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Find the visible primary action button and click it
            const primaryBtn = document.querySelector('.page-content .btn-primary:not([disabled])');
            if (primaryBtn) {
                e.preventDefault();
                primaryBtn.click();
            }
        }
        if (e.key === 'Escape') {
            // Close sidebar/overlay/modals
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('mobileOverlay').classList.remove('show');
            // If there's a cancel button, click it
            const cancelBtn = document.querySelector('.btn-outline:not([disabled])');
            if (cancelBtn) cancelBtn.click();
        }
    });

    // Apply font size
    const savedFontSize = localStorage.getItem('bms_font_size');
    if (savedFontSize) document.documentElement.style.fontSize = savedFontSize + 'px';

    // Apply color
    const savedColor = localStorage.getItem('bms_primary_color');
    if (savedColor) changeAppColor(savedColor);

    // Show login screen or auto-login
    const activeRole = localStorage.getItem('bms_role');
    const autoLogin = localStorage.getItem('bms_auto_login') === 'true';
    const savedRole = localStorage.getItem('bms_saved_role');
    const savedBranch = localStorage.getItem('bms_saved_branch');
    const savedPage = localStorage.getItem('bms_page') || 'dashboard';

    startClock();

    if (activeRole || (autoLogin && savedRole)) {
        loginAs(activeRole || savedRole, localStorage.getItem('bms_branch') || savedBranch, autoLogin);
        if (savedPage !== 'dashboard') navigate(savedPage);
    } else {
        showLoginScreen();
    }
    // Start cloud sync if already logged in
    if (AppState.userRole) {
        syncWithCloud();
    } else {
        checkSeeding();
    }
});
