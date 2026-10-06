# Verfsale Shopify Theme

Custom Shopify theme for the Verfsale store, built on **Shopify Dawn 15.3.0**. On top of Dawn's stock sections it adds store-specific sections, snippets and templates (mostly Dutch-language pages for advice, colours and step-by-step guides).

## Project structure

```
assets/      CSS, JS, images and icons
config/      Theme settings schema and saved settings (settings_data.json)
layout/      theme.liquid and password.liquid
locales/     Translation files (storefront + editor schema)
sections/    Theme sections (Dawn + custom)
snippets/    Reusable Liquid partials
templates/   JSON/Liquid templates, including customers/ templates
```

## Custom additions

Everything below was added on top of Dawn.

**Sections**
- `akta-calculated-product`, `akta-upsell`, `akta-accordion`: product calculation, upsell and accordion blocks
- `advice-tiles`, `advice_collection`, `collection-faq`, `page-faq`: advice and FAQ content
- `color-grid`, `kleurkeuzehulp`, `main-article-kleuren`: colour overview and colour-picker help
- `stappenplan-column`, `stappenplan-slideshow`, `steppenplan-tips-richtext`, `main-article-stappenplan`, `video-steps-guide`: step-by-step guides
- `custom-waterproof-feature`, `trust-badges`, `testimonials`, `technical-support-banner`, `sale-banner`, `countdown-banner`, `promo-category-grid`, `home-logo-list`, `klantenservice-multicolumn`, `contact-info-block`, `product-tabs`, `product-video`, `multiple-videos`, `related-products-static`, `two-text-blocks`, `breadcrumbs-section`, `custom-announcement`, `custom-collection`

**Snippets**
- `collection-system-calculator` (with `assets/system-calculator.js`): material calculator on collection pages
- `mfq-color-selector-popup*`: colour selector popup
- `volume-discount`, `extra-product`, `prod-complementary`, `card-product-2`
- `rapid-search-*`: Rapid Search app integration (used by `templates/page.rapid-search-results-page.liquid`)
- `ultimate-datalayer`, `storefront-tracking`: analytics / data layer
- `breadcrumbs`, `breadcrumbs-share`, `sidebar-klantenservice`, `blog-search`

**Templates**
Alternate templates for specific pages (`page.advies`, `page.kleuren`, `page.stappenplan`, `page.faq`, `page.contact`, …), collections (`collection.buitenafdichting`, `collection.capillair-actieve-binnenisolatie`, …) and articles/blogs (`article.kleuren`, `article.stappenplan`, `blog.kleuren`).

## Development

Requires [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).

```bash
# Log in and preview the theme locally against the store
shopify theme dev --store <your-store>.myshopify.com

# Pull the latest theme (including settings changed in the admin)
shopify theme pull --store <your-store>.myshopify.com

# Push changes to a theme
shopify theme push --store <your-store>.myshopify.com

# Lint Liquid and theme files
shopify theme check
```

## Notes

- `config/settings_data.json` and the JSON templates are rewritten by the Shopify theme editor. Pull before editing them locally so you don't overwrite changes made in the admin.
- Default storefront language is set by `locales/en.default.json`; translations live alongside it in `locales/`.
- Prefer adding new custom sections and snippets over editing core Dawn files. That keeps future Dawn upgrades easier to merge.
