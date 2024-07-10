/**
 * Backmarket Price Converter
 * Version: 1.0
 * Author: anome2002
 * GitHub: https://github.com/anome2002
 */


// Function to fetch the current exchange rate from USD to the selected currency
async function fetchExchangeRate(currency) {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    return data.rates[currency];
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
}

// Function to convert USD to the selected currency
function convertToCurrency(usdPrice, rate) {
  return (usdPrice * rate).toFixed(2);
}

// Function to format numbers with commas
function formatWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to show the notification
function showNotification(currency) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerHTML = `
    <button>&times;</button>
    <p>The current currency is set to ${currency}.</p>
    <p><a id="options-link" href="#">Click here</a> to change the currency.</p>
  `;

  document.body.appendChild(notification);
  notification.style.display = 'block';

  const closeButton = notification.querySelector('button');
  const optionsLink = notification.querySelector('#options-link');

  closeButton.onclick = () => {
    notification.style.display = 'none';
    chrome.storage.sync.set({ firstVisit: false });
  };

  optionsLink.onclick = (e) => {
    e.preventDefault();
    const optionsUrl = chrome.runtime.getURL('options.html');
    window.open(optionsUrl, '_blank');
  };

  setTimeout(() => {
    notification.style.display = 'none';
  }, 10000);
}

// Function to update prices
async function updatePrices() {
  chrome.storage.sync.get(['currency', 'firstVisit'], async (result) => {
    const currency = result.currency || 'KES'; // Default to KES if no currency is set
    const firstVisit = result.firstVisit === undefined ? true : result.firstVisit;

    if (firstVisit) {
      showNotification(currency);
    }

    const exchangeRate = await fetchExchangeRate(currency);
    if (!exchangeRate) {
      console.error('Failed to fetch exchange rate. Prices will not be converted.');
      return;
    }

    const priceElements = document.querySelectorAll('div[data-qa="productCardPrice"]');
    priceElements.forEach(element => {
      const usdPriceText = element.textContent.trim();
      const usdPrice = parseFloat(usdPriceText.replace('$', '').replace(',', ''));
      if (!isNaN(usdPrice)) {
        const convertedPrice = convertToCurrency(usdPrice, exchangeRate);
        const formattedPrice = formatWithCommas(convertedPrice);
        element.textContent = `${currency} ${formattedPrice}`;
      }
    });
  });
}

  updatePrices();
  setInterval(updatePrices, 3000);
