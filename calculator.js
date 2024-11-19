function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
  
    let result = [];
    if (h > 0) result.push(`${h}hr`);
    if (m > 0) result.push(`${m}min`);
    if (s > 0) result.push(`${s}sec`);
    return result.join(" ");
  }
  
  function calculateVolume(file) {
    console.log("Calculating volume");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const geometry = new THREE.STLLoader().parse(e.target.result);
          const volume = getVolume(geometry);
          resolve(volume);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  function getVolume(geometry) {
    let volume = 0;
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 9) {
      const t1x = positions[i],
            t1y = positions[i + 1],
            t1z = positions[i + 2];
      const t2x = positions[i + 3],
            t2y = positions[i + 4],
            t2z = positions[i + 5];
      const t3x = positions[i + 6],
            t3y = positions[i + 7],
            t3z = positions[i + 8];
      volume += signedVolumeOfTriangle(t1x, t1y, t1z, t2x, t2y, t2z, t3x, t3y, t3z);
    }
    return Math.abs(volume) / 1000; // Convert to cm³
  }
  
  function signedVolumeOfTriangle(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    return (1.0 / 6.0) * (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - 
                          x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3);
  }
  
  function estimateCostAndTime(
    volume,
    quality,
    infillPercentage,
    paintOption,
    coats,
    primer,
    layerHeight,
    wallThickness,
    topBottomLayers,
    printSpeed,
    support,
    quantity
  ) {
    console.log("Calculation inputs:", {
      volume,
      quality,
      infillPercentage,
      paintOption,
      coats,
      primer,
      layerHeight,
      wallThickness,
      topBottomLayers,
      printSpeed,
      support,
      quantity
    });
  
    // Base print time calculation (in hours)
    let printTime = volume * 0.04;
  
    // Quality multipliers
    const qualityMultipliers = {
      high: { time: 1.2, cost: 1.15 },
      medium: { time: 1.1, cost: 1.1 },
      low: { time: 1, cost: 1 }
    };
  
    // Apply quality multiplier
    printTime *= qualityMultipliers[quality].time;
  
    // Layer height impact
    printTime *= (0.2 / layerHeight) * 1.2;
  
    // Wall thickness impact
    printTime *= wallThickness / 0.8;
  
    // Top/Bottom layers impact
    printTime *= topBottomLayers / 2;
  
    // Speed impact
    printTime *= 100 / printSpeed;
  
    // Speed inefficiency factor
    if (printSpeed > 100) {
      printTime *= 1 + (printSpeed - 100) * 0.001;
    }
  
    // Infill impact
    printTime *= 0.7 + 0.3 * (infillPercentage / 20);
  
    // Support impact
    if (support) {
      printTime *= 1.3;
    }
  
    // Cost calculations
    let basePrintCost = volume * 0.965;
    let minPrintCost = basePrintCost * qualityMultipliers[quality].cost;
    
    // Operation cost
    let operationCost = printTime * 3.5;
    minPrintCost += operationCost;
  
    // Infill cost factor
    let infillCostFactor = 1 + Math.log(infillPercentage / 20) * 0.2;
    minPrintCost *= infillCostFactor;
  
    // Wall thickness cost impact
    minPrintCost *= wallThickness / 0.8;
  
    // Support cost impact
    if (support) {
      minPrintCost *= 1.15;
    }
  
    // Paint costs
    if (paintOption) {
      const surfaceArea = Math.pow(volume, 2/3) * 4.836;
      const paintCostPerCoat = Math.min(Math.max(surfaceArea / 10, 10), 100);
      const totalPaintCost = paintCostPerCoat * coats;
  
      if (primer) {
        minPrintCost += 20;
      }
      minPrintCost += totalPaintCost;
    }
  
    // Quantity discount
    let discount = 0;
    if (quantity > 25) {
      discount = 0.125;
    } else if (quantity > 10) {
      discount = 0.0625;
    } else if (quantity > 3) {
      discount = 0.025;
    }
  
    let quantityMultiplier = quantity;
    let discountMultiplier = 1 - discount;
  
    // Labor and wear charges
    let laborCharge = minPrintCost * 0.2;
    minPrintCost += laborCharge;
  
    let wearCharge = minPrintCost * 0.2;
    minPrintCost += wearCharge;
  
    // Apply quantity and discount
    minPrintCost = minPrintCost * quantityMultiplier * discountMultiplier;
  
    // Tax calculations
    let minTax = minPrintCost * 0.18;
    let maxTax = minPrintCost * 1.2 * 0.18;
  
    // Maximum cost calculation
    let maxPrintCost = minPrintCost * 1.2;
  
    const discountAmount = {
      min: minPrintCost * discount,
      max: maxPrintCost * discount
    };
  
    // Delivery costs
    const delivery = { min: 60, max: 120 };
  
    // Total cost calculation
    const total = {
      min: minPrintCost + minTax + delivery.min,
      max: maxPrintCost + maxTax + delivery.max,
    };
  
    return {
      printTime,
      printCost: { min: minPrintCost, max: maxPrintCost },
      delivery,
      total,
      discountAmount,
      discountPercentage: discount * 100
    };
  }