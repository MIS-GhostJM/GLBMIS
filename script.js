let taxRowCount = 1;  // Start with 1 to indicate only the initial row
const MAX_TAX_ROWS = 20;
const CONSTANTS = {
    COPY_SUCCESS_DURATION: 2000 // duration in milliseconds (2 seconds)
};

function createTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
    return tooltip;
}

// Function to position the tooltip
function positionTooltip(tooltip, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
}

// Function to show the tooltip
function showTooltip(message, targetElement, duration = 2000) {
    const tooltip = createTooltip(message);
    positionTooltip(tooltip, targetElement);

    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => tooltip.remove(), 50);
    }, duration);
}

// Function to add a new tax row
function addTaxRow() {
    if (taxRowCount >= MAX_TAX_ROWS) {
        document.getElementById('maxTaxAlert').style.display = 'block';
        return;
    }

    taxRowCount++;

    const taxTableBody = document.getElementById('taxTableBody');
    const newRow = document.createElement('tr');
    newRow.id = `taxRow${taxRowCount}`;

    newRow.innerHTML = `
        <td><input type="text" id="taxType${taxRowCount}" maxlength="2" class="tax-type"></td>
        <td><input type="number" id="oldFare${taxRowCount}" placeholder="0.00" min="0" step="0.01"></td>
        <td><input type="number" id="newFare${taxRowCount}" placeholder="0.00" min="0" step="0.01"></td>
        <td id="taxDiff${taxRowCount}" class="currency">0.00</td>
        <td><button class="remove-tax-button" onclick="removeTaxRow(${taxRowCount})">Remove</button></td>
    `;

    taxTableBody.appendChild(newRow);

    // Add event listeners to the new row's inputs
    document.getElementById(`taxType${taxRowCount}`).addEventListener('input', calculateFareDifference);
    document.getElementById(`oldFare${taxRowCount}`).addEventListener('input', calculateFareDifference);
    document.getElementById(`newFare${taxRowCount}`).addEventListener('input', calculateFareDifference);

    calculateFareDifference();
}

// Function to remove a tax row
function removeTaxRow(rowIndex) {
    const rowToRemove = document.getElementById(`taxRow${rowIndex}`);
    rowToRemove.remove();
    taxRowCount--;
    calculateFareDifference();
}

