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
function createEvolutionStage(evolutionData, isCurrent = false, levelsToNextStage = null) {
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

    // Show levels required to reach the NEXT stage (now using the passed parameter)
    if (levelsToNextStage && levelsToNextStage !== 0) {
        const evolutionInfo = evolutionStage.querySelector('.evolution-info');
        const levels = document.createElement('div');
        levels.className = 'evolution-stage-text';
        levels.innerText = `Levels to Evolve: ${levelsToNextStage}`;
        evolutionInfo.appendChild(levels);
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
            
            // Get the level requirement from the NEXT stage
            const nextStage = evolutionTree[index + 1];
            const levelsToNextStage = nextStage ? nextStage.level : null;
            
            const evolutionStage = createEvolutionStage(evolution, isCurrent, levelsToNextStage);
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

// Function to populate techniques section
function populateTechniques(temtem) {
    console.log(temtem);
    const techniquesContainer = document.getElementById('techniques-list');
    techniquesContainer.innerHTML = '';
    
    if (!temtem.techniques || temtem.techniques.length === 0) {
        techniquesContainer.innerHTML = '<p class="no-techniques">No techniques available</p>';
        return;
    }
    
    // Separate techniques by source
    const levelingTechniques = [];
    const courseTechniques = [];
    const breedingTechniques = [];
    const otherTechniques = [];
    
    temtem.techniques.forEach(technique => {
        switch (technique.source) {
            case 'Levelling':
                levelingTechniques.push(technique);
                break;
            case 'TechniqueCourses':
                courseTechniques.push(technique);
                break;
            case 'Breeding':
                breedingTechniques.push(technique);
                break;
            default:
                otherTechniques.push(technique);
                break;
        }
    });
    
    // Sort leveling techniques by level
    levelingTechniques.sort((a, b) => (a.levels || 0) - (b.levels || 0));
    
    // Function to create technique element
    function createTechniqueElement(technique) {
        const techniqueElement = document.createElement('div');
        techniqueElement.className = 'technique-item';
        
        let levelInfo = '';
        if (technique.levels) {
            levelInfo = `<span class="technique-level">Lv. ${technique.levels}</span>`;
        }
        
        techniqueElement.innerHTML = `
            <div class="technique-name">${technique.name}</div>
            ${levelInfo}
        `;
        
        return techniqueElement;
    }
    
    // Add leveling techniques
    if (levelingTechniques.length > 0) {
        const levelingSection = document.createElement('div');
        levelingSection.className = 'technique-source-section';
        levelingSection.innerHTML = '<h4 class="technique-source-title">Leveling</h4>';
        
        const levelingList = document.createElement('div');
        levelingList.className = 'technique-list';
        
        levelingTechniques.forEach(technique => {
            levelingList.appendChild(createTechniqueElement(technique));
        });
        
        levelingSection.appendChild(levelingList);
        techniquesContainer.appendChild(levelingSection);
    }
    
    // Add technique course techniques
    if (courseTechniques.length > 0) {
        const courseSection = document.createElement('div');
        courseSection.className = 'technique-source-section';
        courseSection.innerHTML = '<h4 class="technique-source-title">Technique Courses</h4>';
        
        const courseList = document.createElement('div');
        courseList.className = 'technique-list';
        
        courseTechniques.forEach(technique => {
            courseList.appendChild(createTechniqueElement(technique));
        });
        
        courseSection.appendChild(courseList);
        techniquesContainer.appendChild(courseSection);
    }
    
    // Add breeding techniques
    if (breedingTechniques.length > 0) {
        const breedingSection = document.createElement('div');
        breedingSection.className = 'technique-source-section';
        breedingSection.innerHTML = '<h4 class="technique-source-title">Breeding</h4>';
        
        const breedingList = document.createElement('div');
        breedingList.className = 'technique-list';
        
        breedingTechniques.forEach(technique => {
            breedingList.appendChild(createTechniqueElement(technique));
        });
        
        breedingSection.appendChild(breedingList);
        techniquesContainer.appendChild(breedingSection);
    }
    
    // Add other techniques
    if (otherTechniques.length > 0) {
        const otherSection = document.createElement('div');
        otherSection.className = 'technique-source-section';
        otherSection.innerHTML = '<h4 class="technique-source-title">Other</h4>';
        
        const otherList = document.createElement('div');
        otherList.className = 'technique-list';
        
        otherTechniques.forEach(technique => {
            otherList.appendChild(createTechniqueElement(technique));
        });
        
        otherSection.appendChild(otherList);
        techniquesContainer.appendChild(otherSection);
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
    const VERSION_KEY = "temtemDataVersion";
    
    const DATA_VERSION = "1.5"; // // Update this number with JSON file changes
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
        const temtem = temtemData.find(t => t.number == temtemId);
        if (temtem) {
            populateTemtemDetails(temtem);
            populateTechniques(temtem);
        } else {
            document.getElementById('temtem-name').textContent = 'Temtem not found';
            document.getElementById('temtem-number').textContent = 'Please go back and try again';
        }
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
                
                const temtem = temtemData.find(t => t.number == temtemId);
                if (temtem) {
                    populateTemtemDetails(temtem);
                    populateTechniques(temtem);
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