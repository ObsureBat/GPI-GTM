import csv

header = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
    'Option1 Name', 'Option1 Value', 'Option1 Linked To', 'Option2 Name', 'Option2 Value',
    'Option2 Linked To', 'Option3 Name', 'Option3 Value', 'Option3 Linked To', 'Variant SKU',
    'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
    'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
    'Variant Requires Shipping', 'Variant Taxable', 'Unit Price Total Measure',
    'Unit Price Total Measure Unit', 'Unit Price Base Measure', 'Unit Price Base Measure Unit',
    'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
    'SEO Title', 'SEO Description', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code',
    'Cost per item', 'Status', 'Sort Order',
]

products = [
    ('gtm-himalayan-rock-salt-1kg', 'GTM Rock Salt 1kg', 'GTM', 'Salt', 99, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Himalayan Rock Salt 1Kg.png', 1),
    ('gtm-himalayan-rock-salt-200g', 'GTM Rock Salt 200gm', 'GTM', 'Salt', 21, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Himalayan Rock Salt 200g.png', 2),
    ('gtm-himalayan-pink-salt-1kg', 'GTM Rock Salt Powder 1kg', 'GTM', 'Salt', 99, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Himalayan Pink Salt 1Kg.png', 3),
    ('gtm-himalayan-pink-salt-200g', 'GTM Rock Salt Powder 200gm', 'GTM', 'Salt', 21, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Himalayan Pink Salt 200g.png', 4),
    ('gtm-black-salt-200g', 'GTM Black Salt 200gm', 'GTM', 'Salt', 24, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Black Salt 200g.png', 5),
    ('gpi-himalayan-pink-salt-1kg', 'GPI PINK Salt 1kg', 'GPI', 'Salt', 112, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Himalayan Pink Salt 1Kg.png', 6),
    ('gpi-himalayan-pink-salt', 'GPI PINK Salt Lumps 1kg', 'GPI', 'Salt', 99, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Himalayan Pink Salt.png', 7),
    ('gpi-black-salt-500g', 'GPI Black Salt 500gm', 'GPI', 'Salt', 54, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GTM Black Salt 500g.png', 8),
    ('gpi-pink-crushed-salt-1kg', 'GPI Pink Crushed 1kg', 'GPI', 'Salt', 120, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Pink Crushed Salt 1Kg.png', 9),
    ('gpi-puiro-1kg', 'GPI Puiro 1kg', 'GPI', 'Salt', 120, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Puiro 1Kg.png', 10),
    ('gpi-black-salt-1kg', 'GPI Black Salt 1kg', 'GPI', 'Salt', 120, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Black Salt 1Kg.png', 11),
    ('gpi-iodine-salt-1kg', 'GPI Iodine Salt 1kg', 'GPI', 'Salt', 30, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Iodine Salt 1Kg.png', 12),
    ('gpi-garam-masala-100g', 'GPI Garam Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Garam Masala 100g.png', 13),
    ('gpi-ktchen-king-100g', 'GPI Kitchen King Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Ktchen King 100g.png', 14),
    ('gpi-chana-masala-100g', 'GPI Chana Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Chana Masala 100g.png', 15),
    ('gpi-paneer-masala-100g', 'GPI Paneer Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Paneer Masala 100g.png', 16),
    ('gpi-dal-makhani-100g', 'GPI Dal Makhani Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Dal Makhani 100g.png', 17),
    ('gpi-soya-chaap-masala-100g', 'GPI Soya Chaap Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Soya Chaap Masala 100g.png', 18),
    ('gpi-sambhar-masala-100g', 'GPI Sambhar Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Sambhar Masala 100g.png', 19),
    ('gpi-pav-bhaji-100g', 'GPI Pav Bhaji Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Pav Bhaji 100g.png', 20),
    ('gpi-raita-masala-100g', 'GPI Raita Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Raita Masala 100g.png', 21),
    ('gpi-chaat-masala-100g', 'GPI Chaat Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Chaat Masala 100g.png', 22),
    ('gpi-chicken-masala-100g', 'GPI Chicken Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Chicken Masala 100g.png', 23),
    ('gpi-egg-curry-100g', 'GPI Egg Curry Masala 100gm', 'GPI', 'Masala', 139, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Egg Curry 100g.png', 24),
    ('gpi-premium-detergent-powder', 'GPI Detergent Premium 1kg', 'GPI', 'Detergent', 99, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Premium Detergent Powder.png', 25),
    ('gpi-super-detergent-powder', 'GPI Detergent Super 1kg', 'GPI', 'Detergent', 125, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Super Detergent Powder.png', 26),
    ('gpi-gold-detergent-powder', 'GPI Detergent Gold 1kg', 'GPI', 'Detergent', 155, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Gold Detergent Powder.png', 27),
    ('gpi-premium-detergent-500g', 'GPI Detergent Premium 500gm', 'GPI', 'Detergent', 52, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Premium Detergent Powder.png', 28),
    ('gpi-super-detergent-500g', 'GPI Detergent Super 500gm', 'GPI', 'Detergent', 65, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Super Detergent Powder.png', 29),
    ('gpi-gold-detergent-500g', 'GPI Detergent Gold 500gm', 'GPI', 'Detergent', 80, 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev/products/GPI Gold Detergent Powder.png', 30),
]

rows = []
for handle, title, vendor, tag, price, image, sort in products:
    body = f'<p>{title} from {vendor}.</p>'
    row = {h: '' for h in header}
    row.update({
        'Handle': handle,
        'Title': title,
        'Body (HTML)': body,
        'Vendor': vendor,
        'Tags': tag,
        'Published': 'true',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '100',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': f'{price:.2f}',
        'Variant Requires Shipping': 'true',
        'Variant Taxable': 'true',
        'Image Src': image,
        'Image Position': '1',
        'Variant Weight Unit': 'kg',
        'Cost per item': f'{price:.2f}',
        'Status': 'active',
        'Sort Order': str(sort),
    })
    rows.append(row)

paths = [
    r'd:\GPI-GTM\server\data\products_export_1.csv',
    r'd:\GPI-GTM\public\data\products_export_1.csv',
    r'd:\GPI-GTM\products_export_1.csv',
]
for path in paths:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=header)
        w.writeheader()
        w.writerows(rows)
print(f'Wrote {len(rows)} products')
