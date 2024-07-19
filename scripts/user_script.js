let currentSort = null;
let currentSearchQuery = '';

document.addEventListener("DOMContentLoaded", () => {
  displayRecords();

  document.getElementById("sortSerialNumber").addEventListener("change", () => {
    if (document.getElementById("sortSerialNumber").checked) {
      currentSort = "serialNumber";
      document.getElementById("sortSpecies").checked = false;
    } else {
      currentSort = null;
    }
    sortRecords(currentSort, currentSearchQuery);
  });

  document.getElementById("sortSpecies").addEventListener("change", () => {
    if (document.getElementById("sortSpecies").checked) {
      currentSort = "species";
      document.getElementById("sortSerialNumber").checked = false;
    } else {
      currentSort = null;
    }
    sortRecords(currentSort, currentSearchQuery);
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    currentSearchQuery = event.target.value.trim().toLowerCase();
    sortRecords(currentSort, currentSearchQuery);
  });
});

function sortRecords(sortBy, searchQuery) {
  const recordsContainer = document.getElementById("records");
  recordsContainer.innerHTML = "";

  database.ref("wood").once("value", (snapshot) => {
    let recordsArray = [];
    snapshot.forEach((childSnapshot) => {
      const record = childSnapshot.val();
      if (searchQuery) {
        const recordName = record.name.toLowerCase();
        const recordSerialNumber = record.serialNumber.toLowerCase();
        if (!recordName.includes(searchQuery) && !recordSerialNumber.includes(searchQuery)) {
          return; // Skip records that don't match the search query
        }
      }
      recordsArray.push({ key: childSnapshot.key, ...record });
    });

    if (sortBy === "serialNumber") {
      recordsArray.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    } else if (sortBy === "species") {
      recordsArray.sort((a, b) => {
        const speciesComparison = a.species.localeCompare(b.species);
        if (speciesComparison !== 0) return speciesComparison;
        return a.serialNumber.localeCompare(b.serialNumber);
      });
    }

    recordsArray.forEach((record) => {
      const recordDiv = createRecordElement(record, record.key);
      recordsContainer.appendChild(recordDiv);
    });
  });
}

function displayRecords() {
  sortRecords(currentSort, currentSearchQuery);
}

function createRecordElement(record, key) {
  const recordDiv = document.createElement("div");
  recordDiv.classList.add("record");
  recordDiv.innerHTML = `
    <div class="record-info">
    <span class="record-item"><strong>Numer Seryjny:</strong> ${record.serialNumber}</span> 
    <span class="record-item"><strong>Gatunek:</strong> ${record.species}</span> 
    <span class="record-item"><strong>Typ:</strong> ${record.type}</span>
  </div>
    <div id="zoom-cont" class="zoom-container"><img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>
    <div class="more">
      <div id="record-menu" class="record-buttons">
        <button class="details-btn" data-id="${key}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
            <path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"/>
          </svg>
        </button>
        <div>
          <div class="heart" id="heart" style="position:relative;margin-top:10px; margin-left:20px; height:20px; width:20px; cursor:pointer; background:white; display:flex; justify-content:center; text-align:center; border-radius:0 0 0 10px; transform:rotate(-45deg);"></div>
          <div class="animation-heart" id="animation-heart"></div>
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

const heart = document.querySelector(".heart");
const animationHeart = document.querySelector(".animation-heart");

heart.addEventListener("click", () => {
  animationHeart.classList.add("popup");
  heart.classList.add("fill-color")
})

