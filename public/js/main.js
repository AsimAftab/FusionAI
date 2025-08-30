// Main JavaScript for FusionAI Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeModelCards();
    initializeAnimations();
    initializeScrollEffects();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Update active navigation on scroll
    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

// Model card interactions
function initializeModelCards() {
    const modelCards = document.querySelectorAll('.model-card');
    const tryButtons = document.querySelectorAll('.try-model');
    const learnMoreButtons = document.querySelectorAll('.learn-more');
    
    // Add hover effects
    modelCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Try model button functionality
    tryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const modelId = this.getAttribute('data-model-id');
            
            // Add loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            // Simulate loading and redirect
            setTimeout(() => {
                window.location.href = `/chat/${modelId}`;
            }, 500);
        });
    });
    
    // Learn more button functionality
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const modelCard = this.closest('.model-card');
            const modelName = modelCard.querySelector('.model-name').textContent;
            
            // Show modal with more information
            showModelInfoModal(modelName, modelCard);
        });
    });
    
    // Card click to navigate
    modelCards.forEach(card => {
        card.addEventListener('click', function() {
            const modelId = this.getAttribute('data-model');
            const tryButton = this.querySelector('.try-model');
            
            if (tryButton) {
                tryButton.click();
            }
        });
    });
}

// Animation initialization
function initializeAnimations() {
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.7 });
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
    
    // Animate cards on scroll
    const cards = document.querySelectorAll('.model-card, .feature-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        cardObserver.observe(card);
    });
}

// Scroll effects
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class for header styling
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Parallax effect for hero section
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            heroVisual.style.transform = `translateY(${parallax}px)`;
        });
    }
}

// Utility functions
function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const originalText = element.textContent;
        const prefix = originalText.match(/^\D*/)[0];
        const suffix = originalText.match(/\D*$/)[0];
        
        element.textContent = prefix + Math.floor(current) + suffix;
    }, 16);
}

function showModelInfoModal(modelName, modelCard) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('modelInfoModal');
    if (!modal) {
        modal = createModelInfoModal();
        document.body.appendChild(modal);
    }
    
    // Populate modal content
    const modalTitle = modal.querySelector('.modal-title');
    const modalDescription = modal.querySelector('.modal-description');
    const modalFeatures = modal.querySelector('.modal-features');
    
    modalTitle.textContent = modelName;
    modalDescription.textContent = modelCard.querySelector('.model-description').textContent;
    
    // Copy features
    const features = modelCard.querySelectorAll('.model-features li');
    modalFeatures.innerHTML = '';
    features.forEach(feature => {
        modalFeatures.appendChild(feature.cloneNode(true));
    });
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function createModelInfoModal() {
    const modal = document.createElement('div');
    modal.id = 'modelInfoModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title"></h3>
                <button class="btn-close" onclick="closeModal('modelInfoModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description"></p>
                <h4>Features:</h4>
                <ul class="modal-features"></ul>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="closeModal('modelInfoModal')">
                        <i class="fas fa-play"></i>
                        Try Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Close modal on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal('modelInfoModal');
        }
    });
    
    return modal;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Quick navigation with number keys
    if (e.ctrlKey || e.metaKey) {
        const models = document.querySelectorAll('.model-card');
        const num = parseInt(e.key);
        if (num >= 1 && num <= models.length) {
            e.preventDefault();
            models[num - 1].querySelector('.try-model').click();
        }
    }
});

// Add loading states
function showLoading(element, text = 'Loading...') {
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    element.disabled = true;
}

function hideLoading(element) {
    const originalContent = element.getAttribute('data-original-content');
    if (originalContent) {
        element.innerHTML = originalContent;
        element.removeAttribute('data-original-content');
    }
    element.disabled = false;
}

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', function() {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log(`Page load time: ${pageLoadTime}ms`);
        
        // Send analytics if needed
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                value: pageLoadTime,
                event_category: 'Performance'
            });
        }
    });
}

// Initialize performance tracking
trackPagePerformance();

// Export functions for global access
window.FusionAI = {
    showLoading,
    hideLoading,
    closeModal,
    showModelInfoModal
};

// Footer functions
window.showPrivacyPolicy = function() {
    alert('Privacy Policy: FusionAI respects your privacy. We do not store your conversations or personal data on our servers.');
};

window.showTerms = function() {
    alert('Terms of Service: By using FusionAI, you agree to use the platform responsibly and in accordance with each AI provider\'s terms of service.');
};
