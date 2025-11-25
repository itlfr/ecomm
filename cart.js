// Shopping Cart Management System

class ShoppingCart {
  constructor() {
    this.items = this.loadFromLocalStorage()
    this.promoCodes = {
      FLASH30: { discount: 0.3, code: "FLASH30" },
      MEGA50: { discount: 0.5, code: "MEGA50" },
      VIP70: { discount: 0.7, code: "VIP70" },
    }
    this.appliedPromo = null
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        ...product,
        quantity: quantity,
      })
    }

    this.saveToLocalStorage()
    this.animateCartUpdate()
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId)
    this.saveToLocalStorage()
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      this.saveToLocalStorage()
    }
  }

  applyPromo(code) {
    const promo = this.promoCodes[code.toUpperCase()]
    if (promo) {
      this.appliedPromo = promo
      this.saveToLocalStorage()
      return { success: true, message: `Promo code ${code} applied!` }
    }
    return { success: false, message: "Invalid promo code" }
  }

  removePromo() {
    this.appliedPromo = null
    this.saveToLocalStorage()
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  getDiscount() {
    if (!this.appliedPromo) return 0
    return this.getSubtotal() * this.appliedPromo.discount
  }

  getTax(subtotal) {
    return subtotal * 0.08 // 8% tax
  }

  getShipping() {
    return this.getSubtotal() > 50 ? 0 : 9.99
  }

  getTotal() {
    const subtotal = this.getSubtotal()
    const discount = this.getDiscount()
    const taxBase = subtotal - discount
    const tax = this.getTax(taxBase)
    const shipping = this.getShipping()

    return subtotal - discount + tax + shipping
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  clearCart() {
    this.items = []
    this.appliedPromo = null
    this.saveToLocalStorage()
  }

  saveToLocalStorage() {
    const data = {
      items: this.items,
      appliedPromo: this.appliedPromo,
    }
    localStorage.setItem("cart", JSON.stringify(data))
    this.notifyListeners()
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem("cart")
    if (data) {
      const parsed = JSON.parse(data)
      this.appliedPromo = parsed.appliedPromo
      return parsed.items || []
    }
    return []
  }

  listeners = []

  subscribe(callback) {
    this.listeners.push(callback)
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback())
  }

  animateCartUpdate() {
    const cartBtn = document.getElementById("cartBtn")
    if (cartBtn) {
      cartBtn.style.animation = "pulse 0.5s ease"
      setTimeout(() => {
        cartBtn.style.animation = ""
      }, 500)
    }
  }
}

// Global cart instance
const cart = new ShoppingCart()
