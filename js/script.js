const PRODUCTS = [
  {
    id: "st1water",
    name: "Water Sticker",
    category: "Stickers",
    price: 2.99,
    tag: "NEW",
    description: "A clean water-inspired sticker made for laptops, notebooks, cases and anything else that needs a little Aura.",
    variants: [
      {
        id: "ocean",
        name: "Ocean Blue",
        color: "#002249",
        image: "/assets/placeholder.jpg"
      },
      {
        id: "cherry",
        name: "Cherry Red",
        color: "#e0202e",
        image: "/assets/products/st1water-red.jpg"
      },
      {
        id: "black",
        name: "Black",
        color: "#171719",
        image: "/assets/products/st1water-black.jpg"
      }
    ]
  },

  {
    id: "placeholder",
    name: "placeholder",
    category: "Phone cases",
    price: 0.99,
    tag: "placeholder",
    description: "placeholder",
    variants: [
      {
        id: "clear",
        name: "Clear",
        color: "#e9edf0",
        image: "/assets/placeholder.jpg"
      },
      {
        id: "red",
        name: "Aura Red",
        color: "#e0202e",
        image: "/assets/products/pc1clear-red.jpg"
      },
      {
        id: "smoke",
        name: "Smoke",
        color: "#414146",
        image: "/assets/placeholder.jpg"
      }
    ]
  }
];

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: loadCart()
};

const $ = selector => document.querySelector(selector);

function loadCart() {
  try {
    const saved = localStorage.getItem("aura-cart");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item =>
      item &&
      typeof item.productId === "string" &&
      typeof item.variantId === "string" &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );
  } catch {
    return [];
  }
}

function money(value) {
  return `£${Number(value).toFixed(2)}`;
}

