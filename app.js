// Main Application Logic

// `productsData` and `cart` are provided by `products-data.js` and `cart.js` respectively.
// Remove duplicated declarations here so this file uses the shared globals.

class EcommerceApp {
  constructor() {
    this.filteredProducts = [...productsData]
    this.selectedProduct = null
    this.init()
  }

  init() {
    cart.loadFromLocalStorage()
    this.setupEventListeners()
    this.renderProducts()
    this.renderDeals()
    this.renderTrending()
    this.updateCartUI()
  }

  setupEventListeners() {
    // Cart button
    document.getElementById("cartBtn").addEventListener("click", () => this.openMiniCart())
    document.getElementById("closeCartBtn").addEventListener("click", () => this.closeMiniCart())
    document.getElementById("miniCartOverlay").addEventListener("click", () => this.closeMiniCart())

    // Product modal
    document.getElementById("closeProductBtn").addEventListener("click", () => this.closeProductModal())
    document.querySelector(".modal-product").addEventListener("click", (e) => {
      if (e.target === document.querySelector(".modal-product")) {
        this.closeProductModal()
      }
    })

    // Search and sort
    document.getElementById("searchInput").addEventListener("input", (e) => this.filterProducts(e.target.value))
    document.getElementById("sortSelect").addEventListener("change", (e) => this.sortProducts(e.target.value))

    // Promo modal
    document.getElementById("closePromoBtn").addEventListener("click", () => this.closePromoModal())
    document.getElementById("cancelPromoBtn").addEventListener("click", () => this.closePromoModal())
    document.getElementById("applyPromoBtn").addEventListener("click", () => this.applyPromoCode())
  }

  renderDeals() {
    const dealsGrid = document.getElementById("dealsGrid")
    dealsGrid.innerHTML = ""

    // Get products with save percentage (deals)
    const deals = productsData.filter((p) => p.savePercent > 0).slice(0, 6)

    deals.forEach((product) => {
      const card = this.createProductCard(product)
      dealsGrid.appendChild(card)
    })
  }

  renderTrending() {
    const trendingGrid = document.getElementById("trendingGrid")
    trendingGrid.innerHTML = ""

    // Get highest rated products
    const trending = productsData.sort((a, b) => b.reviews - a.reviews).slice(0, 6)

    trending.forEach((product) => {
      const card = this.createProductCard(product)
      trendingGrid.appendChild(card)
    })
  }

  renderProducts() {
    const grid = document.getElementById("productsGrid")
    grid.innerHTML = ""

    this.filteredProducts.forEach((product) => {
      const card = this.createProductCard(product)
      grid.appendChild(card)
    })
  }

