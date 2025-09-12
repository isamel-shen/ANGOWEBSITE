// Media Gallery JavaScript
class MediaGallery {
    constructor() {
        this.tournaments = [];
        this.currentFilter = 'all';
        this.currentView = 'normal';
        this.currentTournament = null;
        this.searchQuery = '';
        this.viewLock = false; // Atomic lock for view switching
        this.isInitialized = false;
        this.pendingViewSwitch = null; // Queue for pending view switches
        
        this.init();
    }

    async init() {
        await this.loadTournaments();
        this.setupEventListeners();
        this.setDefaultView();
        this.renderCurrentView();
        this.isInitialized = true; // Mark as initialized after everything is set up
        
        // Process any pending view switch
        if (this.pendingViewSwitch) {
            const pendingView = this.pendingViewSwitch;
            this.pendingViewSwitch = null;
            this.switchView(pendingView);
        }
    }

    async loadTournaments() {
        try {
            const response = await fetch('media.json');
            const data = await response.json();
            
            // Filter tournaments to only show visible ones
            this.tournaments = data.tournaments.filter(tournament => tournament.visible !== false);
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
        
        // Update button states with precise control (same as switchView)
        const gridBtn = document.getElementById('grid-view-btn');
        const normalBtn = document.getElementById('normal-view-btn');
        
        if (this.currentView === 'grid') {
            gridBtn.classList.add('active');
            normalBtn.classList.remove('active');
            gridBtn.style.setProperty('background', 'var(--gold)', 'important');
            gridBtn.style.setProperty('color', 'var(--navy-dark)', 'important');
            normalBtn.style.setProperty('background', 'transparent', 'important');
            normalBtn.style.setProperty('color', 'var(--navy)', 'important');
        } else {
            gridBtn.classList.remove('active');
            normalBtn.classList.add('active');
            normalBtn.style.setProperty('background', 'var(--gold)', 'important');
            normalBtn.style.setProperty('color', 'var(--navy-dark)', 'important');
            gridBtn.style.setProperty('background', 'transparent', 'important');
            gridBtn.style.setProperty('color', 'var(--navy)', 'important');
        }
        
        // Show/hide views
        const gridView = document.getElementById('grid-view');
        const normalView = document.getElementById('normal-view');
        
        if (this.currentView === 'grid') {
            gridView.style.display = 'block';
            normalView.style.display = 'none';
        } else {
            gridView.style.display = 'none';
            normalView.style.display = 'block';
        }
    }

    switchView(view) {
        // Validate view
        if (view !== 'grid' && view !== 'normal') {
            console.warn('Invalid view:', view);
            return;
        }
        
        // If already in the requested view, do nothing
        if (this.currentView === view) {
            return;
        }
        
        // If not initialized, queue the switch
        if (!this.isInitialized) {
            this.pendingViewSwitch = view;
            return;
        }
        
        // If view is locked, queue the switch (but allow immediate switch if it's the same)
        if (this.viewLock) {
            this.pendingViewSwitch = view;
            return;
        }
        
        // Lock the view switching
        this.viewLock = true;
        
        console.log(`Switching view: ${this.currentView} → ${view}`);
        
        // Perform view switch immediately
        this.performViewSwitch(view);
        
        // Unlock after a shorter delay
        setTimeout(() => {
            this.viewLock = false;
            
            // Process any pending view switch
            if (this.pendingViewSwitch && this.pendingViewSwitch !== this.currentView) {
                const pendingView = this.pendingViewSwitch;
                this.pendingViewSwitch = null;
                this.switchView(pendingView);
            }
        }, 50); // Reduced from 150ms to 50ms
    }
    
    performViewSwitch(view) {
        // Update internal state
        this.currentView = view;
        
        // Get DOM elements
        const gridBtn = document.getElementById('grid-view-btn');
        const normalBtn = document.getElementById('normal-view-btn');
        const gridView = document.getElementById('grid-view');
        const normalView = document.getElementById('normal-view');
        
        // Validate elements exist
        if (!gridBtn || !normalBtn || !gridView || !normalView) {
            console.error('Required DOM elements not found for view switch');
            return;
        }
        
        // Update button states immediately
        if (view === 'grid') {
            gridBtn.classList.add('active');
            normalBtn.classList.remove('active');
            gridBtn.style.setProperty('background', 'var(--gold)', 'important');
            gridBtn.style.setProperty('color', 'var(--navy-dark)', 'important');
            normalBtn.style.setProperty('background', 'transparent', 'important');
            normalBtn.style.setProperty('color', 'var(--navy)', 'important');
            gridView.style.setProperty('display', 'block', 'important');
            normalView.style.setProperty('display', 'none', 'important');
        } else {
            gridBtn.classList.remove('active');
            normalBtn.classList.add('active');
            normalBtn.style.setProperty('background', 'var(--gold)', 'important');
            normalBtn.style.setProperty('color', 'var(--navy-dark)', 'important');
            gridBtn.style.setProperty('background', 'transparent', 'important');
            gridBtn.style.setProperty('color', 'var(--navy)', 'important');
            gridView.style.setProperty('display', 'none', 'important');
            normalView.style.setProperty('display', 'block', 'important');
        }
        
        // Render content
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
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
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
                        url: this.getCloudinaryUrl(publicId, 'video', {
                            auto_rotate: true,
                            quality: 'auto'
                        }),
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
        if (transformations.auto_rotate) transforms.push('a_auto');
        
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
        
        // Store media items for modal navigation
        this.currentMediaItems = mediaItems;
        
        mediaItems.forEach((item, index) => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            
            if (item.type === 'image') {
                mediaElement.innerHTML = `
                    <img src="${item.url}" alt="${item.title}" class="media-image" loading="lazy" data-index="${index}">
                `;
                
                // Add click handler for image modal
                const img = mediaElement.querySelector('.media-image');
                img.addEventListener('click', () => this.openImageModal(index));
            } else {
                mediaElement.innerHTML = `
                    <div class="media-video">
                        <video controls onloadedmetadata="this.fixOrientation()">
                            <source src="${item.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
                
                // Add orientation fix function to the video element
                const video = mediaElement.querySelector('video');
                video.fixOrientation = function() {
                    // Check if video appears upside down by comparing dimensions
                    if (this.videoWidth > 0 && this.videoHeight > 0) {
                        const aspectRatio = this.videoWidth / this.videoHeight;
                        // If the video is portrait (height > width) and appears upside down,
                        // we might need to rotate it
                        if (aspectRatio < 1) {
                            // Check if the video metadata suggests it's rotated
                            // This is a heuristic approach since we can't directly read EXIF data
                            const container = this.closest('.media-video');
                            if (container) {
                                // Add a class that can be used for CSS transforms
                                container.classList.add('video-portrait');
                            }
                        }
                    }
                };
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

    // Modal functionality
    openImageModal(index) {
        if (!this.currentMediaItems || !this.currentMediaItems[index]) return;
        
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const item = this.currentMediaItems[index];
        
        // Set current image index
        this.currentImageIndex = index;
        
        // Update modal image
        modalImage.src = item.url;
        modalImage.alt = item.title;
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Update navigation buttons visibility
        this.updateModalNavigation();
    }

    closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    nextImage() {
        if (!this.currentMediaItems || this.currentImageIndex === undefined) return;
        
        const nextIndex = (this.currentImageIndex + 1) % this.currentMediaItems.length;
        this.currentImageIndex = nextIndex;
        
        const modalImage = document.getElementById('modalImage');
        const item = this.currentMediaItems[nextIndex];
        
        modalImage.src = item.url;
        modalImage.alt = item.title;
        
        this.updateModalNavigation();
    }

    prevImage() {
        if (!this.currentMediaItems || this.currentImageIndex === undefined) return;
        
        const prevIndex = this.currentImageIndex === 0 
            ? this.currentMediaItems.length - 1 
            : this.currentImageIndex - 1;
        this.currentImageIndex = prevIndex;
        
        const modalImage = document.getElementById('modalImage');
        const item = this.currentMediaItems[prevIndex];
        
        modalImage.src = item.url;
        modalImage.alt = item.title;
        
        this.updateModalNavigation();
    }

    updateModalNavigation() {
        const prevBtn = document.getElementById('modalPrev');
        const nextBtn = document.getElementById('modalNext');
        
        if (this.currentMediaItems && this.currentMediaItems.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mediaGalleryInstance = new MediaGallery();
    
    // Modal event listeners
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('modalPrev');
    const nextBtn = document.getElementById('modalNext');
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        window.mediaGalleryInstance.closeImageModal();
    });
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            window.mediaGalleryInstance.closeImageModal();
        }
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        window.mediaGalleryInstance.prevImage();
    });
    
    nextBtn.addEventListener('click', () => {
        window.mediaGalleryInstance.nextImage();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                window.mediaGalleryInstance.closeImageModal();
            } else if (e.key === 'ArrowLeft') {
                window.mediaGalleryInstance.prevImage();
            } else if (e.key === 'ArrowRight') {
                window.mediaGalleryInstance.nextImage();
            }
        }
    });
});

// Handle window resize for responsive view switching - DISABLED to prevent conflicts
// The responsive behavior is now handled by CSS media queries only
// window.addEventListener('resize', () => {
//     // Disabled to prevent button flashing issues
// });
