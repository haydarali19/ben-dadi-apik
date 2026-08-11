// CMS Fetch Logic for Ben Dadi Apik

async function fetchCMSData(sheetName) {
    if (typeof CMS_URL === 'undefined' || CMS_URL.includes("CONTOH")) {
        console.warn("CMS_URL belum dikonfigurasi. Menggunakan data statis jika ada.");
        return null;
    }
    try {
        const response = await fetch(`${CMS_URL}?sheet=${encodeURIComponent(sheetName)}`);
        const data = await response.json();
        if (data.error) {
            console.error("CMS Error:", data.error);
            return null;
        }
        return data;
    } catch (e) {
        console.error("Error fetching data from " + sheetName, e);
        return null;
    }
}

async function renderPortofolio() {
    const container = document.getElementById("portfolio-container");
    const skeleton = document.getElementById("portfolio-skeleton");
    
    if (!container || !skeleton) return;

    // Always show static portfolio first (fallback)
    skeleton.style.display = 'none';
    container.style.display = 'grid';

    const data = await fetchCMSData("Portofolio");

    // If no CMS data, keep static portfolio as-is
    if (!data || data.length === 0) return;
    
    container.innerHTML = '';
    
    let index = 1;
    data.forEach(item => {
        if (item.Tampilkan === false || String(item.Tampilkan).toUpperCase() === "FALSE") return;
        
        // Kumpulkan semua foto (Foto 1, Foto 2, Foto 3, dst.)
        const photos = [];
        let i = 1;
        while (item[`Foto ${i}`] && String(item[`Foto ${i}`]).trim() !== '') {
            photos.push(item[`Foto ${i}`]);
            i++;
        }
        if (photos.length === 0) return; // skip jika tidak ada foto

        const sliderId = `portfolio-slider-${index}`;
        const imgsHTML = photos.map(url => `<img src="${url}" alt="${item.Judul}">`).join('');
        const navButtons = photos.length > 1
            ? `<button class="slider-btn prev" onclick="moveSlide('${sliderId}', -1)">&#10094;</button>
               <button class="slider-btn next" onclick="moveSlide('${sliderId}', 1)">&#10095;</button>`
            : '';

        const card = document.createElement('div');
        card.className = 'slider-card fade-in visible';
        card.innerHTML = `
            <div class="slider-container" id="${sliderId}">
                <div class="slider-track" data-index="0">
                    ${imgsHTML}
                </div>
                ${navButtons}
            </div>
            <div class="slider-caption">
                <h4>${item.Judul}</h4>
                <div class="slider-desc">${item.Deskripsi}</div>
                <button class="toggle-desc-btn" onclick="toggleCaption(this)">Baca Selengkapnya</button>
            </div>
        `;
        container.appendChild(card);
        index++;
    });
    
    if (typeof initSliders === 'function') initSliders();
}

async function renderTestimoni() {
    const carousel = document.getElementById("testimonial-carousel");
    const track = document.getElementById("testimonial-track");
    const skeleton = document.getElementById("testimonial-skeleton");
    
    if (!carousel || !track || !skeleton) return;
    
    const data = await fetchCMSData("Testimoni");
    skeleton.style.display = 'none';
    if (!data || data.length === 0) return;
    
    track.innerHTML = '';
    let count = 0;

    data.forEach(item => {
        if (item.Tampilkan === false || String(item.Tampilkan).toUpperCase() === "FALSE") return;
        
        const card = document.createElement('div');
        card.className = 'testimonial-card fade-in visible';
        card.innerHTML = `
            <div class="testimonial-text">${item['Isi Testimoni']}</div>
            <div class="testimonial-author">
                <img src="${item['Foto Avatar'] || 'src/Logo BEN DADI APIK.png'}" alt="${item.Nama}" class="testimonial-avatar">
                <div class="testimonial-info">
                    <h4>${item.Nama}</h4>
                    <p>${item.Jabatan}</p>
                </div>
            </div>
        `;
        track.appendChild(card);
        count++;
    });

    carousel.style.display = 'block';

    // Setup dots will be handled by initTestiCarousel
    initTestiCarousel();
    window.addEventListener('resize', initTestiCarousel);
}

