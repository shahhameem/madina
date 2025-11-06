/*
 * JAVASCRIPT FOR MADINA CHEMISTS WEBSITE
 * This file contains logic for:
 * 1. Order Form (WhatsApp and Email)
 * * Note: The homepage carousel is powered by Bootstrap's
 * data-bs- attributes and does not require custom JS.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ======== ORDER FORM LOGIC ========
    const orderForm = document.getElementById('order-form');
    
    // Check if we are on a page with the order form
    if (orderForm) {
        
        // **IMPORTANT**: Set your pharmacy's numbers here
        const PHARMACY_WHATSAPP_NUMBER = "919682586995"; // Use country code (e.g., 91 for India)
        const PHARMACY_EMAIL = "your-email@example.com";

        const whatsappBtn = document.getElementById('whatsapp-btn');
        const emailBtn = document.getElementById('email-btn');

        // --- Handle WhatsApp Submission (using the 'submit' event) ---
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the form from submitting normally
            
            // Get form data
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const medicines = document.getElementById('medicines').value;

            // Simple validation
            if (!name || !phone) {
                alert("Please fill in your Name and WhatsApp Number.");
                return;
            }

            // Format the WhatsApp message
            // Using '*' for bold in WhatsApp
            let message = `*New Order from Madina Chemists Website*\n\n`;
            message += `*Customer Name:* ${name}\n`;
            message += `*Contact Number:* ${phone}\n\n`;
            message += `*Order Details:*\n`;
            message += `${medicines || "Prescription uploaded (please check)"}\n\n`;
            message += `Please confirm this order.`;

            // URL-encode the message
            const encodedMessage = encodeURIComponent(message);
            
            // Create the WhatsApp click-to-chat URL
            const whatsappURL = `https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encodedMessage}`;

            // Open WhatsApp in a new tab
            window.open(whatsappURL, '_blank');
        });

        // --- Handle Email Submission (using the 'click' event) ---
        emailBtn.addEventListener('click', () => {
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const medicines = document.getElementById('medicines').value;

            // Simple validation
            if (!name) {
                alert("Please fill in your Name.");
                return;
            }
            
            // Format the Email subject and body
            const subject = `New Medicine Order from ${name}`;
            
            let body = `New Order from Madina Chemists Website\n\n`;
            body += `Customer Name: ${name}\n`;
            body += `Contact Email: ${email || "Not provided"}\n\n`;
            body += `Order Details:\n`;
            body += `${medicines || "Customer may have uploaded a prescription."}\n\n`;
            
            // URL-encode subject and body
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);

            // Create the 'mailto:' link
            // This will open the user's default email client
            const mailtoURL = `mailto:${PHARMACY_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

            // Trigger the email client
            window.location.href = mailtoURL;
        });
    }

});