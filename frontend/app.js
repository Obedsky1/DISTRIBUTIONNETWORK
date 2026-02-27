import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

// API Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINT = `${API_BASE_URL}/api`;

const firebaseConfig = {
    apiKey: "AIzaSyB-uGMmFUVGLy3PRPcf7pcy2T_QvTNZ1sc",
    authDomain: "community-557f3.firebaseapp.com",
    projectId: "community-557f3",
    storageBucket: "community-557f3.firebasestorage.app",
    messagingSenderId: "841075559461",
    appId: "1:841075559461:web:bfd1e4c9792eefbea043cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// State Management
let currentFilters = {
    search: '',
    platform: 'all',
    category: 'all',
    sortBy: 'trending',
    minMembers: null,
    offset: 0,
    limit: 50
};

let allCommunities = [];
let displayedCommunities = [];

// Gamification State
let gamificationData = {
    points: 0,
    streak: 0,
    viewedCount: 0,
    savedCount: 0,
    ratedCount: 0,
    lastVisit: null,
    badges: {
        'first-timer': true,
        'explorer': false,
        'power-user': false,
        'streak-master': false,
        'contributor': false
    },
    savedCommunities: [],
    ratings: {}
};

// Quiz State
let quizAnswers = {
    interest: null,
    size: null,
    activity: null
};
let currentQuizStep = 1;

let currentUserId = localStorage.getItem('growthhub_user_id');
if (!currentUserId) {
    currentUserId = uuidv4();
    localStorage.setItem('growthhub_user_id', currentUserId);
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await loadGamificationData();
    initializeEventListeners();
    loadStats();
    loadCommunities();
    loadTrendingCommunities();
    updateGamificationUI();
    checkStreak();
});

// Load Gamification Data from Firestore and localStorage fallback
async function loadGamificationData() {
    try {
        const docRef = doc(db, 'user_gamification', currentUserId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            gamificationData = { ...gamificationData, ...docSnap.data() };
        } else {
            const saved = localStorage.getItem('communityFinderGamification');
            if (saved) {
                gamificationData = { ...gamificationData, ...JSON.parse(saved) };
            }
        }
    } catch (e) {
        console.warn("Could not load from Firebase", e);
        const saved = localStorage.getItem('communityFinderGamification');
        if (saved) {
            gamificationData = { ...gamificationData, ...JSON.parse(saved) };
        }
    }
}

// Save Gamification Data to Firestore and localStorage
async function saveGamificationData() {
    localStorage.setItem('communityFinderGamification', JSON.stringify(gamificationData));
    try {
        const docRef = doc(db, 'user_gamification', currentUserId);
        await setDoc(docRef, gamificationData, { merge: true });
    } catch (e) {
        console.warn("Could not save to Firebase", e);
    }
}

// Update Gamification UI
function updateGamificationUI() {
    document.getElementById('userPoints').textContent = gamificationData.points;
    document.getElementById('streakDays').textContent = gamificationData.streak;
    document.getElementById('viewedCount').textContent = gamificationData.viewedCount;
    document.getElementById('savedCount').textContent = gamificationData.savedCommunities.length;

    // Update badges
    Object.keys(gamificationData.badges).forEach(badgeId => {
        const badge = document.querySelector(`[data-badge="${badgeId}"]`);
        if (badge) {
            if (gamificationData.badges[badgeId]) {
                badge.classList.remove('locked');
                badge.classList.add('earned');
            } else {
                badge.classList.remove('earned');
                badge.classList.add('locked');
            }
        }
    });
}

// Check and Update Streak
function checkStreak() {
    const today = new Date().toDateString();
    const lastVisit = gamificationData.lastVisit;

    if (!lastVisit) {
        // First visit
        gamificationData.streak = 1;
        gamificationData.lastVisit = today;
        addPoints(25, 'Daily visit bonus! 🎉');
    } else if (lastVisit !== today) {
        const lastDate = new Date(lastVisit);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            gamificationData.streak++;
            addPoints(25, `${gamificationData.streak} day streak! 🔥`);

            // Check for streak master badge
            if (gamificationData.streak >= 7 && !gamificationData.badges['streak-master']) {
                unlockBadge('streak-master', 'Streak Master - 7 day streak! 🔥');
            }
        } else if (diffDays > 1) {
            // Streak broken
            gamificationData.streak = 1;
            showToast('info', 'Streak Reset', 'Start a new streak today!');
        }

        gamificationData.lastVisit = today;
    }

    saveGamificationData();
    updateGamificationUI();
}

// Add Points
function addPoints(points, message) {
    gamificationData.points += points;
    saveGamificationData();
    updateGamificationUI();
    if (message) {
        showToast('success', `+${points} Points!`, message);
    }
}

