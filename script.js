document.addEventListener("DOMContentLoaded", () => {
    const heroVideo = document.querySelector(".hero-video");

    if (heroVideo) {
        heroVideo.play().catch(() => {});

        heroVideo.addEventListener("ended", () => {
            heroVideo.pause();
            heroVideo.currentTime = heroVideo.duration;
        });
    }

    const reviewsContainer = document.querySelector(".reviews");

    if (reviewsContainer) {
        initializeReviewsMarquee(reviewsContainer);
    }

    const sections = document.querySelectorAll(".info > div[id]");

    if (sections.length) {
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
        } else {
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
        }
    }

    const hasTouchInteraction = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!hasTouchInteraction) {
        return;
    }

    const designCards = Array.from(document.querySelectorAll(".design-card"));
    const pricingCards = Array.from(document.querySelectorAll(".options > div"));

    const clearTapped = (elements) => {
        elements.forEach((element) => element.classList.remove("is-tapped"));
    };

    designCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            event.stopPropagation();
            const wasTapped = card.classList.contains("is-tapped");
            clearTapped(designCards);
            if (!wasTapped) {
                card.classList.add("is-tapped");
            }
        });
    });

    pricingCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            event.stopPropagation();
            const wasTapped = card.classList.contains("is-tapped");
            clearTapped(pricingCards);
            if (!wasTapped) {
                card.classList.add("is-tapped");
            }
        });
    });

    document.addEventListener("click", () => {
        clearTapped(designCards);
        clearTapped(pricingCards);
    });
});

async function initializeReviewsMarquee(container) {
    try {
        const response = await fetch("./reviews.json");
        if (!response.ok) {
            throw new Error("Failed to load reviews");
        }

        const reviews = await response.json();
        if (!Array.isArray(reviews) || reviews.length === 0) {
            return;
        }

        const viewport = document.createElement("div");
        viewport.className = "reviews-viewport";

        const track = document.createElement("div");
        track.className = "reviews-track";
        viewport.appendChild(track);
        container.replaceChildren(viewport);

        const buildCard = (reviewItem, duplicate = false) => {
            const card = document.createElement("article");
            card.className = "review-card";

            if (duplicate) {
                card.setAttribute("aria-hidden", "true");
            }

            const quote = document.createElement("span");
            quote.className = "review-quote";
            quote.setAttribute("aria-hidden", "true");
            quote.textContent = "''";

            const text = document.createElement("p");
            text.className = "review-text";
            text.textContent = reviewItem.review;

            const author = document.createElement("div");
            author.className = "review-author";

            const logo = document.createElement("img");
            logo.className = "review-logo";
            logo.src = "assets/logo.png";
            logo.alt = "";
            logo.loading = "lazy";

            const authorMeta = document.createElement("div");
            authorMeta.className = "review-author-meta";

            const name = document.createElement("h3");
            name.textContent = reviewItem.name;

            const role = document.createElement("p");
            role.className = "review-role";
            role.textContent = reviewItem.role || "Heira user";

            authorMeta.append(name, role);
            author.append(logo, authorMeta);

            card.append(quote, text, author);
            return card;
        };

        reviews.forEach((reviewItem) => {
            track.appendChild(buildCard(reviewItem));
        });

        reviews.forEach((reviewItem) => {
            track.appendChild(buildCard(reviewItem, true));
        });

        const updateAnimationDuration = () => {
            const singleLoopDistance = track.scrollWidth / 2;
            const pixelsPerSecond = window.innerWidth <= 560
                ? 64
                : window.innerWidth <= 820
                    ? 76
                    : 90;

            const duration = Math.max(singleLoopDistance / pixelsPerSecond, 16);
            track.style.setProperty("--reviews-duration", `${duration.toFixed(2)}s`);
        };

        // Wait a frame so layout is finalized before measuring scroll width.
        requestAnimationFrame(() => {
            requestAnimationFrame(updateAnimationDuration);
        });
        window.addEventListener("resize", updateAnimationDuration);
    } catch (error) {
        console.error("Could not initialize review marquee", error);
    }
}
