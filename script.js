// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://lbdahpaqfxjncbxzqlrz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZGFocGFxZnhqbmNieHpxbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTUwNzUsImV4cCI6MjA4MDE3MTA3NX0.wwKYaYCOqPtiKH7GBG2rvZ6UpmMlBWCUE-Eg9hy5AF4';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase initialized');

// ============================================
// STATE MANAGEMENT
// ============================================
let currentNote = null;
let selectedTag = 'work';
let currentFilter = 'all';
let selectedNotes = new Set();

// ============================================
// ANIMATION FUNCTIONS
// ============================================

// Hide startup screen
function hideStartupScreen() {
    const startupScreen = document.getElementById('startup-screen');
    if (startupScreen) {
        setTimeout(() => {
            startupScreen.style.display = 'none';
        }, 3000);
    }
}

// Animate auth to dashboard transition
function animateToDashboard() {
    const authSection = document.getElementById('auth-section');
    const notesSection = document.getElementById('notes-section');
    
    if (authSection && notesSection) {
        authSection.classList.add('auth-transition');
        
        setTimeout(() => {
            authSection.classList.add('hidden');
            authSection.classList.remove('auth-transition');
            
            notesSection.classList.remove('hidden');
            notesSection.classList.add('dashboard-transition');
            
            setTimeout(() => {
                notesSection.classList.remove('dashboard-transition');
            }, 600);
        }, 600);
    }
}

// Animate dashboard to auth transition
function animateToAuth() {
    const authSection = document.getElementById('auth-section');
    const notesSection = document.getElementById('notes-section');
    
    if (authSection && notesSection) {
        notesSection.classList.add('auth-transition');
        
        setTimeout(() => {
            notesSection.classList.add('hidden');
            notesSection.classList.remove('auth-transition');
            
            authSection.classList.remove('hidden');
            authSection.classList.add('dashboard-transition');
            
            setTimeout(() => {
                authSection.classList.remove('dashboard-transition');
            }, 600);
        }, 600);
    }
}

// FIXED: Loading animation for buttons
function animateButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        const originalHTML = button.innerHTML;
        button.dataset.originalHTML = originalHTML;
        
        // Use the button's text or a default
        const loadingText = button.getAttribute('data-loading-text') || 'Loading...';
        button.innerHTML = `
            <span class="loading-spinner"></span>
            <span style="margin-left: 8px;">${loadingText}</span>
        `;
        button.disabled = true;
        button.style.pointerEvents = 'none';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.style.pointerEvents = 'auto';
        if (button.dataset.originalHTML) {
            button.innerHTML = button.dataset.originalHTML;
        }
    }
}

// Success animation
function showSuccessAnimation(element) {
    if (element) {
        const originalHTML = element.innerHTML;
        element.innerHTML = `
            <span class="success-check"></span>
            <span style="margin-left: 8px;">Success!</span>
        `;
        
        setTimeout(() => {
            element.innerHTML = originalHTML;
        }, 1500);
    }
}

// ============================================
// MOBILE OPTIMIZATIONS
// ============================================

function setupMobileOptimizations() {
    // Detect if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Add mobile class to body for CSS targeting
        document.body.classList.add('is-mobile');
        
        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Add small delay to prevent zoom
                setTimeout(() => {
                    input.style.fontSize = '16px';
                }, 100);
            });
        });
        
        // Better touch handling for note cards
        const noteCards = document.querySelectorAll('.note-card');
        noteCards.forEach(card => {
            let touchStartX = 0;
            let touchStartY = 0;
            
            card.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            card.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                // If it's a tap (not swipe), open note
                if (Math.abs(touchEndX - touchStartX) < 10 && 
                    Math.abs(touchEndY - touchStartY) < 10) {
                    const noteId = card.dataset.id;
                    if (noteId) {
                        viewFullNote(noteId);
                    }
                }
            });
        });
    }
    
    // Handle virtual keyboard
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        // iOS specific fixes
        document.addEventListener('focusin', () => {
            // Scroll active element into view
            setTimeout(() => {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.scrollIntoViewIfNeeded) {
                    activeElement.scrollIntoViewIfNeeded();
                }
            }, 300);
        });
    }
}

// ============================================
// PROFESSIONAL HELPER FUNCTIONS
// ============================================

// Professional toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('status-toast');
    const icon = toast.querySelector('i');
    const messageEl = document.getElementById('status-message');
    
    switch(type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    messageEl.textContent = message;
    toast.className = `status-toast ${type}`;
    toast.classList.remove('hidden');
    
    toast.style.animation = 'slideInRight 0.3s ease';
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.style.animation = '';
        }, 300);
    }, 4000);
}

