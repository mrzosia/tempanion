// Get dojo ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const dojoId = urlParams.get('id');

let dojoData = [];
let temtemLookup = null;

// Function to get or create temtem lookup with caching
async function getTemtemLookup() {
    if (temtemLookup) {
        return temtemLookup;
    }

    const LOOKUP_CACHE_KEY = "temtemLookup";
    const LOOKUP_EXPIRY_KEY = "temtemLookupExpiry";
    const expiryDuration = 1000 * 60 * 60 * 24 * 7; // 7 days in ms
    const now = Date.now();

    const cachedLookup = localStorage.getItem(LOOKUP_CACHE_KEY);
    const cachedExpiry = localStorage.getItem(LOOKUP_EXPIRY_KEY);

    if (cachedLookup && cachedExpiry && now < Number(cachedExpiry)) {
        temtemLookup = JSON.parse(cachedLookup);
        return temtemLookup;
    }

    // Fetch and create minimal lookup
    const temtems = await fetch("data/temtems.json").then(res => res.json());
    
    temtemLookup = temtems.reduce((acc, temtem) => {
        acc[temtem.number] = {
            name: temtem.name,
            types: temtem.types,
            number: temtem.number
        };
        return acc;
    }, {});

    // Cache the lookup
    localStorage.setItem(LOOKUP_CACHE_KEY, JSON.stringify(temtemLookup));
    localStorage.setItem(LOOKUP_EXPIRY_KEY, now + expiryDuration);

    return temtemLookup;
}

// Function to create temtem item for the detail page
function createTemtemItem(temtem) {
    const temtemItem = document.createElement('div');
    temtemItem.className = 'temtem-item';
    
    // Make temtem clickable
    temtemItem.onclick = () => {
        window.location.href = `temtem-detail.html?id=${temtem.number}`;
    };
    temtemItem.style.cursor = 'pointer';
    
    const temtemNumber = String(temtem.number).padStart(3, '0');
    
    temtemItem.innerHTML = `
        <div class="temtem-image-container">
            <img srcset="images/thumbnails/temtems/100/${temtemNumber}.png 100w,
                            images/thumbnails/temtems/120/${temtemNumber}.png 120w, 
                            images/thumbnails/temtems/140/${temtemNumber}.png 140w" 
                            alt="${temtem.name}">
        </div>
        <div class="temtem-details">
            <div class="temtem-name">${temtem.name}</div>
            <div class="temtem-number">Lv.${temtem.level}</div>
            <div class="temtem-types">
                ${temtem.types.map(type => `
                    <div class="temtem-type">
                        <div class="type-image-container">
                            <img srcset="images/thumbnails/types/20/${type}.png 20w,
                                         images/thumbnails/types/24/${type}.png 24w"
                                 sizes="(max-width: 480px) 20px, 24px"
                                 alt="${type}"/>
                        </div>
                        <p>${type}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return temtemItem;
}

// Function to populate dojo details
async function populateDojoDetails(dojo) {
    let dojoImageContainer = document.getElementsByClassName('dojo-image-container')[0];
    let dojoImage = document.createElement('img');

    let dojoLeaderName = dojo.leader.name.replace(/[^a-zA-Z]/g, '');

    dojoImage.id = 'dojo-image';
    dojoImage.srcset = `images/thumbnails/dojos/ai/${dojoLeaderName}.png 120w,
                          images/thumbnails/dojos/ai/${dojoLeaderName}.png 160w, 
                          images/thumbnails/dojos/ai/${dojoLeaderName}.png 200w`;
    dojoImage.sizes = "(max-width: 480px) 120px, (max-width: 768px) 160px, 200px"
    dojoImage.alt = dojo.leader.name;
    dojoImageContainer.appendChild(dojoImage);

    document.getElementById('dojo-master-name').textContent = dojo.leader.name;
    document.getElementById('dojo-name').textContent = dojo.name;
    
    // Populate types
    const typesContainer = document.getElementById('dojo-types');
    typesContainer.innerHTML = '';

    dojo.types.forEach(type => {
        const typeElement = document.createElement('div');
        typeElement.className = 'dojo-type';
        typeElement.innerHTML = `
            <div class="type-image-container">
                <img srcset="images/thumbnails/types/20/${type}.png 20w,
                             images/thumbnails/types/24/${type}.png 24w"
                     sizes="(max-width: 480px) 20px, 24px"
                     alt="${type}"/>
            </div>
            <p>${type}</p>
        `;
        typesContainer.appendChild(typeElement);
    });
    
    // Get temtem lookup and populate temtems
    const lookup = await getTemtemLookup();
    const temtemsList = document.getElementById('temtem-list');
    temtemsList.innerHTML = '';
    
    if (dojo.leader && dojo.leader.temtem && dojo.leader.temtem.length > 0) {
        dojo.leader.temtem.forEach(dojoTemtem => {
            // Merge dojo-specific data with full temtem data
            const fullTemtemData = lookup[dojoTemtem.number];
            if (fullTemtemData) {
                const enhancedTemtem = {
                    ...fullTemtemData,
                    level: dojoTemtem.level // Keep dojo-specific level
                };
                
                console.log(enhancedTemtem);
                const temtemItem = createTemtemItem(enhancedTemtem);
                temtemsList.appendChild(temtemItem);
            }
        });
    }
}

// Function to go back to the previous page
function goBack() {
    sessionStorage.setItem('backButtonClicked', 'true');
    window.history.back();
}

// Load dojo data and populate details
window.addEventListener("load", () => {

    if (sessionStorage.getItem('backButtonClicked') === 'true') {
        
        // Disable scroll restoration temporarily
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Force scroll multiple times to override browser behavior
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            // Re-enable scroll restoration
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        }, 50);
        
        sessionStorage.removeItem('backButtonClicked');
    }

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
        const dojo = dojoData.find(d => d.name.toLowerCase().replace(/\s+/g, '-') === dojoId);
        if (dojo) {
            populateDojoDetails(dojo);
        } else {
            document.getElementById('dojo-master-name').textContent = 'Dojo not found';
            document.getElementById('dojo-name').textContent = 'Please go back and try again';
        }
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
                
                const dojo = dojoData.find(d => d.name.toLowerCase().replace(/\s+/g, '-') === dojoId);
                if (dojo) {
                    populateDojoDetails(dojo);
                } else {
                    document.getElementById('dojo-master-name').textContent = 'Dojo not found';
                    document.getElementById('dojo-name').textContent = 'Please go back and try again';
                }
            })
            .catch(err => {
                console.error("Failed to load dojo data:", err);
                document.getElementById('dojo-master-name').textContent = 'Error loading dojo';
                document.getElementById('dojo-name').textContent = 'Please try again later';
            });
    }
});