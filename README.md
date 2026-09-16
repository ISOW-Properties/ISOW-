# ISOW Properties website

A lightweight, dependency-free multi-page front-end for ISOW Properties.

## Pages
- `index.html` - premium homepage and brand intro
- `properties.html` - searchable property catalogue
- `property.html?id=P001` - reusable property detail view
- `ai.html` - interactive ISOW AI requirement matcher
- `about.html` - company overview
- `connect.html` - contact and social links

## Contact
Phone: +91 85930 76501
Email: isowproperties@gmail.com
LinkedIn: https://www.linkedin.com/company/isowproperties/
Facebook: https://www.facebook.com/people/Isow-Property/61585073757517/
WhatsApp: https://wa.me/918593076501

## Property data
`data/properties.js` contains the 105 source listings assembled from the uploaded master HTML and the eight Oragadam Corridor PDF listings. The website intentionally uses curated default visuals for listings; source photos, videos and sketches are not displayed on the property cards.

## Run locally
For best results, use a local static server from this folder:

`python -m http.server 8000`

Then open `http://localhost:8000/`.
