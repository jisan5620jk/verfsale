document.addEventListener('DOMContentLoaded', function () {
  const areaInput = document.getElementById('system-calculator-area');
  if (!areaInput) return;

  const systemProducts = Array.from(
    document.querySelectorAll('[data-system-product]')
  );

  const summaryPriceEl = document.getElementById('summary-total-price');
  const summaryContainersEl = document.getElementById('summary-total-containers');

  /* ----------------------------------------
     VARIANT HELPERS
  ---------------------------------------- */

  function getVariantsFromElement(li) {
    const scriptEl = li.querySelector('.system-variants-json');
    if (!scriptEl) return [];

    let data;
    try {
      data = JSON.parse(scriptEl.textContent);
    } catch (e) {
      console.warn('Variant JSON parse error', e);
      return [];
    }

    let variants = data.filter(v => Number(v.package_liters) > 0);

    const colorIndex = parseInt(li.dataset.colorIndex || '-1', 10);
    const selectedColor = li.dataset.selectedColor || null;

    if (selectedColor && colorIndex >= 0) {
      variants = variants.filter(v => {
        return Array.isArray(v.options) &&
          v.options[colorIndex] === selectedColor;
      });
    }

    return variants;
  }

  function getPackageBreakdown(requiredLiters, variants) {
    if (!variants.length || requiredLiters <= 0) return [];

    const sorted = variants
      .slice()
      .sort((a, b) => b.package_liters - a.package_liters);

    let remaining = requiredLiters;
    const result = [];

    sorted.forEach((v, index) => {
      const size = Number(v.package_liters);
      if (size <= 0) return;

      let qty =
        index === sorted.length - 1
          ? Math.ceil(remaining / size)
          : Math.floor(remaining / size);

      if (qty > 0) {
        result.push({
          variantId: v.id,
          sizeLiters: size,
          qty,
          unitPrice: Number(v.price || 0)
        });
        remaining -= qty * size;
      }
    });

    return result;
  }


  function resetSelectedSizes() {
    systemProducts.forEach(li => {
      // remove stored selected size
      delete li.dataset.selectedSize;

      // remove active state from buttons
      li.querySelectorAll('.system-size-option').forEach(btn => {
        btn.classList.remove('is-active');
      });
    });
  }


  /* ----------------------------------------
     RECALCULATION
  ---------------------------------------- */

  function recalc() {
  const area = parseFloat(areaInput.value) || 0;
  

  let grandTotalPrice = 0;
  let grandTotalContainers = 0;

  systemProducts.forEach(li => {
    const unit = li.dataset.unit || 'L';
    const coverage = parseFloat(li.dataset.coverage) || 0;
    const requiredLiters = area * coverage;

    const requiredTextEl = li.querySelector('[data-required-text]');
    const packagesEl = li.querySelector('[data-packages]');
    const checkbox = li.querySelector('.system-product__checkbox');

    const variants = getVariantsFromElement(li);
    const selectedSize = parseFloat(li.dataset.selectedSize || '0');

    let breakdown =
      selectedSize > 0
        ? variants
            .filter(v => Number(v.package_liters) === selectedSize)
            .slice(0, 1)
            .map(v => ({
              variantId: v.id,
              sizeLiters: selectedSize,
              qty: Math.ceil(requiredLiters / selectedSize),
              unitPrice: Number(v.price || 0)
            }))
        : getPackageBreakdown(requiredLiters, variants);

    if (!breakdown.length || requiredLiters <= 0) {
      if (requiredTextEl) requiredTextEl.innerHTML = '';
      if (packagesEl) packagesEl.innerHTML = '';
      li.dataset.cartItems = '[]';
      return;
    }

    const totalPrice = breakdown.reduce(
      (s, b) => s + b.qty * b.unitPrice,
      0
    );

    const totalContainers = breakdown.reduce((s, b) => s + b.qty, 0);

    /* ✅ ALWAYS SHOW PRODUCT DETAILS */
    if (requiredTextEl) {
    const availablePackaging = [
      ...new Set(breakdown.map(b => b.sizeLiters))
    ].join(` ${unit}, `);

    requiredTextEl.innerHTML = `
      <table class="system-mini-table">
        <tr>
          <th>Benodigde hoeveelheid</th>
          <td>${requiredLiters.toFixed(2)} ${unit}</td>
        </tr>
        <tr>
          <th>Beschikbare verpakking</th>
          <td>${availablePackaging} ${unit}</td>
        </tr>
        <tr>
          <th>Afgerond naar</th>
          <td>
            ${breakdown
              .map(b => `${b.qty} × ${b.sizeLiters} ${unit}`)
              .join('<br>')}
          </td>
        </tr>
      </table>
    `;
  }



    if (packagesEl) {
      packagesEl.innerHTML = `
        <strong>Totaalprijs:</strong>
        € ${totalPrice.toFixed(2).replace('.', ',')}
      `;
    }

    /* ✅ ONLY COUNT IF CHECKED */
    if (checkbox && checkbox.checked) {
      grandTotalPrice += totalPrice;
      grandTotalContainers += totalContainers;

      li.dataset.cartItems = JSON.stringify(
        breakdown.map(b => ({ id: b.variantId, quantity: b.qty }))
      );
    } else {
      li.dataset.cartItems = '[]';
    }
  });

  /* ✅ BOTTOM SUMMARY */
  if (summaryPriceEl) {
    summaryPriceEl.textContent =
      '€ ' + grandTotalPrice.toFixed(2).replace('.', ',');
  }

  if (summaryContainersEl) {
    summaryContainersEl.textContent = grandTotalContainers;
  }

  /* ✅ INLINE SUMMARY (ABOVE ADD TO CART) */
  const inlinePriceEl = document.getElementById('summary-total-price-inline');
  const inlineContainersEl =
    document.getElementById('summary-total-containers-inline');

  if (inlinePriceEl) {
    inlinePriceEl.textContent =
      '€ ' + grandTotalPrice.toFixed(2).replace('.', ',');
  }

  if (inlineContainersEl) {
    inlineContainersEl.textContent = grandTotalContainers;
  }
}


  /* ----------------------------------------
     EVENTS
  ---------------------------------------- */

  areaInput.addEventListener('input', () => {
    resetSelectedSizes();
    recalc();
  });

  areaInput.addEventListener('change', () => {
    resetSelectedSizes();
    recalc();
  });


  systemProducts.forEach(li => {
    li.querySelectorAll('.system-size-option').forEach(btn => {
      btn.addEventListener('click', () => {
        li.dataset.selectedSize = btn.dataset.size;
        li.querySelectorAll('.system-size-option').forEach(b =>
          b.classList.toggle('is-active', b === btn)
        );
        recalc();
      });
    });

    const checkbox = li.querySelector('.system-product__checkbox');
    if (checkbox) checkbox.addEventListener('change', recalc);

    const colorSelect = li.querySelector('[data-color-select]');
    if (colorSelect) {
      li.dataset.selectedColor = colorSelect.value;
      colorSelect.addEventListener('change', () => {
        li.dataset.selectedColor = colorSelect.value;
        recalc();
      });
    }
  });

  recalc();

  /* ----------------------------------------
     ADD TO CART (FAST + SHARED)
  ---------------------------------------- */

  function handleAddToCart() {
  const items = [];

  systemProducts.forEach(li => {
    const checkbox = li.querySelector('.system-product__checkbox');
    if (checkbox && !checkbox.checked) return;
    if (!li.dataset.cartItems) return;

    try {
      JSON.parse(li.dataset.cartItems).forEach(ci => {
        if (ci.quantity > 0) {
          items.push({
            id: ci.id,
            quantity: ci.quantity
          });
        }
      });
    } catch (e) {}
  });

  if (!items.length) return;

  // Disable buttons instantly (UX)
  document
    .querySelectorAll('#system-calculator-add, .system-calculator-add-trigger')
    .forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Toevoegen…';
    });

  const controller = new AbortController();

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    signal: controller.signal
  })
    .then(res => {
      if (!res.ok) throw new Error('Cart add failed');
      // ✅ redirect immediately after ACK
      window.location.href = '/cart';
    })
    .catch(() => {
      // Re-enable buttons on failure
      document
        .querySelectorAll('#system-calculator-add, .system-calculator-add-trigger')
        .forEach(btn => {
          btn.disabled = false;
          btn.textContent = 'Alles toevoegen aan winkelwagen';
        });
    });

  // ⏱ Safety net — if Shopify hangs, still redirect after 1.2s
  setTimeout(() => {
    controller.abort();
    window.location.href = '/cart';
  }, 1200);
}


  document
    .querySelectorAll(
      '#system-calculator-add, .system-calculator-add-trigger'
    )
    .forEach(btn => btn.addEventListener('click', handleAddToCart));
});
