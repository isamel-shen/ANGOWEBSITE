document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const selectEvent = document.getElementById('select-event');
    const discountCodeInput = document.getElementById('discount-code');
    const eTransferDetails = document.getElementById('e-transfer-details');
    const finalAmountEl = document.getElementById('final-amount');
    const confirmationCodeEl = document.getElementById('confirmation-code');
    const teamMembersContainer = document.getElementById('team-members-container');

    let tournaments = [];
    let promoCodes = {};
    let selectedEvent = null;
    let currentDiscount = 0;

    // Fetch tournament data
    fetch('assets/tournaments.json')
        .then(response => response.json())
        .then(data => {
            tournaments = data.tournaments;
            populateEventsDropdown();
        });

    // Fetch promo code data
    fetch('assets/promocodes.json')
        .then(response => response.json())
        .then(data => {
            promoCodes = data;
        });

    function populateEventsDropdown() {
        tournaments.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${event.entryFee}`;
            selectEvent.appendChild(option);
        });
    }

    function generateConfirmationCode() {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    function updatePrice() {
        if (!selectedEvent) return;

        const basePrice = parseFloat(selectedEvent.entryFee.replace('$', ''));
        const discountedPrice = basePrice * (1 - currentDiscount);

        finalAmountEl.textContent = `$${discountedPrice.toFixed(2)}`;
        eTransferDetails.style.display = 'block';
    }

    selectEvent.addEventListener('change', () => {
        const eventId = parseInt(selectEvent.value);
        selectedEvent = tournaments.find(t => t.id === eventId);
        currentDiscount = 0;
        discountCodeInput.value = '';
        updatePrice();
    });

    discountCodeInput.addEventListener('blur', () => {
        const code = discountCodeInput.value.toUpperCase();
        const userEmail = document.getElementById('email').value;

        if (promoCodes[code]) {
            // In a real app, you would need a backend to check if the email has already used the code.
            // For this example, we'll just check the static list.
            if (promoCodes[code].usedEmails.includes(userEmail)) {
                alert('This promo code has already been used with this email address.');
                currentDiscount = 0;
            } else {
                currentDiscount = promoCodes[code].discount / 100;
                alert(`Applied a ${promoCodes[code].discount}% discount!`);
            }
        } else if (code !== '') {
            alert('Invalid promo code.');
            currentDiscount = 0;
        } else {
            currentDiscount = 0;
        }
        updatePrice();
    });
    
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!selectedEvent) {
            alert('Please select an event.');
            return;
        }

        const confirmationCode = generateConfirmationCode();
        confirmationCodeEl.textContent = confirmationCode;
        updatePrice(); // Recalculate price one last time before submitting

        const formData = new FormData(form);
        const teamMembers = Array.from(formData.getAll('teamMembers')).filter(email => email);
        
        const finalPrice = finalAmountEl.textContent;

        const dataToSubmit = {
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

        // --- Google Sheets Integration ---
        // 1. Create a Google Sheet.
        // 2. Go to Extensions > Apps Script.
        // 3. Paste the server-side script (provided in comments below) and save.
        // 4. Click Deploy > New deployment. Select "Web app".
        // 5. For "Who has access", select "Anyone".
        // 6. Click Deploy. Authorize permissions.
        // 7. Copy the Web app URL and paste it below.
        
        const googleSheetScriptURL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

        // Placeholder for email function
        sendConfirmationEmail(dataToSubmit.email, dataToSubmit.confirmationCode, dataToSubmit.selectedEvent, dataToSubmit.finalEntryFee);
        
        fetch(googleSheetScriptURL, {
            method: 'POST',
            mode: 'no-cors', // Important for sending data from browser to Google Apps Script
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
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

    /**
     * Placeholder function for sending a confirmation email.
     * @param {string} email - The user's email address.
     * @param {string} code - The generated confirmation code.
     * @param {string} eventName - The name of the event.
     * @param {string} amount - The final amount to be paid.
     */
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