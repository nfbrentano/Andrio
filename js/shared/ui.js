/**
 * UI Compartilhada - PACO Móveis
 * Menu mobile acessível e interações globais de navegação
 */

function inicializarMenuMobile() {
    if (window._menuMobileInicializado) return;

    const hamburgerBtn = document.getElementById('fun-hamburger');
    const closeBtn = document.getElementById('fun-close-menu');
    const navMenu = document.getElementById('fun-nav-menu');
    const overlay = document.getElementById('fun-mobile-overlay');

    if (!hamburgerBtn || !navMenu) return;

    window._menuMobileInicializado = true;

    function syncMenuAria() {
        const isMobile = window.innerWidth <= 1024;
        requestAnimationFrame(() => {
            if (isMobile) {
                navMenu.setAttribute('aria-hidden', navMenu.classList.contains('is-open') ? 'false' : 'true');
            } else {
                navMenu.setAttribute('aria-hidden', 'false');
            }
        });
    }
    syncMenuAria();

    function openMenu() {
        hamburgerBtn.classList.add('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('is-open');
        navMenu.setAttribute('aria-hidden', 'false');
        if (overlay) {
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.classList.add('menu-open');

        // Move o foco para o botão de fechar dentro do menu modal
        requestAnimationFrame(() => {
            if (closeBtn) closeBtn.focus();
        });
    }

    function closeMenu(restoreFocus = true) {
        hamburgerBtn.classList.remove('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        if (window.innerWidth <= 1024) {
            navMenu.setAttribute('aria-hidden', 'true');
        }
        if (overlay) {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('menu-open');

        // Retorna o foco ao botão de abertura se solicitado
        if (restoreFocus && hamburgerBtn) {
            hamburgerBtn.focus();
        }
    }

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('is-open');
        if (isOpen) {
            closeMenu(true);
        } else {
            openMenu();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeMenu(true));
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeMenu(true));
    }

    // Fechar menu ao pressionar ESC e reter o foco (focus trap) no menu mobile
    document.addEventListener('keydown', (e) => {
        if (!navMenu.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu(true);
            return;
        }

        // Focus trap quando aberto no mobile
        if (e.key === 'Tab' && window.innerWidth <= 1024) {
            const focusableElements = navMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });

    // Fechar menu ao clicar em links e filtros no mobile
    const menuItems = navMenu.querySelectorAll('a, button');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item === closeBtn) return;
            if (window.innerWidth <= 1024) {
                closeMenu(false);
            }
        });
    });

    // Auto-fechar ao redimensionar para desktop & sincronizar ARIA
    window.addEventListener('resize', () => {
        syncMenuAria();
        if (window.innerWidth > 1024 && navMenu.classList.contains('is-open')) {
            closeMenu(false);
        }
    });
}

function inicializarNavbar() {
    const navbar = document.querySelector('.fun-navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Alias para compatibilidade
const initMenuMobile = inicializarMenuMobile;

window.inicializarMenuMobile = inicializarMenuMobile;
window.initMenuMobile = initMenuMobile;
window.inicializarNavbar = inicializarNavbar;

// Auto-inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMobile();
    inicializarNavbar();
});
