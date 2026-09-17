#!/usr/bin/env python3
"""Generate js/registry.js with a structured catalog of tools."""
import json
from pathlib import Path

def T(id, name, cat, desc, kind, icon, popular=False, newest=False, premium=False, keywords=""):
    return {
        "id": id,
        "name": name,
        "category": cat,
        "description": desc,
        "kind": kind,
        "icon": icon,
        "popular": popular,
        "newest": newest,
        "premium": premium,
        "keywords": keywords,
    }

tools = []

# IMAGE
img = [
    T("image-compressor","Image Compressor","Image Tools","Compress images in your browser without uploading to a server.","image-compress","fa-solid fa-compress",True,False,False,"compress optimize jpg png webp size"),
    T("image-resizer","Image Resizer","Image Tools","Resize images to exact pixel dimensions.","image-resize","fa-solid fa-up-right-and-down-left-from-center",True,False,False,"resize scale width height"),
    T("image-cropper","Image Cropper","Image Tools","Crop an image to a custom area.","image-crop","fa-solid fa-crop",False,False,False,"crop cut"),
    T("image-rotator","Image Rotator","Image Tools","Rotate an image 90, 180, or 270 degrees.","image-rotate","fa-solid fa-rotate",False,False,False,"rotate turn"),
    T("image-flipper","Image Flipper","Image Tools","Flip an image horizontally or vertically.","image-flip","fa-solid fa-left-right",False,False,False,"flip mirror"),
    T("image-converter","Image Converter","Image Tools","Convert images between JPG, PNG, and WEBP.","image-convert","fa-solid fa-exchange-alt",True,False,False,"convert format jpg png webp"),
    T("jpg-to-png","JPG to PNG","Image Tools","Convert JPG images to PNG.","image-convert","fa-solid fa-file-image",False,False,False,"jpg jpeg png"),
    T("png-to-jpg","PNG to JPG","Image Tools","Convert PNG images to JPG.","image-convert","fa-solid fa-file-image",False,False,False,"png jpg"),
    T("jpg-to-webp","JPG to WEBP","Image Tools","Convert JPG images to WEBP.","image-convert","fa-solid fa-file-image",False,False,False,"jpg webp"),
    T("png-to-webp","PNG to WEBP","Image Tools","Convert PNG images to WEBP.","image-convert","fa-solid fa-file-image",False,False,False,"png webp"),
    T("webp-to-jpg","WEBP to JPG","Image Tools","Convert WEBP images to JPG.","image-convert","fa-solid fa-file-image",False,False,False,"webp jpg"),
    T("webp-to-png","WEBP to PNG","Image Tools","Convert WEBP images to PNG.","image-convert","fa-solid fa-file-image",False,False,False,"webp png"),
    T("image-to-base64","Image to Base64","Image Tools","Encode an image as a Base64 data URL.","image-base64","fa-solid fa-code",False,False,False,"base64 encode"),
    T("base64-to-image","Base64 to Image","Image Tools","Decode a Base64 string into an image file.","base64-image","fa-solid fa-image",False,False,False,"base64 decode"),
    T("image-blur","Image Blur","Image Tools","Apply blur to an image.","image-filter","fa-solid fa-droplet",False,False,False,"blur filter"),
    T("image-grayscale","Image Grayscale","Image Tools","Convert an image to grayscale.","image-filter","fa-solid fa-circle-half-stroke",False,False,False,"gray black white"),
    T("image-brightness","Image Brightness","Image Tools","Adjust image brightness.","image-filter","fa-solid fa-sun",False,False,False,"bright dark"),
    T("image-contrast","Image Contrast","Image Tools","Adjust image contrast.","image-filter","fa-solid fa-circle-adjust",False,False,False,"contrast"),
    T("image-saturation","Image Saturation","Image Tools","Adjust image saturation.","image-filter","fa-solid fa-palette",False,False,False,"saturate color"),
    T("image-sepia","Image Sepia","Image Tools","Apply a sepia tone to an image.","image-filter","fa-solid fa-camera-retro",False,False,False,"sepia vintage"),
    T("image-invert","Image Invert","Image Tools","Invert image colors.","image-filter","fa-solid fa-circle-half-stroke",False,False,False,"invert negative"),
    T("image-watermark","Image Watermark","Image Tools","Add a text watermark to an image.","image-watermark","fa-solid fa-stamp",False,False,False,"watermark text"),
    T("image-text-overlay","Image Text Overlay","Image Tools","Overlay custom text on an image.","image-watermark","fa-solid fa-font",False,False,False,"text overlay caption"),
    T("image-dimension-checker","Image Dimension Checker","Image Tools","Check width, height, and aspect ratio.","image-info","fa-solid fa-ruler-combined",False,False,False,"size dimension width height"),
    T("image-file-size-checker","Image File Size Checker","Image Tools","Check image file size and type.","image-info","fa-solid fa-weight-scale",False,False,False,"filesize kb mb"),
    T("image-color-picker","Image Color Picker","Image Tools","Pick a color from an uploaded image.","image-picker","fa-solid fa-eye-dropper",False,False,False,"color pick hex"),
    T("image-border","Image Border Generator","Image Tools","Add a colored border around an image.","image-border","fa-solid fa-border-all",False,False,False,"border frame"),
    T("image-bg-color","Image Background Color","Image Tools","Place an image on a solid background color.","image-bg","fa-solid fa-fill-drip",False,False,False,"background color"),
    T("favicon-generator","Favicon Generator","Image Tools","Create a 32x32 and 16x16 favicon from an image.","image-favicon","fa-solid fa-star",False,True,False,"favicon ico"),
    T("image-aspect-ratio","Image Aspect Ratio Calculator","Image Tools","Calculate target size from an aspect ratio.","calc-aspect","fa-solid fa-crop-simple",False,False,False,"aspect ratio 16:9"),
    T("image-pixelate","Image Pixelate","Image Tools","Pixelate an image for a mosaic look.","image-pixelate","fa-solid fa-table-cells",False,False,False,"pixel mosaic"),
    T("image-rounded","Image Rounded Corners","Image Tools","Apply rounded corners to an image.","image-round","fa-solid fa-square",False,False,False,"round corner"),
    T("image-opacity","Image Opacity","Image Tools","Change image opacity.","image-filter","fa-solid fa-droplet",False,False,False,"opacity transparent"),
    T("screenshot-cropper","Screenshot Cropper","Image Tools","Crop screenshots quickly.","image-crop","fa-solid fa-scissors",False,False,False,"screenshot crop"),
]
tools += img

