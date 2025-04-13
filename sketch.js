// --- Game Objects ---
let bread = { x: 80, y: 440, w: 70, h: 45, cornerRadius: 10, isHeld: false, isOnGrill: false, isCooking: false, startTime: 0, isCooked: false, isFilled: false, onPlate: false, initialColor1: '#F5DEB3', initialColor2: '#E8C89E', cookedColor1: '#A0522D', cookedColor2: '#8B4513', filledColor: '#DC143C' }; // Wheat/LightTan, Sienna/SaddleBrown, Crimson
let grill = { x: 180, y: 390, w: 120, h: 100, color: '#333', barColor: '#555', highlightColor: '#777' };
let drawer = { x: 450, y: 430, w: 120, h: 60, isOpen: false, openY: 360, closedY: 430, color1: '#A0522D', color2: '#8B4513', // Sienna, SaddleBrown
               handleXOffset: 50, handleYOffset: 20, handleW: 20, handleH: 15, handleColor1: '#C0C0C0', handleColor2: '#A9A9A9' }; // Silver, DarkGray
let container = { x: drawer.x + 30, y: drawer.closedY + 15, w: 70, h: 45, cornerRadius: 8, isHeld: false, isOnTable: false, tableX: 350, tableY: 220, color1: '#E0E0E0', color2: '#C0C0C0', // LightGray shades
                  lidColor: '#888', handleColor: '#666',
                  fillingColor: '#FFDA63', label: "Lobster Roll" }; // Lighter Gold/Yellow
let table = { x: 280, y: 180, w: 220, h: 170, color1: '#D0D0D0', color2: '#A0A0A0', // Metal Grays
              highlightColor: '#E8E8E8' };
let plate = { x: 0, y: 0, // Will be set on table
              initialX: 600, initialY: 450, // Start position (bottom right)
              currentX: 0, currentY: 0, // Actual drawing position
              r: 60,
              isHeld: false, isOnTable: false,
              color: '#FFFFFF', rimColor: '#E8E8E8', shadowColor: '#D0D0D0',
              label: "Tom Oysters", labelColor: '#4682B4' }; // SteelBlue label

// --- Game State ---
let heldItem = null; // To track which item is being dragged (can be bread, container, or plate)
let cookingDuration = 8000; // 8 seconds in milliseconds
let message = "Trascina il pane (🍞) sulla piastra.";
let grillTimerText = "";
let workSurfaceY = 380; // Y position for the counter line
let floorColor = '#A9A9A9'; // DarkGray
let wallColor1 = '#D8E2DC'; // Light greenish gray
let wallColor2 = '#BCCDC6'; // Darker greenish gray

// --- Feedback ---
let highlightGrill = false;
let highlightPlateDropZone = false; // Highlight on the plate itself when dropping bread
let highlightTableForPlate = false; // Highlight on table when dropping plate

// --- Post-it ---
let postIt = { x: 15, y: 15, w: 180, h: 120, color: '#FFFACD', // LemonChiffon
               angle: -2 }; // Slight rotation angle in degrees

function setup() {
  createCanvas(700, 550);
  textAlign(CENTER, CENTER);
  textSize(16);
  plate.currentX = plate.initialX; // Initialize current position
  plate.currentY = plate.initialY;
  plate.x = table.x + table.w / 2; // Target position on table (center)
  plate.y = table.y + table.h / 2;
  container.x = drawer.x + (drawer.w - container.w) / 2; // Center container in drawer initially
  updateMessageAfterAction(); // Set initial message based on state
}

