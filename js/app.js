const converterGroups = document.querySelectorAll('.card-conventor');

converterGroups.forEach(group => {
    const boxes = group.querySelectorAll('.conventor');
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            boxes.forEach(b => b.classList.remove('active'));
            box.classList.add('active');
        });
    });
});


let fromCurrency = 'RUB';
let toCurrency = 'USD';

const input1 = document.querySelector('.card1 .amount');
const input2 = document.querySelector('.card2 .amount');
const networkErrorDiv = document.querySelector('.network-error');

const fromBoxes = document.querySelectorAll('.card1 .conventor');
const toBoxes = document.querySelectorAll('.card2 .conventor');


fromBoxes.forEach(box => {
    box.addEventListener('click', () => {
        fromBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        fromCurrency = box.textContent.trim();
        convertCurrency();
        updateRates();
    });
});


toBoxes.forEach(box => {
    box.addEventListener('click', () => {
        toBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        toCurrency = box.textContent.trim();
        convertCurrency();
        updateRates(); 
    });
});


input1.addEventListener('input', convertFromFirstInput);
input2.addEventListener('input', convertFromSecondInput);


async function fetchExchangeRate() {
    if (fromCurrency === toCurrency) {
        networkErrorDiv.style.display = 'none'; 
        return 1; 
    }

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();

        if (data && data.rates && data.rates[toCurrency]) {
            networkErrorDiv.style.display = 'none'; 
            return data.rates[toCurrency];
        } else {
            console.error('Valyuta məzənnəsi tapılmadı');
            networkErrorDiv.style.display = 'block';
            networkErrorDiv.textContent = 'Valyuta məzənnəsi tapılmadı';
            return null;
        }
    } catch (error) {
        console.error('Xəta baş verdi:', error);
        networkErrorDiv.style.display = 'block';
        networkErrorDiv.textContent = 'İnternet bağlantısı yoxdur!';
        return null;
    }
}


async function convertCurrency() {
    const rate = await fetchExchangeRate();
    if (rate) {
        const amount = parseFloat(input1.value);
        if (!isNaN(amount)) {
            input2.value = (amount * rate);
        } else {
            input2.value = '';
        }
    }
}


function convertFromFirstInput() {
    const amount = parseFloat(input1.value);
    if (!isNaN(amount)) {
        fetchExchangeRate().then(rate => {
            if (rate) {
                input2.value = (amount * rate);
            }
        });
    } else {
        input2.value = '';
    }
}


function convertFromSecondInput() {
    const amount = parseFloat(input2.value);
    if (!isNaN(amount)) {
        fetchExchangeRate().then(rate => {
            if (rate) {
                input1.value = (amount / rate);
            }
        });
    } else {
        input1.value = '';
    }
}


function updateRates() {
    const rate1 = document.querySelector('.card1 .rate');
    const rate2 = document.querySelector('.card2 .rate');
    fetchExchangeRate().then(rate => {
        if (rate) {
            rate1.textContent = `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`;
            rate2.textContent = `1 ${toCurrency} = ${(1 / rate).toFixed(2)} ${fromCurrency}`;
        }
    });
}


function validateNumberInput(input) {
    input.addEventListener('input', (e) => {
        let value = input.value;
        const originalLength = value.length;
        const cursorPosition = input.selectionStart;

        const lastChar = value[cursorPosition - 1];

        if (!/[.,]/.test(e.data) && e.inputType !== 'insertText') {
            return;
        }

        let newValue = value.replace(',', '.');

        const parts = newValue.split('.');
        if (parts.length > 2) {
            newValue = parts[0] + '.' + parts[1];
        }

        if (parts.length === 2) {
            parts[1] = parts[1].slice(0, 5);
            newValue = parts[0] + '.' + parts[1];
        }

        newValue = newValue.replace(/[^0-9.]/g, '');

        if (newValue !== value) {
            input.value = newValue;
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
    });
}


document.querySelectorAll('.amount').forEach(input => validateNumberInput(input));
window.addEventListener('online', () => {
    networkErrorDiv.style.display = 'none';
    if (input1.value || input2.value) {
        convertCurrency();
        updateRates();
    }
});
window.addEventListener('offline', () => {
    networkErrorDiv.style.display = 'block';
    networkErrorDiv.textContent = 'İnternet bağlantısı yoxdur!';
});