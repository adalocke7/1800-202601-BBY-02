// HTML injection content
const htmlContent = {

  Food: `
<h2>Food & Beverages</h2>

<h3>Grills</h3>
<ul>
  <li><strong>Beast Unleashed (BU)</strong> — Grill</li>
  <li><strong>Beast on Fire (BF)</strong> — Grill</li>
</ul>

<h3>International</h3>
<ul>
  <li><strong>Bombay (B)</strong> — South Asian Kitchen</li>
  <li><strong>Seoul Food (SF)</strong> — Korean Fried Chicken</li>
</ul>

<h3>Burgers & Hot Dogs</h3>
<ul>
  <li><strong>Lionsgate Grill (LG)</strong> — Burgers</li>
  <li><strong>Dawson's Deluxe (DX)</strong> — Gourmet Hot Dogs</li>
  <li><strong>Dawson's Dogs (D)</strong> — Hot Dogs</li>
</ul>

<h3>Snacks & Sweets</h3>
<ul>
  <li><strong>Lemon Heaven, Cin City, Cotton Candy (LCC)</strong> — Sweets & Candy</li>
  <li><strong>Snack Shack (SS)</strong> — Self Service</li>
  <li><strong>LOT185 (L)</strong> — Coffee & Pastries</li>
</ul>

<h3>Comfort Food</h3>
<ul>
  <li><strong>The Mac Bar (M)</strong> — Mac & Cheese</li>
  <li><strong>The Poutinerie (P)</strong> — Poutine</li>
  <li><strong>Pizza Pizza (PP)</strong> — Pizza</li>
</ul>`,

  Drinks: `
<h2>Alcoholic Beverages</h2>

<h3>Beer & Wine</h3>
<ul>
  <li><strong>Beer Express (BE)</strong> — Beer & Wine</li>
  <li><strong>Coors Light (CL)</strong> — Beer</li>
  <li><strong>Granville Island Brewing (GI)</strong> — Beer</li>
  <li><strong>Hop Valley Brewing (HV)</strong> — Beer</li>
  <li><strong>Thirsty Pigeon (TP)</strong> — Craft Beer</li>
</ul>

<h3>Spirits & Seltzer</h3>
<ul>
  <li><strong>Dillon's Bar (DB)</strong> — Spirits & Seltzer</li>
  <li><strong>El Jimador Margarita Bar (MB)</strong> — Margaritas</li>
  <li><strong>White Claw (WC)</strong> — Spirits & Seltzer</li>
</ul>

<h3>General</h3>
<ul>
  <li><strong>Beer Vendor</strong> — Roaming vendor throughout the venue</li>
  <li><strong>Bar (B)</strong> — General bar locations on the map</li>
</ul>`,

  KeyLocations: `
<h2>Key Locations</h2>
<ul>
  <li>❓ <strong>Guest Services</strong> — Help desk for lost items, questions, and assistance</li>
  <li>🟢 <strong>Emergency Exit (E)</strong> — Follow signs in case of an evacuation</li>
  <li>📞 <strong>Courtesy Telephone</strong> — Free-use venue phones</li>
  <li>➕ <strong>First Aid</strong> — Medical staff available; seek out the red cross sign</li>
  <li>🔢 <strong>Elevator</strong> — Accessible vertical transport between levels</li>
  <li>🛒 <strong>Stroller Parking</strong> — Designated area to safely store strollers</li>
  <li>💵 <strong>Cash to Card (S)</strong> — Convert cash into a reloadable spending card</li>
  <li>💧 <strong>Water Fountain</strong> — Free drinking water stations</li>
  <li>⚡ <strong>Charging Station</strong> — Charge your phone and devices here</li>
</ul>`,

  Washrooms: `
<h2>Washrooms</h2>
<ul>
  <li>♿ <strong>Accessible Washroom</strong> — Fully accessible facilities for guests with mobility needs</li>
  <li>🚹 <strong>Men's Washroom</strong></li>
  <li>🚺 <strong>Women's Washroom</strong></li>
  <li>🍼 <strong>Baby Change Table</strong> — Infant changing stations available</li>
  <li>🚻 <strong>Family & Universal Washroom</strong> — Gender-neutral, suitable for all guests and families</li>
</ul>`

};

// Constant references to buttons and info container
const FoodInfo = document.getElementById("Food");
const DrinkInfo = document.getElementById("Drinks");
const KeyLocations = document.getElementById("KeyLocations");
const Washrooms = document.getElementById("Washrooms");

// Event listeners for buttons to update info container
FoodInfo.addEventListener("click", function() {
  document.getElementById("info").innerHTML = htmlContent.Food;
});
DrinkInfo.addEventListener("click", function() {
  document.getElementById("info").innerHTML = htmlContent.Drinks;
});
KeyLocations.addEventListener("click", function() {
  document.getElementById("info").innerHTML = htmlContent.KeyLocations;
});
Washrooms.addEventListener("click", function() {
  document.getElementById("info").innerHTML = htmlContent.Washrooms;
});