let currentSort = null;
let currentSearchQuery = '';
let currentSpeciesFilter = 'Gatunek';
let currentTypeFilter = 'Typ'; 
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

  const minMoisture = parseFloat(document.getElementById("min-moisture").value) || 0;
  const maxMoisture = parseFloat(document.getElementById("max-moisture").value) || 100;
  const minHeight = parseFloat(document.getElementById("min-height").value) || 0;
  const maxHeight = parseFloat(document.getElementById("max-height").value) || 100;
  const minWidth = parseFloat(document.getElementById("min-width").value) || 0;
  const maxWidth = parseFloat(document.getElementById("max-width").value) || 100;
  const minThickness = parseFloat(document.getElementById("min-thickness").value) || 0;
  const maxThickness = parseFloat(document.getElementById("max-thickness").value) || 100;

  return recordsArray.filter(record => {
    const speciesMatch = currentSpeciesFilter === 'Gatunek' || record.species === currentSpeciesFilter;
    const typeMatch = currentTypeFilter === 'Typ' || record.type === currentTypeFilter;
    const searchQueryMatch = currentSearchQuery === '' ||
      (record.name && record.name.toLowerCase().includes(currentSearchQuery)) ||
      (record.serialNumber && record.serialNumber.toLowerCase().includes(currentSearchQuery));
    
    const averageMoisture = (parseFloat(record.moisture1) + parseFloat(record.moisture2) + parseFloat(record.moisture3)) / 3;
    const moistureMatch = averageMoisture >= minMoisture && averageMoisture <= maxMoisture;
    const heightMatch = parseFloat(record.height) >= minHeight && parseFloat(record.height) <= maxHeight;
    const widthMatch = parseFloat(record.width) >= minWidth && parseFloat(record.width) <= maxWidth;
    const thicknessMatch = parseFloat(record.thickness) >= minThickness && parseFloat(record.thickness) <= maxThickness;

    console.log(`Record ${record.serialNumber} matches filters:`, {
      speciesMatch,
      typeMatch,
      searchQueryMatch,
      moistureMatch,
      heightMatch,
      widthMatch,
      thicknessMatch
    });

    return speciesMatch && typeMatch && searchQueryMatch && moistureMatch && heightMatch && widthMatch && thicknessMatch;
  });
}

document.getElementById("submit-filters").addEventListener("click", displayRecords);

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
    console.error("Error fetching records:", error);
  });
}

function resetFilters() {
  document.getElementById("searchInput").value = '';
  currentSearchQuery = '';

  document.getElementById("species-select").value = 'Gatunek';
  currentSpeciesFilter = 'Gatunek';

  document.getElementById("type-select").value = 'Typ';
  currentTypeFilter = 'Typ';

  document.querySelectorAll('.moisture-filter input').forEach(input => input.value = '');
  document.querySelectorAll('.height-filter input').forEach(input => input.value = '');
  document.querySelectorAll('.width-filter input').forEach(input => input.value = '');
  document.querySelectorAll('.thickness-filter input').forEach(input => input.value = '');

  minMoisture = null;
  maxMoisture = null;
  minHeight = null;
  maxHeight = null;
  minWidth = null;
  maxWidth = null;
  minThickness = null;
  maxThickness = null;

  displayRecords();
}

document.getElementById("reset-filters").addEventListener("click", resetFilters);



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

let resetFiltersBtn = document.getElementById("filtr-btn")



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

function toggleFilters() {
  const filtersDiv = document.querySelector('.filters');
  if (filtersDiv.style.display === 'none' || filtersDiv.style.display === '') {
    filtersDiv.style.display = 'flex'; 
  } else {
    filtersDiv.style.display = 'none'; 
  }
}

document.getElementById('filtr-btn').addEventListener('click', toggleFilters);


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