function saveCart() {
  try {
    localStorage.setItem("aura-cart", JSON.stringify(state.cart));
  } catch {}
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function getVariant(product, variantId) {
  if (!product || !Array.isArray(product.variants)) {
    return null;
  }

  return (
    product.variants.find(variant => variant.id === variantId) ||
    product.variants[0]
  );
}

function productUrl(id) {
  return `/products/${encodeURIComponent(id)}`;
}

function imageFallback(image, variant) {
  if (!image) {
    return;
  }

  image.onerror = () => {
    image.onerror = null;
    image.src = createPlaceholder(
      variant && variant.name ? variant.name : "Aura"
    );
  };
}

function createPlaceholder(text) {
  const safeText = String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <rect width="900" height="900" fill="#f7f7f8"/>
      <circle cx="450" cy="450" r="240" fill="#ffffff"/>
      <text x="450" y="440" text-anchor="middle" font-family="Arial" font-size="90" font-weight="700" fill="#e0202e">AURA</text>
      <text x="450" y="505" text-anchor="middle" font-family="Arial" font-size="24" fill="#77777e">${safeText}</text>
    </svg>
  `);

  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function categories() {
  return [
    "All",
    ...new Set(PRODUCTS.map(product => product.category))
  ];
}

function renderCategories() {
  const container = $("#categories");

  if (!container) {
    return;
  }

  container.innerHTML = categories()
    .map(category => `
      <button
        class="category ${state.category === category ? "active" : ""}"
        data-category="${escapeAttribute(category)}"
      >
        ${escapeHTML(category)}
      </button>
    `)
    .join("");
}

function getVisibleProducts() {
  let products = [...PRODUCTS];

  if (state.category !== "All") {
    products = products.filter(
      product => product.category === state.category
    );
  }

  if (state.search) {
    const query = state.search.toLowerCase();

    products = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  if (state.sort === "low") {
    products.sort((a, b) => a.price - b.price);
  }

  if (state.sort === "high") {
    products.sort((a, b) => b.price - a.price);
  }

  if (state.sort === "az") {
    products.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return products;
}

function renderProducts() {
  const grid = $("#productGrid");

  if (!grid) {
    return;
  }

  const products = getVisibleProducts();

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found.</h3>
        <p>Try another search or category.</p>
      </div>
    `;

    return;
  }

  grid.innerHTML = products.map(product => {
    const variant = product.variants[0];

    return `
      <article class="product-card" data-product="${escapeAttribute(product.id)}">

        <div class="product-image-wrap">

          ${product.tag ? `
            <span class="product-tag">
              ${escapeHTML(product.tag)}
            </span>
          ` : ""}

          <a
            href="${productUrl(product.id)}"
            data-product-link="${escapeAttribute(product.id)}"
          >
            <img
              class="product-image"
              src="${escapeAttribute(variant.image)}"
              alt="${escapeAttribute(product.name)}"
              data-card-image="${escapeAttribute(product.id)}"
            >
          </a>

          <button
            class="quick-add"
            data-quick-add="${escapeAttribute(product.id)}"
            aria-label="Add ${escapeAttribute(product.name)} to cart"
          >
            +
          </button>

        </div>

        <div class="product-info">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <a
            class="product-name"
            href="${productUrl(product.id)}"
            data-product-link="${escapeAttribute(product.id)}"
          >
            ${escapeHTML(product.name)}
          </a>

          <div class="product-bottom">

            <strong
              class="product-price"
              data-card-price="${escapeAttribute(product.id)}"
            >
              ${money(product.price)}
            </strong>

            <div class="variant-dots">
              ${product.variants.map((item, index) => `
                <button
                  class="variant-dot ${index === 0 ? "active" : ""}"
                  style="background:${escapeAttribute(item.color)}"
                  title="${escapeAttribute(item.name)}"
                  aria-label="${escapeAttribute(item.name)}"
                  data-card-variant="${escapeAttribute(product.id)}"
                  data-variant="${escapeAttribute(item.id)}"
                ></button>
              `).join("")}
            </div>

          </div>

        </div>

      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-card-variant]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const productId = button.dataset.cardVariant;
      const variantId = button.dataset.variant;

      const product = getProduct(productId);

      if (!product) {
        return;
      }

      const variant = getVariant(product, variantId);

      if (!variant) {
        return;
      }

      const card = button.closest(".product-card");

      if (!card) {
        return;
      }

      const image = card.querySelector("[data-card-image]");

      if (image) {
        image.src = variant.image;
        image.alt = `${product.name} - ${variant.name}`;
        imageFallback(image, variant);
      }

      card.querySelectorAll("[data-card-variant]").forEach(dot => {
        dot.classList.toggle(
          "active",
          dot.dataset.variant === variantId
        );
      });

      card.dataset.variant = variantId;
    });
  });

  grid.querySelectorAll("[data-quick-add]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      addToCart(
        button.dataset.quickAdd,
        undefined,
        1
      );
    });
  });

  grid.querySelectorAll("img").forEach(image => {
    imageFallback(image, {
      name: image.alt
    });
  });
}

function addToCart(productId, variantId, quantity = 1) {
  const product = getProduct(productId);

  if (!product) {
    return;
  }

  const variant = getVariant(product, variantId);

  if (!variant) {
    return;
  }

  const safeQuantity = Math.max(
    1,
    Math.floor(Number(quantity) || 1)
  );

  const existing = state.cart.find(item =>
    item.productId === productId &&
    item.variantId === variant.id
  );

  if (existing) {
    existing.quantity += safeQuantity;
  } else {
    state.cart.push({
      productId: productId,
      variantId: variant.id,
      quantity: safeQuantity
    });
  }

  saveCart();
  updateCart();

  showToast(`${product.name} added to your bag`);
}

function updateCart() {
  const body = $("#cartBody");
  const totalElement = $("#cartTotal");
  const countElement = $("#cartCount");

  if (!body || !totalElement || !countElement) {
    return;
  }

  let total = 0;
  let count = 0;

  const validCart = [];

  state.cart.forEach(item => {
    const product = getProduct(item.productId);

    if (!product) {
      return;
    }

    const variant = getVariant(product, item.variantId);

    if (!variant) {
      return;
    }

    item.quantity = Math.max(
      1,
      Math.floor(Number(item.quantity) || 1)
    );

    validCart.push(item);
  });

  state.cart = validCart;

  if (!state.cart.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">♡</div>
        <h3>Your bag is empty</h3>
        <p>Add something you like from the collection.</p>
      </div>
    `;

    totalElement.textContent = money(0);
    countElement.textContent = "0";

    saveCart();

    return;
  }

  body.innerHTML = state.cart.map((item, index) => {
    const product = getProduct(item.productId);

    if (!product) {
      return "";
    }

    const variant = getVariant(product, item.variantId);

    if (!variant) {
      return "";
    }

    const itemTotal = product.price * item.quantity;

    total += itemTotal;
    count += item.quantity;

    return `
      <div class="cart-item">

        <a
          class="cart-thumb"
          href="${productUrl(product.id)}"
          data-product-link="${escapeAttribute(product.id)}"
        >
          <img
            src="${escapeAttribute(variant.image)}"
            alt="${escapeAttribute(product.name)}"
          >
        </a>

        <div>

          <a
            class="cart-item-name"
            href="${productUrl(product.id)}"
            data-product-link="${escapeAttribute(product.id)}"
          >
            ${escapeHTML(product.name)}
          </a>

          <span class="cart-item-variant">
            ${escapeHTML(variant.name)}
          </span>

          <div class="cart-item-price">
            ${money(itemTotal)}
          </div>

          <div class="cart-qty">

            <button
              data-cart-action="minus"
              data-index="${index}"
            >
              −
            </button>

            <span>${item.quantity}</span>

            <button
              data-cart-action="plus"
              data-index="${index}"
            >
              +
            </button>

            <button
              class="cart-remove"
              data-cart-action="remove"
              data-index="${index}"
            >
              Remove
            </button>

          </div>

        </div>

      </div>
    `;
  }).join("");

  totalElement.textContent = money(total);
  countElement.textContent = String(count);

  body.querySelectorAll("[data-cart-action]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const action = button.dataset.cartAction;

      if (!Number.isInteger(index)) {
        return;
      }

      if (!state.cart[index]) {
        return;
      }

      if (action === "plus") {
        state.cart[index].quantity++;
      }

      if (action === "minus") {
        state.cart[index].quantity--;

        if (state.cart[index].quantity <= 0) {
          state.cart.splice(index, 1);
        }
      }

      if (action === "remove") {
        state.cart.splice(index, 1);
      }

      saveCart();
      updateCart();
    });
  });

  body.querySelectorAll("img").forEach(image => {
    imageFallback(image, {
      name: image.alt
    });
  });
}

