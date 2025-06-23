document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const selectEvent = document.getElementById('select-event');
    const discountCodeInput = document.getElementById('discount-code');
    const eTransferDetails = document.getElementById('e-transfer-details');
    const finalAmountEl = document.getElementById('final-amount');
    const confirmationCodeEl = document.getElementById('confirmation-code');
    const teamMembersContainer = document.getElementById('team-members-container');

    let tournaments = [];
    let selectedEvent = null;
    let currentDiscount = 0;
    // Generate confirmation code ONCE on page load
    const confirmationCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    if (confirmationCodeEl) confirmationCodeEl.textContent = confirmationCode;

    // Fetch tournament data
    fetch('assets/tournaments.json')
        .then(response => response.json())
        .then(data => {
            tournaments = data.tournaments;
            if (selectEvent) populateEventsDropdown();
            // Autofill event if event id is in URL
            const params = new URLSearchParams(window.location.search);
            const eventId = parseInt(params.get('event'));
            if (eventId && selectEvent) {
                // Wait for dropdown to populate
                setTimeout(() => {
                    selectEvent.value = eventId;
                    selectEvent.dispatchEvent(new Event('change'));
                }, 0);
            }
        });

    function populateEventsDropdown() {
        tournaments.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${event.entryFee}`;
            selectEvent.appendChild(option);
        });
    }

    function updatePrice() {
        if (!selectedEvent) return;
        const basePrice = parseFloat(selectedEvent.entryFee.replace('$', ''));
        const discountedPrice = basePrice * (1 - currentDiscount);
        if (finalAmountEl) finalAmountEl.textContent = `$${discountedPrice.toFixed(2)}`;
        if (eTransferDetails) eTransferDetails.style.display = 'block';
    }

    // URLs for backends (with CORS proxy)
    const spinnerCodesBackendURL = "https://corsfix-test-bitter-hill-8907.angocompetitive.workers.dev/?url=" + encodeURIComponent("https://script.google.com/macros/s/AKfycbxIZdHrBA5Ir2tKNjJM01f6zSiejFJLO3RxWVIW-lZY3lnAwSb_HEq7RSYeBWeT-x0Xhg/exec");
    const registrationsBackendURL = "https://corsfix-test-bitter-hill-8907.angocompetitive.workers.dev/?url=" + encodeURIComponent("https://script.google.com/macros/s/AKfycbxEHStMp5X3ZWwItXNGoAxbZfPqxhFsjbQUxc5Zc9o3QU7_Y3X4cuRV10X8Eys8v3-I/exec");

    async function validateDiscountCode(code, email) {
        if (!code) return { valid: false };
        try {
            const res = await fetch(spinnerCodesBackendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'validateCodeForRegistration', code, email })
            });
            const data = await res.json();
            if (data.error) {
                return { valid: false, error: data.error };
            }
            return { valid: true, discount: data.discount };
        } catch (err) {
            return { valid: false, error: 'Network error' };
        }
    }

    async function checkDiscountCode(code, email) {
        if (!code) return { valid: false };
        try {
            const res = await fetch(spinnerCodesBackendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkCodeForRegistration', code, email })
            });
            const data = await res.json();
            if (data.error) {
                return { valid: false, error: data.error };
            }
            return { valid: true, discount: data.discount };
        } catch (err) {
            return { valid: false, error: 'Network error' };
        }
    }

    if (selectEvent) {
        selectEvent.addEventListener('change', () => {
            const eventId = parseInt(selectEvent.value);
            selectedEvent = tournaments.find(t => t.id === eventId);
            currentDiscount = 0;
            if (discountCodeInput) discountCodeInput.value = '';
            updatePrice();
        });
    }

    // Reusable function to check and apply discount code
    async function handleDiscountCodeCheck() {
        const code = discountCodeInput.value.trim().toUpperCase();
        const userEmail = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
        if (!code) {
            currentDiscount = 0;
            updatePrice();
            return;
        }
        const result = await checkDiscountCode(code, userEmail);
        if (result.valid) {
            currentDiscount = parseFloat(result.discount) / 100;
            alert(`Applied a ${result.discount}% discount!`);
        } else {
            currentDiscount = 0;
            alert(result.error || 'Invalid promo code.');
        }
        updatePrice();
    }

    // Prevent Enter key in discount code input from submitting the form
    if (discountCodeInput) {
        discountCodeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
        discountCodeInput.addEventListener('blur', handleDiscountCodeCheck);
    }

    // Add event listener for the Apply button
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', handleDiscountCodeCheck);
    }

    if (teamMembersContainer) {
        teamMembersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-team-member')) {
                const teamMemberInputs = teamMembersContainer.querySelectorAll('input[name="teamMembers"]');
                const newIndex = teamMemberInputs.length + 1;
                const newInputDiv = document.createElement('div');
                newInputDiv.className = 'team-member-input';
                newInputDiv.innerHTML = `
                    <input type="email" name="teamMembers" placeholder="Email ${newIndex}">
                    <button type="button" class="remove-team-member">-</button>
                `;
                teamMembersContainer.appendChild(newInputDiv);
            } else if (e.target.classList.contains('remove-team-member')) {
                e.target.parentElement.remove();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectedEvent) {
                alert('Please select an event.');
                return;
            }
            updatePrice();
            const formData = new FormData(form);
            const teamMembers = Array.from(formData.getAll('teamMembers')).filter(email => email);
            const finalPrice = finalAmountEl ? finalAmountEl.textContent : '';
            const dataToSubmit = {
                action: 'register',
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                teamMembers: teamMembers.join(', '),
                teamName: formData.get('teamName'),
                phoneNumber: formData.get('phoneNumber'),
                selectedEvent: selectedEvent.name,
                discountCode: formData.get('discountCode').toUpperCase(),
                finalEntryFee: finalPrice,
                confirmationCode: confirmationCode,
            };
            // Validate and mark code as used
            const code = dataToSubmit.discountCode;
            if (code) {
                const result = await validateDiscountCode(code, dataToSubmit.email);
                if (!result.valid) {
                    alert(result.error || 'Invalid promo code.');
                    return;
                }
                // Optionally update price again
                currentDiscount = parseFloat(result.discount) / 100;
                updatePrice();
            }
            // Submit registration data
            fetch(registrationsBackendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            })
            .then(() => {
                window.location.href = 'confirmation.html';
            })
            .catch(error => {
                alert('There was an error submitting your registration. Please try again.');
                console.error('Error:', error);
            });
        });
    }

    function sendConfirmationEmail(email, code, eventName, amount) {
        // You can integrate your email service here (e.g., EmailJS, SendGrid).
        console.log(`Sending email to ${email} with code ${code} for event ${eventName} with amount ${amount}`);
    }
});

/*
--- GOOGLE APPS SCRIPT CODE ---
Copy this code into your Google Apps Script editor.

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');
      sheet.appendRow(['Timestamp', 'Full Name', 'Email', 'Team Members', 'Team Name', 'Phone Number', 'Event', 'Discount Code', 'Final Fee', 'Confirmation Code']);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.fullName,
      data.email,
      data.teamMembers,
      data.teamName,
      data.phoneNumber,
      data.selectedEvent,
      data.discountCode,
      data.finalEntryFee,
      data.confirmationCode
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

*/ 