// Update stats in sidebar
async function updateStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) throw error;
        
        const totalNotes = notes?.length || 0;
        const notesWithMedia = notes?.filter(note => note.media_url).length || 0;
        const starredNotes = notes?.filter(note => note.starred).length || 0;
        
        animateCountChange('notes-count', totalNotes);
        animateCountChange('media-count', notesWithMedia);
        animateCountChange('starred-count', starredNotes);
        animateCountChange('notes-total', totalNotes);
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Animate number counting
function animateCountChange(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue === targetValue) return;
    
    const duration = 500;
    const increment = (targetValue - currentValue) / (duration / 16);
    
    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Theme toggle function
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Toggle theme';
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        
        themeToggle.style.animation = 'rotate 0.5s ease';
        setTimeout(() => {
            themeToggle.style.animation = '';
        }, 500);
    });
    
    // Add to header
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        headerRight.insertBefore(themeToggle, headerRight.firstChild);
    }
}

// Professional date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }
    
    if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (diff < 604800000) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

// File preview setup
function setupFilePreview() {
    const mediaUpload = document.getElementById('media-upload');
    const preview = document.getElementById('file-preview');
    
    if (!mediaUpload || !preview) return;
    
    mediaUpload.addEventListener('change', function(e) {
        preview.innerHTML = '';
        
        if (this.files.length > 0) {
            const file = this.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const fileSize = (file.size / (1024*1024)).toFixed(2);
                
                if (file.type.startsWith('image/')) {
                    preview.innerHTML = `
                        <div class="preview-item" style="animation: slideUp 0.4s ease;">
                            <img src="${e.target.result}" alt="Preview" class="preview-image">
                            <div class="preview-info">
                                <div class="preview-name">${file.name}</div>
                                <div class="preview-size">${fileSize} MB</div>
                            </div>
                        </div>
                    `;
                } else if (file.type.startsWith('video/')) {
                    preview.innerHTML = `
                        <div class="preview-item" style="animation: slideUp 0.4s ease;">
                            <video class="preview-video">
                                <source src="${e.target.result}" type="${file.type}">
                            </video>
                            <div class="preview-info">
                                <div class="preview-name">${file.name}</div>
                                <div class="preview-size">${fileSize} MB</div>
                            </div>
                        </div>
                    `;
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// Update user info in header
function updateUserInfo(user) {
    const emailEl = document.getElementById('user-email');
    const avatarEl = document.getElementById('user-avatar');
    
    if (emailEl && user) {
        emailEl.textContent = user.email;
        emailEl.style.animation = 'fadeIn 0.5s ease';
    }
    
    if (avatarEl && user) {
        const initials = user.email.substring(0, 2).toUpperCase();
        avatarEl.innerHTML = `<span>${initials}</span>`;
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ];
        const gradientIndex = user.email.length % gradients.length;
        avatarEl.style.background = gradients[gradientIndex];
        avatarEl.style.animation = 'scaleIn 0.5s ease';
    }
}

// ============================================
// TAG SELECTION
// ============================================
function setupTagSelection() {
    const tagOptions = document.querySelectorAll('.tag-option');
    tagOptions.forEach(option => {
        option.addEventListener('click', function() {
            tagOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedTag = this.dataset.tag;
        });
    });
    
    // Set default selection
    if (tagOptions[0]) {
        tagOptions[0].classList.add('selected');
    }
}

// ============================================
// FILTER SYSTEM
// ============================================
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedFilter = this.dataset.filter;
            currentFilter = selectedFilter;
            
            // Update both filter buttons and sidebar items
            filterButtons.forEach(btn => btn.classList.remove('active'));
            sidebarNavItems.forEach(item => item.classList.remove('active'));
            
            this.classList.add('active');
            
            // Find and activate corresponding sidebar item
            const correspondingSidebarItem = document.querySelector(`.sidebar-nav .nav-item[data-filter="${selectedFilter}"]`);
            if (correspondingSidebarItem) {
                correspondingSidebarItem.classList.add('active');
            }
            
            filterNotes();
        });
    });
}

// ============================================
// SIDEBAR NAVIGATION SYSTEM
// ============================================

