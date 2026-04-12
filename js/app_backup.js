/* =============================================
   app.js â€” Branch Management SPA
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
    managerName: localStorage.getItem('bms_manager_name') || 'ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¹ط§ظ…',
    masterPassword: localStorage.getItem('bms_master_pass') || 'admin#135',
    backupPath: localStorage.getItem('bms_backup_path') || 'D:\\\\Backups-Report',
    systemSecret: 'ReportV2_SecurePath_882' // Dynamic path for cloud data
};

// Default data (used for seeding if no localStorage)
const DEFAULT_BRANCHES = {

    miami:    { name: 'ظپط±ط¹ ظ…ظٹط§ظ…ظٹ',    city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#1a5276' },
    mandara:  { name: 'ظپط±ط¹ ط§ظ„ظ…ظ†ط¯ط±ط©', city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#512e5f' },
    soyouf:   { name: 'ظپط±ط¹ ط§ظ„ط³ظٹظˆظپ',   city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#8B0000' },
    smouha:   { name: 'ظپط±ط¹ ط³ظ…ظˆط­ط©',    city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#1d6a3e' },
    agamy:    { name: 'ظپط±ط¹ ط§ظ„ط¹ط¬ظ…ظٹ',   city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#7d6608' },
    branch6:  { name: 'ط§ظ„ظپط±ط¹ ط§ظ„ط³ط§ط¯ط³', city: 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©', color: '#2c3e50' },
};
const DEFAULT_EMPLOYEES = [

    { id: 'E001', name: 'ط±ظٹظ‡ط§ظ…',    role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'miami' },
    { id: 'E002', name: 'ظ†ظˆط±ظ‡ط§ظ†',   role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'miami' },
    { id: 'E003', name: 'ط³ط§ط±ط©',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'miami' },

    { id: 'E004', name: 'ط±ظˆط§ظ†',     role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'mandara' },
    { id: 'E005', name: 'ظ…ظ†ط© ط®ظ„ظٹظ„', role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'mandara' },
    { id: 'E006', name: 'ط¯ظٹظ†ط§',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'mandara' },

    { id: 'E007', name: 'ط±ط§ظˆظٹط©',    role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'soyouf' },
    { id: 'E008', name: 'ط¯ط¹ط§ط،',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'soyouf' },
    { id: 'E009', name: 'ط±ظˆط§ظ†',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'soyouf' },

    { id: 'E010', name: 'ظ‡ط¯ظ‰',      role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'smouha' },
    { id: 'E011', name: 'ط­ط¨ظٹط¨ط©',    role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'smouha' },
    { id: 'E012', name: 'ط­ط¨ظٹط¨ط© ط®ظ„ظٹظ„', role: 'ط³ظƒط±طھظٹط±ط©',  branch: 'smouha' },

    { id: 'E013', name: 'ط±ط¶ظˆظ‰',     role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'agamy' },
    { id: 'E014', name: 'ط¨ط³ظ…ط©',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'agamy' },
    { id: 'E015', name: 'ط£ط±ظˆظ‰',     role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'agamy' },

    { id: 'E016', name: 'ط±ظٹظ‡ط§ظ…',    role: 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹', branch: 'branch6' },
    { id: 'E017', name: 'ط³1',       role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'branch6' },
    { id: 'E018', name: 'ط³2',       role: 'ط³ظƒط±طھظٹط±ط©',    branch: 'branch6' },
];

// Dynamic data â€” load from localStorage or seed from defaults
let BRANCHES = JSON.parse(localStorage.getItem('bms_branches') || 'null') || {...DEFAULT_BRANCHES};
let EMPLOYEES = JSON.parse(localStorage.getItem('bms_employees') || 'null') || [...DEFAULT_EMPLOYEES];

// -------------------------
// Firebase Sync & Cloud Storage
// -------------------------
window.syncWithCloud = function() {
    if (!window.db) {
        // Try again in 500ms if not ready yet
        setTimeout(syncWithCloud, 500);
        return console.warn("âڈ³ Waiting for Firebase initialization...");
    }
    console.log("âکپï¸ڈ Syncing with cloud...");
    
    // Real-time branches
    db.ref(AppState.systemSecret + '/bms/branches').on('value', snap => {
        if (snap.exists()) {
            BRANCHES = snap.val();
            localStorage.setItem('bms_branches', JSON.stringify(BRANCHES));
            console.log("âœ… Branches synced");
        }
    });

    // Real-time employees
    db.ref(AppState.systemSecret + '/bms/employees').on('value', snap => {
        if (snap.exists()) {
            EMPLOYEES = snap.val();
            localStorage.setItem('bms_employees', JSON.stringify(EMPLOYEES));
            console.log("âœ… Employees synced");
        }
    });

    // Real-time reports
    db.ref(AppState.systemSecret + '/bms/reports').on('value', snap => {
        if (snap.exists()) {
            AppState.reports = snap.val();
            localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
            console.log("âœ… Reports synced");
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
            if (statusText) statusText.textContent = 'ظ…طھطµظ„ ط³ط­ط§ط¨ظٹط§ظ‹';
            console.log("âکپï¸ڈ Connected to Firebase");
        } else {
            statusDiv?.classList.remove('connected');
            statusDiv?.classList.add('disconnected');
            if (statusText) statusText.textContent = 'ظپط´ظ„ ط§ظ„ط§طھطµط§ظ„';
            console.warn("âکپï¸ڈ Disconnected from Firebase");
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
            console.log("ًںŒ± Initial seeding to cloud...");
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
    toast.innerHTML = `<span>${type === 'success' ? 'âœ…' : 'â‌Œ'}</span> ${msg}`;
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
    saveBtn.textContent = 'ط­ظپط¸ ط§ظ„طھط¹ط¯ظٹظ„';
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.padding = '8px 24px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'ط¥ظ„ط؛ط§ط،';
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
            <div class="login-logo-circle">ًں’°</div>
            <h1 class="login-title">Report</h1>
            <p class="login-subtitle">ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ ظˆط§ظ„ظ…ط§ظ„ظٹط§طھ</p>

            <button class="login-btn-admin" onclick="setLoginRole('manager')">
                <span>ًں“¦</span> ط¥ط¯ط§ط±ط© ط§ظ„ظ†ط¸ط§ظ… (ط§ظ„ط±ط¦ظٹط³ظٹ)
            </button>

            <div class="login-select-wrapper">
                <span class="login-select-icon">ًںڈ¢</span>
                <select id="loginBranch" class="login-select" onchange="setLoginRole('branch')">
                    <option value="">ظپط±ظˆط¹ Report ط§ظ„ظ…طھط§ط­ط©</option>
                    ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${savedBranch === k ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
            </div>

            <div id="loginPassArea" style="display:block; transition: all 0.3s ease;">
                <div class="login-input-group">
                    <input type="password" id="loginPass" class="login-input" placeholder="ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±" value="${savedPass}"
                        onkeydown="if(event.key==='Enter') handleLoginSubmit()">
                    <span id="passToggle" class="login-eye-btn" onclick="togglePassView()">ًں‘پï¸ڈ</span>
                </div>

                <div class="login-checkbox-row">
                    <input type="checkbox" id="loginRemember" ${shouldRemember ? 'checked' : ''}>
                    <label for="loginRemember">طھط°ظƒط± ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„</label>
                </div>

                <button class="btn btn-primary" onclick="handleLoginSubmit()" style="width:100%; justify-content:center; padding:16px; background:#0062cc; border:none; border-radius:16px; font-weight:900; font-size:16px; color:white; transition: 0.3s;"
                    onmouseover="this.style.boxShadow='0 10px 30px rgba(0, 98, 204, 0.4)'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.boxShadow='none'; this.style.transform='none'">
                    ط¯ط®ظˆظ„ ط§ظ„ظ†ط¸ط§ظ…
                </button>
            </div>

            <div class="login-footer-links">
                <a href="javascript:void(0)" class="login-link" onclick="setLoginRole('developer')">ط¯ط®ظˆظ„ ط§ظ„ظ…ط¨ط±ظ…ط¬</a>
                <a href="javascript:void(0)" class="login-link" onclick="handleForgotPass()">ظ‡ظ„ ظ†ط³ظٹطھ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±طں</a>
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
        customPrompt('ًں”گ ط¯ط®ظˆظ„ ط§ظ„ظ…ط¨ط±ظ…ط¬ â€” ط£ط¯ط®ظ„ ط§ظ„ظƒظˆط¯ ط§ظ„ظ…ط§ط³طھط±', '', function(pass) {
            if (!pass) return;
            const master = (AppState.masterPassword || '').trim();
            if (pass.trim() === master || pass.trim() === 'admin135') {
                const remember = document.getElementById('loginRemember')?.checked || false;
                loginAs('developer', null, remember, pass.trim());
            } else {
                showToast('ظƒظˆط¯ ط§ظ„ظ…ط¨ط±ظ…ط¬ ط؛ظٹط± طµط­ظٹط­!', 'error');
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
    
    if (role === 'developer' && subtitle) subtitle.textContent = 'طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„: ط§ظ„ظ…ط¨ط±ظ…ط¬';
    if (role === 'manager' && subtitle) subtitle.textContent = 'طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„: ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ط±ط¦ظٹط³ظٹط©';
    
    if (role === 'branch') {
        const sel = document.getElementById('loginBranch');
        if (sel && sel.selectedIndex > 0 && subtitle) {
            subtitle.textContent = 'طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„: ' + sel.options[sel.selectedIndex].text;
        } else if (subtitle) {
            subtitle.textContent = 'ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ ظˆط§ظ„ظ…ط§ظ„ظٹط§طھ';
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
        return showToast('ظٹط±ط¬ظ‰ طھط­ط¯ظٹط¯ ظپط±ط¹ ط£ظˆ ط­ط³ط§ط¨ ط£ظˆظ„ط§ظ‹ ظ„ظ…ط¹ط±ظپط© ظƒظ„ظ…ط© ط³ط±ظ‡', 'error');
    }
    
    const input = prompt('ًں›،ï¸ڈ ط§ط³طھط¹ط§ط¯ط© ط§ظ„ظˆطµظˆظ„:\nظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ظƒظ„ظ…ط© ط§ظ„ط³ط± ط§ظ„ظ…ط§ط³طھط± ظ„ظ…ط¹ط±ظپط© ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط®ط§طµط© ط¨ظ‡ط°ط§ ط§ظ„ط­ط³ط§ط¨:');
    
    if (input === AppState.masterPassword) {
        let passToShow = '';
        if (role === 'developer') passToShow = AppState.masterPassword;
        else if (role === 'manager') passToShow = 'admin';
        else if (role === 'branch') passToShow = '1111';
        
        alert(`âœ… ط§ظ„ظƒظˆط¯ ط§ظ„ط³ط±ظٹ ط§ظ„طµط­ظٹط­ ظ„ظ„ط­ط³ط§ط¨ ظ‡ظˆ:\n\n[ ${passToShow} ]`);
    } else if (input) {
        showToast('ظƒظ„ظ…ط© ط§ظ„ط³ط± ط§ظ„ظ…ط§ط³طھط± ط؛ظٹط± طµط­ظٹط­ط©!', 'error');
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
        return showToast('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ط§ظ„ظپط±ط¹ ط£ظˆ ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ "ط¥ط¯ط§ط±ط© ط§ظ„ظ†ط¸ط§ظ…" ط£ظˆظ„ط§ظ‹', 'error');
    }

    if (role === 'branch') {
        const branch = document.getElementById('loginBranch').value;
        if (!branch) return showToast('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ط§ظ„ظپط±ط¹ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©', 'error');
        if (pass === '7788') {
            loginAs('branch', branch, remember, pass);
        } else {
            showToast('ظƒظ„ظ…ط© ظ…ط±ظˆط± ط§ظ„ظپط±ط¹ ط؛ظٹط± طµط­ظٹط­ط©!', 'error');
        }
    } else if (role === 'manager') {
        // This handles cases where they change admin pass (if we ever allow it) or re-confirm
        if (pass === 'admin_2026') {
            loginAs('manager', null, remember, pass);
        } else {
            showToast('ظƒظ„ظ…ط© ظ…ط±ظˆط± ط§ظ„ط¥ط¯ط§ط±ط© ط؛ظٹط± طµط­ظٹط­ط©!', 'error');
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
                const confirmLink = confirm('âڑ ï¸ڈ ظ„ظ… ظٹطھظ… ط±ط¨ط· ظ…ط¬ظ„ط¯ ط§ظ„ظ†ط³ط® ط§ظ„ط§ط­طھظٹط§ط·ظٹط© ط¨ط¹ط¯!\n\nظٹط¬ط¨ طھط­ط¯ظٹط¯ ط§ظ„ظ…ط¬ظ„ط¯ (D:\\Backups-Report) ط§ظ„ط¢ظ† ظ„ظٹطھظ… ط§ظ„ط­ظپط¸ ط¨ط¯ط§ط®ظ„ظ‡ طھظ„ظ‚ط§ط¦ظٹط§ظ‹.');
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
                        alert('ظٹط±ط¬ظ‰ ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ طµظ„ط§ط­ظٹط© ط§ظ„ظˆطµظˆظ„ ظ„ظ„ظ…ط¬ظ„ط¯ ظ„ط¥طھظ…ط§ظ… ط¹ظ…ظ„ظٹط© ط§ظ„ط­ظپط¸ ط§ظ„طھظ„ظ‚ط§ط¦ظٹ.');
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
                showToast('طھظ… ط­ظپط¸ ط§ظ„ظ†ط³ط®ط© ط¨ظ†ط¬ط§ط­ ظپظٹ ط§ظ„ظ…ط¬ظ„ط¯ ط§ظ„ط¥ط¬ط¨ط§ط±ظٹ ًں“پ', 'success');
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
    showToast('طھظ… ط§ظ„ط­ظپط¸ ظپظٹ ظ…ط³ط§ط± ط§ظ„طھظ†ط²ظٹظ„ط§طھ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ', 'success');
}

window.forceSyncData = function() {
    saveData();
    showToast('طھظ… ظ…ط²ط§ظ…ظ†ط© ظˆط­ظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط¨ظ†ط¬ط§ط­ ًں”„');
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
    
    // Branch selector in topbar â€” only for dev/manager
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
        avatar.innerHTML = '<span>ًں’°</span>';
        avatar.title = 'ط§ظ„ظ…ط¨ط±ظ…ط¬';
    } else if (AppState.userRole === 'manager') {
        avatar.innerHTML = '<span>ًں‘”</span>';
        avatar.title = AppState.managerName;
    } else {
        const branch = BRANCHES[AppState.userBranch];
        avatar.innerHTML = `<span>${branch?.name?.[4] || 'ظپ'}</span>`;
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
        dashboard: isManager ? `ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… â€” ${AppState.managerName}` : (isDev ? 'ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… (ظƒط§ظ…ظ„ط©)' : 'ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…'),
        report: 'ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ',
        branches: 'ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظˆط¹',
        employees: 'ط§ظ„ظ…ظˆط¸ظپظٹظ†',
        finance: 'ط§ظ„ظ…ط§ظ„ظٹط©',
        admin: 'ط§ظ„ط£ط¯ظ…ظ† ط¥ط¯ظٹطھظˆط±',
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
            <h1>âڑ™ï¸ڈ ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ًں‘‹</h1>
            <p>ط£ظ†طھ ظ…ط³ط¬ظ„ ط§ظ„ط¯ط®ظˆظ„ ظƒظ…ط¨ط±ظ…ط¬ (ط§ظ„طھط­ظƒظ… ط§ظ„ظƒط§ظ…ظ„ ظˆط§ظ„ظˆط§ط¬ظ‡ط© ط§ظ„ط®ظ„ظپظٹط©)</p>
        </div>
        <div class="empty-state animate-in">
            <span class="empty-icon">âڑ™ï¸ڈ</span>
            <p>طھظ… طھط®طµظٹطµ ظ‡ط°ظ‡ ط§ظ„ظˆط§ط¬ظ‡ط© ظ„ظ„طھط­ط±ظٹط± ظˆطµظٹط§ظ†ط© ط§ظ„ظ†ط¸ط§ظ….<br>ظٹط±ط¬ظ‰ ط§ظ„طھظˆط¬ظ‡ ط¥ظ„ظ‰ (ط§ظ„ط£ط¯ظ…ظ† ط¥ط¯ظٹطھظˆط±) ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظˆط¹ ظˆط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ.</p>
            <button class="btn btn-primary" onclick="navigate('admin')" style="margin-top:15px;padding:12px 25px;">ط§ظ„ط§ظ†طھظ‚ط§ظ„ ظ„ظ„ط£ط¯ظ…ظ† ط¥ط¯ظٹطھظˆط±</button>
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
        const bManager = bStaff.find(e => e.role === 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
        const bSecretaries = bStaff.filter(e => e.role !== 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
        const lastReport = bReports[bReports.length - 1];
        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport };
    });

    const roleLabel = isDev
        ? '<span class="badge badge-morning" style="font-size:12px;">ًں› ï¸ڈ ط§ظ„ظ…ط¨ط±ظ…ط¬</span>'
        : `<span class="badge badge-success" style="font-size:12px;">ًںڈ¢ ${BRANCHES[AppState.userBranch]?.name || ''}</span>`;

    el.innerHTML = `
    <div class="page-header animate-in" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
            <h1>ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ًں‘‹</h1>
            <p>${isDev ? 'ظ†ط¸ط±ط© ط¹ط§ظ…ط© ظƒط§ظ…ظ„ط© ط¹ظ„ظ‰ ط§ظ„ظ†ط¸ط§ظ…' : 'ط¨ظٹط§ظ†ط§طھ ظپط±ط¹ظƒ ط§ظ„ط­ط§ظ„ظٹ'}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
            ${roleLabel}
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card red animate-in">
            <span class="card-icon">ًں’°</span>
            <div class="card-label">${isDev ? 'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¥ظٹط±ط§ط¯ط§طھ' : 'ط¥ظٹط±ط§ط¯ط§طھ ط§ظ„ظپط±ط¹'}</div>
            <div class="card-value" data-count="${totalRevenue}">0</div>
            <span class="card-unit">ط¬.ظ…</span>
        </div>
        <div class="summary-card gold animate-in">
            <span class="card-icon">ًں“¤</span>
            <div class="card-label">${isDev ? 'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ' : 'ظ…طµط±ظˆظپط§طھ ط§ظ„ظپط±ط¹'}</div>
            <div class="card-value" data-count="${totalExpenses}">0</div>
            <span class="card-unit">ط¬.ظ…</span>
        </div>
        <div class="summary-card green animate-in">
            <span class="card-icon">ًں“ˆ</span>
            <div class="card-label">طµط§ظپظٹ ط§ظ„ط¥ظٹط±ط§ط¯</div>
            <div class="card-value" data-count="${netRevenue}">0</div>
            <span class="card-unit">ط¬.ظ…</span>
        </div>
        <div class="summary-card blue animate-in">
            <span class="card-icon">ًںڈ¦</span>
            <div class="card-label">ط§ظ„ط±طµظٹط¯ ط§ظ„ط­ط§ظ„ظٹ</div>
            <div class="card-value" data-count="${currentBalance}">0</div>
            <span class="card-unit">ط¬.ظ…</span>
        </div>
    </div>

    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">ًں“ٹ ${isDev ? 'ط¨ظٹط§ظ†ط§طھ ط§ظ„ظپط±ظˆط¹ ط§ظ„ظ…ط³طھظ‚ظ„ط©' : 'ط¨ظٹط§ظ†ط§طھ ظپط±ط¹ظƒ'}</h2>
    </div>

    <div class="branches-grid">
        ${branchData.map((bd, i) => `
        <div class="branch-card animate-in" style="animation-delay:${i*0.07}s">
            <div class="branch-card-top" style="background: linear-gradient(135deg, ${bd.branch.color} 0%, ${bd.branch.color}cc 100%);">
                <div class="branch-name">${bd.branch.name}</div>
                <div class="branch-location">ًں“چ ${bd.branch.city} ${bd.bManager ? 'آ· ظ…ط¯ظٹط±ط©: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="branch-card-body">
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط¥ظٹط±ط§ط¯ط§طھ</span>
                    <span class="bsr-val" style="color:#27ae60;">${formatNumber(bd.bRev)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ظ…طµط±ظˆظپط§طھ</span>
                    <span class="bsr-val" style="color:#e74c3c;">${formatNumber(bd.bExp)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„طµط§ظپظٹ</span>
                    <span class="bsr-val" style="color:var(--primary);font-weight:900;">${formatNumber(bd.bRev - bd.bExp)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط§طھطµط§ظ„ط§طھ</span>
                    <span class="bsr-val">${bd.bCalls}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط­ط¬ظˆط²ط§طھ</span>
                    <span class="bsr-val">${bd.bBookings}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„طھظ‚ط§ط±ظٹط±</span>
                    <span class="bsr-val">${bd.bReports.length} طھظ‚ط±ظٹط±</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط³ظƒط±طھط§ط±ظٹط©</span>
                    <span class="bsr-val">${isManager ? 'ظ…ظˆط¸ظپ ظ…ط®طھطµ' : (bd.bSecretaries.map(s => s.name).join(' آ· ') || 'â€”')}</span>
                </div>
                ${bd.lastReport ? `<div class="branch-stat-row" style="border-bottom:none;padding-top:12px;border-top:1px dashed var(--border-color);margin-top:4px;">
                    <span class="bsr-label">ط¢ط®ط± طھظ‚ط±ظٹط±</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.lastReport.date}</span>
                </div>` : ''}
            </div>
            ${isBranch ? `<div class="branch-card-footer">
                <button class="btn btn-outline" style="flex:1;font-size:13px;padding:8px 12px;" onclick="navigate('report')">ًں“‌ طھظ‚ط±ظٹط± ط¬ط¯ظٹط¯</button>
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
        const bManager = bStaff.find(e => e.role === 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
        const bSecretaries = bStaff.filter(e => e.role !== 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
        const lastReport = bReports[bReports.length - 1];
        return { key, branch, bReports, bRev, bExp, bCalls, bBookings, bStaff, bManager, bSecretaries, lastReport };
    });

    const selectedBranchName = (AppState.currentBranch && AppState.currentBranch !== 'all') 
        ? BRANCHES[AppState.currentBranch]?.name 
        : 'ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹ ط§ظ„ظ…ط³طھظ‚ظ„ط©';

    const branchesGridHTML = `
    <div class="page-header animate-in" style="margin-top:12px;">
        <h2 style="font-size:18px;">ًں“ٹ ط¨ظٹط§ظ†ط§طھ ${selectedBranchName}</h2>
    </div>
    <div class="branches-grid" style="margin-bottom:30px;">
        ${branchData.map((bd, i) => `
        <div class="branch-card animate-in" style="animation-delay:${i*0.07}s">
            <div class="branch-card-top" style="background: linear-gradient(135deg, ${bd.branch.color} 0%, ${bd.branch.color}cc 100%);">
                <div class="branch-name">${bd.branch.name}</div>
                <div class="branch-location">ًں“چ ${bd.branch.city} ${bd.bManager ? 'آ· ظ…ط¯ظٹط±ط©: ' + bd.bManager.name : ''}</div>
            </div>
            <div class="branch-card-body">
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط¥ظٹط±ط§ط¯ط§طھ</span>
                    <span class="bsr-val" style="color:#27ae60;">${formatNumber(bd.bRev)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ظ…طµط±ظˆظپط§طھ</span>
                    <span class="bsr-val" style="color:#e74c3c;">${formatNumber(bd.bExp)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„طµط§ظپظٹ</span>
                    <span class="bsr-val" style="color:var(--primary);font-weight:900;">${formatNumber(bd.bRev - bd.bExp)} ط¬.ظ…</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط§طھطµط§ظ„ط§طھ</span>
                    <span class="bsr-val">${bd.bCalls}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„ط­ط¬ظˆط²ط§طھ</span>
                    <span class="bsr-val">${bd.bBookings}</span>
                </div>
                <div class="branch-stat-row">
                    <span class="bsr-label">ط§ظ„طھظ‚ط§ط±ظٹط±</span>
                    <span class="bsr-val">${bd.bReports.length} طھظ‚ط±ظٹط±</span>
                </div>
                <div class="branch-stat-row" style="border-bottom:none;">
                    <span class="bsr-label">ط§ظ„ط³ظƒط±طھط§ط±ظٹط©</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.bSecretaries.map(s => s.name).join(' آ· ') || 'â€”'}</span>
                </div>
                ${bd.lastReport ? `<div class="branch-stat-row" style="border-bottom:none;padding-top:12px;border-top:1px dashed var(--border-color);margin-top:4px;">
                    <span class="bsr-label">ط¢ط®ط± طھظ‚ط±ظٹط±</span>
                    <span class="bsr-val" style="font-size:12px;">${bd.lastReport.date}</span>
                </div>` : ''}
            </div>
        </div>`).join('')}
    </div>`;

    el.innerHTML = `
    <div class="page-header animate-in" style="display:flex;align-items:center;justify-content:space-between;">
        <div>
            <h1>ظ…ط±ط­ط¨ط§ظ‹ ${AppState.managerName} ًں‘‹</h1>
            <p>ط§ط³طھط¹ط±ط§ط¶ ط§ظ„طھظ‚ط§ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹط© ظ„ظ„ظپط±ظˆط¹</p>
        </div>
    </div>

    ${branchesGridHTML}

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon morning">ًں”چ</div>
            <h3>طھطµظپظٹط© ط§ظ„طھظ‚ط§ط±ظٹط± ط§ظ„طھظپطµظٹظ„ظٹط©</h3>
        </div>
        <div class="section-card-body" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; align-items:end;">
            <div class="form-group">
                <label>ط§ط®طھط± ط§ظ„طھط§ط±ظٹط®</label>
                <div style="display:flex; gap:8px;">
                    <input type="date" id="mDateFilter" class="form-input" value="${today()}">
                    <button class="btn btn-outline" style="padding:8px 12px; min-width:unset; border-radius:10px; background:var(--bg-input);" onclick="resetManagerDate()" title="ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ظٹظˆظ…">ًں”„</button>
                </div>
            </div>
            <div class="form-group">
                <label>ط§ط®طھط± ط§ظ„ظپط±ط¹</label>
                <select id="mBranchFilter" class="form-input">
                    <option value="all">ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹ (طھظ‚ط±ظٹط± ظ…ط¬ظ…ط¹)</option>
                    ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
                </select>
            </div>
            <button class="btn btn-primary" onclick="searchManagerReport()" style="padding:12px;">ط¥ط¸ظ‡ط§ط± ط§ظ„طھظ‚ط±ظٹط±</button>
        </div>
    </div>

    <div id="mReportResult" class="animate-in" style="margin-top:20px;">
        <div class="empty-state">
            <span class="empty-icon">ًں“‚</span>
            <p>ط§ط®طھط± ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظپط±ط¹ ط«ظڈظ… ط§ط¶ط؛ط· ط¹ظ„ظ‰ "ط¥ط¸ظ‡ط§ط± ط§ظ„طھظ‚ط±ظٹط±"</p>
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
                <span class="empty-icon">â‌Œ</span>
                <p>ظ„ط§ طھظˆط¬ط¯ طھظ‚ط§ط±ظٹط± ظ…ط³ط¬ظ„ط© ظ„ظ‡ط°ط§ ط§ظ„طھط§ط±ظٹط® ظ„ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹</p>
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
                <div class="card-label">ط¥ط¬ظ…ط§ظ„ظٹ ط¥ظٹط±ط§ط¯ ط§ظ„ظپط±ظˆط¹</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalRev)} <small>ط¬.ظ…</small></div>
            </div>
            <div class="summary-card gold" style="padding:15px;">
                <div class="card-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalExp)} <small>ط¬.ظ…</small></div>
            </div>
            <div class="summary-card green" style="padding:15px;">
                <div class="card-label">طµط§ظپظٹ ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظٹظˆظ…</div>
                <div class="card-value" style="font-size:20px;">${formatNumber(totalRev - totalExp)} <small>ط¬.ظ…</small></div>
            </div>
            <div class="summary-card blue" style="padding:15px;">
                <div class="card-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط­ط¬ظˆط²ط§طھ</div>
                <div class="card-value" style="font-size:20px;">${totalBucks} <span style="font-size:12px;">ط­ط¬ط²</span></div>
            </div>
        </div>

        <div class="section-card animate-in">    <div class="branch-card animate-in" style="max-width:100%; width:100%; border:3px solid ${b.color}; border-radius:15px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
        <div class="branch-card-top" style="background: linear-gradient(135deg, ${b.color} 0%, ${b.color}cc 100%); padding:20px;">
            <div class="branch-name" style="font-size:24px; font-weight:900;">${b.name}</div>
            <div class="branch-location" style="font-size:16px; opacity:0.9;">ًں“چ ${b.city} ${bManager ? 'آ· ظ…ط¯ظٹط±ط©: ' + bManager.name : ''}</div>
        </div>
        <div class="branch-card-body" style="padding:25px; background:var(--bg-card);">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:25px;">
                <!-- Column 1: Morning -->
                <div style="background:var(--bg-input); padding:20px; border-radius:15px; border:2px solid #f1c40f;">
                    <h4 style="margin-bottom:15px; color:#f39c12; font-size:20px; text-align:center; border-bottom:1px solid #f1c40f; padding-bottom:10px;">âک€ï¸ڈ ط§ظ„ظپطھط±ط© ط§ظ„طµط¨ط§ط­ظٹط©</h4>
                    <div class="info-row" style="font-size:18px;"><span class="lbl">ط§ظ„ط³ظƒط±طھط§ط±ظٹط©</span><span class="val" style="font-weight:700;">${report.morning.secretary}</span></div>
                    <div class="info-row" style="font-size:16px;"><span class="lbl">ظپطھط­/ط؛ظ„ظ‚</span><span class="val">${report.morning.openTime} - ${report.morning.closeTime}</span></div>
                    
                    <div style="background:rgba(255,255,255,0.5); padding:10px; border-radius:10px; margin-top:10px;">
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط§ظ„ظˆط§ط±ط¯</span><span class="val" style="color:#27ae60; font-weight:800;">${formatNumber(report.morning.inflow)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط­ط¬ظˆط²ط§طھ ط®ط§طµط©</span><span class="val" style="color:#2980b9;">${formatNumber(report.morning.special)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ظ…ظ†طµط±ظپ</span><span class="val" style="color:#c0392b;">${formatNumber(report.morning.outflow)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط§ط³طھط±ط¯ط§ط¯</span><span class="val" style="color:#c0392b;">${formatNumber(report.morning.refund)}</span></div>
                    </div>
                    
                    <div class="info-row" style="margin-top:10px; border-top:2px solid #f39c12; padding-top:10px;">
                        <span class="lbl" style="font-weight:900; font-size:19px;">طµط§ظپظٹ ط§ظ„ظپطھط±ط©</span>
                        <span class="val" style="font-size:26px; font-weight:900; color:#f39c12;">${formatNumber(report.morning.revenue)} ط¬.ظ…</span>
                    </div>
                </div>
                <!-- Column 2: Evening -->
                <div style="background:var(--bg-input); padding:20px; border-radius:15px; border:2px solid #3498db;">
                    <h4 style="margin-bottom:15px; color:#2980b9; font-size:20px; text-align:center; border-bottom:1px solid #3498db; padding-bottom:10px;">ًںŒ™ ط§ظ„ظپطھط±ط© ط§ظ„ظ…ط³ط§ط¦ظٹط©</h4>
                    <div class="info-row" style="font-size:18px;"><span class="lbl">ط§ظ„ط³ظƒط±طھط§ط±ظٹط©</span><span class="val" style="font-weight:700;">${report.evening.secretaries?.map(s=>s.name).join(' & ') || 'ظ…ظˆط¸ظپ ظ…ط®طھطµ'}</span></div>
                    <div class="info-row" style="font-size:16px;"><span class="lbl">ظپطھط­/ط؛ظ„ظ‚</span><span class="val">${report.evening.openTime} - ${report.evening.closeTime}</span></div>

                    <div style="background:rgba(255,255,255,0.5); padding:10px; border-radius:10px; margin-top:10px;">
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط§ظ„ظˆط§ط±ط¯</span><span class="val" style="color:#27ae60; font-weight:800;">${formatNumber(report.evening.inflow)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط­ط¬ظˆط²ط§طھ ط®ط§طµط©</span><span class="val" style="color:#d35400;">${formatNumber(report.evening.special)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ظ…ظ†طµط±ظپ</span><span class="val" style="color:#c0392b;">${formatNumber(report.evening.outflow)}</span></div>
                        <div class="info-row" style="font-size:17px;"><span class="lbl">ط§ط³طھط±ط¯ط§ط¯</span><span class="val" style="color:#c0392b;">${formatNumber(report.evening.refund)}</span></div>
                    </div>

                    <div class="info-row" style="margin-top:10px; border-top:2px solid #2980b9; padding-top:10px;">
                        <span class="lbl" style="font-weight:900; font-size:19px;">طµط§ظپظٹ ط§ظ„ظپطھط±ط©</span>
                        <span class="val" style="font-size:26px; font-weight:900; color:#2980b9;">${formatNumber(report.evening.revenue)} ط¬.ظ…</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:30px; padding:25px; background:var(--bg-card); border:3px solid var(--primary); border-radius:20px; box-shadow:0 5px 20px rgba(0,0,0,0.05);">
                <h4 style="margin-bottom:20px; font-size:22px; color:var(--primary); text-align:center; border-bottom:2px solid var(--primary-light); padding-bottom:12px;">ًں“ˆ ظ…ظ„ط®طµ ط§ظ„ظ…ط§ظ„ظٹط© ظˆط¹ظ‡ط¯ط© ط§ظ„ط®ط²ظ†ط©</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; text-align:center;">
                    <div style="background:var(--bg-input); padding:15px; border-radius:12px;">
                        <small style="font-size:15px; color:var(--text-secondary);">ط¥ط¬ظ…ط§ظ„ظٹ ط¥ظٹط±ط§ط¯ ط§ظ„ظٹظˆظ…</small>
                        <div style="font-size:32px; font-weight:900; color:var(--primary);">${formatNumber(report.morning.revenue + report.evening.revenue)} <small style="font-size:14px;">ط¬.ظ…</small></div>
                    </div>
                    <div style="background:var(--bg-input); padding:15px; border-radius:12px;">
                        <small style="font-size:15px; color:var(--text-secondary);">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ</small>
                        <div style="font-size:32px; font-weight:900; color:#e74c3c;">${formatNumber(report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} <small style="font-size:14px;">ط¬.ظ…</small></div>
                    </div>
                    <div style="background:var(--bg-input); padding:15px; border-radius:12px; border:2px solid #27ae60;">
                        <small style="font-size:15px; color:#27ae60; font-weight:bold;">ط§ظ„طµط§ظپظٹ ط§ظ„ظ†ظ‡ط§ط¦ظٹ</small>
                        <div style="font-size:32px; font-weight:900; color:#27ae60;">${formatNumber((report.morning.revenue + report.evening.revenue) - report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} <small style="font-size:14px;">ط¬.ظ…</small></div>
                    </div>
                    <div style="background:var(--primary); padding:15px; border-radius:12px; color:white;">
                        <small style="font-size:15px; color:rgba(255,255,255,0.8);">ط±طµظٹط¯ ط§ظ„ط®ط²ظ†ط© ط§ظ„ظپط¹ظ„ظٹ</small>
                        <div style="font-size:38px; font-weight:900; color:white; text-shadow:0 2px 4px rgba(0,0,0,0.2);">${formatNumber(report.currentBalance)} <small style="font-size:14px;">ط¬.ظ…</small></div>
                    </div>
                </div>
            </div>

            ${report.expenses.length > 0 ? `
            <div style="margin-top:20px; padding:15px; background:#fffaf0; border-radius:12px; border-left:5px solid #f39c12;">
                <h4 style="font-size:18px; margin-bottom:10px; color:#d35400;">ًں“¤ طھظپط§طµظٹظ„ ط§ظ„ظ…ظ†طµط±ظپط§طھ:</h4>
                <div style="font-size:16px; line-height:1.6;">
                    ${report.expenses.map(e => `â€¢ ${e.beneficiary} (${e.type}): <strong style="color:#c0392b;">${e.amount} ط¬.ظ…</strong>`).join('<br>')}
                </div>
            </div>` : ''}

            ${report.evening.bookingNote ? `
            <div style="margin-top:15px; padding:15px; background:#f0f7ff; border-radius:12px; border-left:5px solid #2980b9;">
                <h4 style="font-size:18px; margin-bottom:10px; color:#2980b9;">ًں“‌ ظ…ظ„ط§ط­ط¸ط§طھ ط§ظ„ط­ط¬ظˆط²ط§طھ:</h4>
                <p style="font-size:17px; font-weight:500;">${report.evening.bookingNote}</p>
            </div>` : ''}
        </div>
    </div>`;„ظ‚</span><span class="val">${report.evening.openTime} - ${report.evening.closeTime}</span></div>
                    <div class="info-row"><span class="lbl">ط§ظ„ظˆط§ط±ط¯</span><span class="val">${formatNumber(report.evening.inflow || report.evening.revenue)} ط¬.ظ…</span></div>
                    <div class="info-row"><span class="lbl">ط­ط¬ظˆط²ط§طھ ط®ط§طµط©</span><span class="val">${formatNumber(report.evening.special || 0)} ط¬.ظ…</span></div>
                    <div class="info-row"><span class="lbl">ظ…ظ†طµط±ظپ</span><span class="val" style="color:#e74c3c;">${formatNumber(report.evening.outflow || 0)} ط¬.ظ…</span></div>
                    <div class="info-row"><span class="lbl">ط§ط³طھط±ط¯ط§ط¯</span><span class="val" style="color:#e74c3c;">${formatNumber(report.evening.refund || 0)} ط¬.ظ…</span></div>
                    <div class="info-row" style="border-top:1px dashed #ccc; padding-top:8px; margin-top:8px;">
                        <span class="lbl">طµط§ظپظٹ ط§ظ„ط¥ظٹط±ط§ط¯</span><span class="val primary" style="font-weight:900;">${formatNumber(report.evening.revenue)} ط¬.ظ…</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:20px; padding:15px; background:var(--bg-card); border:1px dashed var(--border-color); border-radius:var(--radius-sm);">
                <h4 style="margin-bottom:10px;">ًں’¸ ظ…ظ„ط®طµ ط§ظ„ظ…ط§ظ„ظٹط© ظˆط¬ط±ط¯ ط§ظ„طµظ†ط¯ظˆظ‚</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                    <div><small>ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¥ظٹط±ط§ط¯</small><div style="font-size:18px; font-weight:900; color:var(--primary);">${formatNumber(report.morning.revenue + report.evening.revenue)} ط¬.ظ…</div></div>
                    <div><small>ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ</small><div style="font-size:18px; font-weight:900; color:#e74c3c;">${formatNumber(report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} ط¬.ظ…</div></div>
                    <div><small>طµط§ظپظٹ ط§ظ„ظٹظˆظ…</small><div style="font-size:18px; font-weight:900; color:#27ae60;">${formatNumber((report.morning.revenue + report.evening.revenue) - report.expenses.reduce((s,e)=>s+Number(e.amount||0),0))} <small>ط¬.ظ…</small></div></div>
                    <div><small>ط±طµظٹط¯ ط§ظ„ط®ط²ظ†ط©</small><div style="font-size:18px; font-weight:900; color:#3498db;">${formatNumber(report.currentBalance)} <small>ط¬.ظ…</small></div></div>
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
    showToast('طھظ… طھط­ط¯ظٹط« ط§ط³ظ… ط§ظ„ظ…ط¯ظٹط± ط¨ظ†ط¬ط§ط­', 'success');
};

// -------------------------
// Page: Daily Report Form
// -------------------------
function renderReport(el) {
    const latestReport = AppState.reports[AppState.reports.length - 1];

    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>ًں“‌ ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ</h1>
        <p>ط¥ط¯ط®ط§ظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ظپطھط±ط§طھ ط§ظ„طµط¨ط§ط­ظٹط© ظˆط§ظ„ظ…ط³ط§ط¦ظٹط©</p>
    </div>

    <!-- Morning Shift -->
    <div class="form-section animate-in">
        <div class="form-section-header">âک€ï¸ڈ ط§ظ„ظپطھط±ط© ط§ظ„طµط¨ط§ط­ظٹط©</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="morningSecretary">ط§ظ„ط³ظƒط±طھط§ط±ظٹط© ط§ظ„ظ…ط®طھطµط©</label>
                    <select id="morningSecretary">
                        ${EMPLOYEES.filter(e => e.branch === (AppState.userBranch || 'soyouf'))
                            .map(e => `<option value="${e.name}">${e.name}</option>`).join('') || '<option value="">ظ„ط§ ظٹظˆط¬ط¯ ظ…ظˆط¸ظپظٹظ† ظ…ط³ط¬ظ„ظٹظ†</option>'}
                    </select>
                </div>
                <div class="form-group">
                    <label for="morningOpenTime">ظˆظ‚طھ ط§ظ„ظپطھط­</label>
                    <input type="time" id="morningOpenTime" value="12:00">
                </div>
                <div class="form-group">
                    <label for="morningCloseTime">ظˆظ‚طھ ط§ظ„ط¥ط؛ظ„ط§ظ‚</label>
                    <input type="time" id="morningCloseTime" value="20:00">
                </div>
                <div class="form-group">
                    <label for="morningCalls">ط¹ط¯ط¯ ط§ظ„ط§طھطµط§ظ„ط§طھ</label>
                    <input type="text" inputmode="numeric" id="morningCalls" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="morningBookings">ط¹ط¯ط¯ ط§ظ„ط­ط¬ظˆط²ط§طھ</label>
                    <input type="text" inputmode="numeric" id="morningBookings" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="morningInflow">ط§ظ„ظˆط§ط±ط¯ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="morningInflow" placeholder="0" oninput="calculateShiftRevenue('morning')" value="">
                </div>
                <div class="form-group">
                    <label for="morningSpecial">ط­ط¬ظˆط²ط§طھ ط®ط§طµط© (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="morningSpecial" placeholder="0" oninput="calculateShiftRevenue('morning')" value="">
                </div>
                <div class="form-group">
                    <label for="morningOutflow">ظ…ظ†طµط±ظپ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="morningOutflow" placeholder="0" oninput="calculateShiftRevenue('morning')" value="">
                </div>
                <div class="form-group">
                    <label for="morningRefund">ط§ط³طھط±ط¯ط§ط¯ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="morningRefund" placeholder="0" oninput="calculateShiftRevenue('morning')" value="">
                </div>
                <div class="form-group">
                    <label for="morningRevenue">ط§ظ„ط¥ظٹط±ط§ط¯ ط§ظ„طµط¨ط§ط­ظٹ ط§ظ„ظ†ظ‡ط§ط¦ظٹ (طھظ„ظ‚ط§ط¦ظٹ)</label>
                    <input type="text" id="morningRevenue" class="form-input readonly-input" style="font-weight:900; color:var(--primary); background:#ebf5fb;" value="0" readonly>
                </div>
            </div>
        </div>
    </div>

    <!-- Evening Shift -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًںŒ™ ط§ظ„ظپطھط±ط© ط§ظ„ظ…ط³ط§ط¦ظٹط©</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group" style="grid-column: 1/-1;">
                    <label for="eveningSecretariesList">ط§ظ„ط³ظƒط±طھط§ط±ظٹط© ط§ظ„ظ…ط®طھطµط© (ط§ظ„ظپطھط±ط© ط§ظ„ظ…ط³ط§ط¦ظٹط©)</label>
                    <div id="eveningSecretaries" style="display:flex;flex-direction:column;gap:10px;margin-top:8px;"></div>
                    <button class="btn-add-row" onclick="addSecretaryRow()">+ ط¥ط¶ط§ظپط© ط³ظƒط±طھط§ط±ظٹط©</button>
                </div>
                <div class="form-group">
                    <label for="eveningOpenTime">ظˆظ‚طھ ط§ظ„ظپطھط­</label>
                    <input type="time" id="eveningOpenTime" value="14:00">
                </div>
                <div class="form-group">
                    <label for="eveningCloseTime">ظˆظ‚طھ ط§ظ„ط¥ط؛ظ„ط§ظ‚</label>
                    <input type="time" id="eveningCloseTime" value="22:00">
                </div>
                <div class="form-group">
                    <label for="eveningCalls">ط¹ط¯ط¯ ط§ظ„ط§طھطµط§ظ„ط§طھ</label>
                    <input type="text" inputmode="numeric" id="eveningCalls" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningBookings">ط¹ط¯ط¯ ط§ظ„ط­ط¬ظˆط²ط§طھ</label>
                    <input type="text" inputmode="numeric" id="eveningBookings" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9]/g,'')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningInflow">ط§ظ„ظˆط§ط±ط¯ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="eveningInflow" placeholder="0" oninput="calculateShiftRevenue('evening')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningSpecial">ط­ط¬ظˆط²ط§طھ ط®ط§طµط© (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="eveningSpecial" placeholder="0" oninput="calculateShiftRevenue('evening')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningOutflow">ظ…ظ†طµط±ظپ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="eveningOutflow" placeholder="0" oninput="calculateShiftRevenue('evening')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningRefund">ط§ط³طھط±ط¯ط§ط¯ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="eveningRefund" placeholder="0" oninput="calculateShiftRevenue('evening')" value="">
                </div>
                <div class="form-group">
                    <label for="eveningRevenue">ط§ظ„ط¥ظٹط±ط§ط¯ ط§ظ„ظ…ط³ط§ط¦ظٹ ط§ظ„ظ†ظ‡ط§ط¦ظٹ (طھظ„ظ‚ط§ط¦ظٹ)</label>
                    <input type="text" id="eveningRevenue" class="form-input readonly-input" style="font-weight:900; color:var(--primary); background:#ebf5fb;" value="0" readonly>
                </div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label for="eveningBookingNote">ظ…ظ„ط§ط­ط¸ط© ط§ظ„ط­ط¬ظˆط²ط§طھ</label>
                    <input type="text" id="eveningBookingNote" placeholder="ظ…ط«ط§ظ„: ظƒظˆط±ط³ PH1" value="">
                </div>
            </div>
        </div>
    </div>

    <!-- Expenses -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًں’¸ ط§ظ„ظ…ظ†طµط±ظپط§طھ</div>
        <div class="form-section-body">
            <div class="expense-rows" id="expenseRows">
                <div class="expense-row">
                    <input type="text" placeholder="ط§ظ„ظ…ط³طھظپظٹط¯" value="">
                    <input type="text" placeholder="ط§ظ„ط³ط¨ط¨ / ط§ظ„ظ†ظˆط¹" value="">
                    <input type="text" inputmode="decimal" placeholder="ط§ظ„ظ…ط¨ظ„ط؛" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')" value="">
                    <button class="btn-remove" onclick="this.closest('.expense-row').remove()">âœ•</button>
                </div>
            </div>
            <button class="btn-add-row" onclick="addExpenseRow()">+ ط¥ط¶ط§ظپط© ظ…طµط±ظˆظپ</button>
        </div>
    </div>

    <!-- Teacher Bookings & Cancellations -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًں“‹ ط§ظ„ط؛ظٹط§ط¨ط§طھ ظˆط§ظ„ط¥ظ„ط؛ط§ط،ط§طھ</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="teacherBookings">ط­ط¬ظˆط²ط§طھ ط®ط§طµط© ظ„ظ…ط¯ط±ط³</label>
                    <textarea id="teacherBookings" placeholder="ط£ط¯ط®ظ„ طھظپط§طµظٹظ„ ط­ط¬ظˆط²ط§طھ ط§ظ„ظ…ط¯ط±ط³ظٹظ† ط¥ظ† ظˆط¬ط¯طھ..."></textarea>
                </div>
                <div class="form-group">
                    <label for="cancellations">ط§ظ„ط؛ظٹط§ط¨ط§طھ ظˆط§ظ„ط¥ظ„ط؛ط§ط،ط§طھ</label>
                    <textarea id="cancellations" placeholder="ط£ط¯ط®ظ„ طھظپط§طµظٹظ„ ط§ظ„ط؛ظٹط§ط¨ط§طھ ظˆط§ظ„ط¥ظ„ط؛ط§ط،ط§طھ..."></textarea>
                </div>
            </div>
        </div>
    </div>

    <!-- Balance -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًںڈ¦ ط§ظ„ط±طµظٹط¯ ط§ظ„ط­ط§ظ„ظٹ</div>
        <div class="form-section-body">
            <div class="form-grid">
                <div class="form-group">
                    <label for="branchSelect2">ط§ظ„ظپط±ط¹</label>
                    ${AppState.userRole === 'branch' 
                        ? `<div style="padding:10px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); font-weight:bold; color:var(--primary);">${BRANCHES[AppState.userBranch]?.name}</div>
                           <input type="hidden" id="branchSelect2" value="${AppState.userBranch}">`
                        : `<select id="branchSelect2">
                            ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}" ${k===(AppState.userBranch||'soyouf')?'selected':''}>${v.name}</option>`).join('')}
                           </select>`
                    }
                </div>
                <div class="form-group">
                    <label for="reportDate">ط§ظ„طھط§ط±ظٹط®</label>
                    <input type="date" id="reportDate" value="${today()}">
                </div>
                <div class="form-group">
                    <label for="currentBalance">ط§ظ„ط±طµظٹط¯ ط§ظ„ط­ط§ظ„ظٹ (ط¬.ظ…)</label>
                    <input type="text" inputmode="decimal" id="currentBalance" oninput="this.value=this.value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')" value="">
                </div>
            </div>
        </div>
    </div>

    <div class="form-actions animate-in">
        <button class="btn btn-primary" onclick="saveReport()">ًں’¾ ط­ظپط¸ ط§ظ„طھظ‚ط±ظٹط±</button>
        <button class="btn btn-outline" onclick="navigate('dashboard')">â†© ط§ظ„ط¹ظˆط¯ط©</button>
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
        <input type="text" placeholder="ط§ظ„ظ…ط³طھظپظٹط¯">
        <input type="text" placeholder="ط§ظ„ط³ط¨ط¨ / ط§ظ„ظ†ظˆط¹">
        <input type="number" placeholder="ط§ظ„ظ…ط¨ظ„ط؛">
        <button class="btn-remove" onclick="this.closest('.expense-row').remove()">âœ•</button>
    `;
    container.appendChild(row);
};

window.calculateShiftRevenue = function(shift) {
    const inflow = parseFloat(document.getElementById(`${shift}Inflow`).value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
    const special = parseFloat(document.getElementById(`${shift}Special`).value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
    const outflow = parseFloat(document.getElementById(`${shift}Outflow`).value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
    const refund = parseFloat(document.getElementById(`${shift}Refund`).value.replace(/[ظ -ظ©]/g, d=>'ظ ظ،ظ¢ظ£ظ¤ظ¥ظ¦ظ§ظ¨ظ©'.indexOf(d)).replace(/[^0-9.]/g,'')) || 0;
    
    // Total = (Inflow + Special) - (Outflow + Refund)
    const result = (inflow + special) - (outflow + refund);
    document.getElementById(`${shift}Revenue`).value = result;
    
    // Also auto-suggest current balance? (Optional, maybe safer to let user double check)
    calculateGlobalBalance();
};

function calculateGlobalBalance() {
    const mRev = parseFloat(document.getElementById('morningRevenue').value) || 0;
    const eRev = parseFloat(document.getElementById('eveningRevenue').value) || 0;
    
    // We can't easily auto-calc balance without knowing the previous balance in the form
    // but we can update the total display if needed.
}

window.addSecretaryRow = function() {
    const container = document.getElementById('eveningSecretaries');
    if (!container) return;
    
    const branchKey = (AppState.userRole === 'branch') ? AppState.userBranch : document.getElementById('branchSelect2').value;
    const branchStaff = EMPLOYEES.filter(e => e.branch === branchKey);
    const options = branchStaff.map(e => `<option value="${e.name}">${e.name}</option>`).join('') || '<option value="">ظ„ط§ ظٹظˆط¬ط¯ ظ…ظˆط¸ظپظٹظ†</option>';

    const row = document.createElement('div');
    row.className = 'expense-row';
    row.style.gridTemplateColumns = '1.2fr 1fr 1fr auto';
    row.innerHTML = `
        <select style="padding:10px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); font-family:Cairo;">
            ${options}
        </select>
        <input type="time" value="14:00">
        <input type="time" value="22:00">
        <button class="btn-remove" onclick="this.closest('.expense-row').remove()">âœ•</button>
    `;
    container.appendChild(row);
};

window.saveReport = function() {
    const expenseRows = [...document.querySelectorAll('#expenseRows .expense-row')].map(row => {
        const inputs = row.querySelectorAll('input');
        return { beneficiary: inputs[0].value, type: inputs[1].value, amount: parseFloat(inputs[2].value) || 0 };
    }).filter(e => e.beneficiary || e.amount);

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
            inflow: parseFloat(document.getElementById('morningInflow').value) || 0,
            special: parseFloat(document.getElementById('morningSpecial').value) || 0,
            outflow: parseFloat(document.getElementById('morningOutflow').value) || 0,
            refund: parseFloat(document.getElementById('morningRefund').value) || 0,
            revenue: parseFloat(document.getElementById('morningRevenue').value) || 0,
        },
        evening: {
            secretaries: secretaryRows,
            openTime: document.getElementById('eveningOpenTime').value,
            closeTime: document.getElementById('eveningCloseTime').value,
            calls: parseInt(document.getElementById('eveningCalls').value) || 0,
            bookings: parseInt(document.getElementById('eveningBookings').value) || 0,
            bookingNote: document.getElementById('eveningBookingNote').value,
            inflow: parseFloat(document.getElementById('eveningInflow').value) || 0,
            special: parseFloat(document.getElementById('eveningSpecial').value) || 0,
            outflow: parseFloat(document.getElementById('eveningOutflow').value) || 0,
            refund: parseFloat(document.getElementById('eveningRefund').value) || 0,
            revenue: parseFloat(document.getElementById('eveningRevenue').value) || 0,
        },
        expenses: expenseRows,
        teacherBookings: document.getElementById('teacherBookings').value,
        cancellations: document.getElementById('cancellations').value,
        currentBalance: parseFloat(document.getElementById('currentBalance').value) || 0,
    };

    AppState.reports.push(report);
    saveData();
    showToast('طھظ… ط­ظپط¸ ط§ظ„طھظ‚ط±ظٹط± ط¨ظ†ط¬ط§ط­!', 'success');
    setTimeout(() => navigate('dashboard'), 1000);
};

// -------------------------
// Page: Branches
// -------------------------
function renderBranches(el) {
    el.innerHTML = `
    <div class="page-header animate-in">
        <h1>ًںڈ¢ ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظˆط¹</h1>
        <p>ط¹ط±ط¶ ظˆط¥ط¯ط§ط±ط© ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹</p>
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
                    <div class="branch-location">ًں“چ ${branch.city}</div>
                </div>
                <div class="branch-card-body">
                    <div class="branch-stat-row">
                        <span class="bsr-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¥ظٹط±ط§ط¯ط§طھ</span>
                        <span class="bsr-val">${formatNumber(bRev)} ط¬.ظ…</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ</span>
                        <span class="bsr-val">${formatNumber(bExp)} ط¬.ظ…</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">طµط§ظپظٹ ط§ظ„ط¥ظٹط±ط§ط¯</span>
                        <span class="bsr-val" style="color:var(--primary)">${formatNumber(bRev-bExp)} ط¬.ظ…</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">ط¹ط¯ط¯ ط§ظ„طھظ‚ط§ط±ظٹط±</span>
                        <span class="bsr-val">${bReports.length} طھظ‚ط±ظٹط±</span>
                    </div>
                    <div class="branch-stat-row">
                        <span class="bsr-label">ط§ظ„ظ…ظˆط¸ظپظٹظ†</span>
                        <span class="bsr-val">${EMPLOYEES.filter(e=>e.branch===key).length} ظ…ظˆط¸ظپ</span>
                    </div>
                </div>
                <div class="branch-card-footer">
                    <button class="btn btn-outline" style="flex:1;font-size:13px;padding:8px 12px;" onclick="navigate('report')">ًں“‌ طھظ‚ط±ظٹط± ط¬ط¯ظٹط¯</button>
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
        <h1>ًں‘¥ ط§ظ„ظ…ظˆط¸ظپظٹظ†</h1>
        <p>${isBranch ? 'ظ‚ط§ط¦ظ…ط© ظ…ظˆط¸ظپظٹ ظپط±ط¹ظƒ' : 'ظ‚ط§ط¦ظ…ط© ط¨ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ† ظپظٹ ظƒط§ظپط© ط§ظ„ظپط±ظˆط¹'}</p>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">ًں‘¤</div>
            <h3>${isBranch ? 'ظ…ظˆط¸ظپظٹ ط§ظ„ظپط±ط¹' : 'ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ†'} (${employees.length})</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>ط§ظ„ظ…ظˆط¸ظپ</th>
                        <th>ط§ظ„ظƒظˆط¯</th>
                        <th>ط§ظ„ظˆط¸ظٹظپط©</th>
                        <th>ط§ظ„ظپط±ط¹</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map((emp, i) => {
                        const isManager = AppState.userRole === 'manager';
                        const displayName = isManager ? `ظ…ظˆط¸ظپ #${emp.id.slice(-3)}` : emp.name;
                        const displayInitial = isManager ? 'ًں‘¤' : emp.name[0];
                        
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
                        <td><span class="badge ${emp.role === 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹' ? 'badge-manager' : (emp.role === 'ط³ظƒط±طھظٹط±ط©' ? 'badge-secretary' : 'badge-morning')}">${emp.role}</span></td>
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
        <h1>ًں’° ط§ظ„ظ…ط§ظ„ظٹط©</h1>
        <p>${isBranch ? 'ظ…ظ„ط®طµ ظ…ط§ظ„ظٹ ظ„ظپط±ط¹ظƒ' : 'ظ…ظ„ط®طµ ظ…ط§ظ„ظٹ طھظپطµظٹظ„ظٹ ظ„ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹'}</p>
    </div>

    <div class="financial-summary animate-in">
        <div class="fin-stat">
            <div class="fin-stat-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¥ظٹط±ط§ط¯ط§طھ</div>
            <div class="fin-stat-value" data-count="${totalRevenue}">0</div>
            <div class="fin-stat-unit">ط¬ظ†ظٹظ‡ ظ…طµط±ظٹ</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…طµط±ظˆظپط§طھ</div>
            <div class="fin-stat-value" data-count="${totalExpenses}">0</div>
            <div class="fin-stat-unit">ط¬ظ†ظٹظ‡ ظ…طµط±ظٹ</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">طµط§ظپظٹ ط§ظ„ط¥ظٹط±ط§ط¯</div>
            <div class="fin-stat-value" data-count="${netRevenue}">0</div>
            <div class="fin-stat-unit">ط¬ظ†ظٹظ‡ ظ…طµط±ظٹ</div>
        </div>
        <div class="fin-stat">
            <div class="fin-stat-label">ط§ظ„ط±طµظٹط¯ ط§ظ„ط­ط§ظ„ظٹ</div>
            <div class="fin-stat-value" data-count="${latestBalance}">0</div>
            <div class="fin-stat-unit">ط¬ظ†ظٹظ‡ ظ…طµط±ظٹ</div>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon expense">ًں“‹</div>
            <h3>ط³ط¬ظ„ ط§ظ„ظ…طµط±ظˆظپط§طھ</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>ط§ظ„طھط§ط±ظٹط®</th><th>ط§ظ„ظپط±ط¹</th><th>ط§ظ„ظ…ط³طھظپظٹط¯</th><th>ط§ظ„ظ†ظˆط¹</th><th>ط§ظ„ظ…ط¨ظ„ط؛</th></tr>
                </thead>
                <tbody>
                    ${reports.flatMap(r => r.expenses.map(e => ({...e, date: r.date, branch: r.branch}))).length === 0
                        ? `<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">ًں“­</span><p>ظ„ط§ طھظˆط¬ط¯ ظ…طµط±ظˆظپط§طھ ظ…ط³ط¬ظ„ط©</p></div></td></tr>`
                        : reports.flatMap(r => r.expenses.map(e => `
                            <tr>
                                <td>${e.date || r.date}</td>
                                <td>${BRANCHES[r.branch]?.name || r.branch}</td>
                                <td>${e.beneficiary}</td>
                                <td>${e.type}</td>
                                <td class="amount-cell expense">${formatNumber(e.amount)} ط¬.ظ…</td>
                            </tr>`
                        )).join('')
                    }
                </tbody>
            </table>
        </div>
    </div>

    <div class="section-card animate-in">
        <div class="section-card-header">
            <div class="header-icon finance">ًں“ٹ</div>
            <h3>ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ ظˆط§ظ„ظ…ط§ظ„ظٹط§طھ | Report</h3>
        </div>
        <div class="section-card-body table-wrapper">
            <table>
                <thead>
                    <tr><th>ط§ظ„طھط§ط±ظٹط®</th><th>ط§ظ„ظپط±ط¹</th><th>ط¥ظٹط±ط§ط¯ ط§ظ„طµط¨ط§ط­</th><th>ط¥ظٹط±ط§ط¯ ط§ظ„ظ…ط³ط§ط،</th><th>ط§ظ„ظ…طµط±ظˆظپط§طھ</th><th>ط§ظ„ط±طµظٹط¯</th></tr>
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
                    </tr>`).join('') || `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon">ًں“­</span><p>ظ„ط§ طھظˆط¬ط¯ طھظ‚ط§ط±ظٹط±</p></div></td></tr>`}
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
        <h1>âڑ™ï¸ڈ ط§ظ„ط£ط¯ظ…ظ† ط¥ط¯ظٹطھظˆط±</h1>
        <p>ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظˆط¹ ظˆط§ظ„ظ…ظˆط¸ظپظٹظ† â€” ط¥ط¶ط§ظپط© ظˆطھط¹ط¯ظٹظ„ ظˆط­ط°ظپ</p>
    </div>

    <!-- ====== SYSTEM SETTINGS ====== -->
    <div class="form-section animate-in" style="border-color:#3498db;">
        <div class="form-section-header" style="background:#ebf5fb;color:#2980b9;">âڑ™ï¸ڈ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ†ط¸ط§ظ…</div>
        <div class="form-section-body">
            <div class="form-group" style="margin-bottom:0;">
                <label>ط§ط³ظ… ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¹ط§ظ… ط§ظ„ط­ط§ظ„ظٹ</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="adminManagerName" class="form-input" value="${AppState.managerName}" style="flex:1;">
                    <button class="btn btn-primary" onclick="adminSaveManagerName()">ط­ظپط¸ ط§ظ„ط§ط³ظ…</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">ظ‡ط°ط§ ط§ظ„ط§ط³ظ… ط³ظٹط¸ظ‡ط± ظپظٹ ظˆط§ط¬ظ‡ط© ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¹ط§ظ… ظˆط¹ظ†ط¯ طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>ط§ظ„ظ…ظپطھط§ط­ ط§ظ„ط³ط±ظٹ (ط§ظ„ظ…ط§ط³طھط±)</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="adminMasterPass" class="form-input" value="${AppState.masterPassword}" style="flex:1;">
                    <button class="btn btn-primary" onclick="adminSaveMasterPass()">ط­ظپط¸ ط§ظ„ظ…ظپطھط§ط­</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">ظ‡ط°ط§ ط§ظ„ظ…ظپطھط§ط­ ظٹطھظٹط­ ط§ط®طھط±ط§ظ‚ ط£ظٹ ظپط±ط¹ ظˆط§ظ„ط¯ط®ظˆظ„ ظƒظ…ط¨ط±ظ…ط¬ ظˆظƒط´ظپ ط§ظ„ط¨ط§ط³ظˆظˆط±ط¯ط§طھ.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>ظ…ط³ط§ط± ط­ظپط¸ ط§ظ„ظ†ط³ط® ط§ظ„ط§ط­طھظٹط§ط·ظٹط© ط§ظ„ط¥ط¬ط¨ط§ط±ظٹ ظ„ظ„ظپط±ظˆط¹</label>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div id="folderStatusBadge" style="padding: 10px; background: #fdf2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; color: #991b1b; display: flex; align-items: center; gap: 8px;">
                        <span id="folderStatusDot" style="width:10px; height:10px; background:#ef4444; border-radius:50%"></span>
                        <span id="folderStatusText">ط§ظ„ظ…ط¬ظ„ط¯ ط؛ظٹط± ظ…ط±طھط¨ط·</span>
                    </div>
                    <input type="text" id="adminBackupPath" class="form-input" value="${AppState.backupPath || 'D:\\Backups-Report'}" style="flex:1;" dir="ltr" readonly>
                    <button class="btn btn-primary" onclick="adminSaveBackupPath()">ط±ط¨ط· ط§ظ„ظ…ط¬ظ„ط¯ ط§ظ„ط¢ظ†</button>
                    <button class="btn btn-outline" style="padding:10px;" onclick="createLocalBackup()" title="ط§ط®طھط¨ط§ط± ط§ظ„ط­ظپط¸ ط§ظ„ط¢ظ†">ًں“پ ط§ط®طھط¨ط§ط±</button>
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">طھظˆط¬ظٹظ‡ ط¥ط¬ط¨ط§ط±ظٹ ظ„ظ„ط³ظٹط³طھظ… ظ„ظ…ط³ط§ط± ط§ظ„ط­ظپط¸. ط¹ظ†ط¯ ط§ظ„ط±ط¨ط·طŒ ط³ظٹطھظ… ط§ظ„ط­ظپط¸ طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ظپظٹ ط§ظ„ظپظˆظ„ط¯ط± ط¯ظˆظ† طھط­ظ…ظٹظ„ط§طھ ظٹط¯ظˆظٹط©.</p>
            </div>
            <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <label>طھط؛ظٹظٹط± ط­ط¬ظ… ط§ظ„ط®ط· (ظ„طھط­ط³ظٹظ† ظˆط¶ظˆط­ ط§ظ„ط£ط±ظ‚ط§ظ… ظˆط§ظ„ط¨ظٹط§ظ†ط§طھ)</label>
                <div style="display:flex; align-items:center; gap:20px;">
                    <input type="range" min="14" max="22" step="1" id="fontSizeSlider" 
                           value="${localStorage.getItem('bms_font_size') || 16}" 
                           oninput="changeAppFontSize(this.value); this.nextElementSibling.textContent = this.value + 'px'" style="flex:1;">
                    <span style="font-weight:bold; color:var(--primary); font-size:18px; min-width:40px;">${localStorage.getItem('bms_font_size') || 16}px</span>
                    <button class="btn btn-secondary" onclick="resetFontSize()" style="padding:6px 12px; font-size:12px;">ط¥ط±ط¬ط§ط¹ ظ„ظ„ظˆط¶ط¹ ط§ظ„ط£طµظ„ظٹ</button>
                </div>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>طھط؛ظٹظٹط± ط§ظ„ط«ظٹظ… ط§ظ„ظ„ظˆظ†ظٹ (ط§ظ„ظ„ظˆظ† ط§ظ„ط£ط³ط§ط³ظٹ)</label>
                <div style="display:flex; align-items:center; gap:15px;">
                    <input type="color" id="primaryColorPicker" 
                           value="${localStorage.getItem('bms_primary_color') || '#008080'}" 
                           oninput="changeAppColor(this.value)" style="width:100%; max-width:300px; height:45px; border:none; cursor:pointer; border-radius:8px;">
                    <button class="btn btn-secondary" onclick="resetAppColor()" style="padding:6px 12px; font-size:12px;">ط¥ط±ط¬ط§ط¹ ظ„ظ„ظˆط¶ط¹ ط§ظ„ط£طµظ„ظٹ</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ====== BRANCHES SECTION ====== -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًںڈ¢ ط¥ط¯ط§ط±ط© ط§ظ„ظپط±ظˆط¹</div>
        <div class="form-section-body">
            <div id="adminBranchList"></div>
            <div style="border-top:1px solid var(--border-color);margin-top:20px;padding-top:20px;">
                <h4 style="margin-bottom:14px;font-size:15px;color:var(--text-primary);">â‍• ط¥ط¶ط§ظپط© ظپط±ط¹ ط¬ط¯ظٹط¯</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>ظ…ط¹ط±ظ‘ظپ ط§ظ„ظپط±ط¹ (ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©)</label>
                        <input type="text" id="newBranchKey" placeholder="ظ…ط«ط§ظ„: maadi">
                    </div>
                    <div class="form-group">
                        <label>ط§ط³ظ… ط§ظ„ظپط±ط¹</label>
                        <input type="text" id="newBranchName" placeholder="ظ…ط«ط§ظ„: ظپط±ط¹ ط§ظ„ظ…ط¹ط§ط¯ظٹ">
                    </div>
                    <div class="form-group">
                        <label>ط§ظ„ظ…ط¯ظٹظ†ط©</label>
                        <input type="text" id="newBranchCity" placeholder="ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©" value="ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©">
                    </div>
                    <div class="form-group">
                        <label>ط§ظ„ظ„ظˆظ†</label>
                        <input type="color" id="newBranchColor" value="#2c3e50">
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:14px;" onclick="adminAddBranch()">â‍• ط¥ط¶ط§ظپط© ط§ظ„ظپط±ط¹</button>
            </div>
        </div>
    </div>

    <!-- ====== EMPLOYEES SECTION ====== -->
    <div class="form-section animate-in">
        <div class="form-section-header">ًں‘¥ ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط¸ظپظٹظ†</div>
        <div class="form-section-body">
            <div id="adminEmployeeList"></div>
            <div style="border-top:1px solid var(--border-color);margin-top:20px;padding-top:20px;">
                <h4 style="margin-bottom:14px;font-size:15px;color:var(--text-primary);">â‍• ط¥ط¶ط§ظپط© ظ…ظˆط¸ظپ ط¬ط¯ظٹط¯</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>ط§ط³ظ… ط§ظ„ظ…ظˆط¸ظپ</label>
                        <input type="text" id="newEmpName" placeholder="ط§ظ„ط§ط³ظ…">
                    </div>
                    <div class="form-group">
                        <label>ط§ظ„ظˆط¸ظٹظپط©</label>
                        <select id="newEmpRole">
                            <option value="ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹">ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹</option>
                            <option value="ط³ظƒط±طھظٹط±ط©" selected>ط³ظƒط±طھظٹط±ط©</option>
                            <option value="ط£ط³طھط§ط°">ط£ط³طھط§ط°</option>
                            <option value="ط£ط®ط±ظ‰">ط£ط®ط±ظ‰</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>ط§ظ„ظپط±ط¹</label>
                        <select id="newEmpBranch">
                            ${Object.entries(BRANCHES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:14px;" onclick="adminAddEmployee()">â‍• ط¥ط¶ط§ظپط© ط§ظ„ظ…ظˆط¸ظپ</button>
            </div>
        </div>
    </div>

    <!-- ====== DANGER ZONE ====== -->
    <div class="form-section animate-in" style="border-color:#ffe3e3;">
        <div class="form-section-header" style="background:#fff5f5;color:#c92a2a;">âڑ ï¸ڈ طھطµظپظٹط± ط§ظ„ط¨ظٹط§ظ†ط§طھ</div>
        <div class="form-section-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:20px;">
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">ًں“‌</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„طھظ‚ط§ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹط©</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearReports()">ًں—‘ï¸ڈ طھطµظپظٹط± ط§ظ„طھظ‚ط§ط±ظٹط±</button>
                </div>
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">ًں‘¥</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ† ظ…ظ† ظƒظ„ ط§ظ„ظپط±ظˆط¹</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearEmployees()">ًں—‘ï¸ڈ طھطµظپظٹط± ط§ظ„ظ…ظˆط¸ظپظٹظ†</button>
                </div>
                <div style="background:var(--bg-input);border-radius:var(--radius-sm);padding:18px;text-align:center;border:1px solid var(--border-color);">
                    <span style="font-size:28px;display:block;margin-bottom:8px;">ًںڈ¢</span>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹ ظˆط§ظ„ظ…ظˆط¸ظپظٹظ†</p>
                    <button class="btn" style="background:#e67e22;color:white;width:100%;justify-content:center;" onclick="adminClearBranches()">ًں—‘ï¸ڈ طھطµظپظٹط± ط§ظ„ظپط±ظˆط¹</button>
                </div>
            </div>
            <div style="border-top:2px dashed #ffe3e3;padding-top:20px;text-align:center;">
                <p style="color:#c92a2a;font-weight:700;margin-bottom:6px;">â›” طھطµظپظٹط± ط´ط§ظ…ظ„</p>
                <p style="color:var(--text-secondary);font-size:13px;margin-bottom:14px;">ط­ط°ظپ ظƒظ„ ط´ظٹط، (ط§ظ„ظپط±ظˆط¹ + ط§ظ„ظ…ظˆط¸ظپظٹظ† + ط§ظ„طھظ‚ط§ط±ظٹط±) ظˆط¥ط¹ط§ط¯طھظ‡ط§ ظ„ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط§ظپطھط±ط§ط¶ظٹط©</p>
                <button class="btn" style="background:#c92a2a;color:white;padding:12px 28px;" onclick="adminResetAll()">ًں”„ ط¥ط¹ط§ط¯ط© ط¶ط¨ط· ط§ظ„ظ…طµظ†ط¹ ط§ظ„ظƒط§ظ…ظ„</button>
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
        text.textContent = 'ط§ظ„ظ…ط¬ظ„ط¯ ظ…ظ€ط±طھط¨ظ€ط· âœ…';
        input.value = handle.name || AppState.backupPath;
    } else {
        badge.style.background = '#fdf2f2';
        badge.style.borderColor = '#fecaca';
        badge.style.color = '#991b1b';
        dot.style.background = '#ef4444';
        text.textContent = 'ط§ظ„ظ…ط¬ظ„ط¯ ط؛ظٹط± ظ…ط±طھط¨ط· â‌Œ';
    }
}

function renderAdminBranchList() {
    const container = document.getElementById('adminBranchList');
    if (!container) return;
    const entries = Object.entries(BRANCHES);
    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">ًںڈ¢</span><p>ظ„ط§ طھظˆط¬ط¯ ظپط±ظˆط¹</p></div>';
        return;
    }
    container.innerHTML = `
    <div class="table-wrapper"><table>
        <thead><tr><th>ط§ظ„ظ…ط¹ط±ظ‘ظپ</th><th>ط§ظ„ط§ط³ظ…</th><th>ط§ظ„ظ…ط¯ظٹظ†ط©</th><th>ط§ظ„ظ„ظˆظ†</th><th>ط§ظ„ظ…ط¯ظٹط±ط©</th><th>ط§ظ„ط³ظƒط±طھط§ط±ظٹط©</th><th>ط¥ط¬ط±ط§ط،ط§طھ</th></tr></thead>
        <tbody>
            ${entries.map(([key, b]) => {
                const manager = EMPLOYEES.find(e => e.branch === key && e.role === 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
                const secretaries = EMPLOYEES.filter(e => e.branch === key && e.role !== 'ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹');
                return `<tr>
                    <td><code style="background:var(--bg-input);padding:3px 8px;border-radius:4px;font-size:12px;">${key}</code></td>
                    <td>${b.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="طھط¹ط¯ظٹظ„ ط§ظ„ط§ط³ظ…" onclick="editBranchPrompt('${key}','name','ط§ظ„ط§ط³ظ…')">âœڈï¸ڈ</span></td>
                    <td>${b.city} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="طھط¹ط¯ظٹظ„ ط§ظ„ظ…ط¯ظٹظ†ط©" onclick="editBranchPrompt('${key}','city','ط§ظ„ظ…ط¯ظٹظ†ط©')">âœڈï¸ڈ</span></td>
                    <td><input type="color" value="${b.color}" onchange="adminEditBranch('${key}','color',this.value)" style="width:36px;height:32px;border:none;cursor:pointer;background:transparent;"></td>
                    <td>${manager ? `${manager.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="طھط¹ط¯ظٹظ„ ظ…ط¯ظٹط± ط§ظ„ظپط±ط¹" onclick="editEmpPrompt('${manager.id}')">âœڈï¸ڈ</span>` : '<span style="color:var(--text-muted)">â€”</span>'}</td>
                    <td>${secretaries.map(s => `${s.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="طھط¹ط¯ظٹظ„ ط§ظ„ط³ظƒط±طھط§ط±ظٹط©" onclick="editEmpPrompt('${s.id}')">âœڈï¸ڈ</span>`).join(' &nbsp;طŒ&nbsp; ') || '<span style="color:var(--text-muted)">â€”</span>'}</td>
                    <td><button class="btn-remove" onclick="adminDeleteBranch('${key}')">ًں—‘ï¸ڈ</button></td>
                </tr>`;
            }).join('')}
        </tbody>
    </table></div>`;
}

function renderAdminEmployeeList() {
    const container = document.getElementById('adminEmployeeList');
    if (!container) return;
    if (EMPLOYEES.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">ًں‘¤</span><p>ظ„ط§ ظٹظˆط¬ط¯ ظ…ظˆط¸ظپظٹظ†</p></div>';
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
                <thead><tr><th>ط§ظ„ظƒظˆط¯</th><th>ط§ظ„ط§ط³ظ…</th><th>ط§ظ„ظˆط¸ظٹظپط©</th><th>ط¥ط¬ط±ط§ط،ط§طھ</th></tr></thead>
                <tbody>
                    ${g.employees.map(emp => `<tr>
                        <td><code style="background:var(--bg-input);padding:3px 8px;border-radius:4px;font-size:12px;">${emp.id}</code></td>
                        <td>${emp.name} <span style="cursor:pointer;font-size:13px;opacity:0.7;margin-right:6px;" title="طھط¹ط¯ظٹظ„ ط§ط³ظ… ط§ظ„ظ…ظˆط¸ظپ" onclick="editEmpPrompt('${emp.id}')">âœڈï¸ڈ</span></td>
                        <td>
                            <select onchange="adminEditEmployee('${emp.id}','role',this.value)" style="padding:6px 10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;font-family:Cairo;font-size:13px;color:var(--text-primary);">
                                <option value="ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹" ${emp.role==='ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹'?'selected':''}>ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹</option>
                                <option value="ط³ظƒط±طھظٹط±ط©" ${emp.role==='ط³ظƒط±طھظٹط±ط©'?'selected':''}>ط³ظƒط±طھظٹط±ط©</option>
                                <option value="ط£ط³طھط§ط°" ${emp.role==='ط£ط³طھط§ط°'?'selected':''}>ط£ط³طھط§ط°</option>
                                <option value="ط£ط®ط±ظ‰" ${!['ظ…ط¯ظٹط±ط© ط§ظ„ظپط±ط¹','ط³ظƒط±طھظٹط±ط©','ط£ط³طھط§ط°'].includes(emp.role)?'selected':''}>ط£ط®ط±ظ‰</option>
                            </select>
                        </td>
                        <td><button class="btn-remove" onclick="adminDeleteEmployee('${emp.id}')">ًں—‘ï¸ڈ</button></td>
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
        showToast('طھظ… طھط­ط¯ظٹط« ط§ظ„ظپط±ط¹ ط¨ظ†ط¬ط§ط­');
    }
};

window.adminSaveManagerName = function() {
    const val = document.getElementById('adminManagerName').value.trim();
    if (!val) return showToast('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… طµط­ظٹط­', 'error');
    AppState.managerName = val;
    localStorage.setItem('bms_manager_name', val);
    showToast('طھظ… ط­ظپط¸ ط§ط³ظ… ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¬ط¯ظٹط¯ âœ…');
    // Refresh avatar display
    updateUserDisplay();
};

window.adminSaveMasterPass = function() {
    const val = document.getElementById('adminMasterPass').value.trim();
    if (!val) return showToast('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ظ…ظپطھط§ط­ طµط­ظٹط­', 'error');
    AppState.masterPassword = val;
    localStorage.setItem('bms_master_pass', val);
    showToast('طھظ… ط­ظپط¸ ط§ظ„ظ…ظپطھط§ط­ ط§ظ„ظ…ط§ط³طھط± ط¨ظ†ط¬ط§ط­ ًں”’');
};

window.adminSaveBackupPath = async function() {
    if (window.showDirectoryPicker) {
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            await saveDirHandle(dirHandle);
            
            AppState.backupPath = dirHandle.name;
            localStorage.setItem('bms_backup_path', dirHandle.name);
            
            updateFolderStatusUI();
            showToast('طھظ… ط±ط¨ط· ط§ظ„ظ…ط¬ظ„ط¯ ط§ظ„ط¥ط¬ط¨ط§ط±ظٹ ظ„ظ„ظ†ط¸ط§ظ… ط¨ظ†ط¬ط§ط­ ًں“پ', 'success');
        } catch (e) {
            console.error(e);
            showToast('طھظ… ط¥ظ„ط؛ط§ط، ط§ط®طھظٹط§ط± ط§ظ„ظ…ط¬ظ„ط¯', 'error');
        }
    } else {
        showToast('ظ…طھطµظپط­ظƒ ظ„ط§ ظٹط¯ط¹ظ… ط§ظ„ط±ط¨ط· ط§ظ„ظ…ط¨ط§ط´ط± ط¨ط§ظ„ظ…ط¬ظ„ط¯ط§طھطŒ ط³ظٹطھظ… ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط­ظ…ظٹظ„ ط§ظ„طھظ‚ظ„ظٹط¯ظٹ', 'error');
    }
};

window.adminDeleteBranch = function(key) {
    if (!confirm(`ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط­ط°ظپ ${BRANCHES[key]?.name || key}طں`)) return;
    delete BRANCHES[key];
    EMPLOYEES = EMPLOYEES.filter(e => e.branch !== key);
    saveData();
    renderAdminBranchList();
    renderAdminEmployeeList();
    showToast('طھظ… ط­ط°ظپ ط§ظ„ظپط±ط¹ ظˆط¬ظ…ظٹط¹ ظ…ظˆط¸ظپظٹظ‡', 'error');
};

window.adminAddBranch = function() {
    const key = document.getElementById('newBranchKey').value.trim().toLowerCase();
    const name = document.getElementById('newBranchName').value.trim();
    const city = document.getElementById('newBranchCity').value.trim();
    const color = document.getElementById('newBranchColor').value;

    if (!key || !name) { showToast('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ظ…ط¹ط±ظ‘ظپ ظˆط§ظ„ط§ط³ظ…', 'error'); return; }
    if (BRANCHES[key]) { showToast('ظ‡ط°ط§ ط§ظ„ظ…ط¹ط±ظ‘ظپ ظ…ظˆط¬ظˆط¯ ط¨ط§ظ„ظپط¹ظ„', 'error'); return; }

    BRANCHES[key] = { name, city, color };
    saveData();
    document.getElementById('newBranchKey').value = '';
    document.getElementById('newBranchName').value = '';
    renderAdminBranchList();
    showToast('طھظ… ط¥ط¶ط§ظپط© ط§ظ„ظپط±ط¹ ط¨ظ†ط¬ط§ط­! ًںژ‰');
};

window.adminEditEmployee = function(id, field, value) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (emp) {
        emp[field] = value;
        saveData();
        showToast('طھظ… طھط­ط¯ظٹط« ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظˆط¸ظپ ط¨ظ†ط¬ط§ط­ âœ…');
    }
};

window.editEmpPrompt = function(id) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (!emp) return;
    window.customPrompt('âœڈï¸ڈ طھط¹ط¯ظٹظ„ ط§ط³ظ… ط§ظ„ظ…ظˆط¸ظپ:', emp.name, (newName) => {
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
    window.customPrompt(`âœڈï¸ڈ طھط¹ط¯ظٹظ„ ${label}:`, b[field], (newVal) => {
        if (newVal && newVal.trim() !== '' && newVal.trim() !== b[field]) {
            adminEditBranch(key, field, newVal.trim());
            renderAdminBranchList();
        }
    });
};

window.adminDeleteEmployee = function(id) {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط­ط°ظپ ${emp.name}طں`)) return;
    EMPLOYEES = EMPLOYEES.filter(e => e.id !== id);
    saveData();
    renderAdminEmployeeList();
    showToast('طھظ… ط­ط°ظپ ط§ظ„ظ…ظˆط¸ظپ', 'error');
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

    if (!name) { showToast('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ط§ظ„ظ…ظˆط¸ظپ', 'error'); return; }

    const id = 'E' + Date.now();
    EMPLOYEES.push({ id, name, role, branch });
    saveData();
    document.getElementById('newEmpName').value = '';
    renderAdminEmployeeList();
    renderAdminBranchList();
    showToast('طھظ… ط¥ط¶ط§ظپط© ط§ظ„ظ…ظˆط¸ظپ ط¨ظ†ط¬ط§ط­! ًںژ‰');
};

window.adminClearReports = function() {
    if (!confirm('âڑ ï¸ڈ ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯طں ط³ظٹطھظ… ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„طھظ‚ط§ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹط© ظ†ظ‡ط§ط¦ظٹط§ظ‹!')) return;
    AppState.reports = [];
    localStorage.setItem('bms_reports', JSON.stringify(AppState.reports));
    showToast('طھظ… طھطµظپظٹط± ط¬ظ…ظٹط¹ ط§ظ„طھظ‚ط§ط±ظٹط±', 'error');
};

window.adminClearEmployees = function() {
    if (!confirm('âڑ ï¸ڈ ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯طں ط³ظٹطھظ… ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ† ظ…ظ† ظƒظ„ ط§ظ„ظپط±ظˆط¹!')) return;
    EMPLOYEES = [];
    saveData();
    renderAdminEmployeeList();
    renderAdminBranchList();
    showToast('طھظ… طھطµظپظٹط± ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ†', 'error');
};

window.adminClearBranches = function() {
    if (!confirm('âڑ ï¸ڈ ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯طں ط³ظٹطھظ… ط­ط°ظپ ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹ ظˆط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ† ظ…ط¹ظ‡ظ…!')) return;
    BRANCHES = {};
    EMPLOYEES = [];
    saveData();
    renderAdminBranchList();
    renderAdminEmployeeList();
    showToast('طھظ… طھطµظپظٹط± ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹ ظˆط§ظ„ظ…ظˆط¸ظپظٹظ†', 'error');
};

window.adminResetAll = function() {
    if (!confirm('â›” ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط¥ط¹ط§ط¯ط© ط¶ط¨ط· ط§ظ„ظ…طµظ†ط¹ ط§ظ„ظƒط§ظ…ظ„طں\n\nط³ظٹطھظ… ط­ط°ظپ:\nâ€¢ ط¬ظ…ظٹط¹ ط§ظ„ظپط±ظˆط¹\nâ€¢ ط¬ظ…ظٹط¹ ط§ظ„ظ…ظˆط¸ظپظٹظ†\nâ€¢ ط¬ظ…ظٹط¹ ط§ظ„طھظ‚ط§ط±ظٹط±\n\nظˆط¥ط¹ط§ط¯طھظ‡ط§ ظ„ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط§ظپطھط±ط§ط¶ظٹط©!')) return;
    BRANCHES = {...DEFAULT_BRANCHES};
    EMPLOYEES = [...DEFAULT_EMPLOYEES];
    AppState.reports = [];
    saveData();
    renderAdmin(document.getElementById('pageContent'));
    showToast('طھظ… ط¥ط¹ط§ط¯ط© ط¶ط¨ط· ط§ظ„ظ…طµظ†ط¹ ط¨ط§ظ„ظƒط§ظ…ظ„ âœ…');
};

// -------------------------
// Theme Toggle
// -------------------------
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? 'âک€ï¸ڈ' : 'ًںŒ™';
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
        console.log("ًں§¹ Clearing legacy test data...");
        AppState.reports = [];
        EMPLOYEES = [...DEFAULT_EMPLOYEES];
        BRANCHES = {...DEFAULT_BRANCHES};
        saveData();
        localStorage.setItem('bms_fresh_start_v3', 'true');
    }
});