// Function to calculate the fare difference and update the tax breakdown
// Function to calculate the fare difference and update the tax breakdown
function calculateFareDifference() {
  const baseOldFare = parseFloat(document.getElementById('baseOldFare').value) || 0;
  const baseNewFare = parseFloat(document.getElementById('baseNewFare').value) || 0;
  const isFlexible = document.getElementById('flexibilitySelect').value === 'Yes';
  let airlinePenalty = parseFloat(document.getElementById('airlinePenalty').value) || 0;
  let serviceFee = parseFloat(document.getElementById('serviceFee').value) || 0;

  // Fetch gdscurrency value for concatenation
  const gdscurrency = document.getElementById('gdscurrency').value || '';
  const servicefeecurrency = document.getElementById('serviceFeeCurrency').value || '';

  let totalBaseFare = baseNewFare - baseOldFare;
  let totalTaxDifference = 0;
  let totalFareDifference = 0;

  const taxBreakdown = [];
  let isTaxTableUnchanged = true;

  // Loop through each tax row to calculate tax differences and update the tax breakdown
  for (let i = 1; i <= taxRowCount; i++) {
      const taxType = document.getElementById(`taxType${i}`).value;
      const oldFare = parseFloat(document.getElementById(`oldFare${i}`).value) || 0;
      const newFare = parseFloat(document.getElementById(`newFare${i}`).value) || 0;
      const taxDifference = newFare - oldFare;
      
      document.getElementById(`taxDiff${i}`).textContent = `${taxDifference.toFixed(2)} ${gdscurrency}`;

      if (oldFare !== 0 || newFare !== 0 || taxType) {
          isTaxTableUnchanged = false;  // If any input is filled, the table is considered changed
      }

      if (taxDifference >= 0) {
          totalTaxDifference += taxDifference;
      }

      taxBreakdown.push({
          type: taxType,
          difference: taxDifference
      });
  }

  if (totalBaseFare > 0) {
      totalFareDifference += totalBaseFare;
  }

  totalFareDifference += totalTaxDifference;

  // Hide or show Airline Penalty and Service Fee based on flexibility selection
  if (isFlexible) {
      document.getElementById('airlinePenaltyRow').style.display = 'none';
      document.getElementById('serviceFeeRow').style.display = 'none';
      document.getElementById('serviceFeeCurrencyRow').style.display = 'none';

      // Hide penalty and service fee summaries in the Summary section
      document.getElementById('Penaltysummary').style.display = 'none';
      document.getElementById('Servicefeesummary').style.display = 'none';
      
      // Reset Airline Penalty and Service Fee values to zero
      airlinePenalty = 0;
      serviceFee = 0;
      serviceFeeCurrency = '';
      document.getElementById('airlinePenalty').value = '';
      document.getElementById('serviceFee').value = '';
  } else {
      document.getElementById('airlinePenaltyRow').style.display = 'flex';
      document.getElementById('serviceFeeRow').style.display = 'flex';
      document.getElementById('serviceFeeCurrencyRow').style.display = 'flex';

      // Show penalty and service fee summaries in the Summary section
      document.getElementById('Penaltysummary').style.display = 'flex';
      document.getElementById('Servicefeesummary').style.display = 'flex';
  }

  totalFareDifference += airlinePenalty;

  // Update the displayed values in the summary with gdscurrency concatenation
  document.getElementById('totalBaseFare').textContent = `${totalBaseFare > 0 ? totalBaseFare.toFixed(2) : '0.00'} ${gdscurrency}`;
  document.getElementById('Penaltysummary').querySelector('.currency').textContent = `${airlinePenalty.toFixed(2)} ${gdscurrency}`;
  document.getElementById('taxDifference').textContent = `${totalTaxDifference.toFixed(2)} ${gdscurrency}`;
  document.getElementById('totalFareDiff').textContent = `${totalFareDifference.toFixed(2)} ${gdscurrency}`;
  document.getElementById('totalBaseFareshow').textContent = `${totalBaseFare.toFixed(2)} ${gdscurrency}`;
  document.getElementById('Servicefeesummary').querySelector('.currency').textContent = `${serviceFee.toFixed(2)} ${servicefeecurrency}`;


  // Update the tax breakdown section in real-time
  updateTaxBreakdown(taxBreakdown, isTaxTableUnchanged, gdscurrency);
}

// Function to update the tax breakdown in the UI
function updateTaxBreakdown(taxBreakdown, isTaxTableUnchanged) {
  const taxListElement = document.querySelector('.tax-list');
  taxListElement.innerHTML = ''; // Clear existing breakdown

  if (isTaxTableUnchanged) {
      taxListElement.textContent = "No Tax Calculation Defined";
  } else {
      taxBreakdown.forEach((tax, index) => {
          const taxElement = document.createElement('div');
          const oldFare = document.getElementById(`oldFare${index + 1}`).value || "0.00";
          const newFare = document.getElementById(`newFare${index + 1}`).value || "0.00";
          
          taxElement.textContent = `${tax.type || '--'}: Old: ${parseFloat(oldFare).toFixed(2)}, New: ${parseFloat(newFare).toFixed(2)}, Difference: ${tax.difference.toFixed(2)}`;
          taxListElement.appendChild(taxElement);
      });
  }
}


function positionTooltip(tooltip, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
}

function showTooltip(message, targetElement, duration = 2000) {
    const tooltip = createTooltip(message);
    positionTooltip(tooltip, targetElement);

    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => tooltip.remove(), 50);
    }, duration);
}