# PDF
pdf = [
    T("pdf-merge","PDF Merger","PDF Tools","Merge multiple PDF files into one.","pdf-merge","fa-solid fa-object-group",True,False,False,"merge combine pdf"),
    T("pdf-split","PDF Split","PDF Tools","Split a PDF into individual pages.","pdf-split","fa-solid fa-scissors",False,False,False,"split pages"),
    T("pdf-rotate","PDF Rotate","PDF Tools","Rotate all pages in a PDF.","pdf-rotate","fa-solid fa-rotate",False,False,False,"rotate pdf"),
    T("images-to-pdf","Images to PDF","PDF Tools","Combine images into a single PDF.","images-pdf","fa-solid fa-file-pdf",True,False,False,"image pdf jpg png"),
    T("pdf-info","PDF Information","PDF Tools","View page count and PDF metadata.","pdf-info","fa-solid fa-circle-info",False,False,False,"info metadata pages"),
    T("text-to-pdf","Text to PDF","PDF Tools","Convert plain text into a downloadable PDF.","text-pdf","fa-solid fa-file-lines",False,False,False,"text pdf"),
    T("pdf-page-extract","PDF Extract Pages","PDF Tools","Extract a page range into a new PDF.","pdf-extract","fa-solid fa-file-export",False,False,False,"extract pages"),
    T("pdf-size-checker","PDF Size Checker","PDF Tools","Check PDF file size and page count.","pdf-info","fa-solid fa-weight-hanging",False,False,False,"size pdf"),
]
tools += pdf

# VIDEO / AUDIO (honest client capabilities)
vid = [
    T("video-info","Video Information","Video Tools","Read duration, size, and type of a video file in the browser.","media-info","fa-solid fa-circle-info",False,False,False,"video info metadata"),
    T("video-thumbnail","Video Thumbnail Generator","Video Tools","Capture a thumbnail frame from a local video.","video-thumb","fa-solid fa-image",False,True,False,"thumbnail frame capture"),
    T("video-aspect-ratio","Video Aspect Ratio Calculator","Video Tools","Calculate video frame size from an aspect ratio.","calc-aspect","fa-solid fa-film",False,False,False,"16:9 9:16"),
    T("gif-info","GIF Information","Video Tools","Inspect GIF file size and type.","file-info","fa-solid fa-gift",False,False,False,"gif info"),
    T("audio-info","Audio File Information","Audio Tools","Read audio file size, type, and duration.","media-info","fa-solid fa-music",False,False,False,"audio info"),
    T("audio-volume-preview","Audio Volume Preview","Audio Tools","Preview a local audio file and adjust playback volume.","audio-preview","fa-solid fa-volume-high",False,False,False,"volume preview"),
]
tools += vid

