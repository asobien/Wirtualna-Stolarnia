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
                <p><strong>Wysokość:</strong> ${record.height}</p>
                <p><strong>Szerokość:</strong> ${record.width}</p>
                <p><strong>Grubość:</strong> ${record.thickness}</p>
                <p><strong>Średnica:</strong> ${record.diameter}%</p>
            `;
  
        if (record.serialNumber) {
          const imageRef = storage.ref(record.serialNumber + ".jpg");
          imageRef
            .getDownloadURL()
            .then((url) => {
              modalContent += `<div id="zoom-cont" class=zoom-container><img src="${url}" alt="Record Image" class="zoom-img" id="zoom-img" style="width:200px;"></div>`;
              showModalWithContent(modalContent);
  
              const container = document.getElementById("zoom-cont");
              const img = document.getElementById("zoom-img");
  
              container.addEventListener("mousemove", (e) => {
                const x = e.clientX - container.offsetLeft;
                const y = e.clientY - container.offsetTop;
            
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
            
                const offsetX = (x / containerWidth - 2) * 25;
                const offsetY = (y / containerHeight + 1.1) * 60;
            
                img.style.transformOrigin = "center";
                img.style.transform = `scale(2) translate(${offsetX}%, ${offsetY}%)`;
            });
              container.addEventListener("mouseleave", () => {
                img.style.transformOrigin = "center";
                img.style.transform = "scale(1)";
              })
            })
            .catch((error) => {
              console.error("Error getting image URL:", error);
              showModalWithContent(modalContent);
            });
        } else {
          showModalWithContent(modalContent);
        }
      } else {
        console.error("Record not found or empty");
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
                        <button class="edit-details-btn" onclick="editRecord('${childSnapshot.key}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#342323" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg></button>
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
  recordRef.once("value", (snapshot) => {
    const record = snapshot.val();
    let editForm = `
                <form id="editRecordForm">
                
                <label>Numer seryjny:<input type="text" class="edit-input" id="editWoodSerialNumber" placeholder="Numer Seryjny" value="${
                  record.serialNumber || ""
                }" required></label>
                <label>Nazwa:<input type="text" class="edit-input" id="editWoodName" placeholder="Nazwa" value="${
                  record.name || ""
                }" required></label>
                <label>Gatunek:<input type="text" class="edit-input" id="editWoodSpecies" placeholder="Gatunek" value="${
                  record.species || ""
                }"></label>
                <label>Typ:<input type="text" class="edit-input" id="editWoodType" placeholder="Typ (P lub D)" value="${
                  record.type || ""
                }"></label>
                <label>Kształt:<input type="text" class="edit-input" id="editWoodShape" placeholder="Kształt" value="${
                  record.shape || ""
                }"></label>
                <label>Data zakupu:<input type="" class="edit-input" id="editWoodPurchaseDate" placeholder="Data Zakupu" value="${
                  record.purchaseDate || ""
                }"></label>
                <label>Zakupiona od:<input type="text" class="edit-input" id="editWoodPurchasedFrom" placeholder="Zakupione od" value="${
                  record.purchasedFrom || ""
                }"></label>
                <label>Rok ścięcia:<input type="text" class="edit-input" id="editWoodYearCut" placeholder="Rok Ścięcia" value="${
                  record.yearCut || ""
                }"></label>
                <label>Wilgotność 1:<input type="text" class="edit-input" id="editWoodMoisture1" placeholder="Wilgotność 1 (%)" value="${
                  record.moisture1 || ""
                }"></label>
                <label>Wilgotność 2:<input type="text" class="edit-input" id="editWoodMoisture2" placeholder="Wilgotność 2 (%)" value="${
                  record.moisture2 || ""
                }"></label>
                <label>Wilgotność 3:<input type="text" class="edit-input" id="editWoodMoisture3" placeholder="Wilgotność 3 (%)" value="${
                  record.moisture3 || ""
                }"></label>
                <label>Osoba mierząca:<input type="text" class="edit-input" id="editWoodMeasurer" placeholder="Osoba mierząca" value="${
                  record.measurer || ""
                }"></label>
                <label>Wilgotnościomierz:<input type="text" class="edit-input" id="editWoodMoistureMeter" placeholder="Wilgotnościomierz" value="${
                  record.moistureMeter || ""
                }"></label>                    
                <label>Wysokość:<input type="text" class="edit-input" id="editWoodHeight" placeholder="Wysokość" value="${
                  record.height || ""
                }"></label>
                <label>Szerokość:<input type="text" class="edit-input" id="editWoodWidth" placeholder="Szerokość" value="${
                  record.width || ""
                }"></label>
                <label>Grubość:<input type="text" class="edit-input" id="editWoodThickness" placeholder="Grubość" value="${
                  record.thickness || ""
                }"></label>
                <label>Średnica:<input type="text" class="edit-input" id="editWoodDiameter" placeholder="Średnica" value="${
                  record.diameter || ""
                }"></label>
                <label style="display:none;" id="additional-wood-measure-date">Data pomiaru:<input type="date" class="edit-input" id="editWoodMeasureDate"></label>
                <label style="display:none;" id="additiona-wood-moisture4">Wilgotność 4:<input type="text" class="edit-input" id="editWoodMoisture4" placeholder="Wilgotność 4 (%)"></label>
                <label style="display:none;" id="additional-wood-moisture5">Wilgotność 5:<input type="text" class="edit-input" id="editWoodMoisture5" placeholder="Wilgotność 5 (%)"></label> 
                <label style="display:none;" id="additional-wood-moisture6">Wilgotność 6:<input type="text" class="edit-input" id="editWoodMoisture6" placeholder="Wilgotność 6 (%)"></label> 
                <button style="display:none;" id="additionalMoistureDelete">X</button> 

                <button id="addMoistureButton">Dodaj pomiar wilgotności</button>
                <button class="submit-btn" type="submit">Zapisz zmiany</button>
            </form>
        `;

    showModalWithContent(editForm);
    const addMoistureButton = document.getElementById("addMoistureButton");
    addMoistureButton.addEventListener("click", () => {
      addMoistureFields();
    });

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
          diameter: document.getElementById("editWoodDiameter").value,
          measureDate: document.getElementById("editWoodMeasureDate").value,
          moisture4: document.getElementById("editWoodMoisture4").value,
          moisture5: document.getElementById("editWoodMoisture5").value,
          moisture6: document.getElementById("editWoodMoisture6").value,
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
}

function addMoistureFields() {
const additionalMeasureDate = document.getElementById("additional-wood-measure-date");
additionalMeasureDate.style.display = "block";
const additionalWoodMoisture4 = document.getElementById("additiona-wood-moisture4");
additionalWoodMoisture4.style.display = "block";
const additionalWoodMoisture5 = document.getElementById("additional-wood-moisture5");
additionalWoodMoisture5.style.display = "block";
const additionalWoodMoisture6 = document.getElementById("additional-wood-moisture6");
additionalWoodMoisture6.style.display = "block";
}

const addMoistureFieldsButton = document.getElementById("add-moisture-btn");
addMoistureFieldsButton.addEventListener("click", () =>{
  const addMeasureDate = document.getElementById("add-measure-date");
  addMeasureDate.style.display = "block";
  const addMoisture4 = document.getElementById("add-moisture4");
  addMoisture4.style.display = "block";
  const addMoisture5 = document.getElementById("add-moisture5");
  addMoisture5.style.display = "block";
  const addMoisture6 = document.getElementById("add-moisture6");
  addMoisture6.style.display = "block";

})
// function addMoistureFields() {
//   let additionalMoistureFieldsDiv = document.getElementById("editRecordForm");
//   additionalMoistureFieldsDiv.innerHTML += `
//   <label>Data pomiaru:<input type="date" class="edit-input" id="editWoodMeasureDate"
//   <label>Wilgotność 4:<input type="text" class="edit-input" id="editWoodMoisture4" placeholder="Wilgotność 4 (%)"></label>
//   <label>Wilgotność 5:<input type="text" class="edit-input" id="editWoodMoisture5" placeholder="Wilgotność 5 (%)"></label> 
//   <label>Wilgotność 6:<input type="text" class="edit-input" id="editWoodMoisture6" placeholder="Wilgotność 6 (%)"></label> 
//   <button id="additionalMoistureDelete">X</button>                                       
//   `;
// }

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
    const woodHeight = document.getElementById("woodHeight").value;
    const woodWidth = document.getElementById("woodWidth").value;
    const woodThickness = document.getElementById("woodThickness").value;
    const woodDiameter = document.getElementById("woodDiameter").value;
    const file = document.getElementById("image").files[0];
    const woodMeasureDate = document.getElementById("woodMeasureDate").value;
    const woodMoisture4 = document.getElementById("woodMoisture4").value;
    const woodMoisture5 = document.getElementById("woodMoisture5").value;
    const woodMoisture6 = document.getElementById("woodMoisture6").value;

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
            if (file) {
                const storageRef = storage.ref(woodSerialNumber + ".jpg");
                storageRef
                    .put(file)
                    .then(() => {
                        storageRef
                            .getDownloadURL()
                            .then((url) => {
                                saveRecordToDatabase(url, recordId);
                            })
                            .catch((error) => {
                                console.error("Error getting image URL: ", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error uploading image: ", error);
                    });
            } else {
                saveRecordToDatabase(null, recordId);
            }
        }
    });

    function saveRecordToDatabase(imageUrl, recordId) {
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
                diameter: woodDiameter,
                imageUrl: imageUrl,
                measureDate: woodMeasureDate,
                moisture4: woodMoisture4,
                moisture5: woodMoisture5,
                moisture6: woodMoisture6,
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


function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username === "user" && password === "WS7684!") {
    document.querySelector(".login-container").style.display = "none";
    document.querySelector(".container").style.display = "block";
  } else {
    document.getElementById("error-msg").innerText =
      "Błędna nazwa użytkownika lub hasło.";
  }
}