// Unlock Badge
function unlockBadge(badgeId, message) {
    if (!gamificationData.badges[badgeId]) {
        gamificationData.badges[badgeId] = true;
        addPoints(50, message);
        saveGamificationData();
        updateGamificationUI();
    }
}

// Check Badge Progress
function checkBadges() {
    if (gamificationData.viewedCount >= 10 && !gamificationData.badges['explorer']) {
        unlockBadge('explorer', 'Explorer Badge Unlocked! ⭐');
    }
    if (gamificationData.viewedCount >= 50 && !gamificationData.badges['power-user']) {
        unlockBadge('power-user', 'Power User Badge Unlocked! 🏆');
    }
    if (gamificationData.ratedCount >= 5 && !gamificationData.badges['contributor']) {
        unlockBadge('contributor', 'Contributor Badge Unlocked! 💎');
    }
}

// Event Listeners
function initializeEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', debounce((e) => {
        currentFilters.search = e.target.value;
        currentFilters.offset = 0;
        clearSearch.style.display = e.target.value ? 'block' : 'none';
        loadCommunities();
    }, 500));

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        currentFilters.search = '';
        clearSearch.style.display = 'none';
        loadCommunities();
    });

    // Category Pills
    const categoryPills = document.querySelectorAll('.category-pill');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilters.category = pill.dataset.category;
            currentFilters.offset = 0;
            loadCommunities();
        });
    });

    // Platform Filters
    const platformButtons = document.querySelectorAll('.platform-btn');
    platformButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            platformButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.platform = btn.dataset.platform;
            currentFilters.offset = 0;
            loadCommunities();
        });
    });

    // Sort
    const sortBy = document.getElementById('sortBy');
    sortBy.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        currentFilters.offset = 0;
        loadCommunities();
    });

    // Min Members
    const minMembers = document.getElementById('minMembers');
    minMembers.addEventListener('input', debounce((e) => {
        currentFilters.minMembers = e.target.value ? parseInt(e.target.value) : null;
        currentFilters.offset = 0;
        loadCommunities();
    }, 500));

    // Reset Filters
    const resetBtn = document.getElementById('resetFilters');
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        minMembers.value = '';
        sortBy.value = 'trending';
        currentFilters = {
            search: '',
            platform: 'all',
            category: 'all',
            sortBy: 'trending',
            minMembers: null,
            offset: 0,
            limit: 50
        };
        platformButtons.forEach(b => b.classList.remove('active'));
        platformButtons[0].classList.add('active');
        categoryPills.forEach(p => p.classList.remove('active'));
        categoryPills[0].classList.add('active');
        clearSearch.style.display = 'none';
        loadCommunities();
    });

    // Load More
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', () => {
        currentFilters.offset += currentFilters.limit;
        loadCommunities(true);
    });

    // Quick Match Quiz
    const quickMatchBtn = document.getElementById('quickMatchBtn');
    const quizModal = document.getElementById('quizModal');
    const quizSkip = document.getElementById('quizSkip');

    quickMatchBtn.addEventListener('click', () => {
        quizModal.classList.add('active');
        currentQuizStep = 1;
        resetQuiz();
    });

    quizSkip.addEventListener('click', () => {
        quizModal.classList.remove('active');
    });

    // Quiz Options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', () => {
            const step = option.closest('.quiz-step');
            step.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            const value = option.dataset.value;
            if (currentQuizStep === 1) {
                quizAnswers.interest = value;
            } else if (currentQuizStep === 2) {
                quizAnswers.size = value;
            } else if (currentQuizStep === 3) {
                quizAnswers.activity = value;
            }

            // Auto-advance after selection
            setTimeout(() => {
                if (currentQuizStep < 3) {
                    nextQuizStep();
                } else {
                    completeQuiz();
                }
            }, 300);
        });
    });

    // Close modal on overlay click
    quizModal.addEventListener('click', (e) => {
        if (e.target === quizModal) {
            quizModal.classList.remove('active');
        }
    });
}

// Quiz Functions
function resetQuiz() {
    quizAnswers = { interest: null, size: null, activity: null };
    document.querySelectorAll('.quiz-step').forEach(step => step.style.display = 'none');
    document.getElementById('quizStep1').style.display = 'block';
    document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
    updateQuizProgress();
}

function nextQuizStep() {
    document.getElementById(`quizStep${currentQuizStep}`).style.display = 'none';
    currentQuizStep++;
    document.getElementById(`quizStep${currentQuizStep}`).style.display = 'block';
    updateQuizProgress();
}

