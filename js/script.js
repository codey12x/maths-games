const CATEGORIES = ["All", "Phone cases", "Stickers"];

const PRODUCTS = [
  {
    id: 1,
    name: "Samsung Galaxy 15",
    cat: "Phone cases",
    price: 7.99,
    icon: "assets/phonecase.jpg",
    bg: "#2a0104"
  },
  {
    id: 2,
    name: "Iphone 15",
    cat: "Phone cases",
    price: 12.99,
    icon: "assets/iphone15case.jpg",
    bg: "#db7077"
  }
];

const $ = id => document.getElementById(id);
const money = n => "£" + n.toFixed(2);

let activeCat = "All";
let cart = {};

try {
  const saved = localStorage.getItem("aura-cart");
  if (saved) cart = JSON.parse(saved) || {};
} catch (e) {
  cart = {};
}

function saveCart() {
  try {
    localStorage.setItem("aura-cart", JSON.stringify(cart));
  } catch (e) {}
}

function renderChips() {
  $("chips").innerHTML = CATEGORIES.map(c => `
    <button
      class="chip"
      data-cat="${c}"
      aria-pressed="${c === activeCat}"
    >
      ${c}
    </button>
  `).join("");
}

$("chips").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;

  activeCat = b.dataset.cat;

  renderChips();
  renderProducts();
});

function productImage(p, className = "product-image") {
  if (!p.icon) {
    return "";
  }

  return `
    <img
      class="${className}"
      src="${p.icon}"
      alt="${p.name}"
      loading="lazy"
      onerror="this.style.display='none'"
    >
  `;
}

function renderProducts() {
  const q = $("search").value.trim().toLowerCase();

  let list = PRODUCTS.filter(p =>
    (activeCat === "All" || p.cat === activeCat) &&
    (
      p.name.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q)
    )
  );

  const s = $("sort").value;

  if (s === "low") {
    list = [...list].sort((a, b) => a.price - b.price);
  }

  if (s === "high") {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  $("grid").innerHTML = list.length
    ? list.map(p => `
      <article class="card">
        <div
          class="pic"
          style="background:${p.bg}"
        >
          ${productImage(p)}
        </div>

        <div class="info">
          <h3>${p.name}</h3>
          <span class="cat">${p.cat}</span>

          <div class="row">
            <span class="price">${money(p.price)}</span>

            <button
              class="add"
              data-add="${p.id}"
              aria-label="Add ${p.name} to cart"
            >
              Add
            </button>
          </div>
        </div>
      </article>
    `).join("")
    : `
      <div class="empty">
        No products found. Try another category or search.
      </div>
    `;
}

$("grid").addEventListener("click", e => {
  const b = e.target.closest("[data-add]");
  if (!b) return;

  const id = b.dataset.add;

  cart[id] = (cart[id] || 0) + 1;

  saveCart();
  renderCart();

  b.textContent = "Added";

  setTimeout(() => {
    b.textContent = "Add";
  }, 900);
});

$("search").addEventListener("input", renderProducts);
$("sort").addEventListener("change", renderProducts);

function renderCart() {
  const ids = Object.keys(cart).filter(id =>
    PRODUCTS.some(p => p.id == id)
  );

  let total = 0;
  let count = 0;

  $("cartBody").innerHTML = ids.length
    ? ids.map(id => {
        const p = PRODUCTS.find(x => x.id == id);
        const q = cart[id];

        total += p.price * q;
        count += q;

        return `
          <div class="item">
            <div
              class="thumb"
              style="background:${p.bg}"
            >
              ${productImage(p, "cart-image")}
            </div>

            <div class="meta">
              <b>${p.name}</b>
              <span class="cat">${money(p.price)}</span>

              <div class="qty">
                <button data-dec="${id}" aria-label="Fewer">
                  −
                </button>

                <span>${q}</span>

                <button data-inc="${id}" aria-label="More">
                  +
                </button>

                <button class="rm" data-rm="${id}">
                  Remove
                </button>
              </div>
            </div>

            <b>${money(p.price * q)}</b>
          </div>
        `;
      }).join("")
    : `
      <div class="empty">
        Your cart is empty. Add something from the shop.
      </div>
    `;

  $("total").textContent = money(total);
  $("count").textContent = count;
  $("checkout").disabled = count === 0;
}

$("cartBody").addEventListener("click", e => {
  const t = e.target;

  if (t.dataset.inc) {
    cart[t.dataset.inc]++;
  } else if (t.dataset.dec) {
    cart[t.dataset.dec]--;

    if (cart[t.dataset.dec] <= 0) {
      delete cart[t.dataset.dec];
    }
  } else if (t.dataset.rm) {
    delete cart[t.dataset.rm];
  } else {
    return;
  }

  saveCart();
  renderCart();
});

function openCart(open) {
  $("drawer").classList.toggle("open", open);
  $("shade").classList.toggle("open", open);
  $("drawer").setAttribute("aria-hidden", String(!open));
}

$("cartBtn").onclick = () => openCart(true);
$("closeCart").onclick = () => openCart(false);
$("shade").onclick = () => openCart(false);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    openCart(false);
  }
});

const CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 6;

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem("shop-orders")) || [];
  } catch (e) {
    return [];
  }
}

function saveOrders(list) {
  try {
    localStorage.setItem("shop-orders", JSON.stringify(list));
  } catch (e) {}
}

function makeCode() {
  const used = new Set(loadOrders().map(o => o.code));
  let code;

  do {
    const bytes = new Uint8Array(CODE_LENGTH);
    crypto.getRandomValues(bytes);

    code =
      "#" +
      Array
        .from(bytes, b => CODE_CHARS[b % CODE_CHARS.length])
        .join("");
  } while (used.has(code));

  return code;
}

const TYPO_DOMAINS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gnail.com": "gmail.com",

  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",

  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",

  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com"
};

function checkEmail(raw) {
  const email = raw.trim().toLowerCase();

  const valid =
    /^[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email);

  if (!valid) {
    return {
      ok: false,
      msg: "Enter a valid email address, like name@example.com."
    };
  }

  const domain = email.split("@")[1];

  if (TYPO_DOMAINS[domain]) {
    return {
      ok: false,
      msg:
        "Did you mean " +
        email.split("@")[0] +
        "@" +
        TYPO_DOMAINS[domain] +
        "?"
    };
  }

  if (domain.includes("..")) {
    return {
      ok: false,
      msg: "That email address doesn't look right."
    };
  }

  return {
    ok: true,
    email
  };
}

function showStep(step) {
  $("cartBody").classList.toggle("hidden", step !== "cart");
  $("cartFoot").classList.toggle("hidden", step !== "cart");

  $("detailsPanel").classList.toggle(
    "show",
    step === "details"
  );

  $("donePanel").classList.toggle(
    "show",
    step === "done"
  );

  $("dTitle").textContent =
    step === "cart"
      ? "Your cart"
      : step === "details"
        ? "Your details"
        : "Order placed";
}

function cartLines() {
  return Object.keys(cart)
    .filter(id => PRODUCTS.some(p => p.id == id))
    .map(id => {
      const p = PRODUCTS.find(x => x.id == id);

      return {
        name: p.name,
        qty: cart[id],
        price: p.price
      };
    });
}

function cartTotal() {
  return cartLines().reduce(
    (sum, line) => sum + line.price * line.qty,
    0
  );
}

function showDone(order) {
  $("orderCode").textContent = order.code;
  $("doneTotal").textContent = money(order.total);

  $("doneItems").innerHTML =
    order.items.map(l => `
      <div>
        <span>${l.qty} × ${l.name}</span>
        <span>${money(l.price * l.qty)}</span>
      </div>
    `).join("") +
    `
      <div>
        <b>Total</b>
        <b>${money(order.total)}</b>
      </div>
    `;

  showStep("done");
}

$("checkout").onclick = () => {
  if (!cartLines().length) return;

  $("payTotal").textContent = money(cartTotal());
  $("oErr").textContent = "";

  showStep("details");

  $("oName").focus();
};

$("backToCart").onclick = () => {
  showStep("cart");
};

$("placeOrder").onclick = () => {
  const name = $("oName").value.trim();
  const mail = checkEmail($("oEmail").value);

  if (!name) {
    $("oErr").textContent = "Enter your name.";
    return;
  }

  if (!mail.ok) {
    $("oErr").textContent = mail.msg;
    return;
  }

  const order = {
    code: makeCode(),
    name,
    email: mail.email,
    items: cartLines(),
    total: cartTotal(),
    time: new Date().toISOString()
  };

  const orders = loadOrders();

  orders.push(order);
  saveOrders(orders);

  cart = {};

  saveCart();
  renderCart();

  $("oName").value = "";
  $("oEmail").value = "";

  try {
    sessionStorage.setItem(
      "shop-last",
      JSON.stringify(order)
    );
  } catch (e) {}

  showDone(order);
};

$("copyCode").onclick = async () => {
  const code = $("orderCode").textContent;

  try {
    await navigator.clipboard.writeText(code);
    $("copyCode").textContent = "Copied";
  } catch (e) {
    $("copyCode").textContent =
      "Press and hold the code to copy";
  }

  setTimeout(() => {
    $("copyCode").textContent = "Copy code";
  }, 1500);
};

$("newOrder").onclick = () => {
  try {
    sessionStorage.removeItem("shop-last");
  } catch (e) {}

  showStep("cart");
  openCart(false);
};


/* LOGO */

const LOGO_SRC = "𝓐𝓾𝓻𝓪";

(function () {
  const el = $("logo");

  if (!el) return;

  el.textContent = LOGO_SRC;
  el.setAttribute("aria-label", "Aura");
})();


/* MOBILE MENU */

$("menuBtn").onclick = () => {
  const open = $("nav").classList.toggle("open");

  $("menuBtn").setAttribute(
    "aria-expanded",
    String(open)
  );
};

$("nav").addEventListener("click", e => {
  if (e.target.tagName === "A") {
    $("nav").classList.remove("open");

    $("menuBtn").setAttribute(
      "aria-expanded",
      "false"
    );
  }
});


/* START */

renderChips();
renderProducts();
renderCart();