// Enhanced Biology-themed animated background particles
// Features: Mouse interaction, depth layers, pulsing, connection lines, optimized performance

export class BioParticles {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particleCount = window.innerWidth > 768 ? 30 : 15;
        this.mouse = { x: null, y: null, radius: 150 };
        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'bio-particles';
        document.body.prepend(this.container);

        // Create canvas for connection lines
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bio-canvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Create particles with depth layers
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle(i);
        }

        // Setup interactions
        this.setupMouseInteraction();
        this.setupScrollParallax();
        this.setupResize();

        // Start animation loop
        this.animate();
    }

    createParticle(index) {
        const particle = document.createElement('div');
        particle.className = 'bio-particle';

        // Assign depth layer (1-3)
        const depth = (index % 3) + 1;
        particle.classList.add(`depth-${depth}`);

        // Particle types with better color variations
        const types = ['cell', 'dna', 'fluid', 'energy'];
        const type = types[index % types.length];
        particle.classList.add(type);

        // Size varies by depth (closer = larger)
        const baseSize = 40 - (depth * 8);
        const size = baseSize + Math.random() * 30;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;

        // Animation duration varies by depth (closer = faster)
        const duration = 25 - (depth * 5) + Math.random() * 10;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;

        // Assign float animation
        const animations = ['floatUp1', 'floatUp2', 'floatUp3'];
        particle.style.animationName = animations[index % animations.length];

        // Store particle data
        particle.particleData = {
            x: (x / 100) * window.innerWidth,
            y: (y / 100) * window.innerHeight,
            baseX: (x / 100) * window.innerWidth,
            baseY: (y / 100) * window.innerHeight,
            depth: depth,
            size: size,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03
        };

        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    setupMouseInteraction() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
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

    setupResize() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            const data = particle.particleData;

            // Pulsing effect
            data.pulsePhase += data.pulseSpeed;
            const pulse = Math.sin(data.pulsePhase) * 0.15 + 1;
            particle.style.transform = `scale(${pulse})`;

            // Update base position from animation
            const rect = particle.getBoundingClientRect();
            data.baseX = rect.left + rect.width / 2;
            data.baseY = rect.top + rect.height / 2;
            data.x = data.baseX;
            data.y = data.baseY;
        });
    }

    drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const connectionDistance = 200;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i].particleData;
                const p2 = this.particles[j].particleData;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;

                    this.ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.updateParticles();
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BioParticles());
} else {
    new BioParticles();
}
