export class CommentSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        if (!this.container) return;

        // Clear any existing content
        this.container.innerHTML = '';

        // Create the Disqus thread container
        const disqusThread = document.createElement('div');
        disqusThread.id = 'disqus_thread';
        this.container.appendChild(disqusThread);

        // Configure Disqus
        // We need to ensure this is available globally for Disqus to read
        window.disqus_config = function () {
            this.page.url = window.location.href;  // Replace PAGE_URL with your page's canonical URL variable
            this.page.identifier = window.location.pathname; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
        };

        // Inject the Disqus script
        const script = document.createElement('script');
        script.src = 'https://https-zeeteachbio-vercel-app.disqus.com/embed.js';
        script.setAttribute('data-timestamp', +new Date());
        (document.head || document.body).appendChild(script);
    }
}