function openCart() {
  const cartDrawer = $("#cartDrawer");
  const overlay = $("#overlay");

  if (cartDrawer) {
    cartDrawer.classList.add("open");
  }

  if (overlay) {
    overlay.classList.add("open");
  }

  document.body.classList.add("drawer-open");
}

function closeCart() {
  const cartDrawer = $("#cartDrawer");
  const overlay = $("#overlay");

  if (cartDrawer) {
    cartDrawer.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("open");
  }

  document.body.classList.remove("drawer-open");
}

function showToast(message) {
  const toast = $("#toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);

  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderProductPage(product) {
  const app = $("#app");

  if (!app || !product) {
    return;
  }

  const firstVariant = product.variants[0];

  app.innerHTML = `
    <section class="product-page">

      <div class="wrap">

        <div class="product-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/#shop">Shop</a>
          <span>/</span>
          <strong>${escapeHTML(product.name)}</strong>
        </div>

        <div class="product-layout">

          <div class="product-gallery">

            <div class="product-main-image">
              <img
                id="productMainImage"
                src="${escapeAttribute(firstVariant.image)}"
                alt="${escapeAttribute(product.name)}"
              >
            </div>

            <div class="product-thumbs" id="productThumbs">

              ${product.variants.map((variant, index) => `
                <button
                  class="product-thumb ${index === 0 ? "active" : ""}"
                  data-gallery-variant="${escapeAttribute(variant.id)}"
                >
                  <img
                    src="${escapeAttribute(variant.image)}"
                    alt="${escapeAttribute(variant.name)}"
                  >
                </button>
              `).join("")}

            </div>

          </div>

          <div class="product-details">

            <span class="product-category">
              ${escapeHTML(product.category)}
            </span>

            <h1>
              ${escapeHTML(product.name)}
            </h1>

            <p class="product-description">
              ${escapeHTML(product.description)}
            </p>

            <div class="product-price-large" id="productPrice">
              ${money(product.price)}
            </div>

            <div class="variant-section">

              <div class="variant-label">
                <span>Color</span>

                <span
                  class="variant-selected"
                  id="variantName"
                >
                  ${escapeHTML(firstVariant.name)}
                </span>
              </div>

              <div class="variant-picker">

                ${product.variants.map((variant, index) => `
                  <button
                    class="variant-choice ${index === 0 ? "active" : ""}"
                    style="background:${escapeAttribute(variant.color)}"
                    title="${escapeAttribute(variant.name)}"
                    aria-label="${escapeAttribute(variant.name)}"
                    data-product-variant="${escapeAttribute(variant.id)}"
                  ></button>
                `).join("")}

              </div>

            </div>

            <div class="product-buy-row">

              <div class="quantity-picker">

                <button id="quantityMinus">
                  −
                </button>

                <span id="productQuantity">
                  1
                </span>

                <button id="quantityPlus">
                  +
                </button>

              </div>

              <button
                class="add-product-btn"
                id="addProductButton"
              >
                Add to bag
              </button>

            </div>

            <div class="product-meta">

              <div class="meta-row">
                <span>Product ID</span>
                <strong>${escapeHTML(product.id)}</strong>
              </div>

              <div class="meta-row">
                <span>Category</span>
                <strong>${escapeHTML(product.category)}</strong>
              </div>

              <div class="meta-row">
                <span>Variants</span>
                <strong>${product.variants.length}</strong>
              </div>

            </div>

          </div>

        </div>

        <div class="related-section">

          <span class="section-label">
            YOU MAY ALSO LIKE
          </span>

          <h2>More from Aura.</h2>

          <div
            class="product-grid"
            id="relatedProducts"
          ></div>

        </div>

      </div>

    </section>
  `;

  setupProductPage(product);

  const mainImage = $("#productMainImage");

  if (mainImage) {
    imageFallback(mainImage, firstVariant);
  }

  document
    .querySelectorAll("#productThumbs img")
    .forEach(image => {
      imageFallback(image, {
        name: image.alt
      });
    });
}

function setupProductPage(product) {
  let selectedVariant = product.variants[0];
  let quantity = 1;

  const image = $("#productMainImage");
  const variantName = $("#variantName");
  const quantityText = $("#productQuantity");

  function selectVariant(variantId) {
    const variant = getVariant(product, variantId);

    if (!variant) {
      return;
    }

    selectedVariant = variant;

    if (image) {
      image.src = selectedVariant.image;
      image.alt = `${product.name} - ${selectedVariant.name}`;

      imageFallback(image, selectedVariant);
    }

    if (variantName) {
      variantName.textContent = selectedVariant.name;
    }

    document
      .querySelectorAll("[data-product-variant]")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.productVariant === selectedVariant.id
        );
      });

    document
      .querySelectorAll("[data-gallery-variant]")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.galleryVariant === selectedVariant.id
        );
      });
  }

  document
    .querySelectorAll("[data-product-variant]")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectVariant(button.dataset.productVariant);
      });
    });

  document
    .querySelectorAll("[data-gallery-variant]")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectVariant(button.dataset.galleryVariant);
      });
    });

  const quantityMinus = $("#quantityMinus");
  const quantityPlus = $("#quantityPlus");
  const addProductButton = $("#addProductButton");

  if (quantityMinus) {
    quantityMinus.addEventListener("click", () => {
      quantity = Math.max(1, quantity - 1);

      if (quantityText) {
        quantityText.textContent = quantity;
      }
    });
  }

  if (quantityPlus) {
    quantityPlus.addEventListener("click", () => {
      quantity++;

      if (quantityText) {
        quantityText.textContent = quantity;
      }
    });
  }

  if (addProductButton) {
    addProductButton.addEventListener("click", () => {
      addToCart(
        product.id,
        selectedVariant.id,
        quantity
      );
    });
  }

  const related = PRODUCTS
    .filter(item =>
      item.id !== product.id &&
      item.category === product.category
    )
    .slice(0, 3);

  const fallbackRelated = PRODUCTS
    .filter(item => item.id !== product.id)
    .slice(0, 3);

  renderRelatedProducts(
    related.length ? related : fallbackRelated
  );
}

