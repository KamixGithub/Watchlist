const API_URL = 'https://qb0hkq40v2.execute-api.eu-central-1.amazonaws.com/watchlist';
const watchlistEl = document.getElementById('watchlist');
const watchedEl = document.getElementById('watched');
//ADD
const addForm = document.getElementById('add-form');
const addButton = document.getElementById("add-open-dialog");
const adddialog = document.getElementById("add-dialog");
const cancelButton = document.getElementById("cancel");
//UPDATE
const updateForm = document.getElementById('update-form');
const updatedialog = document.getElementById("update-dialog");
const updatecancelButton = document.getElementById("cancel-update");
//RATE
const rateForm = document.getElementById('rating-form');
const ratingcancelButton = document.getElementById("cancel-rating");
const ratedialog = document.getElementById("rating-dialog");
let data = [];
let currentItem = null;

addButton.addEventListener("click", () => {
    addForm.reset();
    adddialog.showModal();
});

cancelButton.addEventListener("click", () => {
    adddialog.close("Title not added");
});

ratingcancelButton.addEventListener("click", () => {
    ratedialog.close("Rating not added");
});

updatecancelButton.addEventListener("click", () => {
    updatedialog.close("Update not added");
});

async function fetchWatchlist() {
    //TODO: Uncomment the following lines to fetch data from the API
    const response = await fetch(API_URL);
    data = await response.json();
    renderWatchlist(data);
}

function renderWatchlist(items) {
    watchlistEl.innerHTML = '';
    watchedEl.innerHTML = '';
    items.forEach(item => {

        if (item.rating) {
            const div = document.createElement('div');
            div.className = 'watchlist-item';
            div.innerHTML = `
            <div><strong>${item.title}</strong> (${item.year})</div>
            <input type="hidden" id="itemid" value="${item.id}">
            <input type="hidden" id="update-Rating" value="${item.rating}">
            <div class="description-div">${item.description}</div>
            <div>
                Rating: ${renderStars(item.rating, item.id)}
            </div>
            <div class="button-container">
                <button class="update" onclick="updateItem('${item.id}')">Edit</button>
                <button class="delete" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        `;
            watchedEl.appendChild(div);
        } else {
            const div = document.createElement('div');
            div.className = 'watchlist-item';
            div.innerHTML = `
            <div><strong>${item.title}</strong> (${item.year})</div>
                <input type="hidden" id="itemid" value="${item.id}">
                <input type="hidden" id="update-Rating" value="${item.rating}">
                <div class="description-div">${item.description}</div>
                <div class="button-container">
                    <button class="update" onclick="updateItem('${item.id}')">Edit</button>
                    <button class="rate" onclick="rateItem('${item.id}')">Watched</button>
                    <button class="delete" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            `;
            watchlistEl.appendChild(div);
        }
    });
}

//STAR RATING --------------------------------------------
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        document.getElementById('update-Rating').value = value;
        updateStars(value);
    });
});

document.querySelectorAll('#rating-container .star').forEach(star => {
    star.addEventListener('click', () => {
        const starIndex = Number(star.getAttribute('data-index'));
        const rating = starIndex + 1;
        document.getElementById('update-Rating').value = rating;
        updateStars(rating);
    });
});

function updateStars(rating) {
    document.querySelectorAll('#rating-container .star').forEach((star, i) => {
        const fillPercentage = (i < rating) ? 100 : 0;
        const starFg = star.querySelector('.star-foreground');
        starFg.style.width = fillPercentage + '%';
    });
}

function renderStars(rating, itemId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        let fillPercentage = 0;
        if (rating >= i) {
            fillPercentage = 100;
        } else if (rating > i - 1) {
            fillPercentage = (rating - (i - 1)) * 100;
        }
        stars += `<span class="star" style="position: relative; display: inline-block;" onclick="rateItem('${itemId}')">
                    <span class="star-background">&#9733;</span>
                    <span class="star-foreground" style="position: absolute; top: 0; left: 0; width: ${fillPercentage}%; overflow: hidden; white-space: nowrap; color: #ffc107;">&#9733;</span>
                  </span>`;
    }
    return stars;
}


//CRUD OPERATIONS --------------------------------------------

// create
async function createItem() {
    const title = document.getElementById('new-title').value;
    const description = document.getElementById('new-description').value;
    const year = parseInt(document.getElementById('new-year').value, 10);
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, year })
    });
    fetchWatchlist();
}

//Edit
function updateItem(itemid) {
    currentItem = data.find(item => item.id === itemid);
    document.getElementById('update-title').value = currentItem.title;
    document.getElementById('update-description').value = currentItem.description;
    document.getElementById('update-year').value = currentItem.year;
    updatedialog.showModal();

}

async function sendUpdateItem() {
    console.log(currentItem);
    const title = document.getElementById('update-title').value;
    const description = document.getElementById('update-description').value;
    const year = parseInt(document.getElementById('update-year').value, 10);
    const rating = currentItem.rating;
    if (rating) {
        await fetch(`${API_URL}/${currentItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, year, rating }) });
    } else {
        await fetch(`${API_URL}/${currentItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, year }) });
    }
    fetchWatchlist();
}

//rating
function rateItem(itemid) {
    currentItem = data.find(item => item.id === itemid);
    // Set the hidden input value (convert rating to number, or 0 if not rated)
    const currentRating = currentItem.rating ? Number(currentItem.rating) : 0;
    document.getElementById('update-Rating').value = currentRating;
    updateStars(currentRating);
    ratedialog.showModal();
}

async function sendRateItem() {
    const rating = parseInt(document.getElementById('update-Rating').value, 10);
    const title = currentItem.title;
    const description = currentItem.description;
    const year = currentItem.year;

    await fetch(`${API_URL}/${currentItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, year, rating }) });
    fetchWatchlist();
}

//delete
async function deleteItem(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchWatchlist();
}

addForm.addEventListener('submit', (e) => { createItem(); });
updateForm.addEventListener('submit', (e) => { sendUpdateItem(); });
rateForm.addEventListener('submit', (e) => { sendRateItem(); });

fetchWatchlist();