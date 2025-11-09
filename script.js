/*
 * JAVASCRIPT FOR MADINA CHEMISTS WEBSITE
 * This file contains logic for:
 * 1. Shopping Cart (localStorage)
 * 2. Fetching & Displaying Medicines from JSON
 * 3. Order Form (WhatsApp and Email)
 */

document.addEventListener('DOMContentLoaded', () => {

    // Global variable to hold all medicine data from JSON
    let allMedicines = [];

    // --- Core Cart Logic ---
    
    // Load cart from localStorage or initialize as empty array
    const loadCart = () => {
        const cartJson = localStorage.getItem('madinaCart');
        return cartJson ? JSON.parse(cartJson) : [];
    };

    // Save cart to localStorage
    const saveCart = (cart) => {
        localStorage.setItem('madinaCart', JSON.stringify(cart));
    };

    // Add to Cart
    const addToCart = (medicineId) => {
        let cart = loadCart();
        
        // Find the medicine details from our global 'allMedicines' list
        const medicineToAdd = allMedicines.find(m => m.id === parseInt(medicineId));
        if (!medicineToAdd) {
            console.error("Medicine not found!");
            return;
        }

        // Check if item is already in cart
        const existingItem = cart.find(item => item.id === medicineToAdd.id);

        if (existingItem) {
            existingItem.quantity += 1; // Increase quantity
        } else {
            // Add new item with quantity 1
            cart.push({ ...medicineToAdd, quantity: 1 });
        }

        saveCart(cart);
        updateCartUI(); // Update navbar badge
        showToast(`${medicineToAdd.name} added to cart!`); // Show confirmation
    };

    // Update Cart Quantity
    const updateCartQuantity = (medicineId, newQuantity) => {
        let cart = loadCart();
        const item = cart.find(item => item.id === medicineId);

        if (item) {
            if (newQuantity < 1) {
                // If quantity is 0 or less, remove it
                removeFromCart(medicineId);
            } else {
                item.quantity = newQuantity;
                saveCart(cart);
            }
        }
        
        renderCartModal(); // Re-render the modal body
        updateCartUI(); // Update navbar badge
    };

    // Remove from Cart
    const removeFromCart = (medicineId) => {
        let cart = loadCart();
        const updatedCart = cart.filter(item => item.id !== medicineId);
        
        saveCart(updatedCart);
        renderCartModal(); // Re-render the modal body
        updateCartUI(); // Update navbar badge
    };

    // Get Cart Total Price
    const getCartTotal = () => {
        const cart = loadCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Clear Cart
    const clearCart = () => {
        saveCart([]); // Save an empty array
        renderCartModal();
        updateCartUI();
    };

    // --- UI Rendering ---

    // Update Cart Badge in Navbar
    const updateCartUI = () => {
        const cart = loadCart();
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 0) {
                cartButton.innerHTML = `
                    Cart <span class="badge bg-light text-primary rounded-pill">${totalItems}</span>
                `;
            } else {
                cartButton.innerHTML = `Cart`;
            }
        }
    };

    // Render Items inside the Cart Modal
    const renderCartModal = () => {
        const cart = loadCart();
        const cartItemsList = document.getElementById('cartItemsList');
        const cartTotalEl = document.getElementById('cartTotal');

        if (!cartItemsList) return;

        // Clear old list
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="text-center text-muted">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemHtml = `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="my-0">${item.name}</h6>
                            <small class="text-muted">Price: ₹${item.price.toFixed(2)}</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <input 
                                type="number" 
                                class="form-control form-control-sm cart-quantity-input" 
                                value="${item.quantity}" 
                                min="1" 
                                data-id="${item.id}"
                                style="width: 60px; margin-right: 10px;">
                            <button class="btn btn-sm btn-outline-danger btn-remove-item" data-id="${item.id}">&times;</button>
                        </div>
                    </li>
                `;
                cartItemsList.innerHTML += itemHtml;
            });
        }

        // Update total
        cartTotalEl.textContent = `₹${getCartTotal().toFixed(2)}`;

        // Add event listeners for new buttons/inputs
        addModalEventListeners();
    };

    // Show a simple toast notification
    const showToast = (message) => {
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast show aero-card bg-primary text-white';
            toast.role = 'alert';
            toast.ariaLive = 'assertive';
            toast.ariaAtomic = 'true';
            toast.innerHTML = `<div class="toast-body">${message}</div>`;
            
            toastContainer.appendChild(toast);

            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }
    };


    // --- Event Listeners ---

    // Add listeners for buttons *inside* the modal (uses event delegation)
    const addModalEventListeners = () => {
        const cartItemsList = document.getElementById('cartItemsList');
        if (!cartItemsList) return;

        cartItemsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-item')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(id);
            }
        });

        cartItemsList.addEventListener('change', (e) => {
            if (e.target.classList.contains('cart-quantity-input')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const newQuantity = parseInt(e.target.value);
                updateCartQuantity(id, newQuantity);
            }
        });

        // Listener for "Clear Cart" button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
    };

    // Generate text summary for the order
    const generateOrderSummary = () => {
        const cart = loadCart();
        if (cart.length === 0) return "No items in cart.";

        let summary = "Order Summary:\n\n";
        cart.forEach(item => {
            summary += `${item.quantity} x ${item.name} (@ ₹${item.price.toFixed(2)} each)\n`;
        });
        
        summary += `\n*Total Price: ₹${getCartTotal().toFixed(2)}*`;
        return summary;
    };


    // --- Page-Specific Logic ---

    // == MEDICINES PAGE (medicines.html) ==
    const medicinesListContainer = document.getElementById('medicines-list');
    const categoryFilter = document.getElementById('category-filter');

    if (medicinesListContainer) {
        // Fetch and display medicines
        fetch('https://cdn.jsdelivr.net/gh/shahhameem/madina/medicines.json')
            .then(response => response.json())
            .then(data => {
                allMedicines = data; // Store all medicines globally
                populateCategories(data);
                renderMedicines(data);
            })
            .catch(error => {
                console.error("Error fetching medicines:", error);
                medicinesListContainer.innerHTML = "<p class='text-danger'>Could not load medicines. Please try again later.</p>";
            });

        // Function to render medicines to the page
        const renderMedicines = (medicines) => {
            medicinesListContainer.innerHTML = ''; // Clear existing
            if (medicines.length === 0) {
                medicinesListContainer.innerHTML = "<p>No medicines found for this category.</p>";
                return;
            }

            medicines.forEach(med => {
                const cardHtml = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card h-100 aero-card">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${med.name}</h5>
                                <h6 class="card-subtitle mb-2 text-primary">₹${med.price.toFixed(2)}</h6>
                                <p class="card-text"><small>${med.description}</small></p>
                                <p class="card-text"><span class="badge bg-light text-dark">${med.category}</span></p>
                                <button class="btn btn-primary mt-auto add-to-cart-btn" data-id="${med.id}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                medicinesListContainer.innerHTML += cardHtml;
            });
        };

        // Populate category filter dropdown
        const populateCategories = (medicines) => {
            const categories = ['All', ...new Set(medicines.map(m => m.category))];
            categoryFilter.innerHTML = '';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
            });
        };

        // Add event listener for category filter
        categoryFilter.addEventListener('change', () => {
            const selectedCategory = categoryFilter.value;
            if (selectedCategory === 'All') {
                renderMedicines(allMedicines);
            } else {
                const filteredMedicines = allMedicines.filter(m => m.category === selectedCategory);
                renderMedicines(filteredMedicines);
            }
        });

        // Add event listener for "Add to Cart" buttons (using delegation)
        medicinesListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const id = e.target.getAttribute('data-id');
                addToCart(id);
            }
        });
    }

    // == ORDER PAGE (order.html) ==
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        // **IMPORTANT**: Set your pharmacy's numbers here
        const PHARMACY_WHATSAPP_NUMBER = "919682586995"; // Use country code
        const PHARMACY_EMAIL = "your-email@example.com";

        const cartSummaryContainer = document.getElementById('cart-summary');
        const cart = loadCart();

        if (cart.length === 0) {
            // If cart is empty, hide form and show message
            cartSummaryContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    Your cart is empty. Please <a href="medicines.html" class="alert-link">add some medicines</a> to your cart before placing an order.
                </div>
            `;
            orderForm.style.display = 'none'; // Hide the form
        } else {
            // If cart has items, render the summary
            let summaryHtml = '<h4 class="mb-3">Your Order</h4><ul class="list-group mb-3">';
            cart.forEach(item => {
                summaryHtml += `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>${item.quantity} x ${item.name}</span>
                        <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
                    </li>
                `;
            });
            summaryHtml += `
                <li class="list-group-item d-flex justify-content-between bg-light">
                    <span>Total (INR)</span>
                    <strong>₹${getCartTotal().toFixed(2)}</strong>
                </li>
            </ul>`;
            cartSummaryContainer.innerHTML = summaryHtml;
        }

        // --- Handle WhatsApp Submission ---
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            if (!name || !phone) {
                alert("Please fill in your Name and WhatsApp Number.");
                return;
            }

            const orderSummary = generateOrderSummary();
            
            let message = `*New Order from Madina Chemists Website*\n\n`;
            message += `*Customer Name:* ${name}\n`;
            message += `*Contact Number:* ${phone}\n\n`;
            message += `${orderSummary}`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
        });

        // --- Handle Email Submission ---
        const emailBtn = document.getElementById('email-btn');
        emailBtn.addEventListener('click', () => {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            if (!name) {
                alert("Please fill in your Name.");
                return;
            }

            const orderSummary = generateOrderSummary();
            
            const subject = `New Medicine Order from ${name}`;
            let body = `New Order from Madina Chemists Website\n\n`;
            body += `Customer Name: ${name}\n`;
            body += `Contact Email: ${email || "Not provided"}\n\n`;
            body += `--------------------\n`;
            body += `${orderSummary.replace(/\*/g, '')}`; // Remove bold markers for email
            body += `\n--------------------`;
            
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const mailtoURL = `mailto:${PHARMACY_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
            window.location.href = mailtoURL;
        });
    }

    // --- Global Init ---
    updateCartUI(); // Update cart badge on every page load
    // Add listener to open the modal
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', renderCartModal);
    }

});