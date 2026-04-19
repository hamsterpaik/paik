document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const homeScreen = document.getElementById('home-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const finishScreen = document.getElementById('finish-screen');
    
    // Home Buttons
    const homeStartWarm = document.getElementById('home-start-warm');
    const homeStartCool = document.getElementById('home-start-cool');
    const homeViewGallery = document.getElementById('home-view-gallery');
    const homeReset = document.getElementById('home-reset');
    const navHomeBtn = document.getElementById('nav-home');
    const saveHeaderBtn = document.getElementById('save-character');
    
    // Header/Modal Back Buttons
    const galleryBackBtn = document.querySelector('.gallery-back-btn');
    const finishBackBtn = document.querySelector('.finish-back-btn');

    // Game Elements
    const characterImg = document.getElementById('main-char');
    const charNameTag = document.getElementById('character-name');
    const toneBtns = document.querySelectorAll('.tone-btn');
    const tabs = document.querySelectorAll('.sidebar-tab');
    const productList = document.getElementById('product-list');
    const canvas = document.getElementById('makeup-canvas');
    const ctx = canvas.getContext('2d');

    // Finish Page Elements
    const resultView = document.getElementById('result-view');
    const confirmSaveBtn = document.getElementById('confirm-save');
    const princessNameInput = document.getElementById('princess-name-input');

    // Configuration
    const charConfigs = {
        warm: {
            lip: { x: 0.50, y: 0.53, w: 14, h: 7 },
            cheek: { lx: 0.38, rx: 0.62, y: 0.52, w: 28, h: 18 }
        },
        cool: {
            lip: { x: 0.49, y: 0.51, w: 14, h: 7 },
            cheek: { lx: 0.38, rx: 0.62, y: 0.50, w: 28, h: 18 }
        }
    };

    // State
    let currentCategory = 'face';
    let currentSubCategory = '';
    let currentTone = 'warm';
    let selectedProducts = { face: null, eye: null, lip: null, cheek: null, hair: null };
    let savedPrincesses = JSON.parse(localStorage.getItem('savedPrincesses') || '[]');

    // --- Navigation ---

    homeStartWarm.onclick = () => { setTone('warm'); startGame(); };
    homeStartCool.onclick = () => { setTone('cool'); startGame(); };
    homeViewGallery.onclick = () => { renderGallery(); galleryScreen.classList.remove('hidden'); };
    galleryBackBtn.onclick = () => { galleryScreen.classList.add('hidden'); };
    finishBackBtn.onclick = () => { finishScreen.classList.add('hidden'); };
    navHomeBtn.onclick = () => { homeScreen.classList.remove('hidden'); };

    homeReset.onclick = () => {
        if (confirm('모든 데이터를 초기화하시겠습니까?')) {
            localStorage.clear();
            location.reload();
        }
    };

    saveHeaderBtn.onclick = () => {
        showFinishPage();
    };

    confirmSaveBtn.onclick = () => {
        saveToGallery();
    };

    function startGame() {
        homeScreen.classList.add('hidden');
        selectedProducts = { face: null, eye: null, lip: null, cheek: null, hair: null };
        setTimeout(resizeCanvas, 600);
        renderProducts();
    }

    // --- Sidebar Tabs ---

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            
            if (currentCategory === 'eye') currentSubCategory = '섀도우';
            else if (currentCategory === 'lip') currentSubCategory = '틴트';
            else currentSubCategory = '';
            
            const subMenus = document.querySelectorAll('.sub-menu-list');
            subMenus.forEach(m => m.style.display = 'none');
            const nextSub = tab.nextElementSibling;
            if (nextSub && nextSub.classList.contains('sub-menu-list')) {
                nextSub.style.display = 'flex';
            }

            renderProducts();
        };
    });

    document.querySelectorAll('.sub-menu-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            currentSubCategory = item.textContent;
            renderProducts();
        };
    });

    // --- Product Rendering ---

    function renderProducts() {
        productList.innerHTML = '';
        let products = [];

        // Add "None/Clear" button first
        const clearItem = document.createElement('div');
        clearItem.className = 'palette-item';
        // Override teardrop style for clear button
        clearItem.style.borderRadius = '50%';
        clearItem.style.transform = 'none';
        clearItem.style.display = 'flex';
        clearItem.style.justifyContent = 'center';
        clearItem.style.alignItems = 'center';
        clearItem.style.background = '#f8f8f8';
        clearItem.style.border = '1px dashed #ccc';
        clearItem.innerHTML = '<span style="font-size: 24px; color: #999; line-height: 1;">✕</span>';
        clearItem.title = '지우기';
        
        if (selectedProducts[currentCategory] === null) {
            clearItem.style.borderColor = 'var(--etude-pink-dark)';
            clearItem.style.background = '#fff';
        }

        clearItem.onclick = () => {
            selectedProducts[currentCategory] = null;
            redrawAllMakeup();
            renderProducts();
        };
        productList.appendChild(clearItem);
        
        if (currentCategory === 'eye') {
            if (currentSubCategory === '아이라이너') {
                products = [{ id: 101, image: 'eyeliner1.png', color: '#000000' }, { id: 102, image: 'eyeliner2.png', color: '#4B3621' }];
            } else if (currentSubCategory === '마스카라') {
                products = [
                    { id: 201, image: 'mascara1.png' }, { id: 202, image: 'mascara2.png' },
                    { id: 203, image: 'mascara3.png' }, { id: 204, image: 'mascara4.png' },
                    { id: 205, image: 'mascara5.png' }
                ];
            } else {
                products = [
                    { id: 1, image: 'palette_eye1.png' }, { id: 2, image: 'palette_eye2.png' },
                    { id: 3, image: 'palette_eye3.png' }, { id: 4, image: 'palette_eye4.png' },
                    { id: 5, image: 'palette_eye5.png' }
                ];
            }
        } else if (currentCategory === 'lip') {
            if (currentSubCategory === '립밤') {
                products = [
                    { id: 301, image: 'lipbalm1.png', color: '#FCE4D6' },
                    { id: 302, image: 'lipbalm2.png', color: '#FCE4D6' }
                ];
            } else {
                products = [
                    { id: 1, color: '#FF4D4D', name: '레드 틴트' }, 
                    { id: 2, color: '#FF8EAA', name: '핑크 틴트' }, 
                    { id: 3, color: '#E63946', name: '레드 립스틱' }
                ];
            }
        } else if (currentCategory === 'cheek') {
            products = [
                { id: 1, image: 'palette_eye1.png', color: '#FFB7C5' }, 
                { id: 2, image: 'palette_eye2.png', color: '#FADADD' }
            ];
        } else {
            products = [{ id: 1, color: '#FFB7C5' }, { id: 2, color: '#FF8EAA' }];
        }

        products.forEach(prod => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            if (prod.image) item.style.backgroundImage = `url(${prod.image})`;
            else item.style.backgroundColor = prod.color;
            if (selectedProducts[currentCategory]?.id === prod.id) item.classList.add('selected');

            item.onclick = () => {
                selectedProducts[currentCategory] = prod;
                redrawAllMakeup();
                renderProducts();
            };
            productList.appendChild(item);
        });
    }

    // --- Game Logic ---

    function setTone(tone) {
        currentTone = tone;
        characterImg.style.opacity = '0';
        setTimeout(() => {
            characterImg.src = tone === 'warm' ? 'warm_char.png' : 'cool_char.png';
            characterImg.style.opacity = '1';
            charNameTag.textContent = tone === 'warm' ? '디어 (WARM DEAR)' : '픽시 (COOL PIXIE)';
            toneBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.classList.contains(tone)) btn.classList.add('active');
            });
            redrawAllMakeup();
        }, 300);
    }

    function resizeCanvas() {
        const rect = characterImg.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawAllMakeup();
    }

    function redrawAllMakeup(targetCtx = ctx, targetCanvas = canvas) {
        if (!targetCanvas.width) return;
        targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        if (selectedProducts.cheek) drawFacePart(selectedProducts.cheek.color || '#FFB7C5', 'cheek', targetCtx, targetCanvas);
        if (selectedProducts.lip) drawFacePart(selectedProducts.lip.color || '#FF4D4D', 'lip', targetCtx, targetCanvas);
    }

    function drawFacePart(color, part, targetCtx, targetCanvas) {
        const config = charConfigs[currentTone][part];
        targetCtx.save();
        targetCtx.fillStyle = color + '99';
        if (part === 'lip') {
            targetCtx.beginPath();
            targetCtx.ellipse(targetCanvas.width * config.x, targetCanvas.height * config.y, config.w, config.h, 0, 0, Math.PI * 2);
            targetCtx.fill();
        } else if (part === 'cheek') {
            targetCtx.filter = 'blur(12px)';
            targetCtx.beginPath();
            targetCtx.ellipse(targetCanvas.width * config.lx, targetCanvas.height * config.y, config.w, config.h, 0, 0, Math.PI * 2);
            targetCtx.ellipse(targetCanvas.width * config.rx, targetCanvas.height * config.y, config.w, config.h, 0, 0, Math.PI * 2);
            targetCtx.fill();
        }
        targetCtx.restore();
    }

    // AI Styling
    const aiStylingBtn = document.querySelector('.btn-ai');
    if (aiStylingBtn) {
        aiStylingBtn.onclick = () => {
            const look = {
                lip: { id: 2, color: '#FF8EAA', name: '핑크 틴트' },
                cheek: { id: 1, image: 'palette_eye1.png', color: '#FFB7C5' }
            };
            selectedProducts.lip = look.lip;
            selectedProducts.cheek = look.cheek;
            redrawAllMakeup();
            renderProducts();
            
            aiStylingBtn.textContent = '적용 완료 ✨';
            setTimeout(() => { aiStylingBtn.textContent = 'AI 스타일링'; }, 2000);
        };
    }

    // --- Finish & Save Logic ---

    function showFinishPage() {
        finishScreen.classList.remove('hidden');
        resultView.innerHTML = `
            <img id="finish-char-img" src="${currentTone === 'warm' ? 'warm_char.png' : 'cool_char.png'}">
            <canvas id="finish-canvas"></canvas>
        `;
        
        const fCanvas = document.getElementById('finish-canvas');
        const fCtx = fCanvas.getContext('2d');
        
        setTimeout(() => {
            fCanvas.width = 240;
            fCanvas.height = 340;
            redrawAllMakeup(fCtx, fCanvas);
        }, 200);
    }

    const postSaveActions = document.getElementById('post-save-actions');
    const goMakeupBtn = document.getElementById('go-makeup');
    const goHomeBtn = document.getElementById('go-home');

    function saveToGallery() {
        const nameInput = document.getElementById('princess-name-input');
        const name = nameInput.value || '에뛰드 프린세스';
        const finishImg = document.getElementById('finish-char-img');
        
        if (!finishImg) return;

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 240;
        thumbCanvas.height = 340;
        const tCtx = thumbCanvas.getContext('2d');
        
        tCtx.drawImage(finishImg, 0, 0, 240, 340);
        redrawAllMakeup(tCtx, thumbCanvas);
        
        try {
            let thumbUrl = "";
            try {
                thumbUrl = thumbCanvas.toDataURL('image/png');
            } catch (e) {
                console.warn("Canvas Tainting detected. Using fallback placeholder.");
                thumbUrl = "logo_circle.png"; // Fallback thumbnail
            }
            
            const princessData = {
                id: Date.now(),
                name: name,
                tone: currentTone,
                thumb: thumbUrl,
                products: JSON.parse(JSON.stringify(selectedProducts))
            };
            
            savedPrincesses.push(princessData);
            localStorage.setItem('savedPrincesses', JSON.stringify(savedPrincesses));
            
            // Success Feedback
            confirmSaveBtn.textContent = '저장 완료 ✓';
            confirmSaveBtn.style.background = '#4CAF50';
            postSaveActions.classList.remove('hidden');
            
            // Show Invitation (Triggered even if canvas tainting happened)
            const invitationScreen = document.getElementById('invitation-screen');
            invitationScreen.classList.remove('hidden');
            document.getElementById('close-invitation').onclick = () => {
                invitationScreen.classList.add('hidden');
            };
            
            renderGallery();
        } catch (e) {
            console.error("Critical save error", e);
            confirmSaveBtn.textContent = '저장 실패';
        }
    }

    goMakeupBtn.onclick = () => {
        resetFinishScreen();
        finishScreen.classList.add('hidden');
    };

    goHomeBtn.onclick = () => {
        resetFinishScreen();
        finishScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
    };

    function resetFinishScreen() {
        confirmSaveBtn.textContent = '갤러리에 저장하기';
        confirmSaveBtn.style.background = 'linear-gradient(90deg, #FF5A8D, #FF8EAA)';
        confirmSaveBtn.style.display = 'block';
        postSaveActions.classList.add('hidden');
        princessNameInput.disabled = false;
        princessNameInput.value = '에뛰드 프린세스';
    }

    // Update finishBackBtn to use reset
    finishBackBtn.onclick = () => {
        resetFinishScreen();
        finishScreen.classList.add('hidden');
    };

    // --- Gallery Logic ---

    function renderGallery() {
        const list = document.getElementById('gallery-list');
        const empty = document.getElementById('gallery-empty');
        if (!list) return;
        
        list.innerHTML = '';
        savedPrincesses = JSON.parse(localStorage.getItem('savedPrincesses') || '[]');
        
        if (savedPrincesses.length === 0) {
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            savedPrincesses.forEach(p => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.onclick = () => viewSavedPrincess(p);
                item.innerHTML = `
                    <img src="${p.thumb}" class="gallery-thumb">
                    <div class="gallery-name">${p.name}</div>
                `;
                list.appendChild(item);
            });
        }
    }

    function viewSavedPrincess(p) {
        finishScreen.classList.remove('hidden');
        resultView.innerHTML = `
            <img src="${p.tone === 'warm' ? 'warm_char.png' : 'cool_char.png'}">
            <canvas id="finish-canvas"></canvas>
        `;
        princessNameInput.value = p.name;
        princessNameInput.disabled = true;
        confirmSaveBtn.style.display = 'none';
        
        const fCanvas = document.getElementById('finish-canvas');
        const fCtx = fCanvas.getContext('2d');
        
        setTimeout(() => {
            fCanvas.width = 240;
            fCanvas.height = 340;
            
            const originalProducts = { ...selectedProducts };
            const originalTone = currentTone;
            
            selectedProducts = p.products;
            currentTone = p.tone;
            
            redrawAllMakeup(fCtx, fCanvas);
            
            selectedProducts = originalProducts;
            currentTone = originalTone;
        }, 150);

        finishBackBtn.onclick = () => {
            finishScreen.classList.add('hidden');
            princessNameInput.disabled = false;
            confirmSaveBtn.style.display = 'block';
        };
    }

    toneBtns.forEach(btn => {
        btn.onclick = () => setTone(btn.classList.contains('warm') ? 'warm' : 'cool');
    });

    window.addEventListener('resize', resizeCanvas);
    homeScreen.classList.remove('hidden');
    renderGallery(); // Initial load
});