# TEXT
text_tools = [
    ("word-counter","Word Counter","Count words, characters, sentences, and paragraphs.","text-stats","fa-solid fa-calculator",True,"word count character"),
    ("character-counter","Character Counter","Count characters with and without spaces.","text-stats","fa-solid fa-font",False,"character length"),
    ("sentence-counter","Sentence Counter","Count sentences in text.","text-stats","fa-solid fa-align-left",False,"sentence"),
    ("paragraph-counter","Paragraph Counter","Count paragraphs in text.","text-stats","fa-solid fa-paragraph",False,"paragraph"),
    ("text-cleaner","Text Cleaner","Normalize whitespace and clean extra spaces.","text-clean","fa-solid fa-broom",False,"clean space"),
    ("remove-duplicate-lines","Remove Duplicate Lines","Remove repeated lines from a list.","text-unique","fa-solid fa-clone",False,"duplicate unique"),
    ("sort-lines","Sort Lines","Sort lines alphabetically A-Z or Z-A.","text-sort","fa-solid fa-arrow-down-a-z",False,"sort alphabet"),
    ("reverse-text","Reverse Text","Reverse characters in text.","text-reverse","fa-solid fa-left-right",False,"reverse"),
    ("uppercase-converter","Uppercase Converter","Convert text to UPPERCASE.","text-case","fa-solid fa-a",False,"upper caps"),
    ("lowercase-converter","Lowercase Converter","Convert text to lowercase.","text-case","fa-solid fa-a",False,"lower"),
    ("title-case","Title Case","Convert text to Title Case.","text-case","fa-solid fa-heading",False,"title case"),
    ("sentence-case","Sentence Case","Convert text to Sentence case.","text-case","fa-solid fa-align-left",False,"sentence case"),
    ("remove-spaces","Remove Spaces","Remove all spaces from text.","text-nospaces","fa-solid fa-minus",False,"space remove"),
    ("remove-empty-lines","Remove Empty Lines","Delete blank lines from text.","text-noempty","fa-solid fa-grip-lines",False,"empty lines"),
    ("text-diff","Text Compare","Compare two texts side by side.","text-diff","fa-solid fa-code-compare",False,"diff compare"),
    ("text-to-slug","Text to Slug","Create a URL slug from text.","text-slug","fa-solid fa-link",False,"slug url"),
    ("lorem-ipsum","Lorem Ipsum Generator","Generate placeholder paragraphs.","lorem","fa-solid fa-align-justify",True,"lorem ipsum dummy"),
    ("random-text","Random Text Generator","Generate random words.","rand-text","fa-solid fa-shuffle",False,"random words"),
    ("morse-encoder","Morse Code Encoder","Encode text to Morse code.","morse-enc","fa-solid fa-ellipsis",False,"morse"),
    ("morse-decoder","Morse Code Decoder","Decode Morse code to text.","morse-dec","fa-solid fa-ellipsis",False,"morse decode"),
    ("text-to-binary","Text to Binary","Convert text to binary.","bin-enc","fa-solid fa-1",False,"binary"),
    ("binary-to-text","Binary to Text","Convert binary to text.","bin-dec","fa-solid fa-0",False,"binary decode"),
    ("rot13","ROT13","Encode or decode text with ROT13.","rot13","fa-solid fa-rotate",False,"rot13 cipher"),
    ("url-encoder","URL Encoder","Percent-encode a URL or string.","url-enc","fa-solid fa-percent",False,"encode url"),
    ("url-decoder","URL Decoder","Decode a percent-encoded string.","url-dec","fa-solid fa-percent",False,"decode url"),
    ("html-entity-encoder","HTML Entity Encoder","Encode special characters as HTML entities.","html-enc","fa-solid fa-code",False,"html entity"),
    ("html-entity-decoder","HTML Entity Decoder","Decode HTML entities to text.","html-dec","fa-solid fa-code",False,"html entity"),
    ("line-counter","Line Counter","Count the number of lines.","text-stats","fa-solid fa-list-ol",False,"lines"),
    ("repeat-text","Repeat Text","Repeat a string N times.","text-repeat","fa-solid fa-copy",False,"repeat"),
    ("extract-emails","Email Extractor","Extract email addresses from text.","extract-email","fa-solid fa-envelope",False,"email extract"),
    ("extract-urls","URL Extractor","Extract URLs from text.","extract-url","fa-solid fa-link",False,"url extract"),
    ("word-frequency","Word Frequency","Count how often each word appears.","word-freq","fa-solid fa-chart-simple",False,"frequency"),
    ("add-line-numbers","Add Line Numbers","Prefix each line with a number.","line-num","fa-solid fa-list-ol",False,"line number"),
    ("trim-lines","Trim Lines","Trim spaces on every line.","trim-lines","fa-solid fa-scissors",False,"trim"),
    ("camel-case","Camel Case Converter","Convert text to camelCase.","text-case","fa-solid fa-i-cursor",False,"camelCase"),
    ("snake-case","Snake Case Converter","Convert text to snake_case.","text-case","fa-solid fa-i-cursor",False,"snake_case"),
    ("kebab-case","Kebab Case Converter","Convert text to kebab-case.","text-case","fa-solid fa-i-cursor",False,"kebab-case"),
]
for i, t in enumerate(text_tools):
    tools.append(T(t[0], t[1], "Text Tools", t[2], t[3], t[4], t[5] if len(t)>5 and t[5] is True else False, False, False, t[6] if len(t)>6 else ""))

