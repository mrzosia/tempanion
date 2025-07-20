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
                <img src="images/temtems/${temtemNumber}.png" alt="${t.name}">
            </div>
            <div class="temtem-details">
                <div class="temtem-name">${t.name}</div>
                <div class="temtem-number">#${temtemNumber}</div>
                <div class="temtem-types">
                    ${t.types.map(type => 
                        `<div class="temtem-type">
                            <div class="type-image-container">
                                <img src="images/types/${type}.png"/>
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
    const expiryDuration = 1000 * 60 * 60 * 24; // 24 hours in ms
    const now = Date.now();

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedExpiry = localStorage.getItem(EXPIRY_KEY);

    if (cachedData && cachedExpiry && now < Number(cachedExpiry)) {
        temtemData = JSON.parse(cachedData);
        renderTemtems(temtemData);
    } else {
        fetch("data/temtems.json")
            .then(res => res.json())
            .then(data => {
                temtemData = data;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(EXPIRY_KEY, now + expiryDuration);
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