

// function getCurrentUserId() {
//   const user = auth.currentUser;
//   return user ? user.uid : null;
// }



// let currentSort = null;
// let currentSearchQuery = '';

// document.addEventListener("DOMContentLoaded", () => {
//   displayRecords();
//   updateFavoritesCount(); // Initial count update

//   document.getElementById("sortSerialNumber").addEventListener("change", () => {
//     if (document.getElementById("sortSerialNumber").checked) {
//       currentSort = "serialNumber";
//       document.getElementById("sortSpecies").checked = false;
//     } else {
//       currentSort = null;
//     }
//     sortRecords(currentSort, currentSearchQuery);
//   });

//   document.getElementById("sortSpecies").addEventListener("change", () => {
//     if (document.getElementById("sortSpecies").checked) {
//       currentSort = "species";
//       document.getElementById("sortSerialNumber").checked = false;
//     } else {
//       currentSort = null;
//     }
//     sortRecords(currentSort, currentSearchQuery);
//   });

//   document.getElementById("searchInput").addEventListener("input", (event) => {
//     currentSearchQuery = event.target.value.trim().toLowerCase();
//     sortRecords(currentSort, currentSearchQuery);
//   });
// });


// function sortRecords(sortBy, searchQuery) {
//   const recordsContainer = document.getElementById("records");
//   recordsContainer.innerHTML = "";

//   database.ref("wood").once("value", (snapshot) => {
//     let recordsArray = [];
//     snapshot.forEach((childSnapshot) => {
//       const record = childSnapshot.val();
//       if (searchQuery) {
//         const recordName = record.name.toLowerCase();
//         const recordSerialNumber = record.serialNumber.toLowerCase();
//         if (!recordName.includes(searchQuery) && !recordSerialNumber.includes(searchQuery)) {
//           return; // Skip records that don't match the search query
//         }
//       }
//       recordsArray.push({ key: childSnapshot.key, ...record });
//     });

//     if (sortBy === "serialNumber") {
//       recordsArray.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
//     } else if (sortBy === "species") {
//       recordsArray.sort((a, b) => {
//         const speciesComparison = a.species.localeCompare(b.species);
//         if (speciesComparison !== 0) return speciesComparison;
//         return a.serialNumber.localeCompare(b.serialNumber);
//       });
//     }

//     recordsArray.forEach((record) => {
//       const recordDiv = createRecordElement(record, record.key);
//       recordsContainer.appendChild(recordDiv);
//     });
//   });
// }

// function displayRecords() {
//   sortRecords(currentSort, currentSearchQuery);
// }
// function createRecordElement(record, key) {
//   const recordDiv = document.createElement("div");
//   recordDiv.classList.add("record");
//   recordDiv.innerHTML = `
//     <div class="record-info">
//       <span class="record-item"><strong>Numer Seryjny:</strong> ${record.serialNumber}</span> 
//       <span class="record-item"><strong>Gatunek:</strong> ${record.species}</span> 
//       <span class="record-item"><strong>Typ:</strong> ${record.type}</span>
//     </div>
//     <div id="zoom-cont" class="zoom-container"><img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>
//     <div class="more">
//       <div id="record-menu" class="record-buttons">
//         <button class="details-btn" data-id="${key}">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
//             <path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"/>
//           </svg>
//         </button>
//         <div class="wrapper">
//           <span>
//             <i class="far fa-heart fa-2xl" onclick="likeBtn(event)" data-serial-number="${record.serialNumber}" style="margin-top:15px; margin-left:15px; cursor:pointer;"></i>
//           </span>
//         </div>
//       </div>
//     </div>
//   `;

//   const detailsButton = recordDiv.querySelector(".details-btn");
//   detailsButton.addEventListener("click", () => {
//     showDetailsModal(key);
//   });

//   return recordDiv;
// }


// function showDetailsModal(recordId) {
//   const recordRef = database.ref("wood/" + recordId.toString());
//   recordRef.once("value", (snapshot) => {
//     const record = snapshot.val();
//     if (record) {
//       let averageMoisture = Math.round((parseFloat(record.moisture1) + parseFloat(record.moisture2) + parseFloat(record.moisture3)) / 3) + '%';
//       record.averageMoisture = averageMoisture;            
//       let modalContent = `
//           <h3>Szczegóły</h3>
//           <p><strong>Numer seryjny:</strong> ${record.serialNumber}</p>
//           <p><strong>Gatunek:</strong> ${record.species}</p>
//           <p><strong>Typ:</strong> ${record.type}</p>
//           <p><strong>Średnia wilgotność:</strong> ${record.averageMoisture}</p>
//           <p><strong>Wysokość:</strong> ${record.height}</p>
//           <p><strong>Szerokość:</strong> ${record.width}</p>
//           <p><strong>Grubość:</strong> ${record.thickness}</p>
//           <p><strong>Średnica:</strong> ${record.diameter}</p>
//       `;