function updateQuizProgress() {
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step${i}`);
        if (i < currentQuizStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (i === currentQuizStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    }
}

function completeQuiz() {
    // Apply quiz filters
    currentFilters.category = quizAnswers.interest;
    currentFilters.offset = 0;

    // Update UI
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.dataset.category === quizAnswers.interest) {
            pill.classList.add('active');
        }
    });

    // Close modal and reload
    document.getElementById('quizModal').classList.remove('active');
    loadCommunities();

    addPoints(15, 'Quiz completed! 🎯');
    showToast('success', 'Perfect Match!', 'Showing communities based on your preferences');
}

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_ENDPOINT}/stats`);
        const data = await response.json();

        document.getElementById('totalCommunities').textContent = formatNumber(data.total_communities);
        document.getElementById('totalPlatforms').textContent = Object.keys(data.platforms).length;
        document.getElementById('allCount').textContent = formatNumber(data.total_communities);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Trending Communities
async function loadTrendingCommunities() {
    try {
        const params = new URLSearchParams({
            limit: 10,
            offset: 0,
            sort_by: 'member_count',
            sort_order: 'desc'
        });

        const response = await fetch(`${API_ENDPOINT}/communities?${params}`);
        const communities = await response.json();

        renderTrendingCommunities(communities.slice(0, 8));

        // Set daily spotlight
        if (communities.length > 0) {
            setDailySpotlight(communities[Math.floor(Math.random() * Math.min(5, communities.length))]);
        }
    } catch (error) {
        console.error('Error loading trending:', error);
    }
}