function setupSidebarNavigation() {
    // Get all sidebar nav items
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    // Get all filter bar buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Function to update active states
    function updateActiveStates(selectedFilter) {
        // Update sidebar items
        sidebarNavItems.forEach(item => {
            const itemFilter = item.dataset.filter;
            item.classList.toggle('active', itemFilter === selectedFilter);
        });
        
        // Update filter bar buttons
        filterButtons.forEach(button => {
            const buttonFilter = button.dataset.filter;
            button.classList.toggle('active', buttonFilter === selectedFilter);
        });
    }
    
    // Add click event to sidebar items
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const selectedFilter = this.dataset.filter;
            
            if (!selectedFilter) return;
            
            // Update current filter
            currentFilter = selectedFilter;
            
            // Update active states
            updateActiveStates(selectedFilter);
            
            // Apply filter
            filterNotes();
            
            // Add animation feedback
            this.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });
}

async function filterNotes() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        let query = supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id);
        
        // Apply filters based on currentFilter
        if (currentFilter === 'starred') {
            query = query.eq('starred', true).eq('archived', false);
        } else if (currentFilter === 'archived') {
            query = query.eq('archived', true);
        } else if (['work', 'personal', 'ideas', 'important', 'other'].includes(currentFilter)) {
            query = query.eq('tag', currentFilter).eq('archived', false);
        } else if (currentFilter === 'all') {
            query = query.eq('archived', false);
        }
        
        const { data: notes, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayNotes(notes || []);
        updateStats();
        
        // Show a toast message for filter changes
        if (currentFilter !== 'all') {
            const filterLabels = {
                'starred': 'Starred Notes',
                'archived': 'Archived Notes',
                'work': 'Work Notes',
                'personal': 'Personal Notes',
                'ideas': 'Ideas Notes',
                'important': 'Important Notes',
                'other': 'Other Notes'
            };
            
            showToast(`Showing ${filterLabels[currentFilter] || currentFilter}`, 'info');
        }
        
    } catch (error) {
        console.error('Error filtering notes:', error);
        showToast('Error filtering notes', 'error');
    }
}

// ============================================
// FULL NOTE VIEW MODAL
// ============================================
function setupNoteModal() {
    const modal = document.getElementById('note-modal');
    const closeBtn = document.getElementById('modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            currentNote = null;
        });
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            currentNote = null;
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            currentNote = null;
        }
    });
    
    // Setup modal action buttons
    const starBtn = document.getElementById('modal-star-btn');
    const archiveBtn = document.getElementById('modal-archive-btn');
    const editBtn = document.getElementById('modal-edit-btn');
    const deleteBtn = document.getElementById('modal-delete-btn');
    
    if (starBtn) starBtn.addEventListener('click', toggleNoteStar);
    if (archiveBtn) archiveBtn.addEventListener('click', toggleNoteArchive);
    if (editBtn) editBtn.addEventListener('click', editCurrentNote);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteCurrentNote);
}

function openNoteModal(note) {
    currentNote = note;
    const modal = document.getElementById('note-modal');
    const tagConfig = {
        work: { icon: 'fa-briefcase', color: '#10b981', label: 'Work' },
        personal: { icon: 'fa-user', color: '#8b5cf6', label: 'Personal' },
        ideas: { icon: 'fa-lightbulb', color: '#f59e0b', label: 'Ideas' },
        important: { icon: 'fa-exclamation-circle', color: '#ef4444', label: 'Important' },
        other: { icon: 'fa-ellipsis-h', color: '#3b82f6', label: 'Other' }
    };
    
    const config = tagConfig[note.tag] || tagConfig.other;
    
    // Update modal content
    const modalTag = document.getElementById('modal-note-tag');
    if (modalTag) {
        modalTag.innerHTML = `
            <i class="fas ${config.icon}" style="color: ${config.color};"></i>
            <span>${config.label}</span>
        `;
    }
    
    const modalContent = document.getElementById('modal-note-content');
    if (modalContent) {
        modalContent.innerHTML = note.content;
    }
    
    const modalDate = document.getElementById('modal-note-date');
    if (modalDate) {
        modalDate.textContent = formatDate(note.created_at);
    }
    
    // Update media
    const mediaContainer = document.getElementById('modal-note-media');
    if (mediaContainer) {
        mediaContainer.innerHTML = '';
        
        if (note.media_url) {
            const isVideo = note.media_url.match(/\.(mp4|webm|ogg|mov)$/i);
            if (isVideo) {
                mediaContainer.innerHTML = `
                    <video controls autoplay>
                        <source src="${note.media_url}" type="video/mp4">
                        Your browser does not support videos.
                    </video>
                `;
            } else {
                mediaContainer.innerHTML = `
                    <img src="${note.media_url}" alt="Note attachment" style="max-height: 500px;">
                `;
            }
            mediaContainer.style.display = 'block';
        } else {
            mediaContainer.style.display = 'none';
        }
    }
    
    // Update status
    const statusContainer = document.getElementById('modal-note-status');
    if (statusContainer) {
        statusContainer.innerHTML = '';
        
        if (note.starred) {
            statusContainer.innerHTML += '<span class="status-badge status-starred">Starred</span>';
        }
        if (note.archived) {
            statusContainer.innerHTML += '<span class="status-badge status-archived">Archived</span>';
        }
    }
    
    // Update action buttons
    const starBtn = document.getElementById('modal-star-btn');
    const archiveBtn = document.getElementById('modal-archive-btn');
    
    if (starBtn) {
        if (note.starred) {
            starBtn.innerHTML = '<i class="fas fa-star"></i><span>Unstar</span>';
            starBtn.classList.add('starred');
        } else {
            starBtn.innerHTML = '<i class="far fa-star"></i><span>Star</span>';
            starBtn.classList.remove('starred');
        }
    }
    
    if (archiveBtn) {
        if (note.archived) {
            archiveBtn.innerHTML = '<i class="fas fa-archive"></i><span>Unarchive</span>';
            archiveBtn.classList.add('archived');
        } else {
            archiveBtn.innerHTML = '<i class="far fa-archive"></i><span>Archive</span>';
            archiveBtn.classList.remove('archived');
        }
    }
    
    // Show modal with animation
    modal.classList.remove('hidden');
}

