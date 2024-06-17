document.addEventListener('DOMContentLoaded', () => {
    const personForm = document.getElementById('person-form');
    const entryForm = document.getElementById('entry-form');
    const clearDataButton = document.getElementById('clear-data');
    const printSummaryButton = document.getElementById('print-summary');
    const entriesList = document.getElementById('entries-list');
    const totalAmount = document.getElementById('total-amount');
    const personInfo = document.getElementById('person-info');
    const modalMessage = document.getElementById('modal-message');
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));

    let entries = JSON.parse(localStorage.getItem('entries')) || [];
    let person = JSON.parse(localStorage.getItem('person')) || { name: '', rate: 0 };

    // Preenchendo o formulário com dados salvos
    if (person.name && person.rate) {
        document.getElementById('name').value = person.name;
        document.getElementById('rate').value = person.rate;
        updatePersonInfo();
    }

    // Atualizando a lista de entradas e o total ao carregar a página
    updateEntriesList();
    calculateTotal();

    personForm.addEventListener('submit', (event) => {
        event.preventDefault();
        person.name = document.getElementById('name').value;
        person.rate = parseFloat(document.getElementById('rate').value);

        localStorage.setItem('person', JSON.stringify(person));
        updatePersonInfo();
        showModal(`Dados salvos: ${person.name}, R$${person.rate}/hora`);
    });

    entryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const hours = parseFloat(document.getElementById('hours').value);
        const minutes = parseFloat(document.getElementById('minutes').value);

        if (minutes < 0 || minutes > 59) {
            showModal('Os minutos devem estar entre 0 e 59.');
            return;
        }

        const description = document.getElementById('description').value;

        const entry = {
            hours,
            minutes,
            description,
            totalMinutes: hours * 60 + minutes
        };

        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
        updateEntriesList();
        calculateTotal();
    });

    clearDataButton.addEventListener('click', () => {
        localStorage.removeItem('person');
        localStorage.removeItem('entries');
        entries = [];
        person = { name: '', rate: 0 };
        document.getElementById('name').value = '';
        document.getElementById('rate').value = '100';
        document.getElementById('hours').value = '1';
        document.getElementById('minutes').value = '0';
        document.getElementById('description').value = '';
        updateEntriesList();
        calculateTotal();
        updatePersonInfo();
        showModal('Dados limpos.');
    });

    printSummaryButton.addEventListener('click', () => {
        window.print();
    });

    function updateEntriesList() {
        entriesList.innerHTML = '';
        entries.forEach(entry => {
            const duration = `${entry.hours}:${entry.minutes.toString().padStart(2, '0')}`;
            const totalHours = (entry.totalMinutes / 60).toFixed(2);
            const subtotal = (totalHours * person.rate).toFixed(2);
            const li = document.createElement('li');
            li.textContent = `${duration} = ${totalHours} horas x R$${person.rate.toFixed(2)} / hora = R$${subtotal} - ${entry.description}`;
            li.classList.add('list-group-item');
            entriesList.appendChild(li);
        });
    }

    function calculateTotal() {
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
        const totalHours = (totalMinutes / 60).toFixed(2);
        const amountDue = (totalHours * person.rate).toFixed(2);

        totalAmount.textContent = `Total devido: R$${amountDue}`;
    }

    function updatePersonInfo() {
        personInfo.textContent = `Nome: ${person.name}, Valor por Hora: R$${person.rate.toFixed(2)}`;
    }

    function showModal(message) {
        modalMessage.textContent = message;
        infoModal.show();
    }
});


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
