
  
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
  
  function showDetailsModal(recordId, batches) {
    const recordRef = database.ref("wood/" + recordId.toString());
    recordRef.once("value", (snapshot) => {
      const record = snapshot.val();
      if (record) {
        let averageMoisture = Math.round((parseFloat(record.moisture1) + parseFloat(record.moisture2) + parseFloat(record.moisture3)) / 3) + '%';
        record.averageMoisture = averageMoisture;
  
        let pricePromise = Promise.resolve(null);
        if (record.batch && record.volume) {
          pricePromise = calculateBoardPrice(record.volume, record.batch);
        }
  
        pricePromise.then((price) => {
          if (price !== null) {
            record.price = price;
            recordRef.update({ price: price });
          }
  
          // Przygotuj treść modala
          let modalContent = `
            <p><strong>Numer seryjny:</strong> ${record.serialNumber}</p>
            <p><strong>Nazwa:</strong> ${record.name}</p>
            <p><strong>Gatunek:</strong> ${record.species}</p>
            <p><strong>Typ:</strong> ${record.type}</p>
            <p><strong>Kształt:</strong> ${record.shape}</p>
            <p><strong>Data zakupu:</strong> ${record.purchaseDate}</p>
            <p><strong>Zakupiona od:</strong> ${record.purchasedFrom}</p>
            <p><strong>Rok ścięcia:</strong> ${record.yearCut}</p>
            <p><strong>Średnia wilgotność:</strong> ${record.averageMoisture}</p>
            <p><strong>Wilgotność 1:</strong> ${record.moisture1}%</p>
            <p><strong>Wilgotność 2:</strong> ${record.moisture2}%</p>
            <p><strong>Wilgotność 3:</strong> ${record.moisture3}%</p>
            <p><strong>Osoba mierząca:</strong> ${record.measurer}</p>
            <p><strong>Wilgotnościomierz:</strong> ${record.moistureMeter}</p>
            <p><strong>Wysokość:</strong> ${record.height} cm</p>
            <p><strong>Szerokość:</strong> ${record.width} cm</p>
            <p><strong>Grubość:</strong> ${record.thickness} cm</p>
            <p><strong>Objętość:</strong> ${record.volume} m³</p>
            <p><strong>Partia:</strong> ${record.batch}</p>
            <p><strong>Cena:</strong> ${price ? price + ' PLN' : "Nie obliczona"}</p>
          `;
  
          if (record.serialNumber) {
            const imageRef = storage.ref(record.serialNumber + ".jpg");
            imageRef.getDownloadURL().then((url) => {
              modalContent += `
                <div id="zoom-cont" class="zoom-container">
                  <img src="${url}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;">
                </div>
              `;
              showModalWithContent(modalContent);
  
              // Dodaj event listeners do zoomowania
              const container = document.getElementById("zoom-cont");
              const img = document.getElementById("zoom-img");
  
              container.addEventListener("mousemove", (e) => {
                const x = e.clientX - container.offsetLeft;
                const y = e.clientY - container.offsetTop;
  
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
  
                const offsetX = (x / containerWidth - 0.5) * 100;
                const offsetY = (y / containerHeight - 0.5) * 100;
  
                img.style.transformOrigin = `${offsetX}% ${offsetY}%`;
                img.style.transform = `scale(2)`;
              });
  
              container.addEventListener("mouseleave", () => {
                img.style.transformOrigin = "center";
                img.style.transform = "scale(1)";
              });
            }).catch((error) => {
              console.error("Błąd podczas pobierania URL zdjęcia:", error);
              showModalWithContent(modalContent);
            });
          } else {
            showModalWithContent(modalContent);
          }
        }).catch((error) => {
          console.error("Błąd podczas obliczania ceny deski:", error);
          showModalWithContent(modalContent);
        });
      } else {
        console.error("Rekord nie znaleziony lub pusty");
      }
    });
  }
  


