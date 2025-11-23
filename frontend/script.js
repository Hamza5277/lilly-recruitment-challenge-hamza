document.addEventListener("DOMContentLoaded", () => {
    fetchMedicines();
});
let allMedicines = [];

//function to fetch medicines from backend
function fetchMedicines() {
    fetch("http://localhost:8000/medicines")
        .then((response) => response.json())
        .then((data) => {
    allMedicines = data.medicines; 
    displayMedicines(allMedicines);
})

        .catch((error) => {
            console.error("Error fetching medicines:", error);
            document.getElementById("medicineList").innerHTML = "<p>Failed to load medicines.</p>";
        });
}
//function to display medicines
function displayMedicines(medicines) {
    const medicineList = document.getElementById("medicineList");
    medicineList.innerHTML = "";

    medicines.forEach((medicine) => {
        const medName = medicine.name || "Unknown Medicine";
        const medPrice = medicine.price !== null ? `$${medicine.price}` : "Price not available";

        const medElement = document.createElement("div");
        medElement.className = "medicine-item";

        // Default view
        medElement.innerHTML = `
            <strong>${medName}</strong>: ${medPrice}
            <div class="actions" style="display:none;">
                <br>
                <button class="updateBtn" data-name="${medName}">Update</button>
                <button class="deleteBtn" data-name="${medName}">Delete</button>
            </div>
        `;

        // When clicking the medicine toggle the action buttons
        medElement.addEventListener("click", () => {
            const actions = medElement.querySelector(".actions");
            actions.style.display = actions.style.display === "none" ? "block" : "none";
        });

        medicineList.appendChild(medElement);
    });

    attachButtonEvents();
}


document.getElementById("addMedicineForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const medName = document.getElementById("medName").value.trim();
    const medPrice = parseFloat(document.getElementById("medPrice").value);

    if (!medName) {
        alert("Please enter a medicine name.");
        return;
    }
    if (isNaN(medPrice) || medPrice <= 0) {
        alert("Please enter a valid price.");
        return;
    }

    createMedicine(medName, medPrice);
});
//function to create and add new medicine
function createMedicine(name, price) {
    fetch("http://localhost:8000/create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name, price })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                fetchMedicines();
                document.getElementById("addMedicineForm").reset();
            }
        })
        .catch((error) => {
            console.error("Error creating medicine:", error);
            alert("Failed to add medicine.");
        });
}

// Function to fetch and display the average price
function fetchAveragePrice() {
    fetch("http://localhost:8000/average-price")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch average price.");
            }
            return response.json();
        })
        .then((data) => {
            const displayElement = document.getElementById("averagePriceDisplay");
            if (data.error) {
                displayElement.textContent = `Error: ${data.error}`;
            } else {
                displayElement.textContent = `Price Average: $${data.average_price}`;
            }
        })
        .catch((error) => {
            console.error("Error fetching average price:", error);
            document.getElementById("averagePriceDisplay").textContent =
                "Failed to calculate average price. Please try again.";
        });
}
document
    .getElementById("averagePriceButton")
    .addEventListener("click", fetchAveragePrice);

document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();

    const filtered = allMedicines.filter(med => {
        return med.name && med.name.toLowerCase().includes(query);
    });

    displayMedicines(filtered);
});
function attachButtonEvents() {
    // DELETE BUTTON
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;

            fetch("http://localhost:8000/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ name })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || data.error);
                fetchMedicines();
            });
        });
    });

    // UPDATE BUTTON
    document.querySelectorAll(".updateBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;
            const newPrice = prompt(`Enter new price for ${name}:`);

            if (!newPrice || isNaN(newPrice) || newPrice <= 0) {
                alert("Invalid price.");
                return;
            }

            fetch("http://localhost:8000/update", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ name, price: newPrice })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || data.error);
                fetchMedicines();
            });
        });
    });
}

    