# DEVELOPER
dev = [
    ("json-formatter","JSON Formatter","Format and pretty-print JSON.","json-pretty","fa-solid fa-brackets-curly",True,"json format pretty"),
    ("json-validator","JSON Validator","Validate JSON and show errors.","json-pretty","fa-solid fa-check",False,"json validate"),
    ("json-minifier","JSON Minifier","Minify JSON to one line.","json-min","fa-solid fa-minimize",False,"json minify"),
    ("xml-formatter","XML Formatter","Pretty-print XML.","xml-pretty","fa-solid fa-code",False,"xml format"),
    ("html-formatter","HTML Formatter","Indent HTML markup.","html-pretty","fa-solid fa-code",False,"html format"),
    ("html-minifier","HTML Minifier","Minify HTML by removing extra space.","html-min","fa-solid fa-minimize",False,"html minify"),
    ("css-formatter","CSS Formatter","Pretty-print CSS rules.","css-pretty","fa-solid fa-css3-alt",False,"css format"),
    ("css-minifier","CSS Minifier","Minify CSS.","css-min","fa-solid fa-minimize",False,"css minify"),
    ("js-minifier","JavaScript Minifier","Minify JavaScript by collapsing whitespace.","js-min","fa-brands fa-js",False,"js minify"),
    ("markdown-preview","Markdown Previewer","Preview Markdown as HTML.","md-preview","fa-brands fa-markdown",True,"markdown preview"),
    ("regex-tester","Regex Tester","Test a regular expression against text.","regex","fa-solid fa-magnifying-glass",True,"regex test"),
    ("base64-encoder","Base64 Encoder","Encode text to Base64.","b64-enc","fa-solid fa-lock",False,"base64"),
    ("base64-decoder","Base64 Decoder","Decode Base64 to text.","b64-dec","fa-solid fa-unlock",False,"base64"),
    ("jwt-decoder","JWT Decoder","Decode a JWT header and payload (no verify).","jwt-dec","fa-solid fa-key",False,"jwt token decode"),
    ("uuid-generator","UUID Generator","Generate UUID v4 values.","uuid","fa-solid fa-fingerprint",True,"uuid guid"),
    ("uuid-validator","UUID Validator","Check if a string is a valid UUID.","uuid-val","fa-solid fa-check-double",False,"uuid valid"),
    ("unix-timestamp","Unix Timestamp Converter","Convert Unix time to date and back.","unix","fa-solid fa-clock",False,"unix epoch timestamp"),
    ("hex-to-rgb","HEX to RGB","Convert HEX color to RGB.","color-conv","fa-solid fa-droplet",False,"hex rgb"),
    ("rgb-to-hex","RGB to HEX","Convert RGB color to HEX.","color-conv","fa-solid fa-droplet",False,"rgb hex"),
    ("css-gradient-generator","CSS Gradient Generator","Build a CSS linear gradient.","css-grad","fa-solid fa-fill-drip",False,"gradient css"),
    ("css-box-shadow","CSS Box Shadow Generator","Generate box-shadow CSS.","css-shadow","fa-solid fa-square",False,"shadow"),
    ("css-border-radius","CSS Border Radius Generator","Generate border-radius CSS.","css-radius","fa-solid fa-square",False,"radius"),
    ("url-parser","URL Parser","Parse protocol, host, path, and query.","url-parse","fa-solid fa-link",False,"url parse"),
    ("user-agent-parser","User Agent Parser","Parse the current browser user agent.","ua-parse","fa-solid fa-globe",False,"useragent"),
    ("http-status","HTTP Status Code Checker","Look up HTTP status code meaning.","http-status","fa-solid fa-server",False,"http status"),
    ("cron-parser","Cron Expression Parser","Explain a 5-field cron expression.","cron","fa-solid fa-clock",False,"cron"),
    ("html-escape","HTML Escape","Escape HTML special characters.","html-enc","fa-solid fa-code",False,"escape"),
    ("query-string-builder","Query String Builder","Build a URL query string from pairs.","qs-build","fa-solid fa-list",False,"querystring"),
    ("json-to-csv","JSON to CSV","Convert a JSON array to CSV.","json-csv","fa-solid fa-table",False,"json csv"),
    ("csv-to-json","CSV to JSON","Convert CSV text to JSON.","csv-json","fa-solid fa-table",False,"csv json"),
    ("xml-to-json","XML to JSON","Convert simple XML to JSON.","xml-json","fa-solid fa-code",False,"xml json"),
    ("hash-sha256","SHA-256 Generator","Create a SHA-256 hash of text.","hash","fa-solid fa-hashtag",False,"sha256 hash"),
    ("hash-sha512","SHA-512 Generator","Create a SHA-512 hash of text.","hash","fa-solid fa-hashtag",False,"sha512"),
    ("hash-md5-note","Checksum Helper","Create SHA-256 checksum (preferred over MD5).","hash","fa-solid fa-hashtag",False,"checksum"),
    ("color-converter","Color Converter","Convert between HEX, RGB, and HSL.","color-conv","fa-solid fa-palette",False,"color convert"),
    ("jwt-generator","JWT Builder (Unsigned)","Build an unsigned JWT-like token for testing only.","jwt-gen","fa-solid fa-key",False,"jwt test"),
]
for t in dev:
    tools.append(T(t[0], t[1], "Developer Tools", t[2], t[3], t[4], t[5] if isinstance(t[5], bool) else False, False, False, t[6] if len(t)>6 else ""))

# SECURITY
sec = [
    T("password-generator","Password Generator","Security & Generator","Generate strong random passwords.","password","fa-solid fa-key",True,False,False,"password random secure"),
    T("username-generator","Username Generator","Security & Generator","Generate username ideas.","username","fa-solid fa-user",False,False,False,"username"),
    T("random-string","Random String Generator","Security & Generator","Generate a random alphanumeric string.","rand-str","fa-solid fa-shuffle",False,False,False,"random string"),
    T("token-generator","Token Generator","Security & Generator","Generate a random token.","rand-str","fa-solid fa-ticket",False,False,False,"token"),
    T("pin-generator","PIN Generator","Security & Generator","Generate numeric PINs.","pin","fa-solid fa-hashtag",False,False,False,"pin"),
    T("hex-generator","Hex Generator","Security & Generator","Generate random hexadecimal strings.","hex-gen","fa-solid fa-0",False,False,False,"hex"),
    T("secret-key-generator","Secret Key Generator","Security & Generator","Generate a long secret key for apps.","rand-str","fa-solid fa-shield-halved",False,False,False,"secret key"),
    T("color-generator","Random Color Generator","Security & Generator","Generate random HEX colors.","rand-color","fa-solid fa-palette",False,False,False,"random color"),
    T("hash-generator","Hash Generator","Security & Generator","Hash text with SHA-256 or SHA-512.","hash","fa-solid fa-fingerprint",False,False,False,"hash sha"),
]
tools += sec

