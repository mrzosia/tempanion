// Get temtem ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const temtemId = urlParams.get('id');

let temtemData = [];

// Function to create matchup type element
function createMatchupType(type, multiplier = null) {
    const typeElement = document.createElement('div');
    typeElement.className = 'matchup-type';
    
    // Add additional classes based on multiplier strength
    if (multiplier !== null) {
        if (multiplier >= 4.0) {
            typeElement.classList.add('super-effective');
        } else if (multiplier >= 2.0) {
            typeElement.classList.add('effective');
        } else if (multiplier <= 0.25) {
            typeElement.classList.add('super-resistant');
        } else if (multiplier <= 0.5) {
            typeElement.classList.add('resistant');
        }
    }
    
    let multiplierText = '';
    if (multiplier !== null) {
        if (multiplier >= 4.0) {
            multiplierText = '<span class="multiplier">4×</span>';
        } else if (multiplier >= 2.0) {
            multiplierText = '<span class="multiplier">2×</span>';
        } else if (multiplier <= 0.25) {
            multiplierText = '<span class="multiplier">0.25×</span>';
        } else if (multiplier <= 0.5) {
            multiplierText = '<span class="multiplier">0.5×</span>';
        }
    }
    
    typeElement.innerHTML = `
        <div class="type-image-container">
            <img srcset="images/thumbnails/types/20/${type}.png 20w,
                         images/thumbnails/types/24/${type}.png 24w"
                 sizes="(max-width: 480px) 20px, 24px"
                 alt="${type}"/>
        </div>
        <p>${type}</p>
        ${multiplierText}
    `;
    return typeElement;
}

// Function to create evolution stage
function createEvolutionStage(evolutionData, isCurrent = false) {
    const evolutionStage = document.createElement('div');
    evolutionStage.className = `evolution-stage ${isCurrent ? 'current' : ''}`;
    
    const temtemNumber = String(evolutionData.number).padStart(3, '0');
    
    evolutionStage.innerHTML = `
        <div class="evolution-image-container">
            <img srcset="images/thumbnails/temtems/80/${temtemNumber}.png 80w,
                          images/thumbnails/temtems/100/${temtemNumber}.png 100w, 
                          images/thumbnails/temtems/120/${temtemNumber}.png 120w" 
                          alt="${evolutionData.name}">
            
            ${isCurrent ? '<div class="current-badge">Current</div>' : ''}
        </div>
        <div class="evolution-info">
            <div class="evolution-name">${evolutionData.name}</div>
            <div class="evolution-stage-text">Stage ${evolutionData.stage}</div>
        </div>
    `;
    
    // Make evolution stage clickable if it's not the current one
    if (!isCurrent) {
        evolutionStage.style.cursor = 'pointer';
        evolutionStage.onclick = () => {
            window.location.href = `temtem-detail.html?id=${evolutionData.number}`;
        };
    }
    
    return evolutionStage;
}

// Function to populate battle matchups using the weakness data from JSON
function populateMatchups(temtem) {
    // Check if weaknesses data exists
    if (!temtem.weaknesses) {
        console.error('No weakness data found for this Temtem');
        return;
    }
    
    const weakToContainer = document.getElementById('weak-to');
    const resistantToContainer = document.getElementById('resistant-to');
    
    weakToContainer.innerHTML = '';
    resistantToContainer.innerHTML = '';
    
    // Separate weaknesses and resistances from the JSON data
    const weakTypes = [];
    const resistantTypes = [];
    
    Object.entries(temtem.weaknesses).forEach(([type, multiplier]) => {
        if (multiplier > 1) {
            weakTypes.push({ type, multiplier });
        } else if (multiplier < 1) {
            resistantTypes.push({ type, multiplier });
        }
    });
    
    // Sort by multiplier strength (highest weakness first, strongest resistance first)
    weakTypes.sort((a, b) => b.multiplier - a.multiplier);
    resistantTypes.sort((a, b) => a.multiplier - b.multiplier);
    
    // Populate weaknesses
    if (weakTypes.length > 0) {
        weakTypes.forEach(({ type, multiplier }) => {
            const weaknessElement = createMatchupType(type, multiplier);
            weakToContainer.appendChild(weaknessElement);
        });
    } else {
        weakToContainer.innerHTML = '<p class="no-matchups">No major weaknesses</p>';
    }
    
    // Populate resistances
    if (resistantTypes.length > 0) {
        resistantTypes.forEach(({ type, multiplier }) => {
            const resistanceElement = createMatchupType(type, multiplier);
            resistantToContainer.appendChild(resistanceElement);
        });
    } else {
        resistantToContainer.innerHTML = '<p class="no-matchups">No major resistances</p>';
    }
}

