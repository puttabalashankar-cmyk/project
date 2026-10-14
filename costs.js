/**
 * AutoHelp AI — Repair Cost Estimator Module
 * Realistic automotive repair pricing ranges based on vehicle category and repair severity.
 * Transparent disclaimers as required.
 */

class CostEstimator {
  constructor() {
    this.pricingMatrix = {
      // Vehicle Multipliers
      vehicleFactors: {
        commuter_bike: 0.35,
        premium_bike: 0.65,
        hatchback: 1.0,
        sedan: 1.25,
        suv: 1.45,
        ev: 1.30
      },

      // Base costs by component category
      components: {
        cooling: {
          name: "Engine Cooling & Radiator",
          minor: { parts: [400, 900], labor: [300, 600], time: "1 – 2 Hours" },
          replace: { parts: [1800, 4200], labor: [800, 1500], time: "3 – 5 Hours" },
          major: { parts: [6500, 14000], labor: [2500, 5000], time: "1 – 2 Days" }
        },
        battery: {
          name: "Battery & Starter System",
          minor: { parts: [150, 400], labor: [250, 500], time: "30 – 45 Mins" },
          replace: { parts: [3200, 6500], labor: [300, 600], time: "1 Hour" },
          major: { parts: [8000, 15000], labor: [1500, 3000], time: "Same Day" }
        },
        brakes: {
          name: "Braking System (Pads, Discs, Fluid)",
          minor: { parts: [350, 700], labor: [400, 800], time: "1 Hour" },
          replace: { parts: [1600, 3800], labor: [700, 1400], time: "2 – 3 Hours" },
          major: { parts: [5500, 12000], labor: [1800, 3500], time: "Same Day" }
        },
        tyres: {
          name: "Tyres, Wheels & Alignment",
          minor: { parts: [100, 250], labor: [200, 400], time: "30 Mins" },
          replace: { parts: [3200, 7500], labor: [300, 600], time: "1 Hour" },
          major: { parts: [12000, 28000], labor: [800, 1600], time: "2 – 4 Hours" }
        },
        clutch: {
          name: "Clutch & Transmission",
          minor: { parts: [300, 800], labor: [500, 1000], time: "1 – 2 Hours" },
          replace: { parts: [3800, 9500], labor: [2000, 4500], time: "Same Day" },
          major: { parts: [15000, 35000], labor: [5000, 12000], time: "2 – 3 Days" }
        },
        ac: {
          name: "Air Conditioning & Climate",
          minor: { parts: [500, 1200], labor: [600, 1200], time: "1 – 2 Hours" },
          replace: { parts: [3500, 8500], labor: [1500, 3000], time: "Same Day" },
          major: { parts: [12000, 24000], labor: [3500, 7000], time: "1 – 2 Days" }
        }
      }
    };
  }

  calculateEstimate(vehicleType, componentKey, severity) {
    const vFactor = this.pricingMatrix.vehicleFactors[vehicleType] || 1.0;
    const comp = this.pricingMatrix.components[componentKey] || this.pricingMatrix.components.cooling;
    const tier = comp[severity] || comp.replace;

    const partsLow = Math.round(tier.parts[0] * vFactor);
    const partsHigh = Math.round(tier.parts[1] * vFactor);
    const laborLow = Math.round(tier.labor[0] * (vFactor > 1 ? vFactor * 0.9 : vFactor));
    const laborHigh = Math.round(tier.labor[1] * (vFactor > 1 ? vFactor * 0.9 : vFactor));

    const totalLow = partsLow + laborLow;
    const totalHigh = partsHigh + laborHigh;

    return {
      componentName: comp.name,
      partsRange: `₹${partsLow.toLocaleString('en-IN')} – ₹${partsHigh.toLocaleString('en-IN')}`,
      laborRange: `₹${laborLow.toLocaleString('en-IN')} – ₹${laborHigh.toLocaleString('en-IN')}`,
      totalRange: `₹${totalLow.toLocaleString('en-IN')} – ₹${totalHigh.toLocaleString('en-IN')}`,
      estimatedTime: tier.time,
      disclaimer: "Estimated market range based on Indian regional workshop averages. Actual costs depend on original equipment manufacturer (OEM) parts and garage tier."
    };
  }

  updateCostUI() {
    const vSelect = document.getElementById('costVehicleSelect');
    const compSelect = document.getElementById('costComponentSelect');
    const sevSelect = document.getElementById('costSeveritySelect');

    if (!vSelect || !compSelect || !sevSelect) return;

    const vType = vSelect.value;
    const compKey = compSelect.value;
    const sevKey = sevSelect.value;

    const res = this.calculateEstimate(vType, compKey, sevKey);

    const totalEl = document.getElementById('costDisplayTotal');
    const partsEl = document.getElementById('costDisplayParts');
    const laborEl = document.getElementById('costDisplayLabor');
    const timeEl = document.getElementById('costDisplayTime');

    if (totalEl) totalEl.textContent = res.totalRange;
    if (partsEl) partsEl.textContent = res.partsRange;
    if (laborEl) laborEl.textContent = res.laborRange;
    if (timeEl) timeEl.textContent = res.estimatedTime;
  }
}

window.costEstimator = new CostEstimator();