function showModalWithContent(content) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Szczegóły</h2>
            ${content}
        </div>
    `;
  
    document.body.appendChild(modal);
  
    const closeButton = modal.querySelector(".close");
    closeButton.addEventListener("click", () => {
        modal.remove();
    });
}

  
  function displayRecords() {
  const recordsContainer = document.getElementById("records");
  recordsContainer.innerHTML = "";
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  database.ref("wood").once("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const record = childSnapshot.val();
      const recordName = record.name.toLowerCase();
      const recordSerialNumber = record.serialNumber.toLowerCase();
      if (
        recordName.includes(searchInput) ||
        recordSerialNumber.includes(searchInput) ||
        !searchInput
      ) {
        const recordDiv = document.createElement("div");
        recordDiv.classList.add("record");
        recordDiv.innerHTML = `
                    <div>
                        <strong>ID:</strong> ${record.id}, 
                        <strong>Numer Seryjny:</strong> ${record.serialNumber}, 
                        <strong>Gatunek:</strong> ${record.species}, 
                        <strong>Typ:</strong> ${record.type}
                    </div>
                    <div class="more">
                    <div id="record-menu" class="record-buttons">
                        <button class="edit-details-btn" onclick="editRecord('${childSnapshot.key}')"><svg style="width:30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#342323" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg></button>
                        <button class="delete-btn" onclick="deleteRecord('${childSnapshot.key}')" data-id="${childSnapshot.key}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#b42222" d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg></button>
                        <button class="details-btn" onclick="showDetailsModal('${childSnapshot.key}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"/></svg></button>
                    </div>
                    </div>
                `;
        recordsContainer.appendChild(recordDiv);
      }
    });
    document.querySelectorAll(".details-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const recordId = this.getAttribute("data-id");
        showDetailsModal(recordId);
      });
    });
  });
  }
  
  document
  .getElementById("searchInput")
  .addEventListener("input", displayRecords);
  
  function editRecord(recordId) {
    const recordRef = database.ref("wood/" + recordId.toString());
    const partiesRef = database.ref("parties"); // Gałąź z partiami
  
    
    recordRef.once("value", (snapshot) => {
      const record = snapshot.val();
      
      
      partiesRef.once("value", (partySnapshot) => {
        const parties = partySnapshot.val();
        console.log("Parties data:", parties); 
  
        let partyOptions = "";
  
    
        for (const partyId in parties) {
          if (parties.hasOwnProperty(partyId)) {
            const party = parties[partyId];
            const partyName = party.name || "Niezdefiniowana partia";
            console.log(`Party ID: ${partyId}, Party Name: ${partyName}`);
            const selected = record.batch === partyId ? "selected" : "";
            partyOptions += `<option value="${partyName}" ${selected}>${partyName}</option>`;
          }
        }
  
        let editForm = `
          <form id="editRecordForm">
            <input type="text" class="edit-input" id="editWoodSerialNumber" placeholder="Numer Seryjny" value="${record.serialNumber || ""}" required>
            <input type="text" class="edit-input" id="editWoodName" placeholder="Nazwa" value="${record.name || ""}" required>
            <input type="text" class="edit-input" id="editWoodSpecies" placeholder="Gatunek" value="${record.species || ""}">
            <input type="text" class="edit-input" id="editWoodType" placeholder="Typ (P lub D)" value="${record.type || ""}">
            <input type="text" class="edit-input" id="editWoodShape" placeholder="Kształt" value="${record.shape || ""}">
            <input type="text" class="edit-input" id="editWoodPurchaseDate" placeholder="Data Zakupu" value="${record.purchaseDate || ""}">
            <input type="text" class="edit-input" id="editWoodPurchasedFrom" placeholder="Zakupione od" value="${record.purchasedFrom || ""}">
            <input type="text" class="edit-input" id="editWoodYearCut" placeholder="Rok Ścięcia" value="${record.yearCut || ""}">
            <input type="text" class="edit-input" id="editWoodMoisture1" placeholder="Wilgotność 1 (%)" value="${record.moisture1 || ""}">
            <input type="text" class="edit-input" id="editWoodMoisture2" placeholder="Wilgotność 2 (%)" value="${record.moisture2 || ""}">
            <input type="text" class="edit-input" id="editWoodMoisture3" placeholder="Wilgotność 3 (%)" value="${record.moisture3 || ""}">
            <input type="text" class="edit-input" id="editWoodMeasurer" placeholder="Osoba mierząca" value="${record.measurer || ""}">
            <input type="text" class="edit-input" id="editWoodMoistureMeter" placeholder="Wilgotnościomierz" value="${record.moistureMeter || ""}">
            <input type="text" class="edit-input" id="editWoodHeight" placeholder="Wysokość" value="${record.height || ""}">
            <input type="text" class="edit-input" id="editWoodWidth" placeholder="Szerokość" value="${record.width || ""}">
            <input type="text" class="edit-input" id="editWoodThickness" placeholder="Grubość" value="${record.thickness || ""}">
            <label for="partySelect">Partia</label>
            <select id="partySelect" name="party" class="form-control">
            <option>Wybierz partię</option>

              ${partyOptions}
            </select>
            <button class="submit-btn" type="submit">Zapisz zmiany</button>
          </form>
        `;
  
        showModalWithContent(editForm);
  
        document
          .getElementById("editRecordForm")
          .addEventListener("submit", (event) => {
            event.preventDefault();
            const editedRecord = {
              serialNumber: document.getElementById("editWoodSerialNumber").value,
              name: document.getElementById("editWoodName").value,
              species: document.getElementById("editWoodSpecies").value,
              type: document.getElementById("editWoodType").value,
              shape: document.getElementById("editWoodShape").value,
              purchaseDate: document.getElementById("editWoodPurchaseDate").value,
              purchasedFrom: document.getElementById("editWoodPurchasedFrom").value,
              yearCut: document.getElementById("editWoodYearCut").value,
              moisture1: document.getElementById("editWoodMoisture1").value,
              moisture2: document.getElementById("editWoodMoisture2").value,
              moisture3: document.getElementById("editWoodMoisture3").value,
              measurer: document.getElementById("editWoodMeasurer").value,
              moistureMeter: document.getElementById("editWoodMoistureMeter").value,
              height: document.getElementById("editWoodHeight").value,
              width: document.getElementById("editWoodWidth").value,
              thickness: document.getElementById("editWoodThickness").value,
              batch: document.getElementById("partySelect").value 
            };
  
            recordRef
              .update(editedRecord)
              .then(() => {
                console.log("Record updated successfully");
                closeModal();
                displayRecords();
              })
              .catch((error) => {
                console.error("Error updating record: ", error);
                alert("Error updating record. Please try again.");
              });
          });
      });
    });
  }
  
  

  function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.remove();
  }
  }
  
  document
  .getElementById("addRecordButton")
  .addEventListener("click", showAddRecordModal);
  
  document.getElementById("addRecordForm").addEventListener("submit", addRecord);
  
  function deleteRecord(recordId) {
  if (confirm("Czy na pewno chcesz usunąć ten rekord?")) {
    database
      .ref("wood/" + recordId)
      .remove()
      .then(() => {
        console.log("Record deleted successfully");
        displayRecords();
      })
      .catch((error) => {
        console.error("Error removing record: ", error);
      });
  }
  }
  
  function showAddRecordModal() {
  const modal = document.getElementById("addRecordModal");
  modal.style.display = "block";
  const inputs = document.querySelectorAll("#addRecordForm input");
  inputs.forEach((input) => {
    input.style.display = "block";
  });
  const submitBtn = document.querySelector(
    '#addRecordForm button[type="submit"]'
  );
  submitBtn.style.display = "block";
  const closeBtn = document.querySelector(".close");
  closeBtn.style.display = "block";
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
    inputs.forEach((input) => {
      input.style.display = "none";
    });
    submitBtn.style.display = "none";
    closeBtn.style.display = "none";
  });
  }
  
  let recordCounter = 0;
  
  function addRecord(event) {
    event.preventDefault();

    const woodSerialNumber = document.getElementById("woodSerialNumber").value;
    const woodName = document.getElementById("woodName").value;
    const woodSpecies = document.getElementById("woodSpecies").value;
    const woodType = document.getElementById("woodType").value;
    const woodShape = document.getElementById("woodShape").value;
    const woodPurchaseDate = document.getElementById("woodPurchaseDate").value;
    const woodPurchasedFrom = document.getElementById("woodPurchasedFrom").value;
    const woodYearCut = document.getElementById("woodYearCut").value;
    const woodMoisture1 = parseFloat(document.getElementById("woodMoisture1").value);
    const woodMoisture2 = parseFloat(document.getElementById("woodMoisture2").value);
    const woodMoisture3 = parseFloat(document.getElementById("woodMoisture3").value);
    const woodMeasurer = document.getElementById("woodMeasurer").value;
    const woodMoistureMeter = document.getElementById("woodMoistureMeter").value;
    const woodHeight = parseFloat(document.getElementById("woodHeight").value);
    const woodWidth = parseFloat(document.getElementById("woodWidth").value);
    const woodThickness = parseFloat(document.getElementById("woodThickness").value);
    const woodBatch = document.getElementById("woodBatch").value; 
    const file = document.getElementById("image").files[0];

    const recordCounterRef = database.ref("recordCounter");

    recordCounterRef.transaction(function (currentValue) {
        return (currentValue || 0) + 1;
    }, function (error, committed, snapshot) {
        if (error) {
            console.error("Transaction failed abnormally!", error);
        } else if (!committed) {
            console.log("Transaction aborted.");
        } else {
            const newRecordCounterValue = snapshot.val();
            const recordId = newRecordCounterValue;
            const volume = calculateVolume(woodHeight, woodWidth, woodThickness);

            
            let pricePromise = Promise.resolve(null);
            if (woodBatch && volume > 0) {
                pricePromise = calculateBoardPrice(volume, woodBatch);
            }

            pricePromise.then((price) => {
                if (file) {
                    const storageRef = storage.ref(woodSerialNumber + ".jpg");
                    storageRef
                        .put(file)
                        .then(() => {
                            storageRef
                                .getDownloadURL()
                                .then((url) => {
                                    saveRecordToDatabase(url, recordId, volume, price);
                                })
                                .catch((error) => {
                                    console.error("Error getting image URL: ", error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error uploading image: ", error);
                        });
                } else {
                    saveRecordToDatabase(null, recordId, volume, price);
                }
            }).catch((error) => {
                console.error("Error calculating board price: ", error);
                if (file) {
                    const storageRef = storage.ref(woodSerialNumber + ".jpg");
                    storageRef
                        .put(file)
                        .then(() => {
                            storageRef
                                .getDownloadURL()
                                .then((url) => {
                                    saveRecordToDatabase(url, recordId, volume, 0); 
                                })
                                .catch((error) => {
                                    console.error("Error getting image URL: ", error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error uploading image: ", error);
                        });
                } else {
                    saveRecordToDatabase(null, recordId, volume, 0); 
                }
            });
        }
    });

    function saveRecordToDatabase(imageUrl, recordId, volume, price) {
        database
            .ref("wood/" + recordId)
            .set({
                id: recordId,
                serialNumber: woodSerialNumber,
                name: woodName,
                species: woodSpecies,
                type: woodType,
                shape: woodShape,
                purchaseDate: woodPurchaseDate,
                purchasedFrom: woodPurchasedFrom,
                yearCut: woodYearCut,
                moisture1: woodMoisture1,
                moisture2: woodMoisture2,
                moisture3: woodMoisture3,
                measurer: woodMeasurer,
                moistureMeter: woodMoistureMeter,
                height: woodHeight,
                width: woodWidth,
                thickness: woodThickness,
                volume: volume,
                batch: woodBatch, 
                price: price, 
                imageUrl: imageUrl,
            })
            .then(() => {
                document.getElementById("addRecordForm").reset();
                const modal = document.getElementById("addRecordModal");
                modal.style.display = "none";
                displayRecords();
            })
            .catch((error) => {
                console.error("Error adding record to database: ", error);
            });
    }

    function calculateVolume(height, width, thickness) {
        return (parseFloat(height) * parseFloat(width) * parseFloat(thickness)) / 1000000; 
    }
}


function calculateVolume(height, width, thickness) {
    height = parseFloat(height) / 100; 
    width = parseFloat(width) / 100;   
    thickness = parseFloat(thickness) / 100;
    return (height * width * thickness).toFixed(3); 
}

  
  function monitorRecordCount() {
  const woodRef = database.ref("wood");
  woodRef.on("value", (snapshot) => {
    const recordCount = snapshot.numChildren();
    if (recordCount === 0) {
      resetRecordCounter(); 
    }
  });
  }
  
  function resetRecordCounter() {
  const recordCounterRef = database.ref("recordCounter");
  recordCounterRef.set(0)
    .then(() => {
      console.log("recordCounter reset to 0");
    })
    .catch((error) => {
      console.error("Error resetting recordCounter: ", error);
    });
  }
  
  window.addEventListener("load", monitorRecordCount);
  window.addEventListener("load", displayRecords);
  
  document
  .getElementById("addRecordButton")
  .addEventListener("click", showAddRecordModal);
  
  document.getElementById("addRecordForm").addEventListener("submit", addRecord);

  document.addEventListener('DOMContentLoaded', (event) => {
    const addPartiaButton = document.getElementById('addPartiaButton');
    const addPartiaModal = document.getElementById('addPartiaModal');
    const closePartiaModal = document.getElementById('closePartiaModal');

    addPartiaButton.addEventListener('click', () => {
        addPartiaModal.style.display = 'block';
    });

    closePartiaModal.addEventListener('click', () => {
        addPartiaModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === addPartiaModal) {
            addPartiaModal.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const partiaForm = document.getElementById('partiaForm');
  const addPartiaButton = document.getElementById('addPartiaButton');
  const addPartiaModal = document.getElementById('addPartiaModal');
  const closePartiaModal = document.getElementById('closePartiaModal');

  addPartiaButton.addEventListener('click', () => {
      addPartiaModal.style.display = 'block';
  });

  closePartiaModal.addEventListener('click', () => {
      addPartiaModal.style.display = 'none';
  });

  partiaForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const partiaName = document.getElementById('partia-name').value;
      const partiaDate = document.getElementById('partia-date').value;
      const partiaPrice = parseFloat(document.getElementById('partia-price').value);
      const partiaTransPrice = parseFloat(document.getElementById('partia-trans-price').value);
      const partiaSignPrice = parseFloat(document.getElementById('partia-sign-price').value);

      const totalCost = partiaPrice + partiaTransPrice + partiaSignPrice;

      const newPartia = {
          name: partiaName,
          date: partiaDate,
          price: partiaPrice,
          transportCost: partiaTransPrice,
          unpackingCost: partiaSignPrice,
          totalCost: totalCost
      };

      database.ref('parties').push(newPartia)
          .then(() => {
              alert('Partia została dodana!');
              partiaForm.reset();
              addPartiaModal.style.display = 'none';
          })
          .catch((error) => {
              console.error('Error adding partia:', error);
              alert('Wystąpił błąd podczas dodawania partii.');
          });
  });
});


function loadBatches() {
  const batchSelect = document.getElementById("woodBatch");
  
  // Czyść istniejące opcje
  batchSelect.innerHTML = "<option value=''>Wybierz partię</option>";
  
  // Pobierz dane o partiach z bazy danych
  const batchesRef = database.ref("parties");
  batchesRef.once("value")
      .then((snapshot) => {
          const batches = snapshot.val();
          if (batches) {
              for (const batchId in batches) {
                  const batch = batches[batchId];
                  const option = document.createElement("option");
                  option.value = batchId;
                  option.text = batch.name; 
                  batchSelect.add(option);
              }
          } else {
              console.log("Brak dostępnych partii");
          }
      })
      .catch((error) => {
          console.error("Error loading batches: ", error);
      });
}
document.addEventListener("DOMContentLoaded", () => {
  loadBatches(); 
});

function calculateBoardPrice(volume, batchId) {
  console.log("Calculating price for batch ID:", batchId); 

  return database.ref("batches/" + batchId).once("value").then((snapshot) => {
    const batch = snapshot.val();
    console.log("Batch data:", batch); 

    if (batch && batch.totalPrice) {
      const totalPrice = parseFloat(batch.totalPrice);
      if (volume > 0) {
        return Math.round((totalPrice / volume) * 100) / 100;
      } else {
        console.error("Objętość deski jest równa 0.");
        return 0; 
      }
    } else {
      console.error("Brak danych o partii lub cena całkowita jest niepoprawna.");
      return 0;
    }
  }).catch((error) => {
    console.error("Błąd podczas pobierania danych partii:", error);
    return 0;
  });
}
