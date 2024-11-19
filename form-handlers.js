// File input handler
document.getElementById("stlFile").addEventListener("change", function (event) {
    console.log("File selected");
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                console.log("File loaded, parsing STL");
                const geometry = new THREE.STLLoader().parse(e.target.result);
                console.log("STL parsed successfully");
                displaySTL(geometry);
            } catch (error) {
                console.error("Error parsing STL file:", error);
                alert("Error parsing STL file. Please check the console for details.");
            }
        };
        reader.onerror = function (e) {
            console.error("Error reading file:", e);
            alert("Error reading file. Please try again.");
        };
        reader.readAsArrayBuffer(file);
    }
});

// Form submit handler
document.getElementById("estimateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const file = document.getElementById("stlFile").files[0];

    if (!file) {
        alert("Please select an STL file");
        return;
    }

    const values = {
        quality: formData.get("quality"),
        infill: parseFloat(formData.get("infillPercentage")) || 20,
        paintOption: document.getElementById("paintOption").checked,
        coats: parseInt(document.querySelector('input[name="coats"]').value) || 2,
        primer: document.getElementById("primerOption").checked,
        layerHeight: parseFloat(document.querySelector('input[name="layerHeight"]').value) || 0.2,
        wallThickness: parseFloat(document.querySelector('input[name="wallThickness"]').value) || 0.8,
        topBottomLayers: parseInt(document.querySelector('input[name="topBottomLayers"]').value) || 2,
        printSpeed: parseFloat(document.querySelector('input[name="printSpeed"]').value) || 100,
        support: document.getElementById("supportOption").checked,
        quantity: parseInt(document.getElementById('quantity').value) || 1
    };

    calculateVolume(file)
        .then((volume) => {
            const result = estimateCostAndTime(
                volume,
                values.quality,
                values.infill,
                values.paintOption,
                values.coats,
                values.primer,
                values.layerHeight,
                values.wallThickness,
                values.topBottomLayers,
                values.printSpeed,
                values.support,
                values.quantity
            );

            updateResultDisplay(result);
            updateTimeEstimates(result.printTime, values.quantity, {
                paintEnabled: values.paintOption,
                coats: values.coats,
                primerEnabled: values.primer
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error calculating. Please try again.");
        });
});

function updateResultDisplay(result) {
    const resultDiv = document.getElementById("result");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = generateResultHTML(result);
}

function updateTimeEstimates(printTime, quantity, paintOptions) {
    let totalProcessingTime = printTime; // Base print time per unit

    // Add paint processing time if paint option is enabled
    if (paintOptions.paintEnabled) {
        // Add time for each coat (30 mins per coat)
        totalProcessingTime += (30/60) * paintOptions.coats; // Convert 30 mins to hours

        // Add primer time if enabled (45 mins)
        if (paintOptions.primerEnabled) {
            totalProcessingTime += 45/60; // Convert 45 mins to hours
        }
    }

    // Multiply by quantity and add 25% buffer
    const productionTime = 1.3 * (totalProcessingTime * quantity);
    const deliveryTime = { min: 1, max: 5 };
    const totalTimeMin = productionTime/24 + deliveryTime.min;
    const totalTimeMax = productionTime/24 + deliveryTime.max;

    document.querySelector('.loading-animation').style.display = 'none';
    document.querySelector('.timeEstimates').style.display = 'flex';
    
    document.getElementById('productionTime').textContent = 
        `~${(productionTime/24).toFixed(1)} days`;
    document.getElementById('totalTime').textContent = 
        `~${totalTimeMin.toFixed(1)} - ${totalTimeMax.toFixed(1)} days`;
}

function generateResultHTML(result) {
    return `
      <div style="font-size: 1.1rem; margin-bottom: 15px;">
        <b>Print Duration (per item):</b> ${formatTime(result.printTime)}
      </div>
  
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
        <div style="margin-bottom: 10px">
          <b>Base Print Cost:</b><br>
          ₹${result.printCost.min.toFixed(0)}
          <span style="color: #888"> up to ₹${result.printCost.max.toFixed(0)}</span>
        </div>
  
        <div style="margin-bottom: 5px">
          <b>Labor Charge:</b><br>
          ₹${(result.printCost.min * 0.2).toFixed(0)} - ${(result.printCost.max * 0.2).toFixed(0)}
        </div>
  
        <div style="margin-bottom: 5px">
          <b>Machine Wear:</b><br>
          ₹${(result.printCost.min * 0.2).toFixed(0)} - ${(result.printCost.max * 0.2).toFixed(0)}
        </div>
  
        <div style="margin-bottom: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.1)">
          <b>Discount (${result.discountPercentage}%):</b><br>
          ₹${result.discountAmount.min.toFixed(0)} - ₹${result.discountAmount.max.toFixed(0)}
        </div>
  
        <div style="margin-bottom: 5px">
          <b>GST (18%):</b><br>
          ₹${(result.printCost.min * 0.18).toFixed(0)} - ${(result.printCost.max * 0.18).toFixed(0)}
        </div>
  
        <div style="margin-bottom: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.1)">
          <b>Delivery:</b><br>
          ₹${result.delivery.min} - ${result.delivery.max}
        </div>
  
        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.1)">
          <b>Total Estimate:</b><br>
          Starting ₹${result.total.min.toFixed(0)} <span style="color: #888"> up to ₹${result.total.max.toFixed(0)}</span>
        </div>
      </div>
    `;
}

// Toggle handlers for options
document.getElementById("paintOption").addEventListener("change", function (event) {
    document.querySelector(".paint-options").style.display =
        event.target.checked ? "block" : "none";
});

document.getElementById("advancedOption").addEventListener("change", function (event) {
    document.querySelector(".advanced-options").style.display =
        event.target.checked ? "block" : "none";
});

// Modal event handlers
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("result").style.display = "none";

    document.getElementById("printerConfigBtn").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("printerModal").style.display = "block";
    });

    document.querySelector(".close-btn").addEventListener("click", function () {
        document.getElementById("printerModal").style.display = "none";
    });

    window.addEventListener("click", function (e) {
        if (e.target == document.getElementById("printerModal")) {
            document.getElementById("printerModal").style.display = "none";
        }
    });

    function isMobileDevice() {
        return (window.innerWidth <= 768) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
    }

    if (isMobileDevice()) {
        document.getElementById('mobileCheck').style.display = 'block';
        document.querySelector('.content').style.display = 'none';
    }

    // Also check on resize
    window.addEventListener('resize', function () {
        if (isMobileDevice()) {
            document.getElementById('mobileCheck').style.display = 'block';
            document.querySelector('.content').style.display = 'none';
        } else {
            document.getElementById('mobileCheck').style.display = 'none';
            document.querySelector('.content').style.display = 'flex';
        }
    });
});

// Quantity change handler with discount calculation
document.getElementById('quantity').addEventListener('change', function () {
    const quantity = parseInt(this.value) || 1;
    let discountPercentage = 0;

    if (quantity > 25) {
        discountPercentage = 12.5;
    } else if (quantity > 10) {
        discountPercentage = 6.25;
    } else if (quantity > 3) {
        discountPercentage = 2.5;
    }

    document.getElementById('discountPercentage').textContent = discountPercentage + '%';
});

// Input validation handler
function addNumericValidation(inputName, min, max, defaultVal) {
    const input = document.querySelector(`input[name="${inputName}"]`);
    if (input) {
        input.addEventListener("change", function () {
            let value = parseFloat(this.value);
            if (isNaN(value) || value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            }
        });
    }
}

// Initialize all numeric validations
document.addEventListener("DOMContentLoaded", function () {
    addNumericValidation("coats", 1, 5, 2);
    addNumericValidation("layerHeight", 0.1, 0.4, 0.2);
    addNumericValidation("wallThickness", 0.4, 2, 0.8);
    addNumericValidation("topBottomLayers", 1, 5, 2);
    addNumericValidation("printSpeed", 25, 150, 100);
    addNumericValidation("infillPercentage", 0, 100, 20);
});

