let temtemData = [];

const temtemList = document.getElementById("temtem-list");

function renderTemtems(data) {
    temtemList.innerHTML = "";
    data.forEach(t => {
        const temtemNumber = String(t.number).padStart(3, '0');

        const item = document.createElement("div");
        item.className = "temtem-item";
        
        // Make temtem item clickable
        item.style.cursor = "pointer";
        item.onclick = () => {
            window.location.href = `temtem-detail.html?id=${t.number}`;
        };

        item.innerHTML = `
            <div class="temtem-image-container">
                <img srcset="images/thumbnails/temtems/100/${temtemNumber}.png 100w,
                             images/thumbnails/temtems/120/${temtemNumber}.png 120w,
                             images/thumbnails/temtems/140/${temtemNumber}.png 140w"
                     sizes="(max-width: 480px) 100px,
                            (max-width: 768px) 120px,
                            140px alt="${t.name}">
            </div>
            <div class="temtem-details">
                <div class="temtem-name">${t.name}</div>
                <div class="temtem-number">#${temtemNumber}</div>
                <div class="temtem-types">
                    ${t.types.map(type => 
                        `<div class="temtem-type">
                            <div class="type-image-container">
                                <img srcset="images/thumbnails/types/20/${type}.png 20w,
                                             images/thumbnails/types/24/${type}.png 24w"
                                     sizes="(max-width: 480px) 20px, 24px"
                                     alt="${type}"/>
                            </div>
                            <p>${type}</p>
                        </div>`).join("")}
                </div>
            </div>
        `;
        temtemList.appendChild(item);
    });
}

function filterTemtems(query) {
    const filtered = temtemData.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase())
    );
    renderTemtems(filtered);
}

window.addEventListener("load", () => {
    window.scrollTo({ top: 0 });

    const CACHE_KEY = "temtemData";
    const EXPIRY_KEY = "temtemDataExpiry";
    const VERSION_KEY = "temtemDataVersion";
    
    const DATA_VERSION = "1.5"; // Update this number with JSON file changes
    const expiryDuration = 1000 * 60 * 60 * 24; // 24 hours in ms
    const now = Date.now();

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedExpiry = localStorage.getItem(EXPIRY_KEY);
    const cachedVersion = localStorage.getItem(VERSION_KEY);

    // Check if cache is valid (not expired AND same version)
    const isCacheValid = cachedData && 
                        cachedExpiry && 
                        now < Number(cachedExpiry) && 
                        cachedVersion === DATA_VERSION;

    if (isCacheValid) {
        temtemData = JSON.parse(cachedData);
        renderTemtems(temtemData);
    } else {
        // Clear old cache when version changes
        if (cachedVersion !== DATA_VERSION) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(EXPIRY_KEY);
        }

        fetch(`data/all-temtems-data.json?v=${DATA_VERSION}`)
            .then(res => res.json())
            .then(data => {
                temtemData = data;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(EXPIRY_KEY, (now + expiryDuration).toString());
                localStorage.setItem(VERSION_KEY, DATA_VERSION);
                renderTemtems(temtemData);
            })
            .catch(err => {
                console.error("Failed to load Temtem data:", err);
            });
    }
});

const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});