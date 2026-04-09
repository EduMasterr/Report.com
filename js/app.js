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
    userRole: localStorage.getItem('bms_role'),   // 'developer' | 'manager' | 'branch'
    userBranch: localStorage.getItem('bms_branch'),
    managerName: localStorage.getItem('bms_manager_name') || 'المدير العام',
    masterPassword: localStorage.getItem('bms_master_pass') || 'admin#135',
    backupPath: localStorage.getItem('bms_backup_path') || 'D:\\\\Backups-Report',
    systemSecret: 'ReportV2_SecurePath_882' // Dynamic path for cloud data
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
    { id: 'E011', name: 'حبيبة',    role: 'سكرتيرة',    branch: 'smouha' },
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
        if (snap.exists()) {
            BRANCHES = snap.val();
            localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
            console.log("✅ Branches synced");
        }
    });

    // Real-time employees
    db.ref(AppState.systemSecret + '/bms/employees').on('value', snap => {
        if (snap.exists()) {
            EMPLOYEES = snap.val();
            localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
            console.log("✅ Employees synced");
        }
    });

    // Real-time reports
    db.ref(AppState.systemSecret + '/bms/reports').on('value', snap => {
        if (snap.exists()) {
            AppState.reports = snap.val();
            localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
            console.log("✅ Reports synced");
            if (AppState.currentPage === 'dashboard') navigate('dashboard');
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
    localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
    localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
    localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
    
    if (window.db) {
        db.ref(AppState.systemSecret + '/bms/reports').set(AppState.reports || []);
        db.ref(AppState.systemSecret + '/bms/branches').set(BRANCHES || {});
        db.ref(AppState.systemSecret + '/bms/employees').set(EMPLOYEES || []);
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

window.forceSyncData = function() {
    saveData();
    showToast('تم مزامنة وحفظ البيانات بنجاح 🔄');
};

window.logout = function() {
    if (AppState.userRole) {
        saveData();
        // Force manual check on logout so it doesn't just download silently
        createLocalBackup(false); 
    }
    
    AppState.userRole = null;
    AppState.userBranch = null;
    localStorage.removeItem('bms_role');
    localStorage.setItem('bms_auto_login', 'false');
    showLoginScreen();
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

    const totalRevenue = userReports.reduce((s, r) => s + (r.morning.revenue || 0) + (r.evening.revenue || 0), 0);
    const totalExpenses = userReports.reduce((s, r) => s + r.expenses.reduce((x, e) => x + Number(e.amount || 0), 0), 0);
    const netRevenue = totalRevenue - totalExpenses;
    const latestReport = userReports[userReports.length - 1];
    const currentBalance = latestReport ? latestReport.currentBalance : 0;

    const branchEntries = Object.entries(BRANCHES).filter(([k]) => k === AppState.userBranch);

    const branchData = branchEntries.map(([key, branch]) => {
        const bReports = allReports.filter(r => r.branch === key);
        const bRev = bReports.reduce((s,r) => s + (r.morning.revenue||0) + (r.evening.revenue||0), 0);
        const bExp = bReports.reduce((s,r) => s + r.expenses.reduce((x,e)=>x+Number(e.amount||0),0), 0);
        const bCalls = bReports.reduce((s,r) => s + (r.morning.calls||0) + (r.evening.calls||0), 0);
        const bBookings = bReports.reduce((s,r) => s + (r.morning.bookings||0) + (r.evening.bookings||0), 0);
        const bStaff = EMPLOYEES.filter(e => e.branch === key);
        const bManager = bStaff.find(e => e.role === 'مديرة الفرع');
        const bSecretaries = bStaff.filter(e => e.role !== 'مديرة الفرع');
        const lastReport = bReports[bReports.length - 1];
        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport };
    });

    const roleLabel = isDev
        ? '<span class="badge badge-morning" style="font-size:12px;">🛠️ المبرمج</span>'
        : `<span class="badge badge-success" style="font-size:12px;">🏢 ${BRANCHES[AppState.userBranch]?.name || ''}</span>`;

    el.innerHTML = `
    <div class="page-header animate-in" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
            <h1>مرحباً بك 👋</h1>
            <p>${isDev ? 'نظرة عامة كاملة على النظام' : 'بيانات فرعك الحالي'}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
            ${roleLabel}
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card red animate-in">
            <span class="card-icon">💰</span>
            <div class="card-label">${isDev ? 'إجمالي الإيرادات' : 'إيرادات الفرع'}</div>
            <div class="card-value" data-count="${totalRevenue}">0</div>
            <span class="card-unit">ج.م</span>
        </div>
        <div class="summary-card gold animate-in">
            <span class="card-icon">📤</span>
            <div class="card-label">${isDev ? 'إجمالي المصروفات' : 'مصروفات الفرع'}</div>
            <div class="card-value" data-count="${totalExpenses}">0</div>
            <span class="card-unit">ج.م</span>
        </div>
        <div class="summary-card green animate-in">
            <span class="card-icon">📈</span>
            <div class="card-label">صافي الإيراد</div>
            <div class="card-value" data-count="${netRevenue}">0</div>
            <span class="card-unit">ج.م</span>
        </div>
        <div class="summary-card blue animate-in">
            <span class="card-icon">🏦</span>
            <div class="card-label">الرصيد الحالي</div>
            <div class="card-value" data-count="${currentBalance}">0</div>
            <span class="card-unit">ج.م</span>
        </div>
    </div>

    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">📊 ${isDev ? 'بيانات الفروع المستقلة' : 'بيانات فرعك'}</h2>
    </div>

    <div class="branches-grid">
        ${branchData.map((bd, i) => `
        <div class="branch-card animate-in" style="animation-delay:${i*0.07}s">
            <div class="branch-card-top" style="background: linear-gradient(135deg, ${bd.branch.color} 0%, ${bd.branch.color}cc 100%);">
                <div class="branch-name">${bd.branch.name}</div>
                <div class="branch-location">📍 ${bd.branch.city} ${bd.bManager ? '· مديرة: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="branch-card-body">
                <div class="branch-stat-row">
                    <span class="bsr-label">الإيرادات</span>
                    <span class="bsr-val" style="color:#27ae60;">${formatNumber(bd.bRev)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">المصروفات</span>
                    <span class="bsr-val" style="color:#e74c3c;">${formatNumber(bd.bExp)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الصافي</span>
                    <span class="bsr-val" style="color:var(--primary);font-weight:900;">${formatNumber(bd.bRev - bd.bExp)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الاتصالات</span>
                    <span class="bsr-val">${bd.bCalls}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الحجوزات</span>
                    <span class="bsr-val">${bd.bBookings}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">التقارير</span>
                    <span class="bsr-val">${bd.bReports.length} تقرير</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">السكرتارية</span>
                    <span class="bsr-val">${isManager ? 'موظف مختص' : (bd.bSecretaries.map(s => s.name).join(' · ') || '—')}</span>
                </div>
                ${bd.lastReport ? `<div class="branch-stat-row" style="border-bottom:none;padding-top:12px;border-top:1px dashed var(--border-color);margin-top:4px;">
                    <span class="bsr-label">آخر تقرير</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.lastReport.date}</span>
                </div>` : ''}
            </div>
            ${isBranch ? `<div class="branch-card-footer">
                <button class="btn btn-outline" style="flex:1;font-size:13px;padding:8px 12px;" onclick="navigate('report')">📝 تقرير جديد</button>
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

    const branchData = branchEntries.map(([key, branch]) => {
        const bReports = allReports.filter(r => r.branch === key);
        const bRev = bReports.reduce((s,r) => s + (r.morning.revenue||0) + (r.evening.revenue||0), 0);
        const bExp = bReports.reduce((s,r) => s + r.expenses.reduce((x,e)=>x+Number(e.amount||0),0), 0);
        const bCalls = bReports.reduce((s,r) => s + (r.morning.calls||0) + (r.evening.calls||0), 0);
        const bBookings = bReports.reduce((s,r) => s + (r.morning.bookings||0) + (r.evening.bookings||0), 0);
        const bStaff = EMPLOYEES.filter(e => e.branch === key);
        const bManager = bStaff.find(e => e.role === 'مديرة الفرع');
        const bSecretaries = bStaff.filter(e => e.role !== 'مديرة الفرع');
        const lastReport = bReports[bReports.length - 1];
        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport };
    });

    const selectedBranchName = (AppState.currentBranch && AppState.currentBranch !== 'all') 
        ? BRANCHES[AppState.currentBranch]?.name 
        : 'جميع الفروع المستقلة';

    const branchesGridHTML = `
    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">📊 بيانات ${selectedBranchName}</h2>
    </div>
    <div class="branches-grid" style="margin-bottom:30px;">
        ${branchData.map((bd, i) => `
        <div class="branch-card animate-in" style="animation-delay:${i*0.07}s">
            <div class="branch-card-top" style="background: linear-gradient(135deg, ${bd.branch.color} 0%, ${bd.branch.color}cc 100%);">
                <div class="branch-name">${bd.branch.name}</div>
                <div class="branch-location">📍 ${bd.branch.city} ${bd.bManager ? '· مديرة: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="branch-card-body">
                <div class="branch-stat-row">
                    <span class="bsr-label">الإيرادات</span>
                    <span class="bsr-val" style="color:#27ae60;">${formatNumber(bd.bRev)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">المصروفات</span>
                    <span class="bsr-val" style="color:#e74c3c;">${formatNumber(bd.bExp)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الصافي</span>
                    <span class="bsr-val" style="color:var(--primary);font-weight:900;">${formatNumber(bd.bRev - bd.bExp)} ج.م</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الاتصالات</span>
                    <span class="bsr-val">${bd.bCalls}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">الحجوزات</span>
                    <span class="bsr-val">${bd.bBookings}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">التقارير</span>
                    <span class="bsr-val">${bd.bReports.length} تقرير</span>
                </div>
                <div class="branch-stat-row" style="border-bottom:none;">
                    <span class="bsr-label">السكرتارية</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.bSecretaries.map(s => s.name).join(' · ') || '—'}</span>
                </div>
                ${bd.lastReport ? `<div class="branch-stat-row" style="border-bottom:none;padding-top:12px;border-top:1px dashed var(--border-color);margin-top:4px;">
                    <span class="bsr-label">آخر تقرير</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.lastReport.date}</span>
                </div>` : ''}
            </div>
        </div>`).join('')}
    </div>`;

    el.innerHTML = `
    <div class="page-header animate-in" style="display:flex;align-items:center;justify-content:space-between;">
        <div>
            <h1>مرحباً ${AppState.managerName} 👋</h1>
            <p>استعراض التقارير اليومية للفروع</p>
        </div>
    </div>

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

    if (branchKey === 'all') {
        const reports = AppState.reports.filter(r => r.date === date);
        if (reports.length === 0) {
            res.innerHTML = `
            <div class="empty-state animate-in">
                <span class="empty-icon">❌</span>
                <p>لا توجد تقارير مسجلة لهذا التاريخ لجميع الفروع</p>
            </div>`;
            return;
        }

        const totalRev = reports.reduce((s, r) => s + (r.morning.revenue || 0) + (r.evening.revenue || 0), 0);
        const totalExp = reports.reduce((s, r) => s + r.expenses.reduce((x, e) => x + Number(e.amount || 0), 0), 0);
        const totalCals = reports.reduce((s, r) => s + (r.morning.calls || 0) + (r.evening.calls || 0), 0);
        const totalBucks = reports.reduce((s, r) => s + (r.morning.bookings || 0) + (r.evening.bookings || 0), 0);

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

        <div class="section-card animate-in">
            <div class="section-card-header">
                <div class="header-icon morning">📊</div>
                <h3>تفاصيل الفروع لليوم (${arabicDate(date)})</h3>
            </div>
            <div class="section-card-body table-wrapper">
                <table>
                    <thead>
                        <tr><th>الفرع</th><th>الإيراد</th><th>المصروف</th><th>الصافي</th><th>اتصالات</th><th>حجوزات</th><th>أخرى</th></tr>
                    </thead>
                    <tbody>
                        ${reports.map(r => {
                            const b = BRANCHES[r.branch];
                            const rev = (r.morning.revenue || 0) + (r.evening.revenue || 0);
                            const exp = r.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
                            return `
                            <tr>
                                <td style="font-weight:700; color:${b?.color || 'inherit'};">${b?.name || r.branch}</td>
                                <td class="amount-cell primary">${formatNumber(rev)}</td>
                                <td class="amount-cell expense">${formatNumber(exp)}</td>
                                <td class="amount-cell success">${formatNumber(rev - exp)}</td>
                                <td>${(r.morning.calls || 0) + (r.evening.calls || 0)}</td>
                                <td>${(r.morning.bookings || 0) + (r.evening.bookings || 0)}</td>
                                <td style="font-size:11px; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${r.cancellations || '—'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        return;
    }

    const report = AppState.reports.find(r => r.date === date && r.branch === branchKey);

    if (!report) {
        res.innerHTML = `
        <div class="empty-state animate-in">
            <span class="empty-icon">❌</span>
            <p>لا يوجد تقرير مسجل لهذا اليوم في هذا الفرع</p>
        </div>`;
        return;
    }

    const branch = BRANCHES[branchKey];
    res.innerHTML = `
    <div class="section-card animate-in" style="border-top:4px solid ${branch.color};">
        <div class="section-card-header" style="justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="header-icon" style="background:${branch.color}22; color:${branch.color};">🏢</div>
                <h3>تقرير ${branch.name} — ${arabicDate(date)}</h3>
            </div>
            <span class="badge badge-morning">عرض فقط</span>
        </div>
        <div class="section-card-body">
            <div class="content-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                <!-- Morning Shift -->
                <div class="info-list" style="background:var(--bg-main); padding:15px; border-radius:var(--radius-sm); border-right:3px solid #f1c40f;">
                    <h4 style="margin-bottom:12px; color:#f39c12;">☀️ الفترة الصباحية</h4>
                    <div class="info-row"><span class="lbl">السكرتارية</span><span class="val">موظف مختص</span></div>
                    <div class="info-row"><span class="lbl">فتح/غلق</span><span class="val">${report.morning.openTime} - ${report.morning.closeTime}</span></div>
                    <div class="info-row"><span class="lbl">الاتصالات</span><span class="val">${report.morning.calls}</span></div>
                    <div class="info-row"><span class="lbl">الحجوزات</span><span class="val">${report.morning.bookings}</span></div>
                    <div class="info-row"><span class="lbl">الإيراد</span><span class="val primary">${formatNumber(report.morning.revenue)} ج.م</span></div>
                </div>
                <!-- Evening Shift -->
                <div class="info-list" style="background:var(--bg-main); padding:15px; border-radius:var(--radius-sm); border-right:3px solid #3498db;">
                    <h4 style="margin-bottom:12px; color:#2980b9;">🌙 الفترة المسائية</h4>
                    <div class="info-row"><span class="lbl">السكرتارية</span><span class="val">موظف مختص</span></div>
                    <div class="info-row"><span class="lbl">الاتصالات</span><span class="val">${report.evening.calls}</span></div>
                    <div class="info-row"><span class="lbl">الحجوزات</span><span class="val">${report.evening.bookings} (${report.evening.bookingNote})</span></div>
                    <div class="info-row"><span class="lbl">الإيراد</span><span class="val primary">${formatNumber(report.evening.revenue)} ج.م</span></div>
                </div>
            </div>
            
            <div style="margin-top:20px; padding:15px; background:var(--bg-card); border:1px dashed var(--border-color); border-radius:var(--radius-sm);">
                <h4 style="margin-bottom:10px;">💸 ملخص المالية وجرد الصندوق</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                    <div><small>إجمالي الإيراد</small><div style="font-size:18px; font-weight:900; color:var(--primary);">${formatNumber(report.morning.revenue + report.evening.revenue)} ج.م</div></div>
                    <div><small>إجمالي المصروفات</small><div style="font-size:18px; font-weight:900; color:#e74c3c;">${formatNumber(report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} ج.م</div></div>
                    <div><small>صافي اليوم</small><div style="font-size:18px; font-weight:900; color:#27ae60;">${formatNumber((report.morning.revenue + report.evening.revenue) - report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} <small>ج.م</small></div></div>
                    <div><small>رصيد الخزنة</small><div style="font-size:18px; font-weight:900; color:#3498db;">${formatNumber(report.currentBalance)} <small>ج.م</small></div></div>
                </div>
            </div>
        </div>
    </div>`;
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
function renderReport(el) {
    const latestReport = AppState.reports[AppState.reports.length - 1];

    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>📝 التقرير اليومي</h1>
        <p>إدخال بيانات الفترات الصباحية والمسائية</p>
    </div>

    <!-- Morning Shift -->
    <div class="form-section animate-in">
        <div class="form-section-header">☀️ الفترة الصباحية</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="morningSecretary">السكرتارية المختصة</label>
                    <select id="morningSecretary">
                        ${EMPLOYEES.filter(e => e.branch === (AppState.userBranch || 'soyouf'))
                            .map(e => `<option value="${e.name}">${e.name}</option>`).join('') || '<option value="">لا يوجد موظفين مسجلين</option>'}
                    </select>
                </div>
                <div class="form-group">
                    <label for="morningOpenTime">وقت الفتح</label>
                    <input type="time" id="morningOpenTime" value="12:00">
                </div>
                <div class="form-group">
                    <label for="morningCloseTime">وقت الإغلاق</label>
                    <input type="time" id="morningCloseTime" value="19:00">
                </div>
                <div class="form-group">
                    <label for="morningCalls">عدد الاتصالات</label>
                    <input type="text" inputmode="numeric" id="morningCalls" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="morningBookings">عدد الحجوزات</label>
                    <input type="text" inputmode="numeric" id="morningBookings" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="morningRevenue">الإيراد (ج.م)</label>
                    <input type="text" inputmode="decimal" id="morningRevenue" placeholder="0" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')" value="">
                </div>
            </div>
        </div>
    </div>

    <!-- Evening Shift -->
    <div class="form-section animate-in">
        <div class="form-section-header">🌙 الفترة المسائية</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group" style="grid-column: 1/-1;">
                    <label for="eveningSecretariesList">السكرتارية المختصة (الفترة المسائية)</label>
                    <div id="eveningSecretaries" style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                        <!-- Rows added via addSecretaryRow -->
                    </div>
                    <button class="btn-add-row" onclick="addSecretaryRow()">+ إضافة سكرتارية</button>
                </div>
                <div class="form-group">
                    <label for="eveningCalls">عدد الاتصالات</label>
                    <input type="number" id="eveningCalls" min="0" value="">
                </div>
                <div class="form-group">
                    <label for="eveningBookings">عدد الحجوزات</label>
                    <input type="number" id="eveningBookings" min="0" value="">
                </div>
                <div class="form-group">
                    <label for="eveningBookingNote">ملاحظة الحجوزات</label>
                    <input type="text" id="eveningBookingNote" placeholder="مثال: كورس PH1" value="">
                </div>
                <div class="form-group">
                    <label for="eveningRevenue">الإيراد (ج.م)</label>
                    <input type="number" id="eveningRevenue" min="0" placeholder="0" value="">
                </div>
            </div>
        </div>
    </div>

    <!-- Expenses -->
    <div class="form-section animate-in">
        <div class="form-section-header">💸 المنصرفات</div>
        <div class="form-section-body">
            <div class="expense-rows" id="expenseRows">
                <div class="expense-row">
                    <input type="text" placeholder="المستفيد" value="">
                    <input type="text" placeholder="السبب / النوع" value="">
                    <input type="text" inputmode="decimal" placeholder="المبلغ" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')" value="">
                    <button class="btn-remove" onclick="this.closest('.expense-row').remove()">✕</button>
                </div>
            </div>
            <button class="btn-add-row" onclick="addExpenseRow()">+ إضافة مصروف</button>
        </div>
    </div>

    <!-- Teacher Bookings & Cancellations -->
    <div class="form-section animate-in">
        <div class="form-section-header">📋 الغيابات والإلغاءات</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="teacherBookings">حجوزات خاصة لمدرس</label>
                    <textarea id="teacherBookings" placeholder="أدخل تفاصيل حجوزات المدرسين إن وجدت..."></textarea>
                </div>
                <div class="form-group">
                    <label for="cancellations">الغيابات والإلغاءات</label>
                    <textarea id="cancellations" placeholder="أدخل تفاصيل الغيابات والإلغاءات..."></textarea>
                </div>
            </div>
        </div>
    </div>

    <!-- Balance -->
    <div class="form-section animate-in">
        <div class="form-section-header">🏦 الرصيد الحالي</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="branchSelect2">الفرع</label>
                    ${AppState.userRole === 'branch' 
                        ? `<div style="padding:10px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); font-weight:bold; color:var(--primary);">${BRANCHES[AppState.userBranch]?.name}</div>
                           <input type="hidden" id="branchSelect2" value="${AppState.userBranch}">`
                        : `<select id="branchSelect2">
                            ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${k===(AppState.userBranch||'soyouf')?'selected':''}>${v.name}</option>`).join('')}
                           </select>`
                    }
                </div>
                <div class="form-group">
                    <label for="reportDate">التاريخ</label>
                    <input type="date" id="reportDate" value="${today()}">
                </div>
                <div class="form-group">
                    <label for="currentBalance">الرصيد الحالي (ج.م)</label>
                    <input type="text" inputmode="decimal" id="currentBalance" oninput="this.value=this.value.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g,'')" value="">
                </div>
            </div>
        </div>
    </div>

    <div class="form-actions animate-in">
        <button class="btn btn-primary" onclick="saveReport()">💾 حفظ التقرير</button>
        <button class="btn btn-outline" onclick="navigate('dashboard')">↩ العودة</button>
    </div>
    `;
    
    // Add initial evening rows
    const eveningContainer = document.getElementById('eveningSecretaries');
    if (eveningContainer) {
        addSecretaryRow();
        addSecretaryRow();
    }
}

window.addExpenseRow = function() {
    const container = document.getElementById('expenseRows');
    const row = document.createElement('div');
    row.className = 'expense-row';
    row.innerHTML = `
        <input type="text" placeholder="المستفيد">
        <input type="text" placeholder="السبب / النوع">
        <input type="number" placeholder="المبلغ">
        <button class="btn-remove" onclick="this.closest('.expense-row').remove()">✕</button>
    `;
    container.appendChild(row);
};

window.addSecretaryRow = function() {
    const container = document.getElementById('eveningSecretaries');
    if (!container) return;
    
    // Get staff for current branch
    const branchKey = (AppState.userRole === 'branch') ? AppState.userBranch : document.getElementById('branchSelect2').value;
    const branchStaff = EMPLOYEES.filter(e => e.branch === branchKey);
    const options = branchStaff.map(e => `<option value="${e.name}">${e.name}</option>`).join('') || '<option value="">لا يوجد موظفين</option>';

    const row = document.createElement('div');
    row.className = 'expense-row';
    row.style.gridTemplateColumns = '1.2fr 1fr 1fr auto';
    row.innerHTML = `
        <select style="padding:10px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); font-family:Cairo;">
            ${options}
        </select>
        <input type="time" value="12:00">
        <input type="time" value="20:00">
        <button class="btn-remove" onclick="this.closest('.expense-row').remove()">✕</button>
    `;
    container.appendChild(row);
};

window.saveReport = function() {
    // Collect expense rows
    const expenseRows = [...document.querySelectorAll('#expenseRows .expense-row')].map(row => {
        const inputs = row.querySelectorAll('input');
        return { beneficiary: inputs[0].value, type: inputs[1].value, amount: parseFloat(inputs[2].value) || 0 };
    }).filter(e => e.beneficiary || e.amount);

    // Collect secretary rows
    const secretaryRows = [...document.querySelectorAll('#eveningSecretaries .expense-row')].map(row => {
        const sel = row.querySelector('select');
        const inputs = row.querySelectorAll('input');
        return { name: sel.value, start: inputs[0].value, end: inputs[1].value };
    }).filter(s => s.name);

    const report = {
        id: 'R' + Date.now(),
        branch: document.getElementById('branchSelect2').value,
        date: document.getElementById('reportDate').value,
        morning: {
            secretary: document.getElementById('morningSecretary').value,
            openTime: document.getElementById('morningOpenTime').value,
            closeTime: document.getElementById('morningCloseTime').value,
            calls: parseInt(document.getElementById('morningCalls').value) || 0,
            bookings: parseInt(document.getElementById('morningBookings').value) || 0,
            revenue: parseFloat(document.getElementById('morningRevenue').value) || 0,
        },
        evening: {
            secretaries: secretaryRows,
            calls: parseInt(document.getElementById('eveningCalls').value) || 0,
            bookings: parseInt(document.getElementById('eveningBookings').value) || 0,
            bookingNote: document.getElementById('eveningBookingNote').value,
            revenue: parseFloat(document.getElementById('eveningRevenue').value) || 0,
        },
        expenses: expenseRows,
        teacherBookings: document.getElementById('teacherBookings').value,
        cancellations: document.getElementById('cancellations').value,
        currentBalance: parseFloat(document.getElementById('currentBalance').value) || 0,
    };

    AppState.reports.push(report);
    saveData();
    showToast('تم حفظ التقرير بنجاح!', 'success');
    setTimeout(() => navigate('dashboard'), 1000);
};

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
            const bReports = AppState.reports.filter(r => r.branch === key);
            const bRev = bReports.reduce((s,r) => s + r.morning.revenue + r.evening.revenue, 0);
            const bExp = bReports.reduce((s,r) => s + r.expenses.reduce((x,e)=>x+Number(e.amount||0),0), 0);
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
    let reports = AppState.reports;
    
    if (isBranch) {
        reports = AppState.reports.filter(r => r.branch === AppState.userBranch);
    } else if (AppState.currentBranch && AppState.currentBranch !== 'all') {
        reports = AppState.reports.filter(r => r.branch === AppState.currentBranch);
    }
    
    const totalRevenue = reports.reduce((s, r) => s + (r.morning.revenue || 0) + (r.evening.revenue || 0), 0);
    const totalExpenses = reports.reduce((s, r) => s + r.expenses.reduce((x,e)=>x+Number(e.amount||0),0), 0);
    const netRevenue = totalRevenue - totalExpenses;
    const latestBalance = reports.length ? reports[reports.length - 1].currentBalance : 0;

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
            <h3>سجل المصروفات</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>التاريخ</th><th>الفرع</th><th>المستفيد</th><th>النوع</th><th>المبلغ</th></tr>
                </thead>
                <tbody>
                    ${reports.flatMap(r => r.expenses.map(e => ({...e, date: r.date, branch: r.branch}))).length === 0
                        ? `<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد مصروفات مسجلة</p></div></td></tr>`
                        : reports.flatMap(r => r.expenses.map(e => `
                            <tr>
                                <td>${e.date || r.date}</td>
                                <td>${BRANCHES[r.branch]?.name || r.branch}</td>
                                <td>${e.beneficiary}</td>
                                <td>${e.type}</td>
                                <td class="amount-cell expense">${formatNumber(e.amount)} ج.م</td>
                            </tr>`
                        )).join('')
                    }
                </tbody>
            </table>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">📊</div>
            <h3>التقرير اليومي والماليات | Report</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>التاريخ</th><th>الفرع</th><th>إيراد الصباح</th><th>إيراد المساء</th><th>المصروفات</th><th>الرصيد</th></tr>
                </thead>
                <tbody>
                    ${reports.map(r => `
                    <tr>
                        <td>${r.date}</td>
                        <td>${BRANCHES[r.branch]?.name || r.branch}</td>
                        <td class="amount-cell">${formatNumber(r.morning.revenue)}</td>
                        <td class="amount-cell">${formatNumber(r.evening.revenue)}</td>
                        <td class="amount-cell expense">${formatNumber(r.expenses.reduce((s,e)=>s+Number(e.amount||0),0))}</td>
                        <td><strong>${formatNumber(r.currentBalance)}</strong></td>
                    </tr>`).join('') || `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد تقارير</p></div></td></tr>`}
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

    // Ensure fresh operational start by clearing legacy test data
    if (!localStorage.getItem('bms_fresh_start_v3')) {
        console.log("🧹 Clearing legacy test data...");
        AppState.reports = [];
        EMPLOYEES = [...DEFAULT_EMPLOYEES];
        BRANCHES = {...DEFAULT_BRANCHES};
        saveData();
        localStorage.setItem('bms_fresh_start_v3', 'true');
    }
});
