function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

let userFavorites = {};


function initializeApp() {
  document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        updateFavoritesCount(); 
        displayFavoriteRecordsOnly(); 
      }
    });
  });
}

function displayFavoriteRecordsOnly() {
  const recordsContainer = document.getElementById("favourite-records");
  recordsContainer.innerHTML = "";

  const userId = getCurrentUserId();
  if (!userId) {
    console.error("User is not logged in.");
    return;
  }
  
  database.ref(`users/${userId}/favorites`).once('value', (favoritesSnapshot) => {
    const favorites = favoritesSnapshot.val() || {};

    database.ref("wood").once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const record = childSnapshot.val();
        if (favorites[record.serialNumber]) {
          const recordDiv = createRecordElement(record, childSnapshot.key);
          recordsContainer.appendChild(recordDiv);
        }
      });
    });
  }).catch((error) => {
    console.error("Error fetching user favorites:", error);
  });
}

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
    <div id="zoom-cont" class="zoom-container"><img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>
    <div class="more">
      <div id="record-menu" class="record-buttons">
        <button class="details-btn" data-id="${key}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
          </svg>
        </button>
        <div class="wrapper">
          <span>
            <i class="fas fa-heart fa-2xl ${userFavorites[record.serialNumber] ? 'fas' : 'far'}" onclick="likeBtn(event)" data-serial-number="${record.serialNumber}" style="margin-top:15px; margin-left:15px; cursor:pointer;"></i>
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
          <p><strong>Średnica:</strong> ${record.diameter}</p>
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
  const userId = getCurrentUserId();
  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  const serialNumber = event.target.getAttribute("data-serial-number");
  const isLiked = event.target.classList.contains("fas");

  if (isLiked) {
    database.ref(`users/${userId}/favorites/${serialNumber}`).remove()
      .then(() => {
        event.target.classList.remove("fas");
        event.target.classList.add("far");
        updateFavoritesCount();
      })
      .catch((error) => {
        console.error("Error removing favorite:", error);
      });
  } else {
    const newFavorite = {};
    newFavorite[serialNumber] = true;
    database.ref(`users/${userId}/favorites`).update(newFavorite)
      .then(() => {
        event.target.classList.remove("far");
        event.target.classList.add("fas");
        updateFavoritesCount();
      })
      .catch((error) => {
        console.error("Error adding favorite:", error);
      });
  }
}


function updateFavoritesCount() {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  database.ref(`users/${userId}/favorites`).once('value', (favoritesSnapshot) => {
    const favorites = favoritesSnapshot.val() || {};
    const count = Object.keys(favorites).length;
    document.getElementById("favoritesCount").textContent = count;
  }).catch((error) => {
    console.error("Error fetching user favorites count:", error);
  });
}


initializeApp();