//       if (record.imageUrl) {
//         modalContent += `
//           <div id="zoom-cont" class="zoom-container"><img src="${record.imageUrl}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>
//         `;
//       }

//       showModalWithContent(modalContent);
//     } else {
//       console.error("Record not found or empty");
//     }
//   }).catch((error) => {
//     console.error("Error fetching record:", error);
//   });
// }

// function showModalWithContent(content) {
//   const modal = document.createElement("div");
//   modal.classList.add("modal");
//   modal.style.display = "block";
//   modal.innerHTML = `
//     <div class="modal-content">
//       <span class="close">&times;</span>
//       ${content}
//     </div>
//   `;

//   document.body.appendChild(modal);

//   const closeModal = () => {
//     modal.style.display = "none";
//     modal.remove();
//   };

//   modal.querySelector(".close").addEventListener("click", closeModal);

//   window.addEventListener("click", (event) => {
//     if (event.target === modal) {
//       closeModal();
//     }
//   });
// }

// function likeBtn(event) {
//   const btn = event.target;
//   const recordSerialNumber = btn.getAttribute("data-serial-number");
//   const userId = getCurrentUserId();

//   if (!userId) {
//     console.error("User is not logged in.");
//     return;
//   }

//   const userFavoritesRef = database.ref(`users/${userId}/favorites/${recordSerialNumber}`);

//   if (btn.classList.contains("far")) {
//     // Add to favorites
//     userFavoritesRef.set(true)
//       .then(() => {
//         btn.classList.remove("far");
//         btn.classList.add("fas");
//         console.log(`Record ${recordSerialNumber} added to favorites.`);
//         updateFavoritesCount(); // Update the favorites count
//       })
//       .catch(error => {
//         console.error("Error adding to favorites:", error);
//       });
//   } else {
//     // Remove from favorites
//     userFavoritesRef.remove()
//       .then(() => {
//         btn.classList.remove("fas");
//         btn.classList.add("far");
//         console.log(`Record ${recordSerialNumber} removed from favorites.`);
//         updateFavoritesCount(); // Update the favorites count
//       })
//       .catch(error => {
//         console.error("Error removing from favorites:", error);
//       });
//   }
// }

// function updateFavoritesCount() {
//   const userId = getCurrentUserId();

//   if (!userId) {
//     console.error("User is not logged in.");
//     return;
//   }

//   database.ref(`users/${userId}/favorites`).once('value', (snapshot) => {
//     const favorites = snapshot.val();
//     const count = favorites ? Object.keys(favorites).length : 0;
//     document.getElementById('favoritesCount').textContent = count;
//   }).catch((error) => {
//     console.error("Error fetching favorites count:", error);
//   });
// }


function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

let currentSort = null;
let currentSearchQuery = '';
let userFavorites = {};

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      updateFavoritesCount(); // Update the favorites count initially
      loadUserFavorites();
    }
  });

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

function loadUserFavorites() {
  const userId = getCurrentUserId();

  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  database.ref(`users/${userId}/favorites`).once('value', (snapshot) => {
    userFavorites = snapshot.val() || {};
    displayRecords(); // Redisplay records with the updated favorites
  }).catch((error) => {
    console.error("Error fetching user favorites:", error);
  });
}

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
  const btn = event.target;
  const recordSerialNumber = btn.getAttribute("data-serial-number");
  const userId = getCurrentUserId();

  if (!userId) {
    console.error("User is not logged in.");
    return;
  }

  const userFavoritesRef = database.ref(`users/${userId}/favorites/${recordSerialNumber}`);

  if (btn.classList.contains("far")) {
    // Add to favorites
    userFavoritesRef.set(true)
      .then(() => {
        btn.classList.remove("far");
        btn.classList.add("fas");
        userFavorites[recordSerialNumber] = true;
        console.log(`Record ${recordSerialNumber} added to favorites.`);
        updateFavoritesCount(); // Update the favorites count
      })
      .catch(error => {
        console.error("Error adding to favorites:", error);
      });
  } else {
    // Remove from favorites
    userFavoritesRef.remove()
      .then(() => {
        btn.classList.remove("fas");
        btn.classList.add("far");
        delete userFavorites[recordSerialNumber];
        console.log(`Record ${recordSerialNumber} removed from favorites.`);
        updateFavoritesCount(); // Update the favorites count
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
    document.getElementById('favoritesCount').textContent = count;
  }).catch((error) => {
    console.error("Error fetching favorites count:", error);
  });
}
