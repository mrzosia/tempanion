// Get temtem ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const temtemId = urlParams.get('id');

let temtemData = [];

// Function to create matchup type element
function createMatchupType(type) {
    const typeElement = document.createElement('div');
    typeElement.className = 'matchup-type';
    typeElement.innerHTML = `
        <div class="type-image-container">
            <img src="images/types/${type}.png"/>
        </div>
        <p>${type}</p>
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
            <img src="images/temtems/${temtemNumber}.png" alt="${evolutionData.name}">
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

// Function to populate temtem details
function populateTemtemDetails(temtem) {
    const temtemNumber = String(temtem.number).padStart(3, '0');

    let temtemImageContainer = document.getElementsByClassName('temtem-image-container')[0];
    let temtemImage = document.createElement('img');
    
    temtemImage.id = 'temtem-image';
    temtemImage.src = `images/temtems/${temtemNumber}.png`;
    temtemImage.alt = temtem.name;
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
                <img src="images/types/${type}.png"/>
            </div>
            <p>${type}</p>
        `;
        typesContainer.appendChild(typeElement);
    });
    
    // Populate battle matchups using the weaknesses data
    const weakToContainer = document.getElementById('weak-to');
    const resistantToContainer = document.getElementById('resistant-to');
    
    weakToContainer.innerHTML = '';
    resistantToContainer.innerHTML = '';
    
    if (temtem.weaknesses) {
        const weakTypes = [];
        const resistantTypes = [];
        
        // Process weaknesses object
        Object.entries(temtem.weaknesses).forEach(([type, multiplier]) => {
            if (multiplier > 1) {
                weakTypes.push(type);
            } else if (multiplier < 1) {
                resistantTypes.push(type);
            }
        });
        
        // Populate weaknesses
        if (weakTypes.length > 0) {
            weakTypes.forEach(type => {
                const weaknessElement = createMatchupType(type);
                weakToContainer.appendChild(weaknessElement);
            });
        } else {
            weakToContainer.innerHTML = '<p class="no-matchups">No major weaknesses</p>';
        }
        
        // Populate resistances
        if (resistantTypes.length > 0) {
            resistantTypes.forEach(type => {
                const resistanceElement = createMatchupType(type);
                resistantToContainer.appendChild(resistanceElement);
            });
        } else {
            resistantToContainer.innerHTML = '<p class="no-matchups">No major resistances</p>';
        }
    }
    
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
    window.location.href = "index.html"
}

// Load temtem data and populate details
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
        const temtem = temtemData.find(t => t.number == temtemId);
        if (temtem) {
            populateTemtemDetails(temtem);
        } else {
            document.getElementById('temtem-name').textContent = 'Temtem not found';
            document.getElementById('temtem-number').textContent = 'Please go back and try again';
        }
    } else {
        fetch("data/temtems.json")
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