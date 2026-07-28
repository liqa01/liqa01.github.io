# IAID static conversion content audit

The static pages were generated directly from the original WordPress theme archive. Source content blocks were compared against the output after replacing only WordPress-generated internal URLs and template calls.

| Page | Source | Static file | Major sections | Links | Media items | Exact source content block |
|---|---|---:|---:|---:|---:|---|
| . | required static technical page (no dedicated source 404 template) | `404.html` | 1 | 22 | 0 | Not applicable (technical 404) |
| about-iaid | template-about.php + iaid_about_content() | `about-iaid/index.html` | 2 | 22 | 0 | Yes |
| advocacy-achievements | template-advocacy.php + iaid_advocacy_content() | `advocacy-achievements/index.html` | 2 | 22 | 0 | Yes |
| committees | template-committees.php + iaid_committees_content() | `committees/index.html` | 2 | 22 | 0 | Yes |
| contact | template-contact.php + iaid_contact_content() | `contact/index.html` | 2 | 23 | 0 | Yes |
| Home | front-page.php + iaid_home_content() | `index.html` | 9 | 29 | 0 | Yes |
| media-coverage | template-media.php + iaid_media_intro_content() + iaid_media_categories() + iaid_media_articles() + iaid_media_library_markup() | `media-coverage/index.html` | 2 | 40 | 18 | Yes |
| membership-register-interest | template-register-interest.php + iaid_register_interest_content() | `membership-register-interest/index.html` | 2 | 23 | 0 | Yes |
| our-story | template-story.php + iaid_story_content() | `our-story/index.html` | 2 | 22 | 0 | Yes |
| resources | template-resources.php + iaid_resources_content() | `resources/index.html` | 8 | 41 | 0 | Yes |

## Preservation results

- Required HTML pages: 10 of 10 present.
- Media references: 18 of 18 preserved in source order.
- Media filter categories: 7 of 7 preserved in source order.
- Resource cards: 23 of 23 preserved in source order.
- Public and mailto links: 38 unique source destinations preserved; no destination added, removed, or substituted.
- Header navigation: original wording, target behaviour, and order preserved on every page.
- Footer content and quick-link order: preserved on every page.
- Visible source copy: preserved except for the user-directed correction of `info@iaid.ie` to `trainus.forireland@gmail.com`; no other source wording was added, removed, paraphrased, corrected, or reordered.
- Section and card order: exact source content blocks were retained, so source order was not altered.
- IAID logo: binary-identical copy of the source asset.
- JavaScript: output begins with a binary-identical copy of the source asset; the premium interaction layer is appended as progressive enhancement.
- CSS: output begins with a binary-identical copy of `assets/css/main.css`; the original smooth-scrolling rule from `style.css` and the premium motion layer are appended.
- Original theme: extracted files are byte-for-byte identical to all 20 archived files (confirmed).
- Original archive SHA-256: `0b5d50043ec64228cf7b02283c461b9200d41c44bad240f26cb8c17ef415fec1`.
- WordPress/PHP removal: no PHP files, PHP tags, or WordPress function calls remain in the static HTML output.

## Unavoidable technical differences

- WordPress template calls and generated URLs were replaced with duplicated static header/footer HTML and relative static paths.
- WordPress active-menu state was reproduced with `current-menu-item` and `aria-current` in each static file.
- The current copyright year is written as 2026, which the brief explicitly permits.
- The required `404.html` contains only the shared source header/footer plus the minimal visible values `IAID` and `404`, because the source theme has no dedicated 404 template.

## Validation status

Automated conversion validation: PASS.

Live HTTP and asset-delivery checks are recorded in the final completion report after local-server testing.
