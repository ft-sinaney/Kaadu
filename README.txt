KAADU — adding photos
=====================

Every plant and butterfly has its own empty folder:

    images/plants/<plant-name>/
    images/butterflies/<butterfly-name>/

Put up to three photos in a folder, named exactly:

    main        the big photo on the species page, also used on its card
    gallery-1   the first small photo beside it
    gallery-2   the second small photo

The ending can be .jpg, .jpeg, .png or .webp  (e.g. main.jpg, gallery-1.png).
Names are lower case with no spaces. Any photo you leave out keeps its
drawing, so you can add photos a few at a time.

photo-checklist.csv lists every folder with the plant's local and
scientific name, so you know which folder is which. It opens in Excel,
with columns to tick off each photo.

Tips
----
- Landscape (wide) photos work best. They are cropped to fill a 4:3 box,
  and square on phone cards, so keep the plant in the middle.
- Resize before adding: about 1600 px wide for main and 1200 px for
  gallery photos, under 500 KB each. Big phone photos (4-8 MB) will
  make the site slow.
- Don't rename or move the folders — the site finds photos by folder name.

Viewing and publishing
----------------------
- To check it on your computer, open index.html in a browser.
- To publish, drag the whole kaadu folder onto app.netlify.com/drop, or
  onto your existing site's Deploys page to replace the current version.

What's in here
--------------
    index.html            the page and its styling
    js/app.js             everything interactive
    js/data.js            the plant and butterfly text
    js/jsqr.js            the QR-scanner library
    frames/               the 200 tree-growth animation frames
    images/bg-*.jpg       the leaf backgrounds (laptop and phone)
    images/plants/        69 photo folders
    images/butterflies/   3 photo folders