function renderRelatedProducts(products) {
  const grid = $("#relatedProducts");

  if (!grid) {
    return;
  }

  grid.innerHTML = products.map(product => {
    const variant = product.variants[0];

    return `
      <article
        class="product-card"
        data-product="${escapeAttribute(product.id)}"
      >

        <div class="product-image-wrap">

          <a
            href="${productUrl(product.id)}"
            data-product-link="${escapeAttribute(product.id)}"
          >
            <img
              class="product-image"
              src="${escapeAttribute(variant.image)}"
              alt="${escapeAttribute(product.name)}"
            >
          </a>

          <button
            class="quick-add"
            data-quick-add="${escapeAttribute(product.id)}"
          >
            +
          </button>

        </div>

        <div class="product-info">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <a
            class="product-name"
            href="${productUrl(product.id)}"
            data-product-link="${escapeAttribute(product.id)}"
          >
            ${escapeHTML(product.name)}
          </a>

          <div class="product-bottom">

            <strong class="product-price">
              ${money(product.price)}
            </strong>

          </div>

        </div>

      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-quick-add]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      addToCart(
        button.dataset.quickAdd,
        undefined,
        1
      );
    });
  });

  grid.querySelectorAll("img").forEach(image => {
    imageFallback(image, {
      name: image.alt
    });
  });
}

function isProductRoute() {
  const pathname = window.location.pathname;

  const match = pathname.match(
    /^\/products\/([^/]+)\/?$/
  );

  if (!match) {
    return null;
  }

  let productId;

  try {
    productId = decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  const product = getProduct(productId);

  if (!product) {
    return null;
  }

  return product.id;
}

function renderHome() {
  const app = $("#app");

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="hero">

      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <div class="wrap hero-inner">

        <div class="hero-copy">

          <div class="eyebrow">
            AURA.FUN
          </div>

          <h1>
            Things worth
            <em>having.</em>
          </h1>

          <p>
            A small collection of useful, fun and good-looking things.
            Nothing complicated.
          </p>

          <div class="hero-actions">

            <a
              class="btn btn-red"
              href="#shop"
            >
              Shop collection
            </a>

            <a
              class="hero-link"
              href="#about"
            >
              Why Aura
              <span>↗</span>
            </a>

          </div>

        </div>

        <div class="hero-orbit">

          <div class="orbit-ring"></div>

          <div class="hero-product hero-product-one">
            <div class="hero-product-inner">A</div>
          </div>

          <div class="hero-product hero-product-two">
            <div class="hero-product-inner">U</div>
          </div>

          <div class="hero-product hero-product-three">
            <div class="hero-product-inner">R</div>
          </div>

          <div class="hero-badge">
            <span>NEW</span>
            <strong>2026</strong>
          </div>

        </div>

      </div>

    </section>

    <section
      class="shop-section"
      id="shop"
    >

      <div class="wrap">

        <div class="section-heading">

          <div>

            <span class="section-label">
              THE COLLECTION
            </span>

            <h2>
              Shop Aura.
            </h2>

          </div>

          <p>
            Pick something you like.
            We'll handle the rest.
          </p>

        </div>

        <div class="shop-toolbar">

          <div
            class="categories"
            id="categories"
          ></div>

          <div class="shop-tools">

            <label class="search-box">

              <span>⌕</span>

              <input
                id="searchInput"
                type="search"
                placeholder="Search products..."
                autocomplete="off"
              >

            </label>

            <select
              class="sort-select"
              id="sortSelect"
            >
              <option value="featured">
                Featured
              </option>

              <option value="low">
                Price: low to high
              </option>

              <option value="high">
                Price: high to low
              </option>

              <option value="az">
                Name: A–Z
              </option>

            </select>

          </div>

        </div>

        <div
          class="product-grid"
          id="productGrid"
        ></div>

      </div>

    </section>

    <section
      class="about-section"
      id="about"
    >

      <div class="wrap">

        <div class="section-heading about-heading">

          <div>

            <span class="section-label">
              ABOUT AURA
            </span>

            <h2>
              Simple by design.
            </h2>

          </div>

          <p>
            Aura is built around small products that feel
            considered instead of complicated.
          </p>

        </div>

        <div class="feature-grid">

          <article class="feature-card">

            <span class="feature-number">
              01
            </span>

            <div>

              <h3>
                Clean
              </h3>

              <p>
                Products and interfaces without unnecessary clutter.
              </p>

            </div>

          </article>

          <article class="feature-card feature-red">

            <span class="feature-number">
              02
            </span>

            <div>

              <h3>
                Personal
              </h3>

              <p>
                Choose colors and variants that fit your style.
              </p>

            </div>

          </article>

          <article class="feature-card">

            <span class="feature-number">
              03
            </span>

            <div>

              <h3>
                Useful
              </h3>

              <p>
                Everything exists for a reason. No filler.
              </p>

            </div>

          </article>

        </div>

      </div>

    </section>

    <section
      class="contact-section"
      id="contact"
    >

      <div class="wrap contact-inner">

        <div>

          <span class="section-label">
            CONTACT
          </span>

          <h2>
            Have a question?
          </h2>

        </div>

        <a
          class="btn btn-dark"
          href="mailto:#"
        >
          not yet
        </a>

      </div>

    </section>
  `;

  bindShop();
}

function bindShop() {
  renderCategories();
  renderProducts();

  const search = $("#searchInput");
  const sort = $("#sortSelect");

  if (search) {
    search.value = state.search;

    search.addEventListener("input", event => {
      state.search = event.target.value.trim();

      renderProducts();
    });
  }

  if (sort) {
    sort.value = state.sort;

    sort.addEventListener("change", event => {
      state.sort = event.target.value;

      renderProducts();
    });
  }

  bindCategoryButtons();
}

function bindCategoryButtons() {
  document
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.onclick = () => {
        state.category = button.dataset.category;

        renderCategories();
        renderProducts();

        bindCategoryButtons();
      };
    });
}

