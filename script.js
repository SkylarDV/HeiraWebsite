document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".info > div[id]");
    if (!sections.length) {
        return;
    }

    document.body.classList.add("reveal-ready");

    const revealPairs = Array.from(sections).map((section, index) => {
        const target = section.id === "development"
            ? section.querySelector(".desc") || section
            : section;

        target.classList.add("scroll-reveal");
        target.style.setProperty("--reveal-delay", `${index * 140}ms`);

        return { section, target };
    });

    if (!("IntersectionObserver" in window)) {
        revealPairs.forEach(({ target }, index) => {
            setTimeout(() => {
                target.classList.add("is-visible");
            }, index * 180);
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries, revealObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const pair = revealPairs.find(({ section }) => section === entry.target);
                if (pair) {
                    pair.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -12% 0px"
        }
    );

    revealPairs.forEach(({ section }) => observer.observe(section));
});