// ============================================
// NOTE ACTIONS
// ============================================
async function toggleNoteStar() {
    if (!currentNote) return;
    
    try {
        const newStarred = !currentNote.starred;
        const { error } = await supabase
            .from('notes')
            .update({ starred: newStarred })
            .eq('id', currentNote.id);
        
        if (error) throw error;
        
        currentNote.starred = newStarred;
        showToast(newStarred ? '✅ Note starred!' : '✅ Note unstarred', 'success');
        
        // Update modal
        openNoteModal(currentNote);
        // Refresh notes list
        filterNotes();
        
    } catch (error) {
        console.error('Error starring note:', error);
        showToast('Error updating note', 'error');
    }
}

async function toggleNoteArchive() {
    if (!currentNote) return;
    
    try {
        const newArchived = !currentNote.archived;
        const { error } = await supabase
            .from('notes')
            .update({ archived: newArchived })
            .eq('id', currentNote.id);
        
        if (error) throw error;
        
        currentNote.archived = newArchived;
        showToast(newArchived ? '✅ Note archived!' : '✅ Note unarchived', 'success');
        
        // Update modal
        openNoteModal(currentNote);
        // Refresh notes list
        filterNotes();
        
    } catch (error) {
        console.error('Error archiving note:', error);
        showToast('Error updating note', 'error');
    }
}

async function editCurrentNote() {
    if (!currentNote) return;
    
    const newContent = prompt('Edit your note:', currentNote.content);
    if (newContent !== null && newContent !== currentNote.content) {
        try {
            const { error } = await supabase
                .from('notes')
                .update({ content: newContent })
                .eq('id', currentNote.id);
            
            if (error) throw error;
            
            currentNote.content = newContent;
            showToast('✅ Note updated!', 'success');
            
            // Update modal and refresh
            openNoteModal(currentNote);
            filterNotes();
            
        } catch (error) {
            console.error('Error updating note:', error);
            showToast('Error updating note', 'error');
        }
    }
}

async function deleteCurrentNote() {
    if (!currentNote) return;
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', currentNote.id);
        
        if (error) throw error;
        
        showToast('✅ Note deleted!', 'success');
        
        // Close modal and refresh
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        currentNote = null;
        filterNotes();
        
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Error deleting note', 'error');
    }
}

// ============================================
// QUICK ACTIONS
// ============================================
function setupQuickActions() {
    const toggleBtn = document.getElementById('action-toggle');
    const actionMenu = document.getElementById('action-menu');
    
    if (toggleBtn && actionMenu) {
        toggleBtn.addEventListener('click', () => {
            actionMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggleBtn.contains(e.target) && !actionMenu.contains(e.target)) {
                actionMenu.classList.remove('show');
            }
        });
        
        // Setup action buttons
        const starBtn = document.getElementById('action-star');
        const archiveBtn = document.getElementById('action-archive');
        const deleteBtn = document.getElementById('action-delete');
        
        if (starBtn) starBtn.addEventListener('click', bulkStarNotes);
        if (archiveBtn) archiveBtn.addEventListener('click', bulkArchiveNotes);
        if (deleteBtn) deleteBtn.addEventListener('click', bulkDeleteNotes);
    }
}

function bulkStarNotes() {
    showToast('Bulk star feature coming soon!', 'info');
}

function bulkArchiveNotes() {
    showToast('Bulk archive feature coming soon!', 'info');
}

