// PASTE YOUR API URL HERE
const API_URL = "https://9epjhobkj2.execute-api.us-east-1.amazonaws.com/default/GetRedisCV";

function toggleJson() {
    const el = document.getElementById('raw-json');
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

async function fetchFullCV() {
    const startTime = performance.now();
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const endTime = performance.now();

        // 1. Update Debug Dashboard
        document.getElementById('dot').className = "status-dot ready";
        document.getElementById('status-text').innerText = "OBJECT RETRIEVED SUCCESSFULLY";
        document.getElementById('latency').innerText = Math.round(endTime - startTime);
        document.getElementById('raw-json').innerText = JSON.stringify(data, null, 2);
        document.getElementById('cv-content').style.opacity = "1";

        // 2. Map Profile (Name, Contact, Summary)
        document.getElementById('name').innerText = data.profile.name;
        document.getElementById('summary').innerText = data.profile.summary;
        document.getElementById('contact-bar').innerHTML = `
        <span>📧 ${data.profile.contact.email}</span>
        <span>📱 ${data.profile.contact.phone}</span>
        <span>📍 ${data.profile.contact.location}</span>
        ${data.profile.contact.linkedin ? `<span>🔗 <a href="${data.profile.contact.linkedin}" target="_blank" style="color:var(--text-dim); text-decoration:none;">LinkedIn</a></span>` : ''}
    `;

        // 3. Map Experience (Loop through array)
        const expList = document.getElementById('experience-list');
        expList.innerHTML = ''; // Clear loading text
        data.experience.forEach(job => {
            const bullets = job.achievements ? job.achievements.map(a => `<li>${a}</li>`).join('') : '';
            
            let descHtml = '';
            if (job.description) {
                descHtml = `<p style="margin-top: 10px; margin-bottom: 15px; color: var(--text-main); font-size: 0.95rem;">${job.description}</p>`;
            }

            let metricsHtml = '';
            if (job.metrics) {
                const metricItems = Object.entries(job.metrics).map(([key, value]) => {
                    const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return `<span class="skill-pill" style="border-color: var(--accent); color: var(--accent); background: rgba(16, 185, 129, 0.1);">${label}: ${value}</span>`;
                }).join(' ');
                metricsHtml = `<div style="margin-bottom: 15px; margin-top: 10px;">${metricItems}</div>`;
            }

            expList.innerHTML += `
            <div class="card">
                <div class="card-tag">REDIS_KEY: experience</div>
                <div class="job-header">
                    <span style="font-weight:700; font-size:1.2rem;">${job.role} <span style="color:var(--accent)">@ ${job.company}</span></span>
                    <span class="date">${job.period}</span>
                </div>
                ${descHtml}
                ${metricsHtml}
                ${bullets ? `<ul>${bullets}</ul>` : ''}
            </div>
        `;
        });

        // 4. Map Education
        const eduList = document.getElementById('education-list');
        eduList.innerHTML = '';
        data.education.forEach(edu => {
            eduList.innerHTML += `
            <div class="sidebar-item">
                <strong>${edu.degree}</strong><br>
                <span style="color:var(--text-dim); font-size:0.85rem;">${edu.institution}</span><br>
                <span class="date">${edu.period}</span>
            </div>
        `;
        });

        // 5. Map Languages (Note: nested inside profile in your JSON)
        const langList = document.getElementById('languages-list');
        langList.innerHTML = '';
        data.profile.languages.forEach(l => {
            langList.innerHTML += `<div class="skill-pill">${l.language}: ${l.proficiency}</div>`;
        });

        // 6. Map Military (Top-level in your JSON)
        const mil = data.military_service;
        document.getElementById('military-card').innerHTML = `
        <div class="card-tag">REDIS_KEY: military_service</div>
        <strong>Reserve:</strong> ${mil.reserve}<br>
        <strong>Regular:</strong> ${mil.regular}<br>
        <p style="color:var(--accent); font-size:0.85rem; margin-top:10px; font-weight:600;">${mil.honors}</p>
    `;

    } catch (err) {
        document.getElementById('status-text').innerText = "FETCH_FAILED: CHECK_CONSOLE";
        document.getElementById('dot').style.background = "red";
        console.error("Fetch Error:", err);
    }
}
window.onload = fetchFullCV;
