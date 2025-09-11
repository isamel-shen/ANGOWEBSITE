// Media Gallery JavaScript
class MediaGallery {
    constructor() {
        this.tournaments = [];
        this.currentFilter = 'all';
        this.currentView = 'normal';
        this.currentTournament = null;
        this.searchQuery = '';
        this.isSwitching = false; // Flag to prevent rapid view switching
        
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
            // Delay hiding to allow clicking on dropdown items
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.search-dropdown')) {
                    document.getElementById('search-dropdown').classList.remove('show');
                }
            }, 150);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderCurrentView();
            });
        });

        // View toggle buttons
        document.getElementById('grid-view-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.switchView('grid');
        });

        document.getElementById('normal-view-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.switchView('normal');
        });

        // Global click handler to prevent unwanted view switching
        document.addEventListener('click', (e) => {
            // Only handle clicks on the media gallery section
            if (!e.target.closest('.media-gallery')) {
                return;
            }
            
            // Close search dropdown if clicking outside of it
            const searchDropdown = document.getElementById('search-dropdown');
            const searchContainer = document.querySelector('.search-container');
            if (searchDropdown && searchContainer && !searchContainer.contains(e.target)) {
                searchDropdown.classList.remove('show');
            }
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
        // Don't switch if already in the requested view or currently switching
        if (this.currentView === view || this.isSwitching) {
            return;
        }
        
        this.isSwitching = true;
        console.log(`Switching view from ${this.currentView} to ${view}`);
        
        this.currentView = view;
        
        // Update button states with more precise control
        const gridBtn = document.getElementById('grid-view-btn');
        const normalBtn = document.getElementById('normal-view-btn');
        
        if (view === 'grid') {
            gridBtn.classList.add('active');
            normalBtn.classList.remove('active');
        } else {
            gridBtn.classList.remove('active');
            normalBtn.classList.add('active');
        }
        
        // Show/hide views
        const gridView = document.getElementById('grid-view');
        const normalView = document.getElementById('normal-view');
        
        if (view === 'grid') {
            gridView.style.display = 'block';
            normalView.style.display = 'none';
        } else {
            gridView.style.display = 'none';
            normalView.style.display = 'block';
        }
        
        this.renderCurrentView();
        
        // Reset switching flag after a short delay
        setTimeout(() => {
            this.isSwitching = false;
        }, 100);
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
            card.addEventListener('click', () => {
                this.selectTournament(tournament);
                // Switch to normal view to show the selected tournament's media
                this.switchView('normal');
            });
            
            // Generate Cloudinary URL for thumbnail - using Format 2 (works!)
            const thumbnailId = tournament.photos.thumbnail.split('/').pop(); // Get just the public ID
            const thumbnailUrl = this.getCloudinaryUrl(thumbnailId, 'image', {
                width: 400,
                height: 300,
                crop: 'fill',
                quality: 'auto'
            });
            
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
            const mediaItems = await this.fetchTournamentMedia(this.currentTournament);
            this.displayMediaItems(mediaItems);
        } catch (error) {
            console.error('Error loading media:', error);
            this.showError('Failed to load media for this tournament');
        }
    }

    async fetchTournamentMedia(tournament) {
        const mediaItems = [];
        
        console.log(`Loading media for tournament: ${tournament.name} (${tournament.id})`);
        console.log('Tournament data:', tournament);
        
        try {
            // Use direct URLs instead of API calls to avoid CORS issues
            if (this.currentFilter === 'all' || this.currentFilter === 'photos') {
                // Get photo public IDs from tournament data
                const photoIds = tournament.photos.public_ids || [];
                console.log(`Found ${photoIds.length} photos for ${tournament.name}:`, photoIds);
                
                photoIds.forEach((publicId, index) => {
                    mediaItems.push({
                        type: 'image',
                        url: this.getCloudinaryUrl(publicId, 'image', {
                            width: 400,
                            height: 300,
                            crop: 'fill',
                            quality: 'auto'
                        }),
                        title: `${tournament.name} Photo ${index + 1}`,
                        date: tournament.date,
                        created_at: new Date().toISOString()
                    });
                });
            }
            
            // Add videos if filter allows
            if (this.currentFilter === 'all' || this.currentFilter === 'videos') {
                // Get video public IDs from tournament data
                const videoIds = tournament.videos.public_ids || [];
                console.log(`Found ${videoIds.length} videos for ${tournament.name}:`, videoIds);
                
                videoIds.forEach((publicId, index) => {
                    mediaItems.push({
                        type: 'video',
                        url: this.getCloudinaryUrl(publicId, 'video'),
                        title: `${tournament.name} Video ${index + 1}`,
                        date: tournament.date,
                        created_at: new Date().toISOString()
                    });
                });
            }
            
            console.log(`Total media items for ${tournament.name}:`, mediaItems.length);
            return mediaItems;
        } catch (error) {
            console.error('Error fetching media:', error);
            // Return empty array instead of mock data
            return this.getMockMediaItems(tournament);
        }
    }

    getCloudinaryUrl(publicId, resourceType = 'image', transformations = {}) {
        if (!this.cloudName) {
            console.warn('Cloudinary cloud name not set');
            return 'https://via.placeholder.com/400x300?text=No+Image';
        }
        
        const baseUrl = `https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload`;
        const transformString = this.buildTransformString(transformations);
        
        return `${baseUrl}/${transformString}/${publicId}`;
    }
    
    buildTransformString(transformations) {
        const transforms = [];
        
        if (transformations.width) transforms.push(`w_${transformations.width}`);
        if (transformations.height) transforms.push(`h_${transformations.height}`);
        if (transformations.crop) transforms.push(`c_${transformations.crop}`);
        if (transformations.quality) transforms.push(`q_${transformations.quality}`);
        if (transformations.format) transforms.push(`f_${transformations.format}`);
        
        return transforms.join(',');
    }

    getMockMediaItems(tournament) {
        // Return empty array instead of mock data to avoid confusion
        console.log(`No media found for tournament: ${tournament.name}`);
        return [];
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
                    <img src="${item.url}" alt="${item.title}" class="media-image" loading="lazy">
                `;
            } else {
                mediaElement.innerHTML = `
                    <div class="media-video">
                        <video controls>
                            <source src="${item.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
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
    window.mediaGalleryInstance = new MediaGallery();
});

// Handle window resize for responsive view switching
let resizeTimeout;
window.addEventListener('resize', () => {
    // Debounce resize events to prevent rapid firing
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const gallery = window.mediaGalleryInstance;
        if (!gallery || gallery.isSwitching) {
            return; // Don't switch if gallery is not ready or currently switching
        }
        
        const isMobile = window.innerWidth <= 768;
        const expectedView = isMobile ? 'grid' : 'normal';
        
        // Only switch if the current view doesn't match the expected view for the screen size
        if (gallery.currentView !== expectedView) {
            console.log(`Resize: switching from ${gallery.currentView} to ${expectedView} (mobile: ${isMobile})`);
            gallery.switchView(expectedView);
        }
    }, 200); // Increased debounce to 200ms
});