function draw() {
  // Draw background
  drawGradientBackground(0, 0, width, workSurfaceY, wallColor1, wallColor2);
  fill(floorColor);
  noStroke();
  rect(0, workSurfaceY, width, height - workSurfaceY);

  // --- Draw Table ---
  drawTable();

  // --- Draw Grill ---
  drawGrill();

  // --- Update Cooking ---
  updateCooking();

  // --- Draw Drawer ---
  drawDrawer();

  // --- Draw Container ---
  drawContainerOrPlaceholder();

  // --- Draw Plate ---
  drawPlateObject(); // Handles drawing based on state (initial, held, onTable)

  // --- Draw Bread ---
  drawBreadOrPlaceholder();

  // --- Highlight Drop Zones ---
  updateHighlights();
  drawHighlights();

  // --- Draw Grill Timer ---
  drawGrillTimer();

  // --- Display Message on Post-it ---
  drawPostItMessage();
}

// --- Drawing Functions ---

function drawGradientBackground(x, y, w, h, c1, c2) {
    noFill();
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(color(c1), color(c2), inter);
      stroke(c);
      line(x, i, x + w, i);
    }
    noStroke();
}

function drawTable() {
    // Shadow first
    fill(0, 0, 0, 50);
    rect(table.x + 5, table.y + 5, table.w, table.h, 8);

    // Metallic Gradient
    noStroke();
    for (let i = table.y; i < table.y + table.h; i++) {
      let inter = map(i, table.y, table.y + table.h, 0, 1);
      let c = lerpColor(color(table.color1), color(table.color2), inter);
      stroke(c);
      line(table.x, i, table.x + table.w, i);
    }
    // Subtle highlight reflection
    fill(table.highlightColor + '40'); // Transparent whiteish
    noStroke();
    rect(table.x + 10, table.y + 10, table.w - 20, 30, 5); // Top highlight bar

     // Outline
    stroke(0,0,0, 50);
    noFill();
    rect(table.x, table.y, table.w, table.h, 8);
    noStroke();
}

function drawGrill() { // Unchanged from v3
    fill(grill.color);
    rect(grill.x, grill.y, grill.w, grill.h, 5);
    let barHeight = 8;
    let barSpacing = (grill.h - 20 - 5 * barHeight) / 4;
    for (let i = 0; i < 5; i++) {
      let yPos = grill.y + 10 + i * (barHeight + barSpacing);
      fill(grill.barColor);
      rect(grill.x + 5, yPos, grill.w - 10, barHeight, 3);
      fill(grill.highlightColor);
      rect(grill.x + 5, yPos, grill.w - 10, barHeight / 3, 3);
    }
}

function drawDrawer() { // Unchanged from v3
    let currentDrawerY = drawer.isOpen ? drawer.openY : drawer.closedY;
    let currentHandleX = drawer.x + drawer.handleXOffset;
    let currentHandleY = currentDrawerY + drawer.handleYOffset;
    fill(0, 0, 0, 40);
    rect(drawer.x + 3, currentDrawerY + 3, drawer.w, drawer.h, 5);
    noStroke();
    for (let i = drawer.x; i < drawer.x + drawer.w; i++) {
        let inter = map(i, drawer.x, drawer.x + drawer.w, 0, 1);
        let c = lerpColor(color(drawer.color1), color(drawer.color2), inter);
        stroke(c);
        line(i, currentDrawerY, i, currentDrawerY + drawer.h);
    }
    stroke(0, 0, 0, 50); noFill(); rect(drawer.x, currentDrawerY, drawer.w, drawer.h, 5); noStroke();
    fill(drawer.handleColor2); rect(currentHandleX, currentHandleY, drawer.handleW, drawer.handleH, 3);
    fill(drawer.handleColor1); rect(currentHandleX, currentHandleY, drawer.handleW - 2, drawer.handleH - 5, 3);
}

function drawContainerOrPlaceholder() { // Only change is adding label
     if (!container.isHeld) {
        if (container.isOnTable) {
           drawContainerObject(container.tableX, container.tableY);
        } else if (drawer.isOpen) {
           let containerDrawX = drawer.x + (drawer.w - container.w) / 2;
           let containerDrawY = (drawer.isOpen ? drawer.openY : drawer.closedY) + (drawer.h - container.h) / 2;
           drawContainerObject(containerDrawX, containerDrawY);
        }
    } else {
        drawContainerObject(mouseX - container.w / 2, mouseY - container.h / 2);
    }
}

