document.body.classList.add("js-ready");

const progressBar = document.getElementById("scroll-progress-bar");
const revealItems = document.querySelectorAll("[data-reveal]");
const navLinks = document.querySelectorAll("[data-scrollspy-nav] a[href^='#']");
const observedSections = document.querySelectorAll("[data-scroll-target]");
const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
const siteHeader = document.querySelector(".site-header");

const getAnchorOffset = () => {
    if (!siteHeader) return 0;
    const headerPosition = window.getComputedStyle(siteHeader).position;
    if (headerPosition !== "sticky" && headerPosition !== "fixed") return 0;
    return Math.max(0, siteHeader.getBoundingClientRect().height - 12);
};

const scrollToHashTarget = (hash, behavior = "smooth") => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (!target) return;

    const top = window.scrollY + target.getBoundingClientRect().top - getAnchorOffset();
    window.scrollTo({
        top: Math.max(0, top),
        behavior
    });
};

const setProgress = () => {
    if (!progressBar) return;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.18
});

revealItems.forEach((item) => revealObserver.observe(item));

anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash) return;
        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        history.pushState(null, "", hash);
        scrollToHashTarget(hash);
    });
});

if (navLinks.length && observedSections.length) {
    const navById = new Map(
        Array.from(navLinks).map((link) => [link.getAttribute("href").slice(1), link])
    );

    const activateSection = (id) => {
        navLinks.forEach((link) => link.classList.remove("is-active"));
        const activeLink = navById.get(id);
        if (activeLink) activeLink.classList.add("is-active");
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const targetId = visibleEntry?.target?.dataset?.navGroup || visibleEntry?.target?.id;
        if (targetId && navById.has(targetId)) {
            activateSection(targetId);
        }
    }, {
        threshold: [0.2, 0.4, 0.65],
        rootMargin: "-15% 0px -55% 0px"
    });

    observedSections.forEach((section) => {
        if (section.id) sectionObserver.observe(section);
    });
}

setProgress();
window.addEventListener("scroll", setProgress, { passive: true });
window.addEventListener("resize", setProgress);
window.addEventListener("load", () => {
    if (window.location.hash) {
        scrollToHashTarget(window.location.hash, "auto");
    }
});
window.addEventListener("popstate", () => {
    if (window.location.hash) {
        scrollToHashTarget(window.location.hash, "auto");
    }
});
