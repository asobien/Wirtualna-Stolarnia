function displayPartie() {
    const partieDisplay = document.getElementById('partieDisplay');
    database.ref('parties').once('value', (snapshot) => {
        partieDisplay.innerHTML = ''; // Clear the container
        snapshot.forEach((childSnapshot) => {
            const partia = childSnapshot.val();
            const partiaElement = document.createElement('div');
            partiaElement.classList.add('partia-item');
            partiaElement.innerHTML = `
                <h3>${partia.name}</h3>
                <p>Data zakupu: ${partia.date}</p>
                <p>Cena zakupu: ${partia.price} PLN</p>
                <p>Koszt transportu: ${partia.transportCost} PLN</p>
                <p>Koszty rozpakowania: ${partia.unpackingCost} PLN</p>
                <p>Koszt całkowity: ${partia.totalCost} PLN</p>
            `;
            partieDisplay.appendChild(partiaElement);
        });
    });
}

document.addEventListener('DOMContentLoaded', displayPartie);