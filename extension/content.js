// This script runs in the context of the Facebook Marketplace page.
// It extracts and returns listing data.

(async () => {
    let title = '';
    try {
        const titleElem = document.evaluate(
            '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[1]/h1/span',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
        if (titleElem) title = titleElem.textContent.trim();
    } catch (e) {
        console.warn("❌ Title extraction failed:", e);
    }

    let seller = '';
    try {
        const potentialSeller = document.querySelector('a[role="link"][href*="/marketplace/"]');
        
        for (const link of potentialSeller) {
            const nameSpan = link.querySelector('span.x193iq5w, span');

            if (nameSpan) {
                const potentialName = nameSpan.textContent.trim();
                if (potentialName.length > 2 && !potentialName.includes(" ") && !potentialName.toLowerCase().includes('details')) {
                    if (link.textContent.trim() === potentialName) {
                        seller = potentialName;
                        break;
                    }
                } else if (potentialName.includes(" ")) {
                    if (link.textContent.trim() === potentialName) {
                        seller = potentialName;
                        break;
                    }
                }
            }
        }

        if (!seller) {
            const containerSpans = document.querySelector('span[dir="auto"]');
            if (containerSpans) {
                const actualSellerLink = containerSpanWithDirAuto.querySelector('a[role="link"][href*="/marketplace/profile/"]');   
                if (actualSellerLink) {
                    const nameSpan = actualSellerLink.querySelector('span.x193iq5w, span');
                    if (nameSpan) {
                        seller = nameSpan.textContent.trim();
                    }
                }
            }
        }

    } catch (e) {
        console.warn("❌ Seller extraction failed:", e);
    }

    let price = "N/A";
    try {
        const spans = document.querySelectorAll("span");
        for (let span of spans) {
            const txt = span.textContent.trim();
            const match = txt.match(/\$\d[\d,\.]*/g);
            if (match && match.length > 0) {
                price = match[0]; // Only take the first $price found
                break;
            }
        }
    } catch (e) {
        console.warn("❌ Price extraction failed:", e);
    }

    let about_raw = "";
    let about_structured = {};
    try {
        const pageText = document.body.innerText;
        if (pageText.includes("About this vehicle")) {
            const spans = [...document.querySelectorAll('span')];
            const vehicle_info = [];

            for (let i = 0; i < spans.length; i++) {
                if (spans[i].textContent.includes("About this vehicle")) {
                    for (let j = i + 1; j < i + 10; j++) {
                        const txt = spans[j]?.textContent.trim();
                        if (txt && ["driven", "transmission", "color", "fuel", "title"].some(kw => txt.toLowerCase().includes(kw))) {
                            vehicle_info.push(txt);
                        }
                    }
                    break;
                }
            }

            about_raw = vehicle_info.join('\n');

            for (const line of vehicle_info) {
                if (line.includes(":")) {
                    const [key, value] = line.split(":", 2).map(s => s.trim());
                    about_structured[key] = value;
                } else if (line.toLowerCase().includes("driven")) {
                    about_structured["Mileage"] = line;
                } else if (line.toLowerCase().includes("transmission")) {
                    about_structured["Transmission"] = line;
                } else if (line.toLowerCase().includes("color")) {
                    about_structured["Exterior color"] = line;
                } else if (line.toLowerCase().includes("fuel")) {
                    about_structured["Fuel type"] = line;
                } else if (line.toLowerCase().includes("title")) {
                    about_structured["Title"] = line;
                }
            }

        } else {
            console.info("ℹ️ No vehicle tag found, trying li-based detail scraping...");
            const li_fields = {
                "Condition": 1,
                "Product Line": 2,
                "Color": 3,
                "Brand": 4
            };
            for (const [label, index] of Object.entries(li_fields)) {
                try {
                    const val = document.evaluate(
                        `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[5]/div/div[2]/ul/li[${index}]/div/span[2]/div/div/span/span`,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    ).singleNodeValue?.textContent;
                    if (val) {
                        about_structured[label] = val;
                        about_raw += `${label}: ${val}\n`;
                    }
                } catch (_) {}
            }
        }
    } catch (e) {
        console.warn("❌ About section failed:", e);
    }

    let description = "";
    try {
        const seeMore = document.evaluate(
            '//span[contains(text(), "See more")]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
        if (seeMore) seeMore.click();
        await new Promise(res => setTimeout(res, 500));
    } catch (_) {}

    try {
        const xpath1 = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[6]/div[2]/div/div[1]/div/span';
        const xpath2 = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[5]/div/div[2]/div[1]/div/span';

        const desc1 = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        description = desc1?.textContent.trim();

        if (!description) {
            const desc2 = document.evaluate(xpath2, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            description = desc2?.textContent.trim() || "";
        }
    } catch (e) {
        console.warn("❌ Description extraction failed:", e);
    }

    const result = {
        title,
        price,
        seller,
        about_raw,
        about_structured,
        description: description || about_raw
    };

    console.log("📝 Scraped Listing Info:", result);
    return result;
})();