function drawContainerObject(cx, cy) { // Added label drawing
    fill(0, 0, 0, 30); rect(cx + 2, cy + 2, container.w, container.h, container.cornerRadius);
    noStroke();
     for (let i = cy; i < cy + container.h; i++) {
        let inter = map(i, cy, cy + container.h, 0, 1);
        let c = lerpColor(color(container.color1), color(container.color2), inter);
        stroke(c); line(cx, i, cx + container.w, i);
    }
    noStroke(); rect(cx, cy, container.w, container.h, container.cornerRadius);
    fill(container.fillingColor); rect(cx + 5, cy + container.h * 0.3, container.w - 10, container.h * 0.6, container.cornerRadius - 3);
    fill(container.lidColor); rect(cx, cy, container.w, 10, container.cornerRadius, container.cornerRadius, 0, 0);
    fill(container.handleColor); ellipse(cx + container.w / 2, cy + 5, 15, 8);

    // --- Add Label ---
    fill(0); // Black text
    textSize(11);
    textAlign(CENTER, CENTER);
    text(container.label, cx + container.w / 2, cy + container.h * 0.6); // Position over filling
    textSize(16); // Reset default size

    stroke(0,0,0, 40); noFill(); rect(cx, cy, container.w, container.h, container.cornerRadius); noStroke();
}


function drawPlateObject() {
    let xPos, yPos;
    if (plate.isHeld) {
        xPos = mouseX;
        yPos = mouseY;
    } else {
        xPos = plate.currentX; // Use currentX/Y which is either initial or table position
        yPos = plate.currentY;
    }

    // Shadow
    fill(0, 0, 0, 30);
    ellipse(xPos + 3, yPos + 3, plate.r * 2, plate.r * 2);

    // Plate Rim & Center
    fill(plate.rimColor);
    ellipse(xPos, yPos, plate.r * 2, plate.r * 2);
    fill(plate.color);
    ellipse(xPos, yPos, plate.r * 1.8, plate.r * 1.8);

    // Reflection
    fill(255, 255, 255, 50);
    arc(xPos, yPos, plate.r * 1.6, plate.r * 1.6, PI + QUARTER_PI, TWO_PI - QUARTER_PI);

     // --- Add Label (only if on table) ---
    if(plate.isOnTable) {
        fill(plate.labelColor);
        textSize(14);
        textAlign(CENTER, CENTER);
        textFont('Georgia'); // A slightly fancier default font
        text(plate.label, xPos, yPos + plate.r * 0.3); // Position lower center
        textFont('sans-serif'); // Reset to default
        textSize(16); // Reset default size
    }
}


function drawBreadOrPlaceholder() { // Unchanged from v3
    let currentBreadColor1 = bread.initialColor1;
    let currentBreadColor2 = bread.initialColor2;
    if (bread.isCooked || bread.isCooking) {
        currentBreadColor1 = bread.cookedColor1;
        currentBreadColor2 = bread.cookedColor2;
    }

    if (bread.onPlate) {
        drawBreadObject(plate.currentX - bread.w / 2, plate.currentY - bread.h / 2, currentBreadColor1, currentBreadColor2);
    } else if (bread.isHeld) {
        drawBreadObject(mouseX - bread.w / 2, mouseY - bread.h / 2, currentBreadColor1, currentBreadColor2);
    } else {
        drawBreadObject(bread.x, bread.y, currentBreadColor1, currentBreadColor2);
    }
}