  createProductCard(product) {
    const card = document.createElement("div")
    card.className = "product-card"

    const stockClass = product.stock > 20 ? "stock-high" : product.stock > 5 ? "stock-low" : "stock-out"
    const stockText = product.stock > 20 ? "In Stock" : product.stock > 5 ? "Limited Stock" : "Out of Stock"

    let badgesHTML = ""
    if (product.badge) {
      const badgeClass = `badge-${product.badge}`
      const badgeText = product.badge.charAt(0).toUpperCase() + product.badge.slice(1)
      badgesHTML += `<span class="badge ${badgeClass}" aria-label="${badgeText}">${badgeText}</span>`
    }
    if (product.savePercent) {
      badgesHTML += `<span class="badge badge-save" aria-label="Save ${product.savePercent}%">Save ${product.savePercent}%</span>`
    }

    const originalPriceHTML = product.originalPrice
      ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>`
      : ""

    const starsHTML = this.renderStars(product.rating)

    card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-badges">
                    ${badgesHTML}
                </div>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <div class="stars">${starsHTML}</div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">$${product.price.toFixed(2)}</span>
                    ${originalPriceHTML}
                </div>
                <span class="stock-indicator ${stockClass}">${stockText}</span>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="ecomApp.addToCart(${product.id})">Add to Cart</button>
                    <button class="btn btn-secondary" onclick="ecomApp.viewProduct(${product.id})">View</button>
                </div>
            </div>
        `

    // Make the whole card clickable (except buttons/inputs/links) to open product details
    card.style.cursor = "pointer"
    card.tabIndex = 0
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return
      this.viewProduct(product.id)
    })
    // keyboard accessibility: Enter or Space opens the product details
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      this.viewProduct(product.id)
      }
    })

    return card
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 !== 0
    let starsHTML = ""

    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star">★</span>'
    }
    if (hasHalf) {
      starsHTML += '<span class="star">★</span>'
    }
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) {
      starsHTML += '<span class="star empty">★</span>'
    }

    return starsHTML
  }

  filterProducts(query) {
    this.filteredProducts = productsData.filter(
      (product) =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()),
    )
    this.renderProducts()
  }

  sortProducts(sortBy) {
    let sorted = [...this.filteredProducts]

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        sorted = [...productsData]
    }

    this.filteredProducts = sorted
    this.renderProducts()
  }

  addToCart(productId) {
    const product = productsData.find((p) => p.id === productId)
    if (product && product.stock > 0) {
      cart.addItem(product, 1)
      this.showNotification(`${product.title} added to cart!`)
      this.updateCartUI()
    }
  }

  viewProduct(productId) {
    const product = productsData.find((p) => p.id === productId)
    if (product) {
      this.selectedProduct = product
      this.openProductModal()
    }
  }

  openProductModal() {
    const modal = document.getElementById("productModal")
    const detail = document.getElementById("productDetail")
    const product = this.selectedProduct

    const starsHTML = this.renderStars(product.rating)
    const originalPriceHTML = product.originalPrice
      ? `<p class="price-original">Was: $${product.originalPrice.toFixed(2)}</p>`
      : ""

    detail.innerHTML = `
      <div class="product-modal-image">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-modal-info">
        <div class="product-brand">${product.brand}</div>
        <h2>${product.title}</h2>
        <div class="product-rating">
          <div class="stars">${starsHTML}</div>
          <span class="rating-count">(${product.reviews} reviews)</span>
        </div>
        <p class="product-full-desc">${product.description}</p>
        <div class="price-section">
          <p class="price-large">$${product.price.toFixed(2)}</p>
          ${originalPriceHTML}
        </div>
        <div class="stock-section">
          <span class="stock-indicator ${product.stock > 20 ? "stock-high" : product.stock > 5 ? "stock-low" : "stock-out"}">
            ${product.stock > 20 ? "In Stock" : product.stock > 5 ? "Limited Stock" : "Out of Stock"}
          </span>
        </div>
        <button class="btn btn-primary btn-large" onclick="ecomApp.addToCart(${product.id})">Add to Cart</button>
      </div>
    `

    modal.classList.add("active")
  }

  closeProductModal() {
    document.getElementById("productModal").classList.remove("active")
  }

  openMiniCart() {
    document.getElementById("miniCart").classList.add("active")
    document.getElementById("miniCartOverlay").classList.add("active")
    this.renderMiniCart()
  }

  closeMiniCart() {
    document.getElementById("miniCart").classList.remove("active")
    document.getElementById("miniCartOverlay").classList.remove("active")
  }

  renderMiniCart() {
    const content = document.getElementById("miniCartContent")
    const summary = document.getElementById("cartSummary")
    const viewCartBtn = document.getElementById("viewCartBtn")
    const checkoutBtn = document.getElementById("checkoutBtn")

    if (cart.items.length === 0) {
      content.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <p class="empty-text">Add items to get started</p>
                </div>
            `
      summary.style.display = "none"
      viewCartBtn.style.display = "none"
      checkoutBtn.style.display = "none"
      return
    }

    content.innerHTML = cart.items
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="ecomApp.decrementQuantity(${item.id})">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="ecomApp.incrementQuantity(${item.id})">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="ecomApp.removeFromCart(${item.id})">Remove</button>
            </div>
        `,
      )
      .join("")

    const subtotal = cart.getSubtotal()
    const discount = cart.getDiscount()
    const tax = cart.getTax(subtotal - discount)
    const shipping = cart.getShipping()
    const total = cart.getTotal()

    summary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${
              cart.appliedPromo
                ? `
                <div class="summary-row">
                    <span>Discount (${cart.appliedPromo.code}):</span>
                    <span>-$${discount.toFixed(2)}</span>
                </div>
            `
                : ""
            }
            <div class="summary-row">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `

    summary.style.display = "block"
    viewCartBtn.style.display = "block"
    checkoutBtn.style.display = "block"
  }

  incrementQuantity(productId) {
    const item = cart.items.find((i) => i.id === productId)
    if (item && item.quantity < item.stock) {
      cart.updateQuantity(productId, item.quantity + 1)
      this.renderMiniCart()
      this.updateCartUI()
    }
  }

  decrementQuantity(productId) {
    const item = cart.items.find((i) => i.id === productId)
    if (item && item.quantity > 1) {
      cart.updateQuantity(productId, item.quantity - 1)
      this.renderMiniCart()
      this.updateCartUI()
    }
  }

  removeFromCart(productId) {
    cart.removeItem(productId)
    this.renderMiniCart()
    this.updateCartUI()
  }

  updateCartUI() {
    const count = cart.getItemCount()
    document.getElementById("cartCount").textContent = count
  }

  applyPromoCode() {
    const input = document.getElementById("promoInput")
    const code = input.value.trim()
    const result = cart.applyPromo(code)

    if (result.success) {
      this.showNotification(result.message)
      this.closePromoModal()
      this.renderMiniCart()
    } else {
      this.showNotification(result.message, "error")
    }
    input.value = ""
  }

  openPromoModal() {
    document.getElementById("promoModal").classList.add("active")
  }

  closePromoModal() {
    document.getElementById("promoModal").classList.remove("active")
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === "error" ? "#dc3545" : "#28a745"};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease"
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
}

// Initialize app when DOM is ready
let ecomApp
document.addEventListener("DOMContentLoaded", () => {
  ecomApp = new EcommerceApp()
})
