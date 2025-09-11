// Media Gallery JavaScript
class MediaGallery {
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
            
            // Generate Cloudinary URL for thumbnail
            const thumbnailUrl = this.getCloudinaryUrl(tournament.photos.thumbnail, 'image', {
                width: 400,
                height: 300,
                crop: 'fill',
                quality: 'auto'
            });
            
            card.innerHTML = `
                <img src="${thumbnailUrl}" alt="${tournament.name}" class="tournament-thumbnail" loading="lazy">
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
        
        try {
            // Fetch photos if filter allows
            if (this.currentFilter === 'all' || this.currentFilter === 'photos') {
                const photosResponse = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/resources/image?prefix=${tournament.photos.folder}/&max_results=50`);
                const photosData = await photosResponse.json();
                
                photosData.resources.forEach(photo => {
                    mediaItems.push({
                        type: 'image',
                        url: photo.secure_url,
                        title: photo.public_id.split('/').pop().replace(/[-_]/g, ' '),
                        date: new Date(photo.created_at).toLocaleDateString(),
                        created_at: photo.created_at
                    });
                });
            }
            
            // Fetch videos if filter allows
            if (this.currentFilter === 'all' || this.currentFilter === 'videos') {
                const videosResponse = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/resources/video?prefix=${tournament.videos.folder}/&max_results=50`);
                const videosData = await videosResponse.json();
                
                videosData.resources.forEach(video => {
                    mediaItems.push({
                        type: 'video',
                        url: video.secure_url,
                        title: video.public_id.split('/').pop().replace(/[-_]/g, ' '),
                        date: new Date(video.created_at).toLocaleDateString(),
                        created_at: video.created_at
                    });
                });
            }
            
            // Sort by creation date (newest first)
            mediaItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            return mediaItems;
        } catch (error) {
            console.error('Error fetching media:', error);
            // Return mock data for demonstration
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
        // Mock data for demonstration when Cloudinary API is not available
        const mockItems = [];
        
        if (this.currentFilter === 'all' || this.currentFilter === 'photos') {
            for (let i = 1; i <= 6; i++) {
                mockItems.push({
                    type: 'image',
                    url: `https://picsum.photos/400/300?random=${tournament.id}-${i}`,
                    title: `${tournament.name} Photo ${i}`,
                    date: tournament.date,
                    created_at: new Date().toISOString()
                });
            }
        }
        
        if (this.currentFilter === 'all' || this.currentFilter === 'videos') {
            for (let i = 1; i <= 3; i++) {
                mockItems.push({
                    type: 'video',
                    url: `https://sample-videos.com/zip/10/mp4/SampleVideo_${i}.mp4`,
                    title: `${tournament.name} Video ${i}`,
                    date: tournament.date,
                    created_at: new Date().toISOString()
                });
            }
        }
        
        return mockItems;
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
                    <div class="media-info">
                        <h3 class="media-title">${item.title}</h3>
                        <p class="media-date">${item.date}</p>
                    </div>
                `;
            } else {
                mediaElement.innerHTML = `
                    <div class="media-video">
                        <video controls>
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
    new MediaGallery();
});

// Handle window resize for responsive view switching
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    const currentView = document.getElementById('grid-view').style.display !== 'none' ? 'grid' : 'normal';
    
    if (isMobile && currentView === 'normal') {
        // Switch to grid view on mobile
        document.getElementById('grid-view-btn').click();
    } else if (!isMobile && currentView === 'grid') {
        // Switch to normal view on desktop
        document.getElementById('normal-view-btn').click();
    }
});