function drawBreadObject(bx, by, c1, c2) { // Unchanged from v3
    fill(0, 0, 0, 30); rect(bx + 3, by + 3, bread.w, bread.h, bread.cornerRadius);
    noStroke();
    for (let i = by; i < by + bread.h; i++) {
        let inter = map(i, by, by + bread.h, 0, 1); let c = lerpColor(color(c1), color(c2), inter); stroke(c); line(bx, i, bx + bread.w, i);
    }
    noStroke(); rect(bx, by, bread.w, bread.h, bread.cornerRadius);
    fill(c2 + '90'); for(let i=0; i<10; i++){ ellipse(bx + random(bread.w * 0.1, bread.w * 0.9), by + random(bread.h * 0.1, bread.h * 0.9), 2, 2); }
    if(bread.isFilled) { fill(bread.filledColor); rect(bx + 15, by + bread.h * 0.4, bread.w - 30, 15, 5); }
    stroke(0,0,0, 50); noFill(); rect(bx, by, bread.w, bread.h, bread.cornerRadius); noStroke();
}

function drawGrillTimer() { // Unchanged from v3
    if (grillTimerText) {
        fill(255, 255, 100); stroke(0); strokeWeight(2); textSize(24);
        text(grillTimerText, grill.x + grill.w / 2, grill.y + grill.h / 2);
        noStroke(); textSize(16);
    }
}

function drawPostItMessage() {
    push(); // Isolate transformations and styles
    translate(postIt.x + postIt.w / 2, postIt.y + postIt.h / 2); // Move origin to center for rotation
    rotate(radians(postIt.angle));

    // Shadow
    fill(0, 0, 0, 50);
    noStroke();
    rect(3 - postIt.w / 2, 3 - postIt.h / 2, postIt.w, postIt.h, 5); // Offset shadow

    // Post-it body
    fill(postIt.color);
    rect(-postIt.w / 2, -postIt.h / 2, postIt.w, postIt.h, 5); // Draw centered

    // Text on post-it
    fill(50); // Dark gray text
    textAlign(CENTER, CENTER);
    textSize(14);
    // basic text wrap simulation
    let words = message.split(' ');
    let line = '';
    let textY = -postIt.h / 2 + 20; // Start Y position for text
    for(let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let testWidth = textWidth(testLine);
      if (testWidth > postIt.w - 20 && n > 0) {
        text(line, 0, textY);
        line = words[n] + ' ';
        textY += 18; // Line height
      } else {
        line = testLine;
      }
    }
    text(line, 0, textY); // Draw the last line


    pop(); // Restore previous transformations and styles
    textSize(16); // Reset default text size
}

function drawHighlights() {
    noFill();
    strokeWeight(4); // Thicker highlight

    // Grill Highlight
    if (highlightGrill) {
        stroke(255, 255, 0, 180); // Brighter Yellow glow
        rect(grill.x - 5, grill.y - 5, grill.w + 10, grill.h + 10, 8);
    }

    // Plate Drop Zone Highlight (on the plate itself)
    if (highlightPlateDropZone) {
        stroke(0, 255, 0, 180); // Brighter Green glow
        ellipse(plate.currentX, plate.currentY, plate.r * 2 + 10, plate.r * 2 + 10);
    }

     // Table Drop Zone for Plate Highlight
    if (highlightTableForPlate) {
        stroke(0, 180, 255, 180); // Cyan glow
        rect(table.x, table.y, table.w, table.h, 8);
    }
    noStroke(); // Reset
}


// --- Update and Interaction Logic ---

function updateCooking() { // Unchanged from v3
   grillTimerText = "";
   if (bread.isCooking) {
       let glowAlpha = map(sin(millis() * 0.015), -1, 1, 60, 180);
       fill(255, 50, 0, glowAlpha); noStroke(); rect(grill.x, grill.y, grill.w, grill.h, 5);
       let elapsed = millis() - bread.startTime;
       if (elapsed >= cookingDuration) {
           bread.isCooking = false; bread.isCooked = true; bread.isOnGrill = false;
           updateMessageAfterAction(); // Update message when cooking finishes
       } else {
           let secondsLeft = ceil((cookingDuration - elapsed) / 1000); grillTimerText = secondsLeft;
       }
   }
}

