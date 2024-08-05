let currentSort = null;
let currentSearchQuery = '';
let currentSpeciesFilter = 'Gatunek'; // Gatunek, który ma być filtrowany
let currentTypeFilter = 'Typ'; // Typ, który ma być filtrowany
let userFavorites = {};

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      updateFavoritesCount(); 
      loadUserFavorites();
    }
  });

  displayRecords();

  document.getElementById("searchInput").addEventListener("input", (event) => {
    currentSearchQuery = event.target.value.trim().toLowerCase();
    displayRecords();
  });

  document.getElementById("species-select").addEventListener("change", (event) => {
    currentSpeciesFilter = event.target.value;
    displayRecords();
  });

  document.getElementById("type-select").addEventListener("change", (event) => {
    currentTypeFilter = event.target.value;
    displayRecords();
  });
});

function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

function loadUserFavorites() {
  const userId = getCurrentUserId();

  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  database.ref(`users/${userId}/favorites`).once('value', (snapshot) => {
    userFavorites = snapshot.val() || {};
    displayRecords(); 
  }).catch((error) => {
    console.error("Error fetching user favorites:", error);
  });
}

function filterRecords(recordsArray) {
  console.log("Current Filters:", {
    species: currentSpeciesFilter,
    type: currentTypeFilter,
    searchQuery: currentSearchQuery,
  });

  return recordsArray.filter(record => {
    const speciesMatch = currentSpeciesFilter === 'Gatunek' || record.species === currentSpeciesFilter;
    const typeMatch = currentTypeFilter === 'Typ' || record.type === currentTypeFilter;
    const searchQueryMatch = currentSearchQuery === '' ||
      (record.name && record.name.toLowerCase().includes(currentSearchQuery)) ||
      (record.serialNumber && record.serialNumber.toLowerCase().includes(currentSearchQuery));
    
    console.log(`Record ${record.serialNumber} matches filters:`, {
      speciesMatch,
      typeMatch,
      searchQueryMatch
    });

    return speciesMatch && typeMatch && searchQueryMatch;
  });
}


function displayRecords() {
  const recordsContainer = document.getElementById("records");
  recordsContainer.innerHTML = "";

  database.ref("wood").once("value", (snapshot) => {
    let recordsArray = [];
    snapshot.forEach((childSnapshot) => {
      const record = childSnapshot.val();
      recordsArray.push({ key: childSnapshot.key, ...record });
    });

    recordsArray = filterRecords(recordsArray);
    recordsArray.forEach((record) => {
      const recordDiv = createRecordElement(record, record.key);
      recordsContainer.appendChild(recordDiv);
    });
  }).catch((error) => {
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
            <i class="far fa-heart fa-2xl ${userFavorites[record.serialNumber] ? 'fas' : 'far'}" onclick="likeBtn(event)" data-serial-number="${record.serialNumber}" style="margin-top:15px; margin-left:15px; cursor:pointer;"></i>
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

function likeBtn(event) {
  const btn = event.target;
  const recordSerialNumber = btn.getAttribute("data-serial-number");
  const userId = getCurrentUserId();

  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  const userFavoritesRef = database.ref(`users/${userId}/favorites/${recordSerialNumber}`);

  if (btn.classList.contains("far")) {
    userFavoritesRef.set(true)
      .then(() => {
        btn.classList.remove("far");
        btn.classList.add("fas");
        userFavorites[recordSerialNumber] = true;
        console.log(`Record ${recordSerialNumber} added to favorites.`);
        updateFavoritesCount(); 
      })
      .catch(error => {
        console.error("Error adding to favorites:", error);
      });
  } else {
    userFavoritesRef.remove()
      .then(() => {
        btn.classList.remove("fas");
        btn.classList.add("far");
        delete userFavorites[recordSerialNumber];
        console.log(`Record ${recordSerialNumber} removed from favorites.`);
        updateFavoritesCount(); 
      })
      .catch(error => {
        console.error("Error removing from favorites:", error);
      });
  }
}

function updateFavoritesCount() {
  const userId = getCurrentUserId();

  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  database.ref(`users/${userId}/favorites`).once('value', (snapshot) => {
    const favorites = snapshot.val();
    const count = favorites ? Object.keys(favorites).length : 0;
    document.getElementById("favoritesCount").textContent = count;
  }).catch((error) => {
    console.error("Error updating favorites count:", error);
  });
}


document.getElementById("searchInput").addEventListener("input", (event) => {
  currentSearchQuery = event.target.value.trim().toLowerCase();
  console.log("Updated searchQuery:", currentSearchQuery); // Debugging line
  displayRecords();
});

document.getElementById("species-select").addEventListener("change", (event) => {
  currentSpeciesFilter = event.target.value;
  displayRecords();
});

document.getElementById("type-select").addEventListener("change", (event) => {
  currentTypeFilter = event.target.value;
  displayRecords();
});
