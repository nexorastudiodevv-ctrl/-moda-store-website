/**
 * MODA Store - Main JS
 * تم كتابة الكود بطريقة دفاعية لمنع توقف الصفحة في حال غياب بعض العناصر
 */

// --- الدوال المساعدة العامة (تعريفها في المستوى الأعلى لتكون متاحة لجميع الكتل) ---

function updateCartCountDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistCountDisplay() {
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        const wishlist = getWishlist();
        wishlistCountElement.textContent = wishlist.length;
    }
}

function isProductInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
}

function updateWishlistButtonState(buttonElement, productId) {
    if (buttonElement) {
        if (isProductInWishlist(productId)) {
            buttonElement.classList.add('active');
        } else {
            buttonElement.classList.remove('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // تحديث العدادات عند جاهزية الـ DOM
    updateCartCountDisplay();
    updateWishlistCountDisplay();

    // --- 1. القائمة الجانبية (Mobile Menu) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const sideMenu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.side-menu-overlay');

    if (menuToggle && sideMenu && overlay) {
        const toggleMenu = () => {
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : '';
        };

        menuToggle.addEventListener('click', toggleMenu);
        if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // --- 2. وضع الليلي (Dark Mode) ---
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        // التحقق من التفضيل المحفوظ
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeBtn.textContent = '☀️';
        }

        darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            darkModeBtn.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // --- 3. السلايدر (Hero Slider) ---
    let slideIndex = 1;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length > 0) {
        const showSlides = (n) => {
            if (n > slides.length) slideIndex = 1;
            if (n < 1) slideIndex = slides.length;
            
            slides.forEach(s => s.style.display = "none");
            dots.forEach(d => d.classList.remove('active'));
            
            slides[slideIndex - 1].style.display = "block";
            if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add('active');
        };

        // تعريف الدوال عالمياً لأن الـ HTML يستخدم onclick
        window.changeSlide = (n) => showSlides(slideIndex += n);
        window.currentSlide = (n) => showSlides(slideIndex = n);

        showSlides(slideIndex);
        
        // تغيير تلقائي كل 5 ثواني
        setInterval(() => window.changeSlide(1), 5000);
    }

    // --- 4. نظام التحميل المتأخر المطور (Enhanced Lazy Loading) ---
    // يشمل الصور العادية، صور الخلفية، والفيديوهات
    const lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // التعامل مع صور الخلفية (data-bg)
                if (target.dataset.bg) {
                    target.style.backgroundImage = `url(${target.dataset.bg})`;
                }

                // التعامل مع الفيديوهات
                if (target.tagName === 'VIDEO') {
                    target.load(); // يبدأ تحميل الفيديو فقط عند الظهور
                }

                target.classList.add('loaded');
                observer.unobserve(target); // التوقف عن مراقبة العنصر بعد تحميله
            }
        });
    }, { rootMargin: '50px' }); // التحميل قبل الوصول للعنصر بـ 50 بكسل

    const lazyElements = document.querySelectorAll('img[loading="lazy"], .lazy-bg, video[preload="none"]');
    lazyElements.forEach(el => {
        lazyObserver.observe(el);
        // إضافة كلاس loaded للصور المحملة مسبقاً (Cache)
        if (el.tagName === 'IMG' && el.complete) el.classList.add('loaded');
        else el.addEventListener('load', () => el.classList.add('loaded'));
    });

    // --- 5. التحكم في معرض صور المنتج (Product Gallery) ---
    // هذا القسم يتعامل مع تفاعل الصور المصغرة لكروت المنتجات في صفحات الشبكة (index.html, products.html)
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const cardThumbs = card.querySelectorAll('.thumb-item');
        const cardMainImg = card.querySelector('.main-card-img');
        const gallery = card.querySelector('.product-image-gallery');

        // تحديث حالة زر المفضلة لكروت المنتجات
        const wishlistBtn = card.querySelector('.wishlist-btn');
        const productDataForCard = {
            id: card.dataset.productId || card.querySelector('h3').textContent, // استخدام ID إذا كان موجودًا، وإلا الاسم
            name: card.querySelector('h3').textContent,
            price: card.querySelector('.price').textContent,
            image: cardMainImg ? cardMainImg.src : '',
        };
        if (wishlistBtn) {
            updateWishlistButtonState(wishlistBtn, productDataForCard.id);
        }

        // تفعيل السلايدر المصغر عند تمرير الفأرة (Hover Slider)
        if (cardMainImg && cardThumbs.length > 1 && gallery) {
            // إنشاء نقاط التنقل برمجياً بناءً على عدد الصور
            const pagination = document.createElement('div');
            pagination.className = 'image-pagination';
            
            const images = Array.from(cardThumbs).map(t => t.src);
            const dots = [];

            images.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'pagination-dot' + (i === 0 ? ' active' : '');
                pagination.appendChild(dot);
                dots.push(dot);
            });
            gallery.appendChild(pagination);

            // منطق حساب تقسيم الصورة وتغييرها
            gallery.addEventListener('mousemove', (e) => {
                // تجاهل الحركة إذا كانت فوق شريط الصور المصغرة السفلي
                if (e.target.closest('.thumb-bar')) return;

                const rect = gallery.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const index = Math.floor((x / rect.width) * images.length);
                const safeIndex = Math.max(0, Math.min(index, images.length - 1));

                cardMainImg.src = images[safeIndex];
                
                // تحديث النقطة النشطة
                dots.forEach((d, i) => d.classList.toggle('active', i === safeIndex));
            });

            // إعادة الصورة للأصل عند خروج الفأرة
            gallery.addEventListener('mouseleave', () => {
                cardMainImg.src = images[0];
                dots.forEach((d, i) => d.classList.toggle('active', i === 0));
            });
        }

        // تفعيل أزرار الإضافة السريعة للسلة
        const quickAddButtons = card.querySelectorAll('.quick-add-btn');
        quickAddButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // منع الانتقال لصفحة التفاصيل عند النقر على الزر
                const product = {
                    id: card.dataset.productId || card.querySelector('h3').textContent,
                    name: card.querySelector('h3').textContent,
                    price: parseInt(card.querySelector('.price').textContent.replace(/[^0-9]/g, '')),
                    image: cardMainImg ? cardMainImg.src : '',
                    quantity: 1
                };
                
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.findIndex(item => item.id === product.id);
                if (existing > -1) cart[existing].quantity += 1;
                else cart.push(product);
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCountDisplay();
                alert('تمت إضافة المنتج للسلة بنجاح!');
            });
        });
    });

    // --- 6. تأثير الزووم في صفحة التفاصيل ---
    const detailImg = document.getElementById('main-product-img');
    if (detailImg) {
        detailImg.addEventListener('click', () => {
            detailImg.classList.toggle('zoomed');
        });
    }

    // --- 7. نموذج التواصل ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('form-feedback').style.display = 'block';
            contactForm.reset();
        });
    }

    // --- 15. تأثير النبض عند التمرير (Scroll Pulse Effect) ---
    if (productCards.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };
        const productCardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        productCards.forEach(card => {
            productCardObserver.observe(card);
        });
    }

    // --- 10. منطق صفحة تفاصيل المنتج (Dynamic Product Details) ---
    const productLinks = document.querySelectorAll('.product-card .btn-small');
    productLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const mainImageSrc = card.querySelector('.main-card-img').src;
            const thumbImages = Array.from(card.querySelectorAll('.thumb-item')).map(img => img.src);
            const uniqueThumbImages = thumbImages.filter(src => src !== mainImageSrc);
            const allImages = [mainImageSrc, ...uniqueThumbImages];
            const productData = {
                id: card.dataset.productId || card.querySelector('h3').textContent,
                name: card.querySelector('h3').textContent,
                price: card.querySelector('.price').textContent,
                images: allImages,
                category: card.dataset.gender ? `القسم: ${card.dataset.gender} - ${card.dataset.category || ''}` : 'القسم: ملابس',
                sizes: card.dataset.size ? card.dataset.size.split(',') : ['M', 'L', 'XL'],
                colors: card.dataset.color ? card.dataset.color.split(',') : ['أسود'],
                desc: "خامة عالية الجودة مريحة جداً للاستخدام اليومي، تصميم عصري يناسب جميع الأذواق."
            };
            localStorage.setItem('selectedProduct', JSON.stringify(productData));
        });
    });

    if (window.location.pathname.includes('product-detail.html')) {
        const product = JSON.parse(localStorage.getItem('selectedProduct'));
        if (product) {
            const nameEl = document.getElementById('main-product-name');
            const priceEl = document.getElementById('main-product-price');
            const mainProductImgEl = document.getElementById('main-product-img');
            const descEl = document.getElementById('main-product-desc');
            const categoryEl = document.getElementById('main-product-category');
            const sizesContainer = document.getElementById('product-sizes-container');
            const colorsContainer = document.getElementById('product-colors-container');
            const detailWishlistBtn = document.getElementById('detail-wishlist-btn');
            const productDetailThumbBar = document.querySelector('.product-detail-thumb-bar');
            if (nameEl) nameEl.textContent = product.name;
            if (priceEl) priceEl.textContent = product.price;
            if (descEl) descEl.textContent = product.desc;
            if (categoryEl) categoryEl.textContent = product.category;
            if (detailWishlistBtn) {
                updateWishlistButtonState(detailWishlistBtn, product.id);
            }
            if (mainProductImgEl && product.images && product.images.length > 0) {
                mainProductImgEl.src = product.images[0];
                if (productDetailThumbBar) {
                    productDetailThumbBar.innerHTML = product.images.map((imgSrc, index) => 
                        `<img src="${imgSrc}" class="thumb-item ${index === 0 ? 'active' : ''}" alt="Product thumbnail ${index + 1}">`
                    ).join('');
                    const detailThumbs = productDetailThumbBar.querySelectorAll('.thumb-item');
                    detailThumbs.forEach(thumb => {
                        thumb.addEventListener('click', function() {
                            mainProductImgEl.src = this.src;
                            detailThumbs.forEach(t => t.classList.remove('active'));
                            this.classList.add('active');
                        });
                    });
                }
            }
            if (sizesContainer) {
                sizesContainer.innerHTML = product.sizes.map(size => `<div class="size-chip">${size}</div>`).join('');
            }
            if (colorsContainer) {
                colorsContainer.innerHTML = product.colors.map(color => `<div class="size-chip">${color}</div>`).join('');
            }
            const chips = document.querySelectorAll('.size-chip');
            chips.forEach(chip => {
                chip.addEventListener('click', function() {
                    const siblings = this.parentElement.querySelectorAll('.size-chip');
                    siblings.forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
    }

    // --- 8. إدارة سلة المشتريات (Cart Management) ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn && window.location.pathname.includes('product-detail.html')) {
        addToCartBtn.addEventListener('click', () => {
            const nameEl = document.getElementById('main-product-name');
            const priceEl = document.getElementById('main-product-price');
            const currentMainImgEl = document.getElementById('main-product-img');
            const selectedProductData = JSON.parse(localStorage.getItem('selectedProduct'));
            const product = {
                id: selectedProductData ? selectedProductData.id : Date.now(),
                name: nameEl ? nameEl.textContent : 'منتج بدون اسم',
                price: priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) : 0,
                image: currentMainImgEl ? currentMainImgEl.src : '',
                quantity: 1
            };
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push(product);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplay();
            alert('تم إضافة المنتج إلى السلة بنجاح!');
            window.location.href = 'cart.html';
        });
    }

    const cartTableBody = document.getElementById('cart-items-body');
    if (cartTableBody) {
        renderCart();
    }

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalAmountEl = document.getElementById('cart-total-amount');
        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center;">السلة فارغة حالياً</td></tr>';
            if (totalAmountEl) totalAmountEl.textContent = '0';
            return;
        }
        let html = '';
        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <tr>
                    <td class="product-cell">
                        <img src="${item.image}" alt="${item.name}">
                        <span>${item.name}</span>
                    </td>
                    <td class="cart-quantity-cell">
                        <div class="cart-quantity-controls">
                            <button onclick="updateQuantity(${index}, -1)" class="cart-quantity-btn">-</button>
                            <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" class="cart-quantity-btn">+</button>
                        </div>
                    </td>
                    <td>${itemTotal} جنيه</td>
                    <td>
                        <button onclick="removeFromCart(${index})" class="cart-remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        cartTableBody.innerHTML = html;
        if (totalAmountEl) totalAmountEl.textContent = total;
    }

    window.removeFromCart = (index) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCountDisplay();
        renderCart();
    };

    window.updateQuantity = (index, delta) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity < 1) cart[index].quantity = 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplay();
            renderCart();
        }
    };

    window.toggleWishlist = (productData) => {
        let wishlist = getWishlist();
        const existingProductIndex = wishlist.findIndex(item => item.id === productData.id);
        let added;
        if (existingProductIndex > -1) {
            wishlist.splice(existingProductIndex, 1);
            added = false;
            alert('تمت إزالة المنتج من قائمة الأمنيات.');
        } else {
            wishlist.push(productData);
            added = true;
            alert('تمت إضافة المنتج إلى قائمة الأمنيات.');
        }
        saveWishlist(wishlist);
        updateWishlistCountDisplay();
        return added;
    };

    const wishlistButtons = document.querySelectorAll('.product-card .wishlist-btn');
    wishlistButtons.forEach(btn => {
        const card = btn.closest('.product-card');
        const productData = {
            id: card.dataset.productId || card.querySelector('h3').textContent,
            name: card.querySelector('h3').textContent,
            price: card.querySelector('.price').textContent,
            image: card.querySelector('.main-card-img').src,
        };
        updateWishlistButtonState(btn, productData.id);
        btn.addEventListener('click', () => {
            const added = window.toggleWishlist(productData);
            btn.classList.toggle('active', added);
        });
    });

    const detailWishlistBtn = document.getElementById('detail-wishlist-btn');
    if (detailWishlistBtn && window.location.pathname.includes('product-detail.html')) {
        detailWishlistBtn.addEventListener('click', () => {
            const product = JSON.parse(localStorage.getItem('selectedProduct'));
            if (product) {
                const added = window.toggleWishlist(product);
                detailWishlistBtn.classList.toggle('active', added);
            }
        });
    }

    const wishlistGrid = document.getElementById('wishlist-items-grid');
    if (wishlistGrid && window.location.pathname.includes('wishlist.html')) {
        const wishlist = getWishlist();
        if (wishlist.length === 0) {
            wishlistGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 20px;">قائمة الأمنيات فارغة حالياً.</p>';
        } else {
            wishlistGrid.innerHTML = wishlist.map(item => `
                <div class="product-card">
                    <button class="wishlist-btn active" onclick="window.toggleWishlist({id: '${item.id}', name: '${item.name}', price: '${item.price}', image: '${item.image}'}); this.closest('.product-card').remove();">❤</button>
                    <img src="${item.image}" class="main-card-img" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price}</p>
                    <a href="product-detail.html" class="btn-small" onclick="localStorage.setItem('selectedProduct', JSON.stringify({id: '${item.id}', name: '${item.name}', price: '${item.price}', images: ['${item.image}'], category: '', sizes: [], colors: [], desc: ''}))">عرض التفاصيل</a>
                </div>`).join('');
        }
    }

    // --- 12. فلترة المنتجات في صفحة products.html ---
    const productsPage = document.getElementById('products-listing');
    if (productsPage) {
        const productGrid = productsPage.querySelector('.product-grid');
        const allProductCards = Array.from(productsPage.querySelectorAll('.product-card'));
        let productsData = [];
        allProductCards.forEach(card => {
            const mainImageSrc = card.querySelector('.main-card-img') ? card.querySelector('.main-card-img').src : '';
            const thumbImages = Array.from(card.querySelectorAll('.thumb-item')).map(img => img.src);
            const uniqueThumbImages = thumbImages.filter(src => src !== mainImageSrc);
            const allImages = [mainImageSrc, ...uniqueThumbImages];
            productsData.push({
                element: card,
                id: card.dataset.productId || card.querySelector('h3').textContent,
                name: card.querySelector('h3').textContent,
                price: parseInt(card.dataset.price),
                gender: card.dataset.gender,
                category: card.dataset.category,
                sizes: card.dataset.size ? card.dataset.size.split(',') : [],
                colors: card.dataset.color ? card.dataset.color.split(',') : [],
                images: allImages,
                isNew: card.dataset.new === 'true'
            });
        });

        const filterCheckboxes = document.querySelectorAll('.filter-check');
        const filterSizeBoxes = document.querySelectorAll('.filter-size');
        const filterColorSwatches = document.querySelectorAll('.filter-color');
        const priceSlider = document.getElementById('price-slider');
        const priceLimitVal = document.getElementById('price-limit-val');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const activeChipsContainer = document.getElementById('active-chips');

        if (priceSlider && priceLimitVal) {
            priceLimitVal.textContent = `${priceSlider.value} جنيه`;
            priceSlider.addEventListener('input', () => {
                priceLimitVal.textContent = `${priceSlider.value} جنيه`;
            });
        }

        const applyFilters = () => {
            const activeFilters = {
                gender: [],
                category: [],
                size: [],
                color: [],
                price: parseInt(priceSlider ? priceSlider.value : 2000)
            };
            filterCheckboxes.forEach(checkbox => {
                if (checkbox.checked) activeFilters[checkbox.dataset.type].push(checkbox.value);
            });
            filterSizeBoxes.forEach(box => {
                if (box.classList.contains('active')) activeFilters.size.push(box.dataset.size);
            });
            filterColorSwatches.forEach(swatch => {
                if (swatch.classList.contains('active')) activeFilters.color.push(swatch.dataset.color);
            });
            const filteredProducts = productsData.filter(product => {
                const matchesGender = activeFilters.gender.length === 0 || activeFilters.gender.includes(product.gender);
                const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(product.category);
                const matchesSize = activeFilters.size.length === 0 || product.sizes.some(size => activeFilters.size.includes(size));
                const matchesColor = activeFilters.color.length === 0 || product.colors.some(color => activeFilters.color.includes(color));
                const matchesPrice = product.price <= activeFilters.price;
                return matchesGender && matchesCategory && matchesSize && matchesColor && matchesPrice;
            });
            productGrid.innerHTML = '';
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 20px;">لا توجد منتجات مطابقة للفلاتر المختارة.</p>';
            } else {
                filteredProducts.forEach(product => productGrid.appendChild(product.element));
            }
            updateActiveChipsDisplay(activeFilters);
        };

        const updateActiveChipsDisplay = (filters) => {
            activeChipsContainer.innerHTML = '';
            const chips = [];
            Object.keys(filters).forEach(key => {
                if (key === 'price') {
                    if (filters.price < parseInt(priceSlider.max)) {
                        chips.push({ type: 'price', value: `${filters.price} جنيه`, display: `السعر: حتى ${filters.price} جنيه` });
                    }
                } else {
                    filters[key].forEach(value => {
                        chips.push({ type: key, value: value, display: `${key === 'gender' ? 'النوع' : key === 'category' ? 'الفئة' : key === 'size' ? 'المقاس' : 'اللون'}: ${value}` });
                    });
                }
            });
            chips.forEach(chipData => {
                const chip = document.createElement('div');
                chip.classList.add('chip');
                chip.innerHTML = `${chipData.display} <i class="fas fa-times-circle"></i>`;
                chip.addEventListener('click', () => {
                    if (chipData.type === 'price') {
                        priceSlider.value = priceSlider.max;
                        priceLimitVal.textContent = `${priceSlider.max} جنيه`;
                    } else if (chipData.type === 'gender' || chipData.type === 'category') {
                        document.querySelector(`.filter-check[data-type="${chipData.type}"][value="${chipData.value}"]`).checked = false;
                    } else if (chipData.type === 'size') {
                        document.querySelector(`.filter-size[data-size="${chipData.value}"]`).classList.remove('active');
                    } else if (chipData.type === 'color') {
                        document.querySelector(`.filter-color[data-color="${chipData.value}"]`).classList.remove('active');
                    }
                    applyFilters();
                });
                activeChipsContainer.appendChild(chip);
            });
        };
        filterCheckboxes.forEach(checkbox => checkbox.addEventListener('change', applyFilters));
        filterSizeBoxes.forEach(box => box.addEventListener('click', () => {
            box.classList.toggle('active');
            applyFilters();
        }));
        filterColorSwatches.forEach(swatch => swatch.addEventListener('click', () => {
            swatch.classList.toggle('active');
            applyFilters();
        }));
        if (priceSlider) priceSlider.addEventListener('change', applyFilters);
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyFilters);
        applyFilters();
    }

    // --- 13. زر العودة للأعلى (Scroll to Top Button) ---
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 14. إتمام الطلب عبر واتساب (Checkout to WhatsApp) ---
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        const shippingRates = { 'cairo': 30, 'giza': 35, 'alex': 50, 'others': 70 };
        const govSelect = document.getElementById('customer-governorate');
        const subtotalEl = document.getElementById('subtotal-amount');
        const shippingEl = document.getElementById('shipping-amount');
        const finalTotalEl = document.getElementById('final-total-amount');
        const updateSummary = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = govSelect ? (shippingRates[govSelect.value] || 0) : 0;
            if(subtotalEl) subtotalEl.textContent = subtotal;
            if(shippingEl) shippingEl.textContent = shipping;
            if(finalTotalEl) finalTotalEl.textContent = subtotal + shipping;
        };
        if (govSelect) {
            updateSummary();
            govSelect.addEventListener('change', updateSummary);
        }
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const address = document.getElementById('customer-address').value;
            const governorate = govSelect ? govSelect.options[govSelect.selectedIndex].text : '';
            const shippingCost = govSelect ? (shippingRates[govSelect.value] || 0) : 0;
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('سلة المشتريات فارغة!');
                return;
            }
            let message = `*طلب جديد من متجر مودة (MODA Store)*\n\n*البيانات الشخصية:*\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n📍 المحافظة: ${governorate}\n🏠 العنوان: ${address}\n\n*المنتجات المطلوبة:*\n`;
            let subtotal = 0;
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                message += `${index + 1}. ${item.name} (الكمية: ${item.quantity} × ${item.price} ج) = ${itemTotal} ج\n`;
            });
            message += `\n💵 المجموع: ${subtotal} ج\n📦 الشحن: ${shippingCost} ج\n*💰 الإجمالي: ${subtotal + shippingCost} ج*`;
            const shopWhatsApp = '201234567890';
            window.open(`https://wa.me/${shopWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
            localStorage.removeItem('cart');
            alert('تم التوجيه إلى واتساب!');
            window.location.href = 'index.html';
        });
    }
});