// Function to populate temtem details
function populateTemtemDetails(temtem) {
    const temtemNumber = String(temtem.number).padStart(3, '0');

    let temtemImageContainer = document.getElementsByClassName('temtem-image-container')[0];
    let temtemImage = document.createElement('img');
    
    temtemImage.id = 'temtem-image';
    temtemImage.alt = temtem.name;
    temtemImage.srcset = `images/thumbnails/temtems/120/${temtemNumber}.png 120w,
                          images/thumbnails/temtems/160/${temtemNumber}.png 160w, 
                          images/thumbnails/temtems/200/${temtemNumber}.png 200w`;
    temtemImage.sizes = "(max-width: 480px) 120px, (max-width: 768px) 160px, 200px"
    temtemImageContainer.appendChild(temtemImage);
    
    document.getElementById('temtem-name').textContent = temtem.name;
    document.getElementById('temtem-number').textContent = `#${temtemNumber}`;
    
    // Populate types
    const typesContainer = document.getElementById('temtem-types');
    typesContainer.innerHTML = '';
    
    temtem.types.forEach(type => {
        const typeElement = document.createElement('div');
        typeElement.className = 'temtem-type';
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
    
    // Populate battle matchups using the weakness data from JSON
    populateMatchups(temtem);
    
    // Populate evolution chain
    const evolutionContainer = document.getElementById('evolution-chain');
    evolutionContainer.innerHTML = '';

    if (temtem.evolution && temtem.evolution.evolutionTree) {
        const evolutionTree = temtem.evolution.evolutionTree;
        const totalStages = evolutionTree.length;
        
        evolutionTree.forEach((evolution, index) => {
            const isCurrent = evolution.number === temtem.number;
            const evolutionStage = createEvolutionStage(evolution, isCurrent);
            evolutionContainer.appendChild(evolutionStage);
            
            // Add arrow after each stage except the last
            if (totalStages >= 2 && index < totalStages - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'evolution-arrow';
                arrow.innerHTML = '↓';
                evolutionContainer.appendChild(arrow);
            }
        });
    } else {
        evolutionContainer.innerHTML = '<p class="no-evolution">This Temtem does not evolve</p>';
    }
}

// Function to go back to the previous page
function goBack() {
    sessionStorage.setItem('backButtonClicked', 'true');
    window.history.back();
}

// Load temtem data and populate details
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

    const CACHE_KEY = "temtemData";
    const EXPIRY_KEY = "temtemDataExpiry";
    const expiryDuration = 1000 * 60 * 60 * 24; // 24 hours in ms
    const now = Date.now();

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedExpiry = localStorage.getItem(EXPIRY_KEY);

    if (cachedData && cachedExpiry && now < Number(cachedExpiry)) {
        temtemData = JSON.parse(cachedData);
        const temtem = temtemData.find(t => t.number == temtemId);
        if (temtem) {
            populateTemtemDetails(temtem);
        } else {
            document.getElementById('temtem-name').textContent = 'Temtem not found';
            document.getElementById('temtem-number').textContent = 'Please go back and try again';
        }
    } else {
        fetch("data/temtems.json?v=1.2")
            .then(res => res.json())
            .then(data => {
                temtemData = data;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(EXPIRY_KEY, now + expiryDuration);
                
                const temtem = temtemData.find(t => t.number == temtemId);
                if (temtem) {
                    populateTemtemDetails(temtem);
                } else {
                    document.getElementById('temtem-name').textContent = 'Temtem not found';
                    document.getElementById('temtem-number').textContent = 'Please go back and try again';
                }
            })
            .catch(err => {
                console.error("Failed to load temtem data:", err);
                document.getElementById('temtem-name').textContent = 'Error loading temtem';
                document.getElementById('temtem-number').textContent = 'Please try again later';
            });
    }
});