function initTestiCarousel() {
    const carousel = document.getElementById('testimonial-carousel');
    const track = document.getElementById('testimonial-track');
    if (!carousel || !track) return;

    const w = carousel.offsetWidth;
    const visible = w < 600 ? 1 : w < 900 ? 2 : 3;
    const gap = 20;
    const cardWidth = (w - gap * (visible - 1)) / visible;
    
    const count = track.children.length;
    const maxIndex = Math.max(0, count - visible);

    Array.from(track.children).forEach(card => {
        card.style.width = cardWidth + 'px';
        card.style.flexShrink = '0';
    });

    // Re-generate dots based on maxIndex
    const dotsEl = document.getElementById('testi-dots');
    if (dotsEl) {
        dotsEl.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('span');
            dot.className = 'testi-dot';
            dot.onclick = () => {
                window.testiIndex = i;
                if (typeof moveTestiSlide === 'function') moveTestiSlide(0);
            };
            dotsEl.appendChild(dot);
        }
    }

    // Reset position
    if (typeof testiIndex !== 'undefined') {
        track.style.transform = `translateX(0)`;
        window.testiIndex = 0;
        if (dotsEl && dotsEl.children.length > 0) {
            dotsEl.children[0].classList.add('active');
        }
        
        // Initial center card styling
        Array.from(track.children).forEach((c, i) => {
            c.classList.remove('center-card');
            if (visible === 3 && i === 1) {
                c.classList.add('center-card');
            } else if (visible === 1 && i === 0) {
                c.classList.add('center-card');
            }
        });
    }
}

async function renderKontak() {
    const data = await fetchCMSData("Info Kontak");
    if (!data || data.length === 0) return;
    
    data.forEach(item => {
        const label = item.Label ? item.Label.toLowerCase() : '';
        if (label.includes('telepon') || label.includes('whatsapp')) {
            const el = document.getElementById('cms-telepon');
            if (el) {
                el.textContent = item.Isi;
                // Basic check to see if it's formatted as wa.me
                let cleanNumber = String(item.Isi).replace(/\D/g,'');
                if(cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
                el.href = `https://wa.me/${cleanNumber}`;
            }
        } else if (label.includes('email')) {
            const el = document.getElementById('cms-email');
            if (el) {
                el.textContent = item.Isi;
                el.href = `mailto:${item.Isi}`;
            }
        } else if (label.includes('alamat')) {
            const el = document.getElementById('cms-alamat');
            if (el) el.textContent = item.Isi;
        }
    });
}

// Ambil pengaturan show/hide section dari sheet "Pengaturan"
async function fetchPengaturan() {
    const defaults = { showPortofolio: true, showTestimoni: true };
    const data = await fetchCMSData("Pengaturan");
    if (!data || data.length === 0) return defaults;

    data.forEach(item => {
        const key   = String(item.Pengaturan || '').trim().toLowerCase();
        const nilai = String(item.Nilai || '').trim().toUpperCase();
        if (key.includes('portofolio')) defaults.showPortofolio = (nilai === 'TRUE');
        if (key.includes('testimoni'))  defaults.showTestimoni  = (nilai === 'TRUE');
    });
    return defaults;
}

// Run when DOM is fully loaded (safe for bottom-of-body scripts)
async function initCMS() {
    const hasCMS = typeof CMS_URL !== 'undefined' && !CMS_URL.includes("CONTOH");

    // Baca pengaturan dari Sheets (jika ada CMS), fallback ke tampil semua
    const config = hasCMS ? await fetchPengaturan() : { showPortofolio: true, showTestimoni: true };

    // --- Terapkan visibilitas section ---
    const sectionPorto = document.getElementById("galeri");
    const sectionTesti = document.getElementById("testimoni");
    if (sectionPorto) sectionPorto.style.display = config.showPortofolio ? '' : 'none';
    if (sectionTesti) sectionTesti.style.display  = config.showTestimoni  ? '' : 'none';

    if (hasCMS) {
        if (config.showPortofolio) renderPortofolio();
        if (config.showTestimoni)  renderTestimoni();
        renderKontak();
    } else {
        // Tidak ada CMS — tampilkan static portfolio jika section aktif
        if (config.showPortofolio) {
            const portContainer = document.getElementById("portfolio-container");
            const portSkeleton  = document.getElementById("portfolio-skeleton");
            if (portContainer && portSkeleton) {
                portSkeleton.style.display = 'none';
                portContainer.style.display = 'grid';
            }
        }
        // Sembunyikan skeleton testimoni jika section tidak aktif
        if (!config.showTestimoni) {
            const testiSkeleton = document.getElementById("testimonial-skeleton");
            if (testiSkeleton) testiSkeleton.style.display = 'none';
        }
    }
}

// Fire immediately if DOM already ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
} else {
    initCMS();
}
