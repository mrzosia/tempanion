let dojoData = [];

const dojoList = document.getElementById("dojo-list");

function renderDojos(data) {
    dojoList.innerHTML = "";
    data.forEach(t => {
        const item = document.createElement("div");
        item.className = "dojo-item";
        
        // Make dojo item clickable
        item.style.cursor = "pointer";
        item.onclick = () => {
            const dojoId = t.name.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `dojo-detail.html?id=${dojoId}`;
        };

        let leaderName = t.leader.name.replace(/[^a-zA-Z]/g, '');

        item.innerHTML = `
            <div class="dojo-image-container">
                <img srcset="images/thumbnails/dojos/ai/${leaderName}.png 100w,
                             images/thumbnails/dojos/ai/${leaderName}.png 120w,
                             images/thumbnails/dojos/ai/${leaderName}.png 140w"
                     sizes="(max-width: 480px) 100px,
                            (max-width: 768px) 120px,
                            140px"
                     alt="${t.name}">
            </div>
            <div class="dojo-details">
                <div class="dojo-master">${t.leader.name}</div>
                <div class="dojo-name">${t.name}</div>
                <div class="dojo-types">
                ${(() => {
                    const visibleTypes = t.types.slice(0, 2);
                    const extraCount = t.types.length - visibleTypes.length;

                    let html = visibleTypes.map(type => `
                    <div class="dojo-type">
                        <div class="type-image-container">
                        <img srcset="images/thumbnails/types/20/${type}.png 20w,
                                    images/thumbnails/types/24/${type}.png 24w"
                             sizes="(max-width: 480px) 20px, 24px"
                             alt="${type}"/>
                        </div>
                        <p>${type}</p>
                    </div>
                    `).join("");

                    if (extraCount > 0) {
                    html += `
                        <div class="dojo-type extra-count">
                        <p>+${extraCount}</p>
                        </div>
                    `;
                    }

                    return html;
                })()}
                </div>
            </div>
        `;
        dojoList.appendChild(item);
    });
}

function filterDojos(query) {
    const filtered = dojoData.filter(t => 
        t.leader.name.toLowerCase().includes(query.toLowerCase())
    );
    renderDojos(filtered);
}

window.addEventListener("load", () => {
    window.scrollTo({ top: 0 });

    const CACHE_KEY = "dojoData";
    const EXPIRY_KEY = "dojoDataExpiry";
    const VERSION_KEY = "dojoDataVersion";
    
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
        dojoData = JSON.parse(cachedData);
        renderDojos(dojoData);
    } else {
        // Clear old cache when version changes
        if (cachedVersion !== DATA_VERSION) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(EXPIRY_KEY);
        }

        fetch(`data/dojos.json?v=${DATA_VERSION}`)
            .then(res => res.json())
            .then(data => {
                dojoData = data;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(EXPIRY_KEY, (now + expiryDuration).toString());
                localStorage.setItem(VERSION_KEY, DATA_VERSION);
                renderDojos(dojoData);
            })
            .catch(err => {
                console.error("Failed to load dojo data:", err);
            });
    }
});