function generateSummaryText() {
  const flexibilityValue = document.getElementById("flexibilitySelect").value;
  let summaryText = "Ticket Change Summary\n";
  summaryText += "=======================\n";
  summaryText += `Base Fare Difference: ${document.getElementById("totalBaseFareshow").innerText}\n`;

  if (flexibilityValue === "No") {
      summaryText += `Airline Penalty: ${document.getElementById("Penaltysummary").querySelector('.currency').innerText}\n`;
  }

  summaryText += `Overall Tax Difference: ${document.getElementById("taxDifference").innerText}\n`;
  summaryText += "=======================\n";
  summaryText += `Total Fare Difference: ${document.getElementById("totalFareDiff").innerText}\n`;

  if (flexibilityValue === "No") {
    summaryText += `Service Fee: ${document.getElementById("Servicefeesummary").querySelector('.currency').innerText}\n\n`;
}
  summaryText += "***Tax Breakdown****\n";
  
  for (let i = 1; i <= taxRowCount; i++) {
      const taxType = document.getElementById(`taxType${i}`).value || "--";
      const oldFare = document.getElementById(`oldFare${i}`).value || "0.00";
      const newFare = document.getElementById(`newFare${i}`).value || "0.00";
      const taxDifference = document.getElementById(`taxDiff${i}`).textContent || "-.--";
      
      summaryText += `${taxType}: Old Tax: ${parseFloat(oldFare).toFixed(2)}, New Tax: ${parseFloat(newFare).toFixed(2)}, Difference: ${taxDifference}\n`;
  }

  return summaryText;
}

async function handleCopy() {
    const copyButton = document.getElementById('copyButton');
    const flexibilityValue = document.getElementById("flexibilitySelect").value;
    const airlinePenalty = document.getElementById("airlinePenalty").value;
    const serviceFee = document.getElementById("serviceFee").value;

    if (flexibilityValue === "No" && (!airlinePenalty || !serviceFee)) {
        copyButton.classList.add('error');
        showTooltip('Please fill in Airline Penalty and Service Fee', copyButton);
        setTimeout(() => {
            copyButton.classList.remove('error');
        }, CONSTANTS.COPY_SUCCESS_DURATION);
        return;
    }

    const summaryText = generateSummaryText();

    try {
        await navigator.clipboard.writeText(summaryText);
        copyButton.classList.add('success');
        showTooltip('Copied!', copyButton);

        setTimeout(() => {
            copyButton.classList.remove('success');
        }, CONSTANTS.COPY_SUCCESS_DURATION);
    } catch (err) {
        copyButton.classList.add('error');
        showTooltip('Failed to copy', copyButton);
        console.error(err);

        setTimeout(() => {
            copyButton.classList.remove('error');
        }, CONSTANTS.COPY_SUCCESS_DURATION);
    }
}

// Function to handle resetting all input fields and summary
function handleReset() {
    document.getElementById('baseOldFare').value = '';
    document.getElementById('baseNewFare').value = '';
    document.getElementById('flexibilitySelect').value = 'Yes';
    document.getElementById('airlinePenalty').value = '';
    document.getElementById('serviceFee').value = '';
    document.getElementById('gdscurrency').value = '';
    document.getElementById('serviceFeeCurrency').value = '';

    // Reset all tax rows except the first one
    while (taxRowCount > 1) {
        removeTaxRow(taxRowCount);
    }

    // Reset the first tax row
    document.getElementById('taxType1').value = '';
    document.getElementById('oldFare1').value = '';
    document.getElementById('newFare1').value = '';

    // Update the summary after reset
    calculateFareDifference();
}

// Initialize event listeners
document.getElementById('baseOldFare').addEventListener('input', calculateFareDifference);
document.getElementById('baseNewFare').addEventListener('input', calculateFareDifference);
document.getElementById('flexibilitySelect').addEventListener('change', calculateFareDifference);
document.getElementById('airlinePenalty').addEventListener('input', calculateFareDifference);
document.getElementById('serviceFee').addEventListener('input', calculateFareDifference);
document.querySelector(".clear-fields-button").addEventListener('click', handleReset);
document.getElementById('copyButton').addEventListener('click', handleCopy);
document.getElementById('gdscurrency').addEventListener('input', calculateFareDifference);
document.getElementById('serviceFeeCurrency').addEventListener('input', calculateFareDifference);

// Initialize event listeners for the inputs in the first tax row
document.getElementById('taxType1').addEventListener('input', calculateFareDifference);
document.getElementById('oldFare1').addEventListener('input', calculateFareDifference);
document.getElementById('newFare1').addEventListener('input', calculateFareDifference);

// Add the initial tax row on page load
document.addEventListener('DOMContentLoaded', () => {
    taxRowCount = 1;  // Ensure we start with only one row
    calculateFareDifference();  // Ensure initial calculations
});
