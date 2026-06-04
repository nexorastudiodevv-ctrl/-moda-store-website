let slideIndex = 1;
let touchStartX = 0;
let touchEndX = 0;

function showSlides(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    slides[slideIndex - 1].style.display = "flex";
    if (dots.length > 0) {
        dots[slideIndex - 1].classList.add("active");
    }
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function handleGesture() {
    // إذا كانت المسافة المقطوعة أكبر من 50 بكسل، نعتبرها سحبة (Swipe)
    if (touchEndX < touchStartX - 50) {
        // سحب لليسار: عرض الشريحة التالية (في اتجاه القراءة العربي)
        changeSlide(1);
    }
    if (touchEndX > touchStartX + 50) {
        // سحب لليمين: عرض الشريحة السابقة
        changeSlide(-1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("تم تحميل متجر MODA بنجاح!");

    // منطق الظهور التدريجي للصور
    const applyFadeIn = (imgList) => {
        imgList.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                img.addEventListener('error', () => {
                    img.classList.add('loaded');
                });
            }
        });
    };

    applyFadeIn(document.querySelectorAll('img'));

    showSlides(slideIndex);

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, { passive: true });
    }

    // تغيير السلايد تلقائياً كل 5 ثوانٍ
    setInterval(() => {
        changeSlide(1);
    }, 5000);

    // Drawer Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.side-menu-overlay');
    const closeMenu = document.querySelector('.close-menu');

    if (menuToggle && sideMenu && overlay && closeMenu) {
        const toggleMenu = () => {
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : '';
        };

        menuToggle.addEventListener('click', toggleMenu);
        closeMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        // غلق القائمة عند النقر على أي رابط بداخلها
        sideMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (sideMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // Zoom effect for product detail image on long press (mobile)
    const mainProductImg = document.getElementById('main-product-img');
    if (mainProductImg) {
        let longPressTimer;
        let isLongPress = false;
        let isZoomed = false;
        const longPressThreshold = 500; // milliseconds for long press
        const moveThreshold = 10; // pixels for touchmove to cancel long press

        let initialTouchX = 0;
        let initialTouchY = 0;

        const toggleZoom = (clientX, clientY) => {
            isZoomed = !isZoomed;
            mainProductImg.classList.toggle('zoomed', isZoomed);

            if (isZoomed) {
                const imgRect = mainProductImg.getBoundingClientRect();
                const x = clientX - imgRect.left;
                const y = clientY - imgRect.top;

                const xPercent = (x / imgRect.width) * 100;
                const yPercent = (y / imgRect.height) * 100;

                mainProductImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            } else {
                mainProductImg.style.transformOrigin = 'center center'; // Reset origin
            }
        };

        mainProductImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) { // Only consider single touch for long press
                initialTouchX = e.touches[0].clientX;
                initialTouchY = e.touches[0].clientY;
                isLongPress = false; // Reset flag
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    e.preventDefault(); // Prevent default context menu on long press
                    toggleZoom(initialTouchX, initialTouchY);
                }, longPressThreshold);
            }
        }, { passive: false }); // Use passive: false to allow preventDefault

        mainProductImg.addEventListener('touchmove', (e) => {
            if (longPressTimer && !isZoomed) { // If not yet zoomed, check for movement to cancel long press
                const currentTouchX = e.touches[0].clientX;
                const currentTouchY = e.touches[0].clientY;
                const distanceMoved = Math.sqrt(
                    Math.pow(currentTouchX - initialTouchX, 2) +
                    Math.pow(currentTouchY - initialTouchY, 2)
                );

                if (distanceMoved > moveThreshold) {
                    clearTimeout(longPressTimer);
                    isLongPress = false; // User is scrolling, not long pressing
                }
            } else if (isZoomed && e.touches.length === 1) { // If zoomed, pan the image with touchmove
                e.preventDefault(); // Prevent scrolling while panning zoomed image
                toggleZoom(e.touches[0].clientX, e.touches[0].clientY); // Update origin to pan
            }
        }, { passive: false });

        mainProductImg.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
            if (!isLongPress && isZoomed) { // If it was a short tap (not a long press) and already zoomed, unzoom
                toggleZoom(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
            isLongPress = false; // Reset for next interaction
        });
    }
    // --- Wishlist System ---
    let wishlist = JSON.parse(localStorage.getItem('moda_wishlist')) || [];

    const updateWishlistUI = () => {
        // تحديث العداد في الهيدر
        const countElem = document.getElementById('wishlist-count');
        if (countElem) countElem.textContent = wishlist.length;

        // مزامنة حالة الأزرار في الصفحة
        document.querySelectorAll('.wishlist-btn, #detail-wishlist-btn').forEach(btn => {
            let name = "";
            if (btn.id === 'detail-wishlist-btn') {
                name = document.getElementById('main-product-name')?.textContent;
            } else {
                name = btn.closest('.product-card')?.querySelector('h3')?.textContent;
            }

            if (name && wishlist.some(item => item.name === name)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    const toggleWishlist = (product) => {
        const index = wishlist.findIndex(item => item.name === product.name);
        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(product);
        }
        localStorage.setItem('moda_wishlist', JSON.stringify(wishlist));
        updateWishlistUI();
    };

    // حقن أزرار المفضلة في كروت المنتجات تلقائياً
    const injectWishlistButtons = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            if (!card.querySelector('.wishlist-btn')) {
                const btn = document.createElement('button');
                btn.className = 'wishlist-btn';
                btn.innerHTML = '❤';
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const name = card.querySelector('h3').textContent;
                    const price = card.querySelector('.price').textContent;
                    const img = card.querySelector('img').src;
                    toggleWishlist({ name, price, img });
                };
                card.appendChild(btn);
            }
        });
    };

    // --- نظام نقل بيانات المنتجات ديناميكياً ---

    // 1. تحديث الروابط في صفحات القوائم (Home & Products)
    const updateProductLinks = () => {
        injectWishlistButtons(); // حقن الأزرار أولاً
        const productCardsInListing = document.querySelectorAll('.product-card');
        productCardsInListing.forEach(card => {
            const link = card.querySelector('.btn-small');
            if (link && link.getAttribute('href').includes('product-detail.html')) {
                const name = card.querySelector('h3').textContent.trim();
                const price = card.querySelector('.price').textContent.trim();
                const imgSrc = card.querySelector('.main-card-img')?.src || card.querySelector('img:not(.thumb-item)').src;
                const sizes = card.dataset.size || '';
                const color = card.dataset.color || '';
                const gender = card.dataset.gender || '';
                // Determine category programmatically based on keywords in the name
                const category = (name.includes("حذاء") || name.includes("بوت") || name.includes("سنيكرز") || name.includes("صندل") || name.includes("سليبر")) ? "أحذية" : "ملابس";

                const detailUrl = `product-detail.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(imgSrc)}&sizes=${encodeURIComponent(sizes)}&color=${encodeURIComponent(color)}&category=${encodeURIComponent(category)}&gender=${encodeURIComponent(gender)}`;
                link.setAttribute('href', detailUrl);
            }
        });
    };

    // --- منطق تبديل الصور في الجاليري المصغر داخل الكارت ---
    const handleThumbInteraction = (e) => {
        if (e.target.classList.contains('thumb-item')) {
            const card = e.target.closest('.product-card');
            const mainImg = card.querySelector('.main-card-img');
            const link = card.querySelector('.btn-small');

            if (mainImg && link) {
                // تحديث الصورة الرئيسية
                mainImg.src = e.target.src;

                // تحديث الكلاس النشط (Active)
                card.querySelectorAll('.thumb-item').forEach(thumb => thumb.classList.remove('active'));
                e.target.classList.add('active');

                // تحديث رابط صفحة التفاصيل ديناميكياً ليشمل الصورة الجديدة
                const name = card.querySelector('h3').textContent.trim();
                const price = card.querySelector('.price').textContent.trim();
                const sizes = card.dataset.size || '';
                const color = card.dataset.color || '';
                const category = (name.includes("حذاء") || name.includes("بوت") || name.includes("سنيكرز") || name.includes("صندل") || name.includes("سليبر")) ? "أحذية" : "ملابس";

                const detailUrl = `product-detail.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(e.target.src)}&sizes=${encodeURIComponent(sizes)}&color=${encodeURIComponent(color)}&category=${encodeURIComponent(category)}`;
                link.setAttribute('href', detailUrl);
            }
        }
    };

    document.addEventListener('mouseover', handleThumbInteraction);
    document.addEventListener('click', handleThumbInteraction);

    // 2. توليد المنتجات ذات الصلة في صفحة التفاصيل
    const relatedGrid = document.getElementById('related-products-grid');
    if (relatedGrid) {
        const relatedData = [
            { name: "قميص كلاسيك أبيض", price: "450 جنيه", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500", size: "M,L,XL", color: "أبيض", category: "ملابس" },
            { name: "بنطال جينز أزرق", price: "550 جنيه", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", size: "L,XL", color: "أزرق", category: "ملابس" },
            { name: "حذاء رياضي عصري", price: "890 جنيه", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", size: "42,43", color: "أحمر", category: "أحذية" },
            { name: "فستان سهرة أبيض", price: "600 جنيه", img: "https://images.unsplash.com/photo-1539008835757-c68c7d09b3e7?w=500", size: "S,M", color: "أبيض", category: "ملابس" }
        ];

        relatedData.forEach(prod => {
            const prodCard = document.createElement('div');
            prodCard.className = 'product-card';
            prodCard.dataset.size = prod.size;
            prodCard.dataset.color = prod.color;
            prodCard.dataset.category = prod.category;
            prodCard.innerHTML = `
                <img src="${prod.img}" alt="${prod.name}" loading="lazy">
                <h3>${prod.name}</h3>
                <p class="price">${prod.price}</p>
                <a href="product-detail.html" class="btn-small">عرض التفاصيل</a>
            `;
            relatedGrid.appendChild(prodCard);
        });

        // تطبيق تأثير الظهور للصور الجديدة وتحديث روابطها
        applyFadeIn(relatedGrid.querySelectorAll('img'));
    }

    // تشغيل تحديث الروابط
    // updateProductLinks(); // This will be called by updateMasterFilter

    // 3. استقبال البيانات في صفحة التفاصيل
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('name')) {
        const nameElem = document.getElementById('main-product-name');
        const priceElem = document.getElementById('main-product-price');
        const imgElem = document.getElementById('main-product-img');
        const categoryElem = document.getElementById('main-product-category');
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        const sizesContainer = document.getElementById('product-sizes-container');
        const colorsContainer = document.getElementById('product-colors-container');

        if (nameElem) nameElem.textContent = urlParams.get('name');
        if (priceElem) priceElem.textContent = urlParams.get('price');

        if (imgElem) {
            imgElem.onload = () => imgElem.classList.add('loaded');
            imgElem.classList.remove('loaded'); // إخفاء الصورة القديمة مؤقتاً
            imgElem.src = urlParams.get('img');
        }

        if (categoryElem) {
            const gender = urlParams.get('gender') || '';
            const category = urlParams.get('category') || '';
            categoryElem.textContent = `القسم: ${category} ${gender ? `(${gender})` : ''}`;
        }

        // Update description based on category
        const descElem = document.getElementById('main-product-desc');
        if (descElem) {
            const category = urlParams.get('category');
            if (category === "أحذية") {
                descElem.textContent = `هذا الـ ${urlParams.get('name')} مصمم هندسياً ليوفر أقصى درجات الراحة والدعم للقدمين أثناء المشي والوقوف لفترات طويلة مع نعل مرن عالي الجودة.`;
            } else if (category === "ملابس") {
                descElem.textContent = `هذا الـ ${urlParams.get('name')} مصنوع من أجود أنواع الأقمشة الناعمة والأنسجة العالمية لضمان التهوية الجيدة والراحة التامة مع مظهر عصري أنيق.`;
            } else { // Default description
                descElem.textContent = `هذا الـ ${urlParams.get('name')} مصنوع من خامات عالية الجودة لضمان الراحة والأناقة الدائمة.`;
            }
        }

        // Update JSON-LD for product details dynamically
        if (jsonLdScript) {
            const productData = JSON.parse(jsonLdScript.textContent);
            productData.name = urlParams.get('name');
            productData.image = [urlParams.get('img')];
            productData.description = descElem.textContent; // Use the dynamically generated description
            if (productData.offers) {
                productData.offers.price = parseFloat(urlParams.get('price').replace(' جنيه', ''));
                productData.offers.url = window.location.href; // Current URL
            } else {
                descElem.textContent = `هذا الـ ${urlParams.get('name')} مصنوع من خامات عالية الجودة لضمان الراحة والأناقة الدائمة.`;
            }
        }

        // تعبئة المقاسات المتاحة للمنتج
        if (sizesContainer && urlParams.has('sizes')) {
            sizesContainer.innerHTML = '';
            const sizes = urlParams.get('sizes').split(',');
            sizes.forEach(s => {
                if (s.trim()) {
                    const btn = document.createElement('div');
                    btn.className = 'size-btn';
                    btn.textContent = s.trim();
                    sizesContainer.appendChild(btn);
                }
            });
        }

        // تعبئة اللون المتاح للمنتج
        if (colorsContainer && urlParams.has('color')) {
            colorsContainer.innerHTML = '';
            const color = urlParams.get('color').trim();
            if (color) {
                const btn = document.createElement('div');
                btn.className = 'size-btn';
                btn.textContent = color;
                if (color === 'أسود') { btn.style.background = '#000'; btn.style.color = '#fff'; }
                if (color === 'أبيض') { btn.style.background = '#fff'; btn.style.border = '1px solid #ddd'; }
                if (color === 'أزرق') { btn.style.background = '#1a73e8'; btn.style.color = '#fff'; }
                colorsContainer.appendChild(btn);
            }
        }
    }

    // Setup wishlist button in product detail page
    const detailWishBtn = document.getElementById('detail-wishlist-btn');
    if (detailWishBtn) {
        detailWishBtn.onclick = () => {
            const name = document.getElementById('main-product-name').textContent;
            const price = document.getElementById('main-product-price').textContent;
            const img = document.getElementById('main-product-img').src;
            toggleWishlist({ name, price, img });
        };
    }

    // --- Unified Smart Filter and Display System ---
    const filters = {
        search: '',
        sort: 'default',
        gender: [],
        category: [],
        color: [],
        size: [],
        price: 2000
    };

    const productCards = document.querySelectorAll('.product-card'); // All product cards
    const productsListing = document.getElementById('products-listing');

    const updateMasterFilter = () => {
        if (!productsListing) return; // لا يعمل إلا في صفحة المنتجات

        const sectionsProducts = { 'mens-section': [], 'womens-section': [] };
        let totalVisible = 0;

        productCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const brand = card.querySelector('.brand-name')?.textContent.toLowerCase() || '';
            const price = parseFloat(card.dataset.price);
            const gender = card.dataset.gender;
            const category = card.dataset.category;
            const color = card.dataset.color;
            const sizes = (card.dataset.size || '').split(',');

            const matchesSearch = name.includes(filters.search) || brand.includes(filters.search);
            const matchesPrice = price <= filters.price;
            const matchesGender = filters.gender.length === 0 || filters.gender.includes(gender);
            const matchesCategory = filters.category.length === 0 || filters.category.includes(category);
            const matchesColor = filters.color.length === 0 || filters.color.includes(color);
            const matchesSize = filters.size.length === 0 || filters.size.some(s => sizes.includes(s));

            const isVisible = matchesSearch && matchesPrice && matchesGender && matchesCategory && matchesColor && matchesSize;
            card.style.display = isVisible ? 'block' : 'none';

            if (isVisible) {
                totalVisible++;
                const sectionId = card.closest('section')?.id;
                if (sectionId && sectionsProducts[sectionId]) {
                    sectionsProducts[sectionId].push(card);
                }
            }
        });

        // Sorting Logic
        for (const id in sectionsProducts) {
            const list = sectionsProducts[id];
            if (filters.sort !== 'default') {
                list.sort((a, b) => {
                    const pA = parseFloat(a.dataset.price);
                    const pB = parseFloat(b.dataset.price);
                    return filters.sort === 'price-asc' ? pA - pB : pB - pA;
                });
                const grid = document.querySelector(`#${id} .product-grid`);
                if (grid) { grid.innerHTML = ''; list.forEach(c => grid.appendChild(c)); }
            }
            // Update Counts
            const section = document.getElementById(id);
            if (section) {
                section.style.display = list.length > 0 ? 'block' : 'none';
            }
        }

        updateFilterCountsUI(); // Update counts after filtering

        const noRes = document.getElementById('no-results-msg');
        if (noRes) noRes.style.display = totalVisible === 0 ? 'block' : 'none';

        renderChips();
        updateProductLinks();
    };

    const renderChips = () => {
        const container = document.getElementById('active-chips');
        if (!container) return;
        container.innerHTML = '';
        ['gender', 'category', 'color', 'size'].forEach(type => {
            filters[type].forEach(val => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.innerHTML = `${val} ✕`;
                chip.onclick = () => {
                    filters[type] = filters[type].filter(v => v !== val);
                    syncUIWithFilters();
                    updateMasterFilter();
                };
                container.appendChild(chip);
            });
        });
    };

    // Function to update filter counts in the UI
    const updateFilterCountsUI = () => {
        const currentVisibleProducts = Array.from(productCards).filter(card => card.style.display !== 'none');
        const counts = { 'القسم': {}, 'الفئة': {}, 'اللون': {}, 'المقاس': {} };

        currentVisibleProducts.forEach(card => {
            const gender = card.dataset.gender;
            if (gender) counts['القسم'][gender] = (counts['القسم'][gender] || 0) + 1;

            const category = card.dataset.category;
            if (category) counts['الفئة'][category] = (counts['الفئة'][category] || 0) + 1;

            const color = card.dataset.color;
            if (color) counts['اللون'][color] = (counts['اللون'][color] || 0) + 1;

            const sizes = card.dataset.size ? card.dataset.size.split(',') : [];
            sizes.forEach(size => {
                const s = size.trim();
                if (s) counts['المقاس'][s] = (counts['المقاس'][s] || 0) + 1;
            });
        });

        document.querySelectorAll('.filter-group').forEach(group => {
            const h4 = group.querySelector('h4');
            if (!h4) return;
            const groupName = h4.textContent.trim();

            group.querySelectorAll('input[type="checkbox"]').forEach(input => {
                const value = input.value.trim();
                const count = counts[groupName][value] || 0;
                let span = input.closest('label').querySelector('.filter-count');
                if (!span) { span = document.createElement('span'); span.className = 'filter-count'; input.closest('label').appendChild(span); }
                span.textContent = ` (${count})`;
            });
            group.querySelectorAll('.filter-color, .filter-size').forEach(el => {
                const value = el.dataset.color || el.dataset.size;
                const count = counts[groupName][value] || 0;
                let span = el.querySelector('.filter-count');
                if (!span) { span = document.createElement('span'); span.className = 'filter-count'; el.appendChild(span); }
                span.textContent = ` (${count})`;
            });
        });
    };

    const syncUIWithFilters = () => {
        document.querySelectorAll('.filter-check').forEach(cb => cb.checked = filters[cb.dataset.type].includes(cb.value));
        document.querySelectorAll('.filter-color').forEach(sw => sw.classList.toggle('active', filters.color.includes(sw.dataset.color)));
        document.querySelectorAll('.filter-size').forEach(sz => sz.classList.toggle('active', filters.size.includes(sz.dataset.size)));
        const slider = document.getElementById('price-slider');
        if (slider) { slider.value = filters.price; document.getElementById('price-limit-val').textContent = `${filters.price} ج.م`; }
    };

    // Event Listeners for Filters
    document.querySelectorAll('.filter-check').forEach(cb => cb.addEventListener('change', e => {
        const val = e.target.value;
        const type = e.target.dataset.type;
        filters[type] = e.target.checked ? [...filters[type], val] : filters[type].filter(v => v !== val);
        updateMasterFilter();
    }));

    document.querySelectorAll('.filter-color').forEach(sw => sw.addEventListener('click', e => {
        // Prevent event from bubbling up to parent elements that might have other click handlers
        e.stopPropagation();
        const c = sw.dataset.color;
        const isActive = sw.classList.contains('active');
        if (isActive) {
            filters.color = filters.color.filter(v => v !== c);
        } else {
            filters.color.push(c);
        }
        updateMasterFilter(); // This will call syncUIWithFilters which toggles active class
    }));


    document.querySelectorAll('.filter-size').forEach(sz => sz.addEventListener('click', () => {
        const s = sz.dataset.size;
        filters.size = filters.size.includes(s) ? filters.size.filter(v => v !== s) : [...filters.size, s];
        sz.classList.toggle('active');
        updateMasterFilter();
    }));

    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) priceSlider.addEventListener('input', (e) => {
        filters.price = parseInt(e.target.value);
        document.getElementById('price-limit-val').textContent = `${filters.price} ج.م`;
        updateMasterFilter();
    });

    // وظيفة Debounce لمنع تكرار التنفيذ الثقيل مع كل نقرة زر أو حرف
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const searchInp = document.getElementById('search-input');
    if (searchInp) searchInp.addEventListener('input', debounce((e) => { filters.search = e.target.value.toLowerCase(); updateMasterFilter(); }, 300));

    const sortSel = document.getElementById('sort-select');
    if (sortSel) sortSel.addEventListener('change', (e) => { filters.sort = e.target.value; updateMasterFilter(); });

    // Handle URL Parameters (Smart Navigation from Home and initial filter application)
    const params = new URLSearchParams(window.location.search);
    if (params.has('category') && !filters.category.includes(params.get('category'))) filters.category.push(params.get('category'));
    if (params.has('gender') && !filters.gender.includes(params.get('gender'))) filters.gender.push(params.get('gender'));

    // Initial sync and filter application
    syncUIWithFilters();
    updateMasterFilter();

    // --- Dark Mode System ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        if (localStorage.getItem('dark-mode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️'; // Set initial icon
        }
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', isDark ? 'enabled' : 'disabled');
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // هنا يمكن إضافة كود لإرسال البيانات للخادم
            contactForm.style.display = 'none';
            formFeedback.style.display = 'block';
            console.log("Contact Form Submitted");
        });
    }

    updateWishlistUI();
});