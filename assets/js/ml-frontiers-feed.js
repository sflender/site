class MLFrontiersFeed {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.feedUrl = 'https://mlfrontiers.substack.com/feed';
        this.maxItems = options.maxItems || 10;
        this.proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoading();
            const feedData = await this.fetchFeed();
            this.renderFeed(feedData);
        } catch (error) {
            console.error('Error loading ML Frontiers feed:', error);
            this.showError('Failed to load latest articles. Please try again later.');
        }
    }
    
    async fetchFeed() {
        const response = await fetch(`${this.proxyUrl}${encodeURIComponent(this.feedUrl)}&count=${this.maxItems}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error('RSS feed parsing failed');
        }
        
        return data;
    }
    
    showLoading() {
        this.container.innerHTML = `
            <div class="ml-frontiers-loading">
                <div class="loading-spinner"></div>
                <p>Loading latest articles from Machine Learning Frontiers...</p>
            </div>
        `;
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="ml-frontiers-error">
                <p class="error-message">${message}</p>
                <button onclick="window.mlFrontiersFeed.init()" class="retry-button">Retry</button>
            </div>
        `;
    }
    
    extractImageFromContent(content, thumbnail) {
        // Try to get thumbnail first
        if (thumbnail) {
            return thumbnail;
        }
        
        // Extract first image from content
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch && imgMatch[1]) {
            return imgMatch[1];
        }
        
        return null;
    }
    
    extractSubtitle(content) {
        // Remove HTML tags and get first paragraph as subtitle
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        const firstParagraph = textContent.split('\n')[0];
        
        // Limit subtitle length
        if (firstParagraph.length > 150) {
            return firstParagraph.substring(0, 147) + '...';
        }
        
        return firstParagraph;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    renderFeed(feedData) {
        const { feed, items } = feedData;
        
        let html = `
            <div class="ml-frontiers-header">
                <div class="feed-title">
                    <h3>Latest from Machine Learning Frontiers</h3>
                    <a href="https://mlfrontiers.substack.com" target="_blank" rel="noopener" class="view-all">
                        View All →
                    </a>
                </div>
                <p class="feed-description">${feed.description || 'Stay updated with the latest in machine learning research and applications'}</p>
            </div>
            <div class="ml-frontiers-articles">
        `;
        
        items.slice(0, this.maxItems).forEach((item, index) => {
            const image = this.extractImageFromContent(item.content, item.thumbnail);
            const subtitle = this.extractSubtitle(item.content);
            const date = this.formatDate(item.pubDate);
            
            html += `
                <article class="ml-frontiers-article" data-index="${index}">
                    ${image ? `
                        <div class="article-image">
                            <img src="${image}" alt="${item.title}" loading="lazy" onerror="this.parentElement.style.display='none'">
                        </div>
                    ` : ''}
                    <div class="article-content">
                        <h4 class="article-title">
                            <a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
                        </h4>
                        ${subtitle ? `<p class="article-subtitle">${subtitle}</p>` : ''}
                        <div class="article-meta">
                            <span class="article-date">${date}</span>
                            <span class="article-author">${item.author || 'ML Frontiers'}</span>
                        </div>
                    </div>
                </article>
            `;
        });
        
        html += `
            </div>
            <div class="ml-frontiers-footer">
                <p>
                    <a href="https://mlfrontiers.substack.com" target="_blank" rel="noopener" class="subscribe-link">
                        Subscribe to Machine Learning Frontiers
                    </a>
                </p>
            </div>
        `;
        
        this.container.innerHTML = html;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if the container exists on this page
    if (document.getElementById('ml-frontiers-feed')) {
        window.mlFrontiersFeed = new MLFrontiersFeed('ml-frontiers-feed', {
            maxItems: 10
        });
    }
});