function renderNotFound() {
  const app = $("#app");

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="product-page">

      <div class="wrap">

        <div class="empty-state">

          <h3>
            Product not found.
          </h3>

          <p>
            That Aura product doesn't exist.
          </p>

          <div style="margin-top:20px">

            <a
              class="btn btn-red"
              href="/"
            >
              Back to shop
            </a>

          </div>

        </div>

      </div>

    </section>
  `;
}

function handleRoute() {
  const pathname = window.location.pathname;

  const productMatch = pathname.match(
    /^\/products\/([^/]+)\/?$/
  );

  if (productMatch) {
    let productId = null;

    try {
      productId = decodeURIComponent(productMatch[1]);
    } catch {
      renderNotFound();
      window.scrollTo(0, 0);
      return;
    }

    const product = getProduct(productId);

    if (product) {
      renderProductPage(product);
    } else {
      renderNotFound();
    }

    window.scrollTo(0, 0);

    return;
  }

  renderHome();

  window.scrollTo(0, 0);
}

function navigateToProduct(id) {
  const product = getProduct(id);

  if (!product) {
    return;
  }

  const url = productUrl(product.id);

  if (window.location.pathname !== url) {
    window.history.pushState(
      {
        productId: product.id
      },
      "",
      url
    );
  }

  handleRoute();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

function bindGlobalEvents() {
  const cartButton = $("#cartButton");
  const closeCartButton = $("#closeCart");
  const overlay = $("#overlay");
  const menuButton = $("#menuButton");
  const checkoutButton = $("#checkoutButton");

  if (cartButton) {
    cartButton.addEventListener("click", openCart);
  }

  if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCart);
  }

  if (overlay) {
    overlay.addEventListener("click", closeCart);
  }

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const mobileNav = $("#mobileNav");

      if (mobileNav) {
        mobileNav.classList.toggle("open");
      }
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (!state.cart.length) {
        showToast("Your bag is empty");
        return;
      }

      showToast("Checkout is ready to connect");
    });
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("[data-product-link]");

    if (link) {
      const href = link.getAttribute("href");

      if (href && href.startsWith("/products/")) {
        event.preventDefault();

        const id = link.dataset.productLink;

        navigateToProduct(id);

        return;
      }
    }

    const mobileLink = event.target.closest(".mobile-nav a");

    if (mobileLink) {
      const mobileNav = $("#mobileNav");

      if (mobileNav) {
        mobileNav.classList.remove("open");
      }
    }
  });

  window.addEventListener("popstate", () => {
    handleRoute();
  });
}

function startApp() {
  bindGlobalEvents();
  updateCart();
  handleRoute();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startApp,
    {
      once: true
    }
  );
} else {
  startApp();
}