function bulkDeleteNotes() {
    showToast('Bulk delete feature coming soon!', 'info');
}

// ============================================
// ENHANCED CREATE NOTE
// ============================================
async function createNote() {
    const content = document.getElementById('note-content').innerHTML.trim();
    
    if (!content || content === '<br>' || content === '<div><br></div>') {
        showToast('Please enter note content', 'error');
        const noteContentEl = document.getElementById('note-content');
        if (noteContentEl) {
            noteContentEl.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                noteContentEl.style.animation = '';
            }, 300);
        }
        return;
    }

    const createBtn = document.getElementById('create-note-btn');
    animateButtonLoading(createBtn, true);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showToast('Please sign in first', 'error');
            animateButtonLoading(createBtn, false);
            return;
        }

        let mediaUrl = null;

        // Handle file upload
        const mediaUpload = document.getElementById('media-upload');
        if (mediaUpload.files.length > 0) {
            const file = mediaUpload.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notes-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('notes-media')
                .getPublicUrl(filePath);

            mediaUrl = urlData.publicUrl;
        }
    
        // Save to database with tag
        const { data, error } = await supabase
            .from('notes')
            .insert([{
                user_id: user.id,
                content: content,
                tag: selectedTag,
                media_url: mediaUrl,
                starred: false,
                archived: false,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        showSuccessAnimation(createBtn);
        showToast('✅ Note created successfully!', 'success');
        
        // Clear form
        document.getElementById('note-content').innerHTML = '';
        
        if (mediaUpload) {
            mediaUpload.value = '';
        }
        
        const preview = document.getElementById('file-preview');
        if (preview) {
            preview.innerHTML = '';
        }
        
        // Reset to default tag
        document.querySelectorAll('.tag-option').forEach(opt => opt.classList.remove('selected'));
        const defaultTag = document.querySelector('.tag-option.work');
        if (defaultTag) {
            defaultTag.classList.add('selected');
        }
        selectedTag = 'work';
        
        // Refresh notes
        setTimeout(() => {
            filterNotes();
            animateButtonLoading(createBtn, false);
        }, 300);
        
    } catch (error) {
        console.error('Error creating note:', error);
        showToast('Error: ' + error.message, 'error');
        animateButtonLoading(createBtn, false);
    }
}

// ============================================
// ENHANCED DISPLAY NOTES
// ============================================
function displayNotes(notes) {
    const notesContainer = document.getElementById('notes-container');
    if (!notesContainer) return;
    
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        let message = 'No notes yet';
        let icon = 'fa-sticky-note';
        
        if (currentFilter === 'starred') {
            message = 'No starred notes';
            icon = 'fa-star';
        } else if (currentFilter === 'archived') {
            message = 'No archived notes';
            icon = 'fa-archive';
        } else if (['work', 'personal', 'ideas'].includes(currentFilter)) {
            message = `No ${currentFilter} notes`;
            icon = currentFilter === 'work' ? 'fa-briefcase' : 
                   currentFilter === 'personal' ? 'fa-user' : 'fa-lightbulb';
        }
        
        notesContainer.innerHTML = `
            <div class="empty-filter" style="animation: fadeIn 0.5s ease;">
                <i class="fas ${icon}"></i>
                <h3>${message}</h3>
                <p>${currentFilter === 'all' ? 'Create your first note to get started' : 'Try changing your filter'}</p>
            </div>
        `;
        return;
    }

    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.dataset.id = note.id;
        noteElement.dataset.tag = note.tag;
        noteElement.style.animationDelay = `${index * 0.1}s`;
        
        const tagConfig = {
            work: { icon: 'fa-briefcase', color: '#10b981', label: 'Work' },
            personal: { icon: 'fa-user', color: '#8b5cf6', label: 'Personal' },
            ideas: { icon: 'fa-lightbulb', color: '#f59e0b', label: 'Ideas' },
            important: { icon: 'fa-exclamation-circle', color: '#ef4444', label: 'Important' },
            other: { icon: 'fa-ellipsis-h', color: '#3b82f6', label: 'Other' }
        };
        
        const config = tagConfig[note.tag] || tagConfig.other;
        
        // Create preview content (truncate if too long)
        const textContent = note.content.replace(/<[^>]*>/g, '');
        const previewContent = textContent.length > 150 
        ? textContent.substring(0, 150) + '...'
        : textContent;
        
        // Create media preview if exists
        let mediaPreview = '';
        if (note.media_url) {
            const isVideo = note.media_url.match(/\.(mp4|webm|ogg|mov)$/i);
            if (isVideo) {
                mediaPreview = `
                    <div class="note-preview">
                        <video class="note-media">
                            <source src="${note.media_url}" type="video/mp4">
                        </video>
                        <div class="note-preview-overlay">
                            <span class="note-preview-text">Click to view video</span>
                        </div>
                    </div>
                `;
            } else {
                mediaPreview = `
                    <div class="note-preview">
                        <img src="${note.media_url}" alt="Note attachment" class="note-media" loading="lazy">
                        <div class="note-preview-overlay">
                            <span class="note-preview-text">Click to view image</span>
                        </div>
                    </div>
                `;
            }
        }
        
        noteElement.innerHTML = `
            <div class="note-card-actions">
                <button class="note-card-action star ${note.starred ? 'starred' : ''}" 
                        onclick="toggleStar('${note.id}', ${note.starred})">
                    <i class="${note.starred ? 'fas' : 'far'} fa-star"></i>
                </button>
                <button class="note-card-action archive ${note.archived ? 'archived' : ''}" 
                        onclick="toggleArchive('${note.id}', ${note.archived})">
                    <i class="${note.archived ? 'fas' : 'far'} fa-archive"></i>
                </button>
            </div>
            
            <div class="note-header" style="animation: fadeIn 0.4s ease ${index * 0.1}s;">
                <div class="note-tag" style="background: ${config.color}20; color: ${config.color};">
                    <i class="fas ${config.icon}" style="color: ${config.color};"></i>
                    <span>${config.label}</span>
                </div>
                <div class="note-date">${formatDate(note.created_at)}</div>
            </div>
            
            <div class="note-content" style="animation: fadeIn 0.4s ease ${index * 0.1 + 0.1}s;">
                ${previewContent.replace(/\n/g, '<br>')}
            </div>
            
            ${mediaPreview}
            
            <div class="note-status" style="animation: fadeIn 0.4s ease ${index * 0.1 + 0.2}s;">
                ${note.starred ? '<span class="status-badge status-starred">Starred</span>' : ''}
                ${note.archived ? '<span class="status-badge status-archived">Archived</span>' : ''}
            </div>
            
            <button class="view-full-btn" onclick="viewFullNote('${note.id}')">
                <i class="fas fa-expand"></i> View Full
            </button>
        `;
        
        notesContainer.appendChild(noteElement);
    });
}