# CALCULATOR
calc = [
    T("basic-calculator","Basic Calculator","Calculator","Add, subtract, multiply, and divide.","calc-basic","fa-solid fa-calculator",True,False,False,"math calculate"),
    T("scientific-calculator","Scientific Calculator","Calculator","sin, cos, tan, log, pow, sqrt.","calc-sci","fa-solid fa-square-root-variable",False,False,False,"scientific sin cos"),
    T("percentage-calculator","Percentage Calculator","Calculator","Find percentages, increase, and decrease.","calc-pct","fa-solid fa-percent",True,False,False,"percent"),
    T("discount-calculator","Discount Calculator","Calculator","Calculate sale price after discount.","calc-discount","fa-solid fa-tags",False,False,False,"discount sale"),
    T("profit-calculator","Profit Calculator","Calculator","Calculate profit and profit margin.","calc-profit","fa-solid fa-chart-line",False,False,False,"profit margin"),
    T("loss-calculator","Loss Calculator","Calculator","Calculate loss amount and percentage.","calc-loss","fa-solid fa-chart-line",False,False,False,"loss"),
    T("tax-calculator","Tax Calculator","Calculator","Add or remove tax from a price.","calc-tax","fa-solid fa-receipt",False,False,False,"tax vat"),
    T("tip-calculator","Tip Calculator","Calculator","Split a bill and calculate tip.","calc-tip","fa-solid fa-utensils",False,False,False,"tip bill"),
    T("age-calculator","Age Calculator","Calculator","Calculate age from a birth date.","calc-age","fa-solid fa-cake-candles",True,False,False,"age birthday"),
    T("date-difference","Date Difference Calculator","Calculator","Days between two dates.","calc-datediff","fa-solid fa-calendar",False,False,False,"date difference days"),
    T("bmi-calculator","BMI Calculator","Calculator","Calculate Body Mass Index.","calc-bmi","fa-solid fa-weight-scale",False,False,False,"bmi health"),
    T("bmr-calculator","BMR Calculator","Calculator","Estimate basal metabolic rate.","calc-bmr","fa-solid fa-heart-pulse",False,False,False,"bmr calories"),
    T("length-converter","Length Converter","Calculator","Convert meters, feet, inches, km, miles.","unit-length","fa-solid fa-ruler",False,False,False,"meter feet inch"),
    T("weight-converter","Weight Converter","Calculator","Convert kg, lb, oz, g.","unit-weight","fa-solid fa-weight-hanging",False,False,False,"kg lb"),
    T("temperature-converter","Temperature Converter","Calculator","Convert C, F, and Kelvin.","unit-temp","fa-solid fa-temperature-half",False,False,False,"celsius fahrenheit"),
    T("area-converter","Area Converter","Calculator","Convert m2, ft2, acres, hectares.","unit-area","fa-solid fa-vector-square",False,False,False,"area m2"),
    T("volume-converter","Volume Converter","Calculator","Convert liters, gallons, ml.","unit-volume","fa-solid fa-cube",False,False,False,"liter gallon"),
    T("speed-converter","Speed Converter","Calculator","Convert km/h, mph, m/s.","unit-speed","fa-solid fa-gauge-high",False,False,False,"speed kmh mph"),
    T("data-storage-converter","Data Storage Converter","Calculator","Convert B, KB, MB, GB, TB.","unit-data","fa-solid fa-hard-drive",False,False,False,"mb gb tb"),
    T("time-converter","Time Converter","Calculator","Convert seconds, minutes, hours, days.","unit-time","fa-solid fa-hourglass",False,False,False,"time seconds"),
]
tools += calc

# BUSINESS
biz = [
    T("invoice-generator","Invoice Generator","Business Tools","Create a simple printable invoice.","invoice","fa-solid fa-file-invoice",True,False,False,"invoice bill"),
    T("receipt-generator","Receipt Generator","Business Tools","Create a simple receipt.","receipt","fa-solid fa-receipt",False,False,False,"receipt"),
    T("quotation-generator","Quotation Generator","Business Tools","Create a quotation document.","quote","fa-solid fa-file-invoice-dollar",False,False,False,"quote quotation"),
    T("margin-calculator","Margin Calculator","Business Tools","Calculate margin from cost and price.","calc-margin","fa-solid fa-percent",False,False,False,"margin"),
    T("markup-calculator","Markup Calculator","Business Tools","Calculate markup from cost and price.","calc-markup","fa-solid fa-percent",False,False,False,"markup"),
    T("sku-generator","SKU Generator","Business Tools","Generate product SKU codes.","sku","fa-solid fa-barcode",False,False,False,"sku product"),
    T("invoice-number","Invoice Number Generator","Business Tools","Generate sequential-style invoice numbers.","inv-no","fa-solid fa-hashtag",False,False,False,"invoice number"),
    T("barcode-generator","Barcode Generator","Business Tools","Generate a Code128-style barcode SVG.","barcode","fa-solid fa-barcode",False,False,False,"barcode"),
    T("price-list-generator","Price List Generator","Business Tools","Build a simple price list table.","pricelist","fa-solid fa-list","False",False,False,"price list"),
    T("sales-calculator","Sales Calculator","Business Tools","Calculate total sales from units and price.","calc-sales","fa-solid fa-cash-register",False,False,False,"sales"),
]
# fix pricelist popular flag I accidentally set as string
for t in biz:
    if t["popular"] == "False":
        t["popular"] = False
