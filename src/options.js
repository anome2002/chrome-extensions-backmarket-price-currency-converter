/**
 * Backmarket Price Converter
 * Version: 1.0
 * Author: anome2002
 * GitHub: https://github.com/anome2002
 */

document.addEventListener('DOMContentLoaded', () => {
  const currencySelect = document.getElementById('currency');
  const saveButton = document.getElementById('save');
  const githubLink = document.getElementById('github-link');

  const githubURL = "https://github.com/anome2002/chrome-extensions-backmarket-price-currency-converter";
  githubLink.href = githubURL;

  async function fetchCurrencies() {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      return Object.keys(data.rates);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
  }

  // Load currencies and populate the select dropdown
  async function populateCurrencies() {
    const currencies = await fetchCurrencies();
    currencySelect.innerHTML = '';
    currencies.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency;
      option.textContent = currency;
      currencySelect.appendChild(option);
    });
    
    // Set default currency to KES
    currencySelect.value = 'KES';
  }

  // Load saved currency from storage and populate dropdown
  chrome.storage.sync.get('currency', (data) => {
    populateCurrencies().then(() => {
      if (data.currency) {
        currencySelect.value = data.currency;
      }
    });
  });

  // Save selected currency to storage
  saveButton.addEventListener('click', () => {
    const selectedCurrency = currencySelect.value;
    chrome.storage.sync.set({ currency: selectedCurrency }, () => {
      alert('Currency saved!');
    });
  });
});