function updateHighlights() {
    highlightGrill = false;
    highlightPlateDropZone = false;
    highlightTableForPlate = false;

    if (heldItem === bread) {
        // Highlight grill if holding raw bread over it
        if (!bread.isCooked && !bread.isFilled && isMouseOver(grill.x, grill.y, grill.w, grill.h)) {
            highlightGrill = true;
        }
        // Highlight plate if holding cooked, filled bread over it AND plate is on table
        else if (bread.isCooked && bread.isFilled && plate.isOnTable && dist(mouseX, mouseY, plate.currentX, plate.currentY) < plate.r) {
            highlightPlateDropZone = true;
        }
    } else if (heldItem === plate) {
         // Highlight table if holding plate over it
        if (isMouseOver(table.x, table.y, table.w, table.h)) {
            highlightTableForPlate = true;
        }
    }
    // Can add highlights for container over table etc. if needed
}

function mousePressed() {
  // --- Check Drawer Handle ---
  let currentDrawerY = drawer.isOpen ? drawer.openY : drawer.closedY;
  let currentHandleX = drawer.x + drawer.handleXOffset;
  let currentHandleY = currentDrawerY + drawer.handleYOffset;
  if (mouseX > currentHandleX && mouseX < currentHandleX + drawer.handleW &&
      mouseY > currentHandleY && mouseY < currentHandleY + drawer.handleH) {
      if (!bread.isCooking) {
          drawer.isOpen = !drawer.isOpen; updateMessageAfterAction();
      } return;
  }

  // --- Check Plate (if not held and not on table) ---
  if (!plate.isHeld && !plate.isOnTable && dist(mouseX, mouseY, plate.currentX, plate.currentY) < plate.r) {
      heldItem = plate;
      plate.isHeld = true;
      updateMessageAfterAction();
      return;
  }

  // --- Check Container ---
   if (!container.isHeld && container.isOnTable && isMouseOver(container.tableX, container.tableY, container.w, container.h)) {
       heldItem = container; container.isHeld = true; container.isOnTable = false; updateMessageAfterAction(); return;
   }
   let containerDrawX = drawer.x + (drawer.w - container.w) / 2;
   let containerDrawY = (drawer.isOpen ? drawer.openY : drawer.closedY) + (drawer.h - container.h) / 2;
   if (!container.isHeld && drawer.isOpen && !container.isOnTable && isMouseOver(containerDrawX, containerDrawY, container.w, container.h)) {
      heldItem = container; container.isHeld = true; updateMessageAfterAction(); return;
   }


  // --- Check Bread ---
  if (!bread.isHeld && !bread.onPlate && !bread.isCooking) {
    let breadCheckX = bread.isOnGrill ? grill.x + (grill.w - bread.w) / 2 : bread.x;
    let breadCheckY = bread.isOnGrill ? grill.y + (grill.h - bread.h) / 2 : bread.y;

    if (isMouseOver(breadCheckX, breadCheckY, bread.w, bread.h)) {
         // Action 1: Fill the bread
         if (bread.isCooked && !bread.isFilled && container.isOnTable) {
             bread.isFilled = true; updateMessageAfterAction();
         }
         // Action 2: Pick up the bread
         else {
             heldItem = bread; bread.isHeld = true;
             if (bread.isOnGrill) {
                  bread.isOnGrill = false; bread.x = mouseX - bread.w/2; bread.y = mouseY - bread.h/2;
             }
             updateMessageAfterAction();
         }
         return;
    }
  }
}

// mouseDragged is implicit: position updates in draw() when heldItem is not null

