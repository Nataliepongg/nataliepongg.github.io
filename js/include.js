class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.statusText}`);
            }
            const content = await response.text();
            document.getElementById(elementId).innerHTML = content;

            // After loading navbar, initialize its JavaScript
            if (componentPath.includes('navbar')) {
                this.initializeNavbar();
            }
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }

    static initializeNavbar() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        hamburger?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Set active nav link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks2 = document.querySelectorAll('.nav-links a');
        
        navLinks2.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}