// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Утиліти для кошика (використовує localStorage) ---
    function getCart() {
        const cart = localStorage.getItem('freshGoCart');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        localStorage.setItem('freshGoCart', JSON.stringify(cart));
        // При необхідності, тут можна оновити лічильник в хедері
    }

    // --- Логіка додавання товару ---
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productElement = e.target.closest('.product-card');
            if (!productElement) return;

            const id = productElement.dataset.productId;
            const name = productElement.querySelector('h3').textContent;
            const priceText = productElement.querySelector('.price').textContent;
            // Вилучаємо всі символи, крім цифр, коми та крапки, та замінюємо кому на крапку
            const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));

            if (!id || isNaN(price)) {
                console.error('Не вдалося отримати дані товару.');
                return;
            }

            const cart = getCart();
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            saveCart(cart);
            alert(`Додано "${name}" до кошика! (Кількість: ${existingItem ? existingItem.quantity : 1})`);
        });
    });

    // --- Логіка сторінки кошика (cart.html) ---
    if (document.body.classList.contains('cart-page')) {
        renderCart();

        document.querySelector('.cart-items').addEventListener('click', (e) => {
            const target = e.target;
            const itemElement = target.closest('.cart-item');
            if (!itemElement) return;

            const id = itemElement.dataset.productId;
            let cart = getCart();
            const item = cart.find(i => i.id === id);

            if (!item) return;

            if (target.classList.contains('increment')) {
                item.quantity += 1;
            } else if (target.classList.contains('decrement')) {
                item.quantity -= 1;
                if (item.quantity < 1) {
                    cart = cart.filter(i => i.id !== id);
                }
            } else if (target.classList.contains('remove-item')) {
                cart = cart.filter(i => i.id !== id);
            }

            saveCart(cart);
            renderCart();
        });

        document.getElementById('checkout-button').addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert("Ваш кошик порожній! Додайте товари для оформлення.");
                return;
            }
            // Тут має бути логіка відправки замовлення на сервер.
            alert(`Замовлення на суму ${document.getElementById('cart-total').textContent} оформлено! Дякуємо за покупку.`);
            localStorage.removeItem('freshGoCart');
            renderCart();
        });
    }

    function renderCart() {
        const cart = getCart();
        const cartList = document.querySelector('.cart-items');
        const totalElement = document.getElementById('cart-total');
        let total = 0;

        if (!cartList || !totalElement) return;

        cartList.innerHTML = '';

        if (cart.length === 0) {
            cartList.innerHTML = '<li style="padding: 20px; text-align: center; color: #555;">Ваш кошик порожній.</li>';
            totalElement.textContent = '0.00 грн';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.dataset.productId = item.id;
            li.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} грн</p>
                </div>
                <div class="cart-controls">
                    <button class="quantity-btn decrement">-</button>
                    <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn increment">+</button>
                    <span class="item-total-price" style="font-weight: bold; min-width: 100px; text-align: right;">${itemTotal.toFixed(2)} грн</span>
                    <button class="quantity-btn remove-item" style="background-color: #ff4d4d; color: white; margin-left: 10px;">X</button>
                </div>
            `;
            cartList.appendChild(li);
        });

        totalElement.textContent = `${total.toFixed(2)} грн`;
    }
});
