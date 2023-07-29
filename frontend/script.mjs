const baseURL = 'https://products-crud-alpha.vercel.app';
//const baseURL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function () {
    startLoading();
    setImageFromURL();
    getProducts();
    
    const addButton = document.querySelector('.big-button');
    const newProductContainer = document.querySelector('.new-product-container');
    const cancelButton = document.querySelector('.btn-secondary');
    const form = newProductContainer.querySelector('form');

    toggleProductEntryFields(false);
    //newProductContainer.style.display = 'none';

    // Add event listener to the "Register New Product" button
    addButton.addEventListener('click', function () {
        toggleProductEntryFields(true);
        //newProductContainer.style.display = 'block';

        scrollToTop();
    });

    // Add event listener to the "Cancel" button
    cancelButton.addEventListener('click', function () {
        toggleProductEntryFields(false);
        //newProductContainer.style.display = 'none';
    });

    // Add event listener to the "Add Product" form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        startLoading();

        // Create a new product card
        const newProduct = {
            id: document.getElementById('product-id').value,
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            imageURL: document.getElementById('product-image').value,
            price: document.getElementById('product-price').value,
            isActive: document.getElementById('is-active').checked
        }

        const isUpdate = (newProduct.id === '' ? false : true);
        const apiUrl = `${baseURL}/product${(isUpdate ? `/${newProduct.id}` : '')}`

        //alert(`${isUpdate} ${newProduct.id}`);

        fetch(apiUrl, {
            method: (isUpdate ? 'PUT' : 'POST'),
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    stopLoading();
                    throw new Error('Error creating product');
                }
            })
            .then(response => {
                showToast('Product Saved...');
                console.log('Product Saved:', response.data);

                //isUpdate
                getProducts();
                //const newCard = getProductCard(createdProduct);
                //displayProduct(newCard);

                // Reset the form fields
                document.getElementById('product-id').value = '';
                form.reset();

                toggleProductEntryFields(false);
                //newProductContainer.style.display = 'none';

                stopLoading();
            })
            .catch(error => {
                showToast('Unable to register new product!');
                console.error('Error:', error);
                // Handle any errors that occurred during the request

                stopLoading();
            });

    });
});


// Add event listeners to dynamically added "Edit" and "Delete" buttons
const container = document.querySelector('.container');
container.addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('btn-danger')) {
        const card = target.closest('.card');
        const id = card.getAttribute('data-id');
        deleteProduct(id, card);
    } else if (target.classList.contains('btn-secondary')) {
        const card = target.closest('.card');
        const id = card.getAttribute('data-id');
        getProduct(id);

        // const card = target.closest('.card');
        // const name = card.querySelector('h3').textContent;
        // const description = card.querySelector('p').textContent;
        // const image = card.querySelector('img').getAttribute('src');

        // Display the form
        toggleProductEntryFields(true);
    }
    else if (target.classList.contains('btn-action')) {
        showToast('Coming Soon...');

    }
});

// Add event listeners to search functionality
const searchInput = document.getElementById('search-input');
const categoryDropdown = document.getElementById('category-dropdown');

searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const category = categoryDropdown.value.toLowerCase();

        if (productName.includes(searchTerm) && (category === '' || card.dataset.category === category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

categoryDropdown.addEventListener('change', function () {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    const category = categoryDropdown.value.toLowerCase();

    cards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();

        if (productName.includes(searchTerm) && (category === '' ||
            //card.dataset.category === category
            card.innerText.toLowerCase().includes(category))) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

function showToast(msg) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toast-message');

    toastMsg.innerText = msg;
    toast.style.display = 'block';

    setTimeout(function () {
        toast.style.display = 'none';
    }, 6000); // Adjust the timeout duration (in milliseconds) as needed
}

function startLoading() {
    var loaderOverlay = document.getElementById('loader-overlay');
    loaderOverlay.style.display = 'flex';

    // Simulating loading delay
    setTimeout(function () {
        stopLoading();
    }, 3000); // Adjust the loading duration (in milliseconds) as needed
}

function stopLoading() {
    var loaderOverlay = document.getElementById('loader-overlay');
    loaderOverlay.style.display = 'none';
}

function setImageFromURL() {
    var url = 'https://random.imagecdn.app/2048/2048';

    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            var imageUrl = URL.createObjectURL(blob);
            document.body.style.backgroundImage = `url(${imageUrl})`;
        })
        .catch(error => {
            showToast('Error while loading random background image');
        });
}

function getProductCard(product) {
    const newCard = document.createElement('div');
    newCard.classList.add('card');
    newCard.setAttribute('data-id', product.id);
    newCard.innerHTML = `
        <span class="category">${product.category}</span>
            <img src="${product.imageURL}" alt="${product.name}">
            <h3>${product.name} $${product.price}</h3>
            <p>${product.description}</p>
            <button class="btn-action">Add to Cart</button>
            <button class="btn-danger">Delete</button>
            <button class="btn-secondary">Edit</button>
            <div class="footer">
                <label class="toggle ${(product.isActive ? "active" : "")}">
                    <input type="checkbox" class="toggle-checkbox">
                </label>
            </div>`;


    return newCard;
}

async function getProducts() {
    try {
        const response = await fetch(`${baseURL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        container.innerHTML = '';
        
        let products = await response.json();
        products = products.data;
        
        if (products.length > 0) {
            for (const product of products) {
                displayProduct(getProductCard(product));
            }

            const toggleCheckboxes = document.querySelectorAll('.toggle-checkbox');
            toggleCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    showToast('Just Frontend...');
                    const card = this.closest('.toggle');
                    if (this.checked) {
                        card.classList.add('active');
                        // this.classList.add('active');
                    } else {
                        card.classList.remove('active');
                        // this.classList.remove('active');
                    }
                });
            });
        }
        else {
            const container = document.querySelector('.container');
            container.innerHTML = `<div class="heading-container">
            <h3 style="text-align: center">No records to display...</h1>
        </div>`;
        }
        stopLoading();
    } catch (error) {
        showToast('Error while getting products');
        console.error(error);
        stopLoading();
    }
}

function displayProduct(newCard) {
    // Append the new card to the container
    const container = document.querySelector('.container');
    container.appendChild(newCard);
}

function deleteProduct(id, cardToRemove) {
    startLoading();
    const apiUrl = `${baseURL}/product/${id}`;

    fetch(apiUrl, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                console.log('Product deleted successfully');
                showToast('Product deleted successfully');
                cardToRemove.remove();
            } else {
                showToast(`Error while getting product: ${response.status}`);
                console.error('Error deleting product:', response);
            }
            stopLoading();
        })
        .catch(error => {
            showToast(`Error while getting product`);
            console.error('Error deleting product:', error);

            stopLoading();
        });
}

function getProduct(id) {
    startLoading();
    const apiUrl = `${baseURL}/product/${id}`;

    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                showToast(`Error while fetching product`);
            }
        })
        .then(response => {
            const product = response.data;
            console.log('Product:', product);
            // Fill the form with the selected product details
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image').value = product.imageURL;
            document.getElementById('product-price').value = product.price;
            document.getElementById('is-active').checked = product.isActive;
            stopLoading();

            scrollToTop();
        })
        .catch(error => {
            showToast(`Error while getting product`);
            console.error('Error:', error);
            // Handle any errors that occurred during the request

            stopLoading();
        });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleProductEntryFields(isDisplay) {
    document.querySelector('.new-product-container').style.display = (isDisplay ? 'block' : 'none');
}