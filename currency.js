// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const rateInfoDiv = document.getElementById('rateInfo');
const loadingDiv = document.getElementById('loading');

// API Configuration
const API_KEY = 647d0f53a0bd9d0f191d1754
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

// Exchange rates cache
let exchangeRates = {};
let lastBaseCurrency = '';

// Event Listeners
swapBtn.addEventListener('click', swapCurrencies);
convertBtn.addEventListener('click', convertCurrency);
amountInput.addEventListener('input', () => {
    if (resultDiv.style.display === 'block') {
        convertCurrency();
    }
});
fromCurrency.addEventListener('change', () => {
    if (resultDiv.style.display === 'block') {
        convertCurrency();
    }
});
toCurrency.addEventListener('change', () => {
    if (resultDiv.style.display === 'block') {
        convertCurrency();
    }
});

// Allow Enter key to convert
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        convertCurrency();
    }
});

// Swap currencies function
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    if (resultDiv.style.display === 'block') {
        convertCurrency();
    }
}

// Hide all message divs
function hideMessages() {
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    rateInfoDiv.style.display = 'none';
    loadingDiv.style.display = 'none';
}

// Show error message
function showError(message) {
    hideMessages();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Fetch exchange rates
async function fetchExchangeRates(baseCurrency) {
    try {
        const response = await fetch(`${API_URL}${baseCurrency}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        exchangeRates = data.rates;
        lastBaseCurrency = baseCurrency;
        
        return data;
    } catch (error) {
        throw new Error('Unable to fetch exchange rates. Please check your internet connection.');
    }
}

// Convert currency
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    // Validation
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (from === to) {
        showError('Please select different currencies');
        return;
    }
    
    // Show loading
    hideMessages();
    loadingDiv.style.display = 'block';
    
    try {
        // Fetch rates if not cached or base currency changed
        if (Object.keys(exchangeRates).length === 0 || lastBaseCurrency !== from) {
            await fetchExchangeRates(from);
        }
        
        // Calculate conversion
        const rate = exchangeRates[to];
        
        if (!rate) {
            throw new Error('Exchange rate not available');
        }
        
        const convertedAmount = (amount * rate).toFixed(2);
        
        // Display result
        hideMessages();
        resultDiv.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">
                ${formatCurrency(amount, from)}
            </div>
            <div style="font-size: 32px; font-weight: 800;">
                ${formatCurrency(convertedAmount, to)}
            </div>
        `;
        resultDiv.style.display = 'block';
        
        // Display rate info
        rateInfoDiv.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
        rateInfoDiv.style.display = 'block';
        
    } catch (error) {
        showError(error.message);
    }
}

// Format currency with symbol
function formatCurrency(amount, currency) {
    const symbols = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
        CAD: 'C$', CHF: 'Fr', CNY: '¥', INR: '₹', KRW: '₩',
        SGD: 'S$', NZD: 'NZ$', MXN: '$', NOK: 'kr', SEK: 'kr',
        RUB: '₽', ZAR: 'R', BRL: 'R$'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Initialize - convert on load if amount is already set
if (amountInput.value && parseFloat(amountInput.value) > 0) {
    convertCurrency();
}
