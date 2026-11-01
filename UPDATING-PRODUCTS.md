# Updating Products, Prices & Photos

You can run the whole shop yourself by editing one file: **`products.json`**.
No coding knowledge is needed — but always keep a backup copy before editing.

---

## 1. Understand the product file

`products.json` is a list. Each product looks like this:

```json
{
  "id": 12,
  "name": "Elegant Flower Bouquet",
  "description": "Beautiful, long-lasting blooms that brighten any space.",
  "price": "",
  "category": "Gifts for Her",
  "tags": ["Gifts for Her", "Birthday Gifts", "Valentine's Day Gifts"],
  "image": "assets/products/product-012.jpg",
  "thumb": "assets/thumbs/product-012.jpg"
}
```

| Field         | What it does                                                             |
|---------------|--------------------------------------------------------------------------|
| `id`          | A unique number. **Never reuse the same id twice.**                      |
| `name`        | The product name shown on the site.                                      |
| `description` | Short marketing text (1–2 sentences).                                    |
| `price`       | Leave `""` (blank) to show “Enquire”. Or add a price, e.g. `"249.00"`.  |
| `category`    | The product's **main** category (one of the 12 listed below).            |
| `tags`        | Extra categories it also appears under (a list). Optional but useful.    |
| `image`       | Path to the full photo, e.g. `assets/products/product-012.jpg`.          |
| `thumb`       | Path to the small photo, e.g. `assets/thumbs/product-012.jpg`.           |

---

## 2. Add or change a price

Find the product and set the `price` field:

```json
"price": "199.99"
```

The site automatically displays it as **R199.99**, and it is added to the order
total in the WhatsApp message.

To go back to “price on request”, set it to an empty string:

```json
"price": ""
```

---

## 3. Edit a product name or description

Simply retype the text between the quotes. Do **not** remove the quotes or the
comma at the end of the line. Example:

```json
"name": "Personalised Travel Gift Set",
"description": "A smart travel companion, beautifully boxed and ready to give.",
```

---

## 4. Change a product's category

Set `category` to one of these **exact** names:

- `Birthday Gifts`
- `Gifts for Her`
- `Gifts for Him`
- `Gifts for Kids`
- `Baby Gifts`
- `Toys and Playtime`
- `Gift Boxes and Hampers`
- `Personalised Gifts`
- `Special Occasion Gifts`
- `Christmas Gifts`
- `Valentine's Day Gifts`
- `Party Gifts and Accessories`

A product can also appear in extra categories using `tags`, for example:

```json
"category": "Toys and Playtime",
"tags": ["Toys and Playtime", "Gifts for Kids", "Birthday Gifts"]
```

---

## 5. Replace or add a product photo

1. Prepare the photo as a **JPG**. Keep it roughly square and at least 800×800 px.
2. Save two versions into the `assets` folders:
   - Full size (max ~1000 px) → `assets/products/`  (e.g. `product-501.jpg`)
   - Small size (max ~480 px) → `assets/thumbs/`    (e.g. `product-501.jpg`)
   - Tip: any free image tool (e.g. Squoosh, Photoshop, Canva) can resize/save.
3. Add the new product to `products.json` with a new `id`...

```json
{
  "id": 501,
  "name": "Your New Gift",
  "description": "A short, lovely description.",
  "price": "",
  "category": "Birthday Gifts",
  "tags": ["Birthday Gifts"],
  "image": "assets/products/product-501.jpg",
  "thumb": "assets/thumbs/product-501.jpg"
}
```

> Keep the file names identical between the two folders so the grid thumbnail and
> the full photo always match.

---

## 6. Remove a product

Delete the whole `{ ... }` block for that product (including the comma that
separated it from the next product). The photo files can stay — unused images are
harmless — or you can delete them too.

---

## 7. Change the WhatsApp number or address

The number appears in three files. Use your editor's “Find & Replace”:

1. **`index.html`** — replace `27787412314` (in the `wa.me` links) and the visible
   text `078 741 2314`.
2. **`app.js`** — replace `27787412314` at the top (`const WA_NUMBER`).
3. **`index.html`** — search for `255 Nightingale Street` to update the address.

---

## 8. Golden rules for `products.json`

- Every `{` needs a matching `}`.
- Every item is separated by a **comma**, but the **last item has no comma**.
- All text stays inside `"double quotes"`.
- No comments are allowed inside the file.

**Tip:** after editing, open the site and press `F12` → **Console**. If you see a
red error, a comma or quote is out of place. You can validate the file free at
**jsonlint.com** before uploading.

---

## 9. Quick checklist

- [ ] Prices added (or left blank on purpose)
- [ ] Names and descriptions checked
- [ ] Categories look right
- [ ] Photos display correctly
- [ ] Cart tested on a phone
- [ ] A WhatsApp order test sent to yourself
