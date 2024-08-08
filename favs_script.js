let userFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
console.log("Pobrane dane z localStorage:", userFavorites);

function displayFavoriteRecordsOnly() {
  console.log("Wywołano displayFavoriteRecordsOnly");
  const recordsContainer = document.getElementById("favourite-records");
  if (!recordsContainer) {
      console.error("Element o ID 'favourite-records' nie został znaleziony");
      return;
  }
  recordsContainer.innerHTML = "";
}
  database.ref("wood").once("value", (snapshot) => {
    console.log("Pobrane dane z bazy:", snapshot.val());
    snapshot.forEach((childSnapshot) => {
        const record = childSnapshot.val();
        if (userFavorites[record.serialNumber]) {
            console.log("Dodano ulubiony produkt:", record);
            const recordDiv = createRecordElement(record, childSnapshot.key);
            recordsContainer.appendChild(recordDiv);
        }
    });
});





function createRecordElement(record, key) {
  const recordDiv = document.createElement("div");
  recordDiv.classList.add("record");

  let averageMoisture = Math.round((parseFloat(record.moisture1) + parseFloat(record.moisture2) + parseFloat(record.moisture3)) / 3) + '%';
  record.averageMoisture = averageMoisture;

  recordDiv.innerHTML = `
    <div class="record-info">
      <span class="record-item"><strong>Numer Seryjny:</strong> ${record.serialNumber}</span>
      <span class="record-item"><strong>Gatunek:</strong> ${record.species}</span>
      <span class="record-item"><strong>Typ:</strong> ${record.type}</span>
      <span class="record-item"><strong>Średnia wilgotność: </strong> ${record.averageMoisture}</span>
      <span class="record-item"><strong>Wysokość: </strong> ${record.height}</span>
      <span class="record-item"><strong>Szerokość: </strong> ${record.width}</span>
      <span class="record-item"><strong>Grubość: </strong> ${record.thickness}</span>
    </div>
    <div id="zoom-cont" class="zoom-container">
      <img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;">
    </div>
    <div class="more">
      <div id="record-menu" class="record-buttons">
        <button class="details-btn" data-id="${key}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"></svg>
        </button>
        <div class="wrapper">
          <span>
            <i class="fas fa-heart fa-2xl ${userFavorites[record.serialNumber] ? 'fas' : 'far'}" 
               onclick="likeBtn(event)" 
               data-serial-number="${record.serialNumber}" 
               style="margin-top:15px; margin-left:15px; cursor:pointer;">
            </i>
          </span>
        </div>
      </div>
    </div>
  `;

  const detailsButton = recordDiv.querySelector(".details-btn");
  detailsButton.addEventListener("click", () => {
    showDetailsModal(key);
  });

  return recordDiv;
}

function showDetailsModal(recordId) {
  const recordRef = database.ref("wood/" + recordId.toString());
  recordRef.once("value", (snapshot) => {
    const record = snapshot.val();
    if (record) {
      let averageMoisture = Math.round((parseFloat(record.moisture1) + parseFloat(record.moisture2) + parseFloat(record.moisture3)) / 3) + '%';
      record.averageMoisture = averageMoisture;

      let modalContent = `
          <h3>Szczegóły</h3>
          <p><strong>Numer seryjny:</strong> ${record.serialNumber}</p>
          <p><strong>Gatunek:</strong> ${record.species}</p>
          <p><strong>Typ:</strong> ${record.type}</p>
          <p><strong>Średnia wilgotność:</strong> ${record.averageMoisture}</p>
          <p><strong>Wysokość:</strong> ${record.height}</p>
          <p><strong>Szerokość:</strong> ${record.width}</p>
          <p><strong>Grubość:</strong> ${record.thickness}</p>
      `;

      if (record.imageUrl) {
        modalContent += `
          <div id="zoom-cont" class="zoom-container"><img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>
        `;
      }

      showModalWithContent(modalContent);
    } else {
      console.error("Record not found or empty");
    }
  }).catch((error) => {
    console.error("Error fetching record:", error);
  });
}

function showModalWithContent(content) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.display = "block";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      ${content}
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.style.display = "none";
    modal.remove();
  };

  modal.querySelector(".close").addEventListener("click", closeModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function likeBtn(event) {
  const serialNumber = event.target.getAttribute("data-serial-number");
  const isLiked = userFavorites[serialNumber];

  if (isLiked) {
    delete userFavorites[serialNumber];
    event.target.classList.remove("fas");
    event.target.classList.add("far");
  } else {
    userFavorites[serialNumber] = true;
    event.target.classList.remove("far");
    event.target.classList.add("fas");
  }

  localStorage.setItem('favorites', JSON.stringify(userFavorites));
  updateFavoritesCount();
}

function updateFavoritesCount() {
  const count = Object.keys(userFavorites).length;
  document.getElementById("favoritesCount").textContent = count;
}

initializeApp();


function initializeApp() {
  document.addEventListener("DOMContentLoaded", () => {
      console.log("userFavorites zawartość:", userFavorites);

      const currentPage = window.location.pathname.split("/").pop(); 
      if (currentPage === 'favourites.html') {
          displayFavoriteRecordsOnly();  
      } else {
          updateFavoritesCount();
      }
  });
}