tools += biz

# DESIGN
des = [
    T("color-palette","Color Palette Generator","Design Tools","Generate a 5-color palette.","palette","fa-solid fa-swatchbook",True,False,False,"palette colors"),
    T("gradient-generator","Gradient Generator","Design Tools","Create a CSS gradient and preview it.","css-grad","fa-solid fa-fill-drip",False,False,False,"gradient"),
    T("contrast-checker","Contrast Checker","Design Tools","Check WCAG contrast between two colors.","contrast","fa-solid fa-circle-half-stroke",False,False,False,"contrast wcag"),
    T("random-color","Random Color","Design Tools","Pick a random color with HEX and RGB.","rand-color","fa-solid fa-dice",False,False,False,"random hex"),
    T("social-image-size","Social Media Image Size Helper","Design Tools","Common social image sizes.","social-sizes","fa-solid fa-image",False,False,False,"instagram youtube size"),
    T("banner-size","Banner Size Calculator","Design Tools","Common ad and banner sizes.","banner-sizes","fa-solid fa-rectangle-ad",False,False,False,"banner ads"),
    T("font-pairing","Font Pairing Helper","Design Tools","Suggested font pairings for headings and body.","font-pair","fa-solid fa-font",False,False,False,"font pair"),
    T("logo-size-helper","Logo Size Helper","Design Tools","Common logo export sizes.","logo-sizes","fa-solid fa-vector-square",False,False,False,"logo size"),
]
tools += des

# QR
qr = [
    T("qr-generator","QR Code Generator","QR & Barcode","Generate a QR code from text or a URL.","qr","fa-solid fa-qrcode",True,False,False,"qr code"),
    T("wifi-qr","WiFi QR Generator","QR & Barcode","Create a WiFi login QR code.","qr-wifi","fa-solid fa-wifi",False,False,False,"wifi qr"),
    T("url-qr","URL QR Generator","QR & Barcode","Create a QR code for a URL.","qr","fa-solid fa-link",False,False,False,"url qr"),
    T("text-qr","Text QR Generator","QR & Barcode","Create a QR code for plain text.","qr","fa-solid fa-font",False,False,False,"text qr"),
    T("email-qr","Email QR Generator","QR & Barcode","Create a mailto QR code.","qr-email","fa-solid fa-envelope",False,False,False,"email qr"),
    T("phone-qr","Phone QR Generator","QR & Barcode","Create a tel: QR code.","qr-phone","fa-solid fa-phone",False,False,False,"phone qr"),
    T("sms-qr","SMS QR Generator","QR & Barcode","Create an SMS QR code.","qr-sms","fa-solid fa-comment-sms",False,False,False,"sms qr"),
    T("location-qr","Location QR Generator","QR & Barcode","Create a geo QR code.","qr-geo","fa-solid fa-location-dot",False,False,False,"map location qr"),
]
tools += qr

# SOCIAL
soc = [
    T("caption-counter","Caption Counter","Social Media Tools","Count characters for captions.","text-stats","fa-solid fa-comment",False,False,False,"caption instagram"),
    T("hashtag-counter","Hashtag Counter","Social Media Tools","Count hashtags in text.","hashtag-count","fa-solid fa-hashtag",False,False,False,"hashtag"),
    T("bio-counter","Bio Character Counter","Social Media Tools","Count characters for a profile bio.","text-stats","fa-solid fa-user",False,False,False,"bio twitter instagram"),
    T("hashtag-maker","Hashtag Maker","Social Media Tools","Turn words into #hashtags.","hashtag-make","fa-solid fa-hashtag",False,False,False,"hashtag generate"),
    T("link-formatter","Link Formatter","Social Media Tools","Normalize and clean links.","url-clean","fa-solid fa-link",False,False,False,"link url"),
    T("username-ideas","Social Username Ideas","Social Media Tools","Generate handle ideas.","username","fa-solid fa-at",False,False,False,"username handle"),
]
tools += soc