// Render Trending Communities
function renderTrendingCommunities(communities) {
    const carousel = document.getElementById('trendingCarousel');
    carousel.innerHTML = '';

    communities.forEach((community, index) => {
        const card = document.createElement('div');
        card.className = 'trending-card';

        const platformIcon = getPlatformIcon(community.platform);
        const growth = Math.floor(Math.random() * 30) + 5; // Simulated growth

        card.innerHTML = `
            <div class="trending-rank">${index + 1}</div>
            <div class="trending-info">
                <div class="trending-icon">${platformIcon}</div>
                <div>
                    <div class="trending-name">${escapeHtml(community.name)}</div>
                    <div class="trending-platform">${community.platform}</div>
                </div>
            </div>
            <div class="trending-stats">
                <div class="trending-growth">
                    <span class="arrow">↑</span>
                    <span>${growth}%</span>
                </div>
                <div class="activity-pulse">
                    <span class="pulse-dot"></span>
                    <span class="pulse-ring"></span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (community.url || community.invite_link) {
                window.open(community.url || community.invite_link, '_blank');
                trackCommunityView(community);
            }
        });

        carousel.appendChild(card);
    });
}

// Set Daily Spotlight
function setDailySpotlight(community) {
    if (!community) return;

    document.getElementById('spotlightImage').textContent = getPlatformIcon(community.platform);
    document.getElementById('spotlightName').textContent = community.name;
    document.getElementById('spotlightDescription').textContent = community.description || 'Discover this amazing community';
    document.getElementById('spotlightMembers').textContent = `👥 ${formatNumber(community.member_count)} members`;
    document.getElementById('spotlightPlatform').textContent = `📱 ${community.platform}`;

    document.getElementById('dailySpotlight').addEventListener('click', () => {
        if (community.url || community.invite_link) {
            window.open(community.url || community.invite_link, '_blank');
            trackCommunityView(community);
        }
    });
}

// Load Communities
async function loadCommunities(append = false) {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('communitiesGrid');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (!append) {
        loading.style.display = 'flex';
        grid.innerHTML = '';
    }

    emptyState.style.display = 'none';

    try {
        const params = new URLSearchParams({
            limit: currentFilters.limit,
            offset: currentFilters.offset,
            sort_by: currentFilters.sortBy === 'trending' || currentFilters.sortBy === 'rating' ? 'member_count' : currentFilters.sortBy,
            sort_order: 'desc'
        });

        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }

        if (currentFilters.platform !== 'all') {
            params.append('platform', currentFilters.platform);
        }

        if (currentFilters.minMembers) {
            params.append('min_members', currentFilters.minMembers);
        }

        const response = await fetch(`${API_ENDPOINT}/communities?${params}`);
        const communities = await response.json();

        loading.style.display = 'none';

        if (communities.length === 0 && !append) {
            emptyState.style.display = 'block';
            loadMoreContainer.style.display = 'none';
            document.getElementById('resultsCount').textContent = '0';
            return;
        }

        if (append) {
            displayedCommunities = [...displayedCommunities, ...communities];
        } else {
            displayedCommunities = communities;
        }

        renderCommunities(communities, append);

        // Show/hide load more button
        if (communities.length === currentFilters.limit) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

        // Update results count
        document.getElementById('resultsCount').textContent = formatNumber(displayedCommunities.length);

    } catch (error) {
        console.error('Error loading communities:', error);
        loading.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

// Render Communities
function renderCommunities(communities, append = false) {
    const grid = document.getElementById('communitiesGrid');

    if (!append) {
        grid.innerHTML = '';
    }

    communities.forEach(community => {
        const card = createCommunityCard(community);
        grid.appendChild(card);
    });
}

// Create Community Card
function createCommunityCard(community) {
    const card = document.createElement('div');
    card.className = 'community-card';

    const platformColor = getPlatformColor(community.platform);
    const platformIcon = getPlatformIcon(community.platform);
    const isSaved = gamificationData.savedCommunities.includes(community.id || community.name);
    const rating = gamificationData.ratings[community.id || community.name] || 0;

    card.innerHTML = `
        <button class="save-btn ${isSaved ? 'saved' : ''}" data-community-id="${community.id || community.name}">
            <span class="heart">${isSaved ? '❤️' : '🤍'}</span>
        </button>
        
        <div class="card-header">
            <div class="card-image">
                ${community.image_url
            ? `<img src="${community.image_url}" alt="${community.name}" onerror="this.style.display='none'; this.parentElement.textContent='${platformIcon}'">`
            : platformIcon
        }
            </div>
            <div class="card-info">
                <h3 class="card-title">${escapeHtml(community.name)}</h3>
                <span class="card-platform" style="background: ${platformColor}20; color: ${platformColor}">
                    ${community.platform}
                </span>
            </div>
        </div>
        
        <p class="card-description">
            ${community.description ? escapeHtml(community.description) : 'No description available'}
        </p>
        
        <div class="card-footer">
            <div class="card-members">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>${formatNumber(community.member_count)} members</span>
            </div>
            <div class="rating-container">
                <div class="stars" data-community-id="${community.id || community.name}">
                    ${[1, 2, 3, 4, 5].map(star =>
            `<span class="star ${star <= rating ? 'filled' : ''}" data-rating="${star}">★</span>`
        ).join('')}
                </div>
            </div>
        </div>
    `;

    // Save button handler
    const saveBtn = card.querySelector('.save-btn');
    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSaveCommunity(community.id || community.name, saveBtn);
    });

    // Rating handler
    const stars = card.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const rating = parseInt(star.dataset.rating);
            rateCommunity(community.id || community.name, rating, card);
        });
    });

    // Card click handler
    card.addEventListener('click', () => {
        if (community.url || community.invite_link) {
            window.open(community.url || community.invite_link, '_blank');
            trackCommunityView(community);
        }
    });

    return card;
}

// Toggle Save Community
function toggleSaveCommunity(communityId, button) {
    const index = gamificationData.savedCommunities.indexOf(communityId);

    if (index > -1) {
        gamificationData.savedCommunities.splice(index, 1);
        button.classList.remove('saved');
        button.querySelector('.heart').textContent = '🤍';
        showToast('info', 'Removed', 'Community removed from saved');
    } else {
        gamificationData.savedCommunities.push(communityId);
        button.classList.add('saved');
        button.querySelector('.heart').textContent = '❤️';
        addPoints(10, 'Community saved! ❤️');
    }

    saveGamificationData();
    updateGamificationUI();
}

// Rate Community
function rateCommunity(communityId, rating, card) {
    const wasRated = gamificationData.ratings[communityId] !== undefined;
    gamificationData.ratings[communityId] = rating;

    if (!wasRated) {
        gamificationData.ratedCount++;
        addPoints(15, `Rated ${rating} stars! ⭐`);
        checkBadges();
    }

    // Update stars in card
    const stars = card.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });

    saveGamificationData();
}

// Track Community View
function trackCommunityView(community) {
    gamificationData.viewedCount++;
    addPoints(5, 'Community viewed! 👁️');
    checkBadges();
    saveGamificationData();
    updateGamificationUI();
}

// Show Toast Notification
function showToast(type, title, text) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️'
    };

    toast.innerHTML = `
        <span class="icon">${icons[type] || '📢'}</span>
        <div class="message">
            <div class="title">${title}</div>
            <div class="text">${text}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility Functions
function getPlatformColor(platform) {
    const colors = {
        'Discord': '#5865f2',
        'Reddit': '#ff4500',
        'Telegram': '#0088cc',
        'Quora': '#b92b27',
        'Facebook': '#1877f2',
        'Other': '#667eea'
    };
    return colors[platform] || colors['Other'];
}

function getPlatformIcon(platform) {
    const icons = {
        'Discord': '💬',
        'Reddit': '🔴',
        'Telegram': '✈️',
        'Quora': '❓',
        'Facebook': '👥',
        'Other': '🌐'
    };
    return icons[platform] || icons['Other'];
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
