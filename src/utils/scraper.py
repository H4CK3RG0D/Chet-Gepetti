import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

options = uc.ChromeOptions()

options.add_argument(r"--user-data-dir=C:\Users\heint\chrome-bot-profile")
options.add_argument("--profile-directory=Profile 2")
options.add_argument("--no-first-run")
driver = uc.Chrome(options=options)
  # Refresh after loading cookies

# Now go to Marketplace item
listing_url = "https://www.facebook.com/marketplace/item/1442756083380475/"
driver.get(listing_url)
time.sleep(5)  # let the page render a bit

# === Collect all $-containing span elements ===
found_data = []
spans = driver.find_elements(By.TAG_NAME, "span")

for i, span in enumerate(spans):
    try:
        text = span.text.strip()
        if "$" in text:
            xpath = driver.execute_script("""
                function absoluteXPath(element) {
                    var comp, comps = [];
                    var parent = null;
                    var xpath = '';
                    var getPos = function(element) {
                        var position = 1, curNode;
                        if (element.nodeType == Node.ATTRIBUTE_NODE) {
                            return null;
                        }
                        for (curNode = element.previousSibling; curNode; curNode = curNode.previousSibling) {
                            if (curNode.nodeName == element.nodeName)
                                ++position;
                        }
                        return position;
                    }

                    if (element instanceof Document) return '/';

                    for (; element && !(element instanceof Document); element = element.parentNode) {
                        comp = comps[comps.length] = {};
                        switch (element.nodeType) {
                            case Node.TEXT_NODE: comp.name = 'text()'; break;
                            case Node.ATTRIBUTE_NODE: comp.name = '@' + element.nodeName; break;
                            case Node.ELEMENT_NODE: comp.name = element.nodeName; break;
                        }
                        comp.position = getPos(element);
                    }

                    for (var i = comps.length - 1; i >= 0; i--) {
                        comp = comps[i];
                        xpath += '/' + comp.name.toLowerCase();
                        if (comp.position !== null && comp.position > 1) {
                            xpath += '[' + comp.position + ']';
                        }
                    }
                    return xpath;
                }
                return absoluteXPath(arguments[0]);
            """, span)

            found_data.append({"index": i, "text": text, "xpath": xpath})
            print(f"[{i}] {text} -> {xpath}")
    except:
        continue

with open("output.txt", "w", encoding="utf-8") as txtfile:
    for item in found_data:
        txtfile.write(f"[{item['index']}] {item['text']} -> {item['xpath']}\n")

with open("debug_fbm.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

input("\nInspect results above. Press Enter to quit.")

driver.quit()