// ============================================
// NOTE ACTIONS (Global functions for onclick)
// ============================================
window.toggleStar = async function(noteId, isStarred) {
    try {
        const { error } = await supabase
            .from('notes')
            .update({ starred: !isStarred })
            .eq('id', noteId);
        
        if (error) throw error;
        
        // Animate the star button
        const starBtn = document.querySelector(`[onclick="toggleStar('${noteId}', ${isStarred})"]`);
        if (starBtn) {
            starBtn.classList.add('star-animate');
            setTimeout(() => starBtn.classList.remove('star-animate'), 300);
        }
        
        showToast(!isStarred ? '✅ Note starred!' : '✅ Note unstarred', 'success');
        filterNotes();
        
    } catch (error) {
        console.error('Error starring note:', error);
        showToast('Error updating note', 'error');
    }
};

window.toggleArchive = async function(noteId, isArchived) {
    try {
        const { error } = await supabase
            .from('notes')
            .update({ archived: !isArchived })
            .eq('id', noteId);
        
        if (error) throw error;
        
        showToast(!isArchived ? '✅ Note archived!' : '✅ Note unarchived', 'success');
        filterNotes();
        
    } catch (error) {
        console.error('Error archiving note:', error);
        showToast('Error updating note', 'error');
    }
};

window.viewFullNote = async function(noteId) {
    try {
        const { data: note, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();
        
        if (error) throw error;
        
        openNoteModal(note);
        
    } catch (error) {
        console.error('Error loading note:', error);
        showToast('Error loading note', 'error');
    }
};

// ============================================
// AUTHENTICATION FUNCTIONS - FIXED
// ============================================
async function handleSignUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }

    const signupBtn = document.getElementById('signup-btn');
    animateButtonLoading(signupBtn, true);

    try {
        console.log('Signing up:', email);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        console.log('Sign up successful:', data);
        showToast('✅ Account created successfully!', 'success');
        
        // Switch to sign in form with animation
        setTimeout(() => {
            animateButtonLoading(signupBtn, false);
            const signupForm = document.getElementById('signup-form');
            const signinForm = document.getElementById('signin-form');
            const signinEmail = document.getElementById('signin-email');
            
            if (signupForm) {
                signupForm.style.animation = 'slideOutLeft 0.4s ease';
            }
            
            setTimeout(() => {
                if (signupForm) {
                    signupForm.classList.add('hidden');
                    signupForm.style.animation = '';
                }
                if (signinForm) {
                    signinForm.classList.remove('hidden');
                    signinForm.style.animation = 'slideInRight 0.4s ease';
                }
                if (signinEmail) {
                    signinEmail.value = email;
                }
                
                setTimeout(() => {
                    if (signinForm) {
                        signinForm.style.animation = '';
                    }
                }, 400);
            }, 400);
        }, 500);
        
    } catch (error) {
        console.error('Sign up failed:', error);
        animateButtonLoading(signupBtn, false);
        showToast('Error: ' + error.message, 'error');
    }
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }

    const signinBtn = document.getElementById('signin-btn');
    animateButtonLoading(signinBtn, true);

    try {
        console.log('Signing in:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        console.log('Sign in successful:', data);
        showToast('✅ Welcome back!', 'success');
        updateUserInfo(data.user);
        
        // Animate transition to dashboard
        setTimeout(() => {
            animateButtonLoading(signinBtn, false);
            animateToDashboard();
            setTimeout(() => {
                filterNotes();
                updateStats();
            }, 600);
        }, 500);
        
    } catch (error) {
        console.error('Sign in failed:', error);
        animateButtonLoading(signinBtn, false);
        showToast('Error signing in: ' + error.message, 'error');
    }
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    animateButtonLoading(logoutBtn, true);
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('Logged out');
        showToast('✅ Successfully logged out', 'success');
        
        // Animate transition back to auth
        setTimeout(() => {
            animateButtonLoading(logoutBtn, false);
            animateToAuth();
        }, 500);
        
    } catch (error) {
        console.error('Logout error:', error);
        animateButtonLoading(logoutBtn, false);
        showToast('Error logging out: ' + error.message, 'error');
    }
}