# DATE
dt = [
    T("countdown","Countdown","Date & Time","Countdown to a target date.","countdown","fa-solid fa-hourglass-end",False,False,False,"countdown"),
    T("stopwatch","Stopwatch","Date & Time","Simple stopwatch.","stopwatch","fa-solid fa-stopwatch",False,False,False,"stopwatch"),
    T("timer","Timer","Date & Time","Countdown timer in minutes and seconds.","timer","fa-solid fa-clock",False,False,False,"timer"),
    T("world-clock","World Clock","Date & Time","Show current time in major timezones.","worldclock","fa-solid fa-earth-asia",False,False,False,"timezone clock"),
    T("date-formatter","Date Formatter","Date & Time","Format a date in common patterns.","date-fmt","fa-solid fa-calendar-days",False,False,False,"date format"),
    T("week-number","Week Number","Date & Time","Get ISO week number of a date.","weeknum","fa-solid fa-calendar-week",False,False,False,"week iso"),
    T("leap-year","Leap Year Checker","Date & Time","Check if a year is a leap year.","leap","fa-solid fa-calendar-check",False,False,False,"leap year"),
    T("working-days","Working Days Calculator","Date & Time","Count weekdays between two dates.","workdays","fa-solid fa-briefcase",False,False,False,"working days weekday"),
    T("timezone-converter","Timezone Converter","Date & Time","Convert a time between timezones.","tz","fa-solid fa-globe",False,False,False,"timezone"),
]
tools += dt

# DOCUMENT / FILE
doc = [
    T("txt-formatter","TXT Formatter","Document Tools","Normalize a text document.","text-clean","fa-solid fa-file-lines",False,False,False,"txt"),
    T("markdown-to-html","Markdown to HTML","Document Tools","Convert Markdown to HTML.","md-html","fa-brands fa-markdown",False,False,False,"markdown html"),
    T("html-to-text","HTML to Text","Document Tools","Strip tags from HTML.","html-text","fa-solid fa-file",False,False,False,"html text"),
    T("csv-viewer","CSV Viewer","Document Tools","Preview CSV as a table.","csv-view","fa-solid fa-table",False,False,False,"csv table"),
    T("csv-formatter","CSV Formatter","Document Tools","Pretty-print CSV rows.","csv-fmt","fa-solid fa-table",False,False,False,"csv"),
    T("file-size-checker","File Size Checker","File Tools","Check any file size and type.","file-info","fa-solid fa-file",False,False,False,"filesize"),
    T("file-extension","File Extension Checker","File Tools","Read a file name and extension.","file-info","fa-solid fa-file-circle-question",False,False,False,"extension"),
    T("mime-checker","MIME Type Checker","File Tools","Guess MIME type from a file.","file-info","fa-solid fa-file-code",False,False,False,"mime"),
    T("file-name-generator","File Name Generator","File Tools","Generate clean file names.","filename","fa-solid fa-file-signature",False,False,False,"filename"),
    T("file-hash","File Hash Calculator","File Tools","SHA-256 hash of a local file.","file-hash","fa-solid fa-fingerprint",False,False,False,"hash checksum file"),
    T("base64-file-encoder","Base64 File Encoder","File Tools","Encode a file to Base64.","file-b64","fa-solid fa-file-export",False,False,False,"base64 file"),
]
tools += doc

# EDUCATION
edu = [
    T("gpa-calculator","GPA Calculator","Education","Calculate GPA from grade points.","gpa","fa-solid fa-graduation-cap",False,False,False,"gpa grade"),
    T("grade-calculator","Grade Calculator","Education","Find required score to hit a target grade.","grade","fa-solid fa-percent",False,False,False,"grade exam"),
    T("fraction-calculator","Fraction Calculator","Education","Add and simplify two fractions.","fraction","fa-solid fa-divide",False,False,False,"fraction"),
    T("multiplication-table","Multiplication Table","Education","Generate a multiplication table.","multable","fa-solid fa-table",False,False,False,"multiply table"),
    T("study-timer","Study Timer","Education","Simple study countdown timer.","timer","fa-solid fa-book",False,False,False,"study timer"),
    T("pomodoro-timer","Pomodoro Timer","Education","25/5 Pomodoro focus timer.","pomodoro","fa-solid fa-clock",True,False,False,"pomodoro focus"),
]
tools += edu

# PRODUCTIVITY
prod = [
    T("todo-list","To-Do List","Productivity","Local to-do list saved in your browser.","todo","fa-solid fa-list-check",True,False,False,"todo task"),
    T("notes","Notes","Productivity","Quick notes saved locally.","notes","fa-solid fa-note-sticky",False,False,False,"notes"),
    T("checklist","Checklist","Productivity","Simple checklist.","todo","fa-solid fa-square-check",False,False,False,"checklist"),
    T("habit-tracker","Habit Tracker","Productivity","Track daily habits for this week.","habits","fa-solid fa-calendar-check",False,False,False,"habit"),
    T("random-picker","Random Picker","Productivity","Pick a random item from a list.","picker","fa-solid fa-dice",False,False,False,"random pick"),
    T("random-number","Random Number Generator","Productivity","Generate a random number in a range.","rand-num","fa-solid fa-dice-five",False,False,False,"random number"),
    T("decision-maker","Decision Maker","Productivity","Yes / No / Maybe helper.","decision","fa-solid fa-circle-question",False,False,False,"decision yes no"),
    T("simple-expense","Simple Expense Tracker","Productivity","Add expenses and see a total.","expense","fa-solid fa-wallet",False,False,False,"expense money"),
]
tools += prod

# UTILITY
util = [
    T("clipboard-note","Quick Clipboard Note","Utility","Type text and copy it instantly.","clipnote","fa-solid fa-clipboard",False,False,False,"clipboard"),
    T("case-converter-all","All Case Converter","Utility","Convert text to many case styles at once.","case-all","fa-solid fa-font",False,False,False,"case"),
    T("list-numberer","List Numberer","Utility","Turn lines into a numbered list.","line-num","fa-solid fa-ol",False,False,False,"list number"),
    T("whitespace-visualizer","Whitespace Visualizer","Utility","Show spaces and tabs in text.","ws-vis","fa-solid fa-eye",False,False,False,"whitespace"),
]
tools += util