function mouseReleased() {
  if (heldItem === bread) {
    // Drop bread on grill
    if (!bread.isCooked && !bread.isFilled && isMouseOver(grill.x, grill.y, grill.w, grill.h)) {
      bread.isOnGrill = true; bread.isCooking = true; bread.startTime = millis();
      bread.x = grill.x + (grill.w - bread.w) / 2; bread.y = grill.y + (grill.h - bread.h) / 2;
    }
    // Drop bread on plate (if plate is ready)
    else if (bread.isCooked && bread.isFilled && plate.isOnTable && dist(mouseX, mouseY, plate.currentX, plate.currentY) < plate.r) {
        bread.onPlate = true;
        bread.x = plate.currentX - bread.w/2; // Position precisely
        bread.y = plate.currentY - bread.h/2;
    } else {
       // Drop elsewhere
       bread.x = mouseX - bread.w/2; bread.y = mouseY - bread.h/2;
       bread.isOnGrill = false; // Ensure it's not stuck state-wise
    }
    bread.isHeld = false;
  }
  else if (heldItem === container) {
    // Drop container on table
    if (isMouseOver(table.x, table.y, table.w, table.h)) {
        container.isOnTable = true;
        container.tableX = table.x + (table.w - container.w) / 2 + 10;
        container.tableY = table.y + (table.h - container.h) / 2;
    } else {
        // Return to drawer (conceptually)
        container.isOnTable = false;
        container.x = drawer.x + (drawer.w - container.w) / 2;
    }
    container.isHeld = false;
  }
  else if (heldItem === plate) {
      // Drop plate on table
      if (isMouseOver(table.x, table.y, table.w, table.h)) {
          plate.isOnTable = true;
          // Snap to defined table position
          plate.currentX = plate.x;
          plate.currentY = plate.y;
      } else {
          // Snap back to initial position
          plate.isOnTable = false;
          plate.currentX = plate.initialX;
          plate.currentY = plate.initialY;
      }
      plate.isHeld = false;
  }

  heldItem = null; // Clear held item regardless
  updateMessageAfterAction(); // Update message based on the final state
  // Reset highlights
  highlightGrill = false;
  highlightPlateDropZone = false;
  highlightTableForPlate = false;
}

// --- Helper Functions ---

function isMouseOver(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function updateMessageAfterAction() {
    // Determine the most relevant message based on the current game state progression
    if (bread.onPlate) {
         message = "Ordine completato! 🎉 Lobster roll servito!";
    } else if (heldItem === bread && bread.isCooked && bread.isFilled) {
         message = "Trascina il panino sul piatto 'Tom Oysters'.";
    } else if (bread.isCooked && bread.isFilled && plate.isOnTable) {
         message = "Metti il panino farcito (🦞) sul piatto (🍽️).";
    } else if (heldItem === bread && bread.isCooked && !bread.isFilled) {
         message = "Ora farcisci il pane."; // Or guide towards container?
    } else if (bread.isCooked && !bread.isFilled && container.isOnTable) {
         message = "Clicca sul pane cotto (♨️) per aggiungere il ripieno 'Lobster Roll'.";
    } else if (heldItem === container) {
         message = "Metti il contenitore 'Lobster Roll' sul tavolo.";
    } else if (bread.isCooked && !bread.isFilled && !container.isOnTable && drawer.isOpen) {
         message = "Prendi il contenitore (🥣) dal cassetto e mettilo sul tavolo.";
    } else if (bread.isCooked && !bread.isFilled && !container.isOnTable && !drawer.isOpen) {
         message = "Pane pronto! ♨️ Apri il cassetto.";
    } else if (heldItem === plate) {
        message = "Posiziona il piatto 'Tom Oysters' sul tavolo.";
    } else if (bread.isCooked && !plate.isOnTable) {
        message = "Prendi il piatto (🍽️) e mettilo sul tavolo."; // Added plate step instruction
    } else if (bread.isCooking) {
         message = "Il pane sta cuocendo... 🔥";
    } else if (heldItem === bread && !bread.isCooked) {
         message = "Trascina il pane sulla piastra calda.";
    } else if (!bread.isHeld && !bread.isOnGrill && !bread.isCooked){
         message = "Prendi il pane (🍞) per iniziare e mettilo sulla piastra.";
    } else {
        // Default / Catch-all message if state is unexpected
        message = "Cosa facciamo ora?";
    }
}