async function checkAuth() {
    try {
        console.log('Checking auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            return;
        }
        
        if (session) {
            console.log('User logged in:', session.user.email);
            updateUserInfo(session.user);
            
            // Directly show dashboard without animation on page load
            const authSection = document.getElementById('auth-section');
            const notesSection = document.getElementById('notes-section');
            
            if (authSection) authSection.classList.add('hidden');
            if (notesSection) notesSection.classList.remove('hidden');
            
            filterNotes();
            updateStats();
        } else {
            console.log('No session found');
            const authSection = document.getElementById('auth-section');
            const notesSection = document.getElementById('notes-section');
            
            if (authSection) authSection.classList.remove('hidden');
            if (notesSection) notesSection.classList.add('hidden');
        }
    } catch (error) {
        console.error('Check auth error:', error);
        const authSection = document.getElementById('auth-section');
        const notesSection = document.getElementById('notes-section');
        
        if (authSection) authSection.classList.remove('hidden');
        if (notesSection) notesSection.classList.add('hidden');
    }
}

// ============================================
// RICH TEXT EDITOR
// ============================================
function setupRichTextEditor() {
    const editor = document.getElementById('rich-text-editor');
    const contentDiv = document.getElementById('note-content');
    const toolbar = editor?.querySelector('.editor-toolbar');
    
    if (!editor || !toolbar) return;
    
    // Setup toolbar buttons
    toolbar.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        const command = button.dataset.command;
        const value = button.dataset.value;
        
        // Focus editor first
        contentDiv.focus();
        
        if (command === 'createLink') {
            const url = prompt('Enter URL:', 'https://');
            if (url) {
                document.execCommand('createLink', false, url);
            }
        } else if (value) {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, null);
        }
        
        // Update active state for buttons
        updateToolbarState();
    });
    
    // Keyboard shortcuts
    contentDiv.addEventListener('keydown', function(e) {
        // Ctrl/Command + B
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            updateToolbarState();
        }
        // Ctrl/Command + I
        else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            updateToolbarState();
        }
        // Ctrl/Command + U
        else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
            updateToolbarState();
        }
        // Ctrl/Command + Z/Y
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
            // Let browser handle undo/redo
            setTimeout(updateToolbarState, 10);
        }
    });
    
    // Update button active states
    function updateToolbarState() {
        toolbar.querySelectorAll('button').forEach(button => {
            const command = button.dataset.command;
            
            if (command === 'formatBlock') {
                const value = button.dataset.value;
                const isActive = document.queryCommandValue('formatBlock') === value;
                button.classList.toggle('active', isActive);
            } else if (command) {
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            }
        });
    }
    
    // Update toolbar on selection change
    contentDiv.addEventListener('input', updateToolbarState);
    contentDiv.addEventListener('mouseup', updateToolbarState);
    contentDiv.addEventListener('keyup', updateToolbarState);
    
    // Paste handling - clean up HTML
    contentDiv.addEventListener('paste', function(e) {
        e.preventDefault();
        
        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');
        
        // Clean and insert
        const cleanText = text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '');
        
        document.execCommand('insertText', false, cleanText);
    });
    
    // Auto-save draft
    let saveTimeout;
    contentDiv.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const draft = contentDiv.innerHTML;
            if (draft && draft !== '<br>' && draft !== '<div><br></div>') {
                localStorage.setItem('noteDraft', draft);
            }
        }, 1000);
    });
    
    // Load draft on page load
    const savedDraft = localStorage.getItem('noteDraft');
    if (savedDraft && savedDraft !== '<br>' && savedDraft !== '<div><br></div>') {
        contentDiv.innerHTML = savedDraft;
    }
    
    // Clear draft when note is created
    const createBtn = document.getElementById('create-note-btn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            localStorage.removeItem('noteDraft');
        });
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================
function animateFormSwitch(fromForm, toForm) {
    const fromElement = document.getElementById(`${fromForm}-form`);
    const toElement = document.getElementById(`${toForm}-form`);
    
    if (fromElement && toElement) {
        fromElement.style.animation = 'slideOutLeft 0.4s ease';
        setTimeout(() => {
            fromElement.classList.add('hidden');
            fromElement.style.animation = '';
            toElement.classList.remove('hidden');
            toElement.style.animation = 'slideInRight 0.4s ease';
            setTimeout(() => {
                toElement.style.animation = '';
            }, 400);
        }, 400);
    }
}

