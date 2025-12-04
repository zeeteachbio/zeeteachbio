// Biology-themed animated background particles
// Creates floating cells, DNA molecules, and other biological elements

export class BioParticles {
    constructor() {
        this.container = null;
        this.particles = [];
        this.particleCount = window.innerWidth > 768 ? 12 : 6; // Fewer on mobile
        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'bio-particles';
        document.body.prepend(this.container);

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle(i);
        }

        // Add scroll parallax
        this.setupScrollParallax();
    }

    createParticle(index) {
        const particle = document.createElement('div');
        particle.className = 'bio-particle';

        // Assign type: cell, dna, or fluid
        const types = ['cell', 'dna', 'fluid'];
        const type = types[index % types.length];
        particle.classList.add(type);

        // Random size between 30-80px
        const size = 30 + Math.random() * 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random horizontal position
        particle.style.left = `${Math.random() * 100}%`;

        // Random animation duration between 20-35s
        const duration = 20 + Math.random() * 15;
        particle.style.animationDuration = `${duration}s`;

        // Random animation delay between 0-10s
        particle.style.animationDelay = `${Math.random() * 10}s`;

        // Assign one of three float animations
        const animations = ['floatUp1', 'floatUp2', 'floatUp3'];
        particle.style.animationName = animations[index % animations.length];

        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    setupScrollParallax() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    document.documentElement.style.setProperty('--scroll-offset', scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BioParticles());
} else {
    new BioParticles();
}
