const lang = localStorage.getItem("lang") || "en";
let phasesCache = {};
let currentPhase = "axiom";

function getLocalized(fieldObj) {
    if(!fieldObj) return "";
    return fieldObj[lang] || fieldObj['en'] || "";
}

async function loadPhasesData(){
    try {
        const response = await fetch("phases.json");
        if(!response.ok) throw new Error("Failed to load phases.json");
        phasesCache = await response.json();
        
        let initialPhase = location.hash.replace("#", "").trim();
        if(!initialPhase || !phasesCache.hasOwnProperty(initialPhase)){
            initialPhase = "axiom";
        }
        renderPhase(initialPhase, false);
    } catch(err) {
        console.error("Atlas Data Layer Error:", err);
        document.getElementById('panelTag').textContent = "SYSTEM ERROR";
        document.getElementById('panelTitle').textContent = "Data Loading Failure";
        document.getElementById('panelDef').textContent = lang === "tr" 
            ? "Atlas veri katmanı yüklenemedi (phases.json erişilemiyor)." 
            : "Atlas data could not be loaded.";
        document.getElementById('panelInterp').textContent = "";
        document.getElementById('panelApps').textContent = "";
        document.getElementById('panelRefs').innerHTML = "<li>--</li>";
    }
}

function renderPhase(phaseKey, updateHistory = true){
    if(!phasesCache || !phasesCache.hasOwnProperty(phaseKey)) {
        phaseKey = "axiom";
    }

    currentPhase = phaseKey;

    document.querySelectorAll('.phase-node').forEach(btn => {
        if(btn.getAttribute('data-phase') === phaseKey){
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const pData = phasesCache[phaseKey];
    document.getElementById('panelTag').textContent = getLocalized(pData.tag);
    document.getElementById('panelTitle').textContent = getLocalized(pData.title);
    document.getElementById('panelDef').textContent = getLocalized(pData.definition);
    document.getElementById('panelInterp').textContent = getLocalized(pData.interpretation);
    document.getElementById('panelApps').textContent = getLocalized(pData.applications);

    const refsList = document.getElementById('panelRefs');
    refsList.innerHTML = "";
    if(pData.references && pData.references.length > 0) {
        pData.references.forEach(ref => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = ref.url || "#";
            // DÜZELTME: ref.title yerine getLocalized(ref.title) kullanılarak objenin doğru dile çevrilmesi sağlandı
            a.textContent = getLocalized(ref.title) || "Reference Document";
            li.appendChild(a);
            refsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = lang === "tr" ? "Referans bulunmuyor." : "No references registered.";
        refsList.appendChild(li);
    }

    if(updateHistory){
        location.hash = phaseKey;
    }
}

function onNodeClick(phaseKey){
    renderPhase(phaseKey, true);
}

window.addEventListener("hashchange", () => {
    const phase = location.hash.replace("#", "").trim();
    if(phase && phasesCache.hasOwnProperty(phase) && phase !== currentPhase){
        renderPhase(phase, false);
    }
});

function projectLanguage(){
    document.querySelectorAll("[data-en]").forEach(el => {
        const value = el.getAttribute("data-" + lang);
        if(value) el.textContent = value;
    });
}

projectLanguage();
loadPhasesData();
