// Media Gallery JavaScript - Fixed Version
class MediaGalleryFixed {
    constructor() {
        this.tournaments = [];
        this.currentFilter = 'all';
        this.currentView = 'normal';
        this.currentTournament = null;
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        await this.loadTournaments();
        this.setupEventListeners();
        this.setDefaultView();
        this.renderCurrentView();
    }

    async loadTournaments() {
        try {
            const response = await fetch('media.json');
            const data = await response.json();
            this.tournaments = data.tournaments;
            this.cloudName = data.cloudinary_cloud_name;
            
            // Set current tournament to the most recent featured one, or first one
            this.currentTournament = this.tournaments.find(t => t.featured) || this.tournaments[0];
            
            this.populateSearchDropdown();
        } catch (error) {
            console.error('Error loading tournaments:', error);
            this.showError('Failed to load tournament data');
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('tournament-search');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterSearchResults();
        });

        searchInput.addEventListener('focus', () => {
            document.getElementById('search-dropdown').classList.add('show');
        });

        searchInput.addEventListener('blur', (e) => {
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.search-dropdown')) {
                    document.getElementById('search-dropdown').classList.remove('show');
                }
            }, 150);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderCurrentView();
            });
        });

        // View toggle buttons
        document.getElementById('grid-view-btn').addEventListener('click', () => {
            this.switchView('grid');
        });

        document.getElementById('normal-view-btn').addEventListener('click', () => {
            this.switchView('normal');
        });
    }

    setDefaultView() {
        const isMobile = window.innerWidth <= 768;
        this.currentView = isMobile ? 'grid' : 'normal';
        
        // Update button states
        document.getElementById('grid-view-btn').classList.toggle('active', this.currentView === 'grid');
        document.getElementById('normal-view-btn').classList.toggle('active', this.currentView === 'normal');
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
        document.getElementById('normal-view-btn').classList.toggle('active', view === 'normal');
        
        // Show/hide views
        document.getElementById('grid-view').style.display = view === 'grid' ? 'block' : 'none';
        document.getElementById('normal-view').style.display = view === 'normal' ? 'block' : 'none';
        
        this.renderCurrentView();
    }

    populateSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        dropdown.innerHTML = '';
        
        this.tournaments.forEach(tournament => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = `${tournament.name} - ${tournament.date}`;
            item.addEventListener('click', () => {
                this.selectTournament(tournament);
                document.getElementById('tournament-search').value = `${tournament.name} - ${tournament.date}`;
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });
    }

    filterSearchResults() {
        const dropdown = document.getElementById('search-dropdown');
        const items = dropdown.querySelectorAll('.dropdown-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(this.searchQuery.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
        
        dropdown.classList.toggle('show', this.searchQuery.length > 0);
    }

    selectTournament(tournament) {
        this.currentTournament = tournament;
        this.renderCurrentView();
    }

    async renderCurrentView() {
        if (this.currentView === 'grid') {
            this.renderGridView();
        } else {
            await this.renderNormalView();
        }
    }

    renderGridView() {
        const container = document.getElementById('tournament-grid');
        container.innerHTML = '';
        
        this.tournaments.forEach(tournament => {
            const card = document.createElement('div');
            card.className = 'tournament-card';
            card.addEventListener('click', () => this.selectTournament(tournament));
            
            // Use direct URL for thumbnail - try different formats
            const thumbnailUrl = this.getThumbnailUrl(tournament);
            
            card.innerHTML = `
                <img src="${thumbnailUrl}" alt="${tournament.name}" class="tournament-thumbnail" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <div class="tournament-info">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <p class="tournament-date">${tournament.date}</p>
                </div>
                <div class="tournament-overlay">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <p class="tournament-date">${tournament.date}</p>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async renderNormalView() {
        if (!this.currentTournament) {
            this.showEmptyState();
            return;
        }

        this.showLoading();
        
        try {
            // Use direct URLs instead of API calls
            const mediaItems = this.getDirectMediaItems(this.currentTournament);
            this.displayMediaItems(mediaItems);
        } catch (error) {
            console.error('Error loading media:', error);
            this.showError('Failed to load media for this tournament');
        }
    }

    getThumbnailUrl(tournament) {
        // Try different thumbnail URL formats
        const cloudName = this.cloudName;
        const thumbnailId = tournament.photos.thumbnail;
        
        // Format 1: Full path
        const url1 = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,q_auto/${thumbnailId}`;
        
        // Format 2: Without transformations
        const url2 = `https://res.cloudinary.com/${cloudName}/image/upload/${thumbnailId}`;
        
        // Format 3: Just the public ID
        const url3 = `https://res.cloudinary.com/${cloudName}/image/upload/${thumbnailId.split('/').pop()}`;
        
        // Return the first format for now, we'll test which one works
        return url1;
    }

    getDirectMediaItems(tournament) {
        const mediaItems = [];
        const cloudName = this.cloudName;
        
        // Add photos if filter allows
        if (this.currentFilter === 'all' || this.currentFilter === 'photos') {
            const photoIds = ['IMG_1949_sgp2ck', 'IMG_1958_nixptn', 'IMG_1942_diuhjz'];
            
            photoIds.forEach((publicId, index) => {
                // Try different URL formats
                const url1 = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,q_auto/tournaments/spring-2025/photos/${publicId}`;
                const url2 = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,q_auto/${publicId}`;
                const url3 = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
                
                mediaItems.push({
                    type: 'image',
                    url: url1, // Start with format 1
                    fallbackUrls: [url2, url3], // Fallback options
                    title: `${tournament.name} Photo ${index + 1}`,
                    date: tournament.date,
                    created_at: new Date().toISOString()
                });
            });
        }
        
        // Add videos if filter allows
        if (this.currentFilter === 'all' || this.currentFilter === 'videos') {
            const videoId = 'IMG_4320_qftyay';
            
            // Try different video URL formats
            const url1 = `https://res.cloudinary.com/${cloudName}/video/upload/tournaments/spring-2025/videos/${videoId}`;
            const url2 = `https://res.cloudinary.com/${cloudName}/video/upload/${videoId}`;
            
            mediaItems.push({
                type: 'video',
                url: url1, // Start with format 1
                fallbackUrls: [url2], // Fallback option
                title: `${tournament.name} Video 1`,
                date: tournament.date,
                created_at: new Date().toISOString()
            });
        }
        
        return mediaItems;
    }

    displayMediaItems(mediaItems) {
        const container = document.getElementById('media-container');
        container.innerHTML = '';
        
        if (mediaItems.length === 0) {
            this.showEmptyState();
            return;
        }
        
        mediaItems.forEach(item => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            
            if (item.type === 'image') {
                mediaElement.innerHTML = `
                    <img src="${item.url}" alt="${item.title}" class="media-image" loading="lazy" 
                         onerror="this.onerror=null; this.src='${item.fallbackUrls[0] || 'https://via.placeholder.com/400x300?text=No+Image'}'; this.onerror=function(){this.src='${item.fallbackUrls[1] || 'https://via.placeholder.com/400x300?text=No+Image'}';}">
                    <div class="media-info">
                        <h3 class="media-title">${item.title}</h3>
                        <p class="media-date">${item.date}</p>
                    </div>
                `;
            } else {
                mediaElement.innerHTML = `
                    <div class="media-video">
                        <video controls onerror="this.onerror=null; this.src='${item.fallbackUrls[0] || ''}';">
                            <source src="${item.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="media-info">
                        <h3 class="media-title">${item.title}</h3>
                        <p class="media-date">${item.date}</p>
                    </div>
                `;
            }
            
            container.appendChild(mediaElement);
        });
        
        this.hideLoading();
    }

    showLoading() {
        document.getElementById('loading-state').style.display = 'block';
        document.getElementById('media-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('media-container').style.display = 'grid';
    }

    showEmptyState() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('media-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    showError(message) {
        const container = document.getElementById('media-container');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
        this.hideLoading();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediaGalleryFixed();
});

// Handle window resize for responsive view switching
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    const currentView = document.getElementById('grid-view').style.display !== 'none' ? 'grid' : 'normal';
    
    if (isMobile && currentView === 'normal') {
        document.getElementById('grid-view-btn').click();
    } else if (!isMobile && currentView === 'grid') {
        document.getElementById('normal-view-btn').click();
    }
});
