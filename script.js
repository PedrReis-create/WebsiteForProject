// --- Product Database ---
const products = [
    {
        id: 'robo-buddy-x1',
        name: 'Robo-Buddy X1',
        category: 'Companion',
        price: 899.99,
        rating: 4.8,
        description: 'A friendly AI-powered companion designed to communicate, assist and interact with its owner.',
        image: 'assets/robot.png' // Manteve o robô principal
    },
    {
        id: 'atlas-home',
        name: 'Atlas Home',
        category: 'Home',
        price: 1299.00,
        rating: 4.9,
        description: 'Heavy-duty household helper capable of automated cleaning and smart management.',
        image: 'assets/atlas.png' // MUDOU AQUI
    },
    {
        id: 'neo-assistant',
        name: 'Neo Assistant',
        category: 'Assistant',
        price: 749.50,
        rating: 4.7,
        description: 'Sleek desk companion designed to manage schedules, calls, and digital tasks.',
        image: 'assets/neo.png' // MUDOU AQUI
    },
    {
        id: 'companion-s2',
        name: 'Companion S2',
        category: 'Companion',
        price: 950.00,
        rating: 4.6,
        description: 'Advanced emotional support robot with real-time biometric response.',
        image: 'assets/companion-s2.png' // MUDOU AQUI
    },
    {
        id: 'guardian-mini',
        name: 'Guardian Mini',
        category: 'Security',
        price: 599.99,
        rating: 4.8,
        description: 'Autonomous security drone unit with encrypted live thermal feed.',
        image: 'assets/guardian.png' // MUDOU AQUI
    },
    {
        id: 'nova-ai',
        name: 'Nova AI',
        category: 'Assistant',
        price: 1100.00,
        rating: 4.9,
        description: 'Next-gen conversational AI terminal integrated into a mobile chassis.',
        image: 'assets/nova.png' // MUDOU AQUI
    }
];

// --- Voice Data & Speech Synthesis API ---
const voicePhrases = {
    friendly: "Hello! I'm Robo-Buddy. It's nice to meet you.",
    professional: "Hello. I am Robo-Buddy X1. How may I assist you today?",
    robotic: "SYSTEM ONLINE. ROBO-BUDDY X1 READY.",
    calm: "Hello. I'm here whenever you need me."
};

let selectedVoiceType = 'Friendly';
const synth = window.speechSynthesis;

function speakPhrase(type) {
    if (!synth) {
        console.warn('Speech synthesis not supported in this browser.');
        return;
    }

    // Cancel active voice playback
    synth.cancel();

    const text = voicePhrases[type];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    // Voice tone customization based on persona
    if (type === 'friendly') {
        utterance.pitch = 1.2;
        utterance.rate = 1.0;
    } else if (type === 'professional') {
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
    } else if (type === 'robotic') {
        utterance.pitch = 0.5;
        utterance.rate = 0.8;
    } else if (type === 'calm') {
        utterance.pitch = 1.0;
        utterance.rate = 0.85;
    }

    synth.speak(utterance);
}

// --- Cart State ---
let cart = [];

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Modals & Buttons
    const voiceModal = document.getElementById('voice-modal');
    const openVoiceModalBtn = document.getElementById('open-voice-modal-btn');
    const closeVoiceModalBtn = document.getElementById('close-voice-modal');
    const playVoiceBtns = document.querySelectorAll('.play-voice-btn');
    const voiceCards = document.querySelectorAll('.voice-card');
    const voiceStatus = document.getElementById('voice-status');

    const purchaseModal = document.getElementById('purchase-modal');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    const checkoutStep1 = document.getElementById('checkout-step-1');
    const checkoutStepLoading = document.getElementById('checkout-step-loading');
    const checkoutStepSuccess = document.getElementById('checkout-step-success');
    const summaryVoiceText = document.getElementById('summary-voice');
    const orderIdText = document.getElementById('order-id-text');

    // Cart Elements
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    // --- Render Catalog Products ---
    function renderProducts(items) {
        productGrid.innerHTML = '';
        if (items.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }
        noResults.classList.add('hidden');

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-card-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-card-img">
                </div>
                <span class="product-card-category">${product.category}</span>
                <h3 class="product-card-title">${product.name}</h3>
                <p class="product-card-desc">${product.description}</p>
                <div class="product-card-footer">
                    <span class="product-card-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-secondary view-product-btn" data-id="${product.id}">VIEW PRODUCT</button>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Add Listeners to VIEW PRODUCT Buttons
        document.querySelectorAll('.view-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const spotlight = document.getElementById('featured');
                spotlight.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    renderProducts(products);

    // --- Filtering System ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            if (filter === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filter);
                renderProducts(filtered);
            }
        });
    });

    // --- Search Functionality ---
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    }

    searchInput.addEventListener('input', handleSearch);

    // --- Voice Modal System ---
    openVoiceModalBtn.addEventListener('click', () => {
        voiceModal.classList.remove('hidden');
    });

    closeVoiceModalBtn.addEventListener('click', () => {
        voiceModal.classList.add('hidden');
        if (synth) synth.cancel();
    });

    playVoiceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const voiceType = btn.getAttribute('data-type');
            
            // Highlight selected voice card
            voiceCards.forEach(card => card.classList.remove('selected'));
            const selectedCard = btn.closest('.voice-card');
            selectedCard.classList.add('selected');

            // Set global active voice label
            selectedVoiceType = voiceType.charAt(0).toUpperCase() + voiceType.slice(1);
            
            // Play Audio
            speakPhrase(voiceType);

            // Show selected badge
            voiceStatus.classList.remove('hidden');
        });
    });

    // --- Purchase System ---
    buyNowBtn.addEventListener('click', () => {
        // Automatically add Robo-Buddy X1 to cart state
        addToCart(products[0]);
        
        // Prepare purchase modal
        summaryVoiceText.textContent = `${selectedVoiceType}`;
        checkoutStep1.classList.remove('hidden');
        checkoutStepLoading.classList.add('hidden');
        checkoutStepSuccess.classList.add('hidden');
        purchaseModal.classList.remove('hidden');
    });

    cancelPurchaseBtn.addEventListener('click', () => {
        purchaseModal.classList.add('hidden');
    });

    confirmPurchaseBtn.addEventListener('click', () => {
        // Step 1 -> Loading
        checkoutStep1.classList.add('hidden');
        checkoutStepLoading.classList.remove('hidden');

        // Generate Random Fake Order ID
        const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
        orderIdText.textContent = `#RBT-${randomOrderNum}`;

        // Simulate API/Processing Network Delay
        setTimeout(() => {
            checkoutStepLoading.classList.add('hidden');
            checkoutStepSuccess.classList.remove('hidden');
        }, 2000);
    });

    closeSuccessBtn.addEventListener('click', () => {
        purchaseModal.classList.add('hidden');
    });

    // Close modals when clicking outside content area
    window.addEventListener('click', (e) => {
        if (e.target === voiceModal) {
            voiceModal.classList.add('hidden');
            if (synth) synth.cancel();
        }
        if (e.target === purchaseModal) purchaseModal.classList.add('hidden');
    });

    // --- Shopping Cart Drawer Implementation ---
    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                </div>
                <strong>$${itemTotal.toFixed(2)}</strong>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });

        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    function toggleCart(open) {
        if (open) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.remove('hidden');
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.add('hidden');
        }
    }

    cartBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    cartCheckoutBtn.addEventListener('click', () => {
        toggleCart(false);
        buyNowBtn.click();
    });
});