# AI (ready architecture, works with /api/ai or shows setup)
ai = [
    T("ai-summarizer","AI Summarizer","AI Tools","Summarize long text. Requires an AI API key on the server.","ai","fa-solid fa-align-left",True,True,True,"ai summarize"),
    T("ai-rewriter","AI Rewriter","AI Tools","Rewrite text more clearly. Requires server AI API.","ai","fa-solid fa-pen",False,True,True,"ai rewrite"),
    T("ai-translator","AI Translator","AI Tools","Translate text. Requires server AI API.","ai","fa-solid fa-language",False,True,True,"ai translate"),
    T("ai-caption","AI Caption Generator","AI Tools","Generate captions from a topic.","ai","fa-solid fa-comment",False,True,True,"ai caption"),
    T("ai-product","AI Product Description","AI Tools","Write a product description.","ai","fa-solid fa-box",False,True,True,"ai product"),
    T("ai-title","AI Title Generator","AI Tools","Generate title ideas.","ai","fa-solid fa-heading",False,True,True,"ai title"),
    T("ai-hashtag","AI Hashtag Generator","AI Tools","Suggest hashtags from a topic.","ai","fa-solid fa-hashtag",False,True,True,"ai hashtag"),
    T("ai-helper","AI Text Helper","AI Tools","General text helper.","ai","fa-solid fa-robot",False,True,True,"ai helper"),
    T("ai-ideas","AI Idea Generator","AI Tools","Brainstorm ideas from a topic.","ai","fa-solid fa-lightbulb",False,True,True,"ai ideas"),
    T("ai-email","AI Email Writer","AI Tools","Draft a polite email.","ai","fa-solid fa-envelope",False,True,True,"ai email"),
    T("ai-study","AI Study Helper","AI Tools","Explain a topic in simple language.","ai","fa-solid fa-book-open",False,True,True,"ai study"),
    T("ai-qa","AI Q&A","AI Tools","Ask a question and get an answer.","ai","fa-solid fa-circle-question",False,True,True,"ai question"),
]
tools += ai

# extra image/text/dev fillers to grow catalog with real kinds already supported
extra = [
    T("image-mirror-text","Image Label Maker","Image Tools","Put a short label on the bottom of an image.","image-watermark","fa-solid fa-tag",False,False,False,"label"),
    T("png-transparent-check","Image Type Checker","Image Tools","See if a file is PNG, JPG, or WEBP.","image-info","fa-solid fa-circle-info",False,False,False,"type"),
    T("text-wrap","Text Wrapper","Text Tools","Wrap text to a given line width.","text-wrap","fa-solid fa-align-justify",False,False,False,"wrap"),
    T("remove-punctuation","Remove Punctuation","Text Tools","Strip punctuation from text.","no-punct","fa-solid fa-i-cursor",False,False,False,"punctuation"),
    T("initials-generator","Initials Generator","Text Tools","Create initials from a name.","initials","fa-solid fa-signature",False,False,False,"initials"),
    T("slug-to-title","Slug to Title","Text Tools","Turn a slug into a readable title.","slug-title","fa-solid fa-heading",False,False,False,"slug"),
    T("json-keys","JSON Key Lister","Developer Tools","List top-level keys in a JSON object.","json-keys","fa-solid fa-key",False,False,False,"json keys"),
    T("css-unit-converter","CSS Unit Helper","Developer Tools","Convert px and rem at 16px base.","css-unit","fa-solid fa-ruler",False,False,False,"px rem"),
    T("rgb-to-hsl","RGB to HSL","Developer Tools","Convert RGB to HSL.","color-conv","fa-solid fa-droplet",False,False,False,"hsl"),
    T("number-base","Number Base Converter","Developer Tools","Convert between decimal, binary, hex.","num-base","fa-solid fa-hashtag",False,False,False,"binary hex decimal"),
]
tools += extra

# de-duplicate ids
seen = set()
uniq = []
for t in tools:
    if t["id"] in seen:
        continue
    seen.add(t["id"])
    uniq.append(t)
tools = uniq

cats = {}
for t in tools:
    cats[t["category"]] = cats.get(t["category"], 0) + 1

out = Path("/home/workdir/artifacts/nailong-tools/js/registry.js")
out.parent.mkdir(parents=True, exist_ok=True)
payload = {
    "version": "148.027.00",
    "generated": True,
    "count": len(tools),
    "categories": [
        "Image Tools","PDF Tools","Video Tools","Audio Tools","Text Tools",
        "Developer Tools","Security & Generator","Calculator","Business Tools",
        "Design Tools","QR & Barcode","Social Media Tools","Date & Time",
        "Document Tools","File Tools","Education","Productivity","Utility","AI Tools"
    ],
    "tools": tools,
}
js = "/* NAILONG TOOLS registry — generated, do not edit by hand unless needed */\nwindow.NT_REGISTRY = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
out.write_text(js, encoding="utf-8")
print("tools", len(tools))
print(json.dumps(cats, indent=2))