// ============================================
// SAFETY NET FOR LOADING BUTTONS
// ============================================
function setupLoadingSafetyNet() {
    // Auto-clear any stuck loading states on page load
    document.querySelectorAll('.btn.loading').forEach(button => {
        animateButtonLoading(button, false);
    });
    
    // Add timeout for all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            // Auto-clear loading after 10 seconds (safety net)
            setTimeout(() => {
                if (this.classList.contains('loading')) {
                    console.warn('Loading timeout for button:', this.id || this.className);
                    animateButtonLoading(this, false);
                    showToast('Request timed out. Please try again.', 'error');
                }
            }, 10000);
        });
    });
}

// ============================================
// SINGLE INITIALIZATION FUNCTION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Noteworthy...');
    
    // Hide startup screen
    setTimeout(() => {
        hideStartupScreen();
    }, 3000);
    
    // Setup theme toggle
    initThemeToggle();
    
    // Setup mobile optimizations
    setupMobileOptimizations();
    
    // Setup tag selection
    setupTagSelection();
    
    // Setup filter buttons
    setupFilterButtons();
    
    // Setup sidebar navigation
    setupSidebarNavigation();
    
    // Setup full view modal
    setupNoteModal();
    
    // Setup quick actions
    setupQuickActions();
    
    // Setup file preview
    setupFilePreview();
    
    // Setup rich text editor
    setupRichTextEditor();
    
    // Setup loading safety net
    setupLoadingSafetyNet();
    
    // Form switching with animation
    document.getElementById('show-signin')?.addEventListener('click', function(e) {
        e.preventDefault();
        animateFormSwitch('signup', 'signin');
    });
    
    document.getElementById('show-signup')?.addEventListener('click', function(e) {
        e.preventDefault();
        animateFormSwitch('signin', 'signup');
    });
    
    // Auth buttons
    const signupBtn = document.getElementById('signup-btn');
    const signinBtn = document.getElementById('signin-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const createNoteBtn = document.getElementById('create-note-btn');
    
    if (signupBtn) {
        signupBtn.setAttribute('data-loading-text', 'Creating Account...');
        signupBtn.addEventListener('click', handleSignUp);
    }
    
    if (signinBtn) {
        signinBtn.setAttribute('data-loading-text', 'Signing In...');
        signinBtn.addEventListener('click', handleSignIn);
    }
    
    if (logoutBtn) {
        logoutBtn.setAttribute('data-loading-text', 'Logging Out...');
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (createNoteBtn) {
        createNoteBtn.setAttribute('data-loading-text', 'Creating Note...');
        createNoteBtn.addEventListener('click', createNote);
    }
    
    // Check auth state
    setTimeout(checkAuth, 500);
    
    console.log('✅ Noteworthy initialized successfully');
});

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.handleLogout = handleLogout;
window.createNote = createNote;
window.editNote = editCurrentNote;
window.deleteNote = deleteCurrentNote;
window.toggleStar = window.toggleStar;
window.toggleArchive = window.toggleArchive;
window.viewFullNote = window.viewFullNote;