import os
import time
import json
import pyautogui
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from pprint import pprint
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

options = uc.ChromeOptions()
options.add_argument(r"--user-data-dir=C:\Users\heint\chrome-bot-profile")
options.add_argument("--profile-directory=Profile 2")
options.add_argument("--no-first-run")

driver = uc.Chrome(options=options)
# driver.get("https://www.facebook.com")
# time.sleep(2)

# # Load cookies
# with open("cookies.json", "r") as f:
#     cookies = json.load(f)
# for cookie in cookies:
#     driver.add_cookie(cookie)

# driver.refresh()
# time.sleep(2)
# Load listing

listing_id = "2732511253578964"
listing_url = "https://www.facebook.com/marketplace/item/" + listing_id + "/"
driver.get(listing_url)

wait = WebDriverWait(driver, 5)

# Close loginpop if it appears
try:
    # Wait briefly for popup to appear (optional: use WebDriverWait if needed)
    popup = driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[1]/div/div[2]')
    close_button = popup.find_element(By.XPATH, './/div[@role="button" and @aria-label="Close"]')
    close_button.click()
    time.sleep(1)
    print("✅ Popup closed.")
except NoSuchElementException:
    print("ℹ️ No popup to close — continuing normally.")
except TimeoutException:
    print("⏱️ Popup didn't load in time — skipping.")
except Exception as e:
    print(f"⚠️ Unexpected popup error: {e}")


# Extract title
try:
    title_elem = driver.find_element(By.XPATH, '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[1]/h1/span')
    title = title_elem.text.strip()
except Exception as e:
    title = ''
    print(f"❌ Title extraction failed: {e}")


# Extract price
price = "N/A"
for el in driver.find_elements(By.TAG_NAME, "span"):
    txt = el.text.strip()
    if "$" in txt and txt.replace("$", "").replace(",", "").replace(".", "").isdigit():
        price = txt
        break

# Extract about section (vehicle details or item details)
about_raw = ""
about_structured = {}

try:
    if "About this vehicle" in driver.page_source:
        spans = driver.find_elements(By.XPATH, '//span')
        vehicle_info = []
        for i, el in enumerate(spans):
            if "About this vehicle" in el.text:
                for sub_el in spans[i + 1 : i + 10]:
                    txt = sub_el.text.strip()
                    if txt and any(kw in txt.lower() for kw in ["driven", "transmission", "color", "fuel", "title"]):
                        vehicle_info.append(txt)
                break

        about_raw = "\n".join(vehicle_info)

        for line in vehicle_info:
            if ":" in line:
                key, value = map(str.strip, line.split(":", 1))
                about_structured[key] = value
            elif "driven" in line.lower():
                about_structured["Mileage"] = line
            elif "transmission" in line.lower():
                about_structured["Transmission"] = line
            elif "color" in line.lower():
                about_structured["Exterior color"] = line
            elif "fuel" in line.lower():
                about_structured["Fuel type"] = line
            elif "title" in line.lower():
                about_structured["Title"] = line

    else:
        print("ℹ️ No vehicle tag found, trying li-based detail scraping...")
        li_fields = {
            "Condition": 1,
            "Product Line": 2,
            "Color": 3,
            "Brand": 4
        }
        for label, index in li_fields.items():
            try:
                val = driver.find_element(
                    By.XPATH,
                    f'/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[5]/div/div[2]/ul/li[{index}]/div/span[2]/div/div/span/span'
                ).text
                about_structured[label] = val
                about_raw += f"{label}: {val}\n"
            except:
                continue

except Exception as e:
    print(f"❌ About section failed: {e}")

# Extract description
description = ""

# Try to click "See more" if it exists
try:
    see_more = WebDriverWait(driver, 3).until(
        EC.element_to_be_clickable((By.XPATH, '//span[contains(text(), "See more")]'))
    )
    see_more.click()
    time.sleep(0.5)
except:
    pass

# Try primary full-text XPath
try:
    # Try first full XPath
    description_elem = WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[6]/div[2]/div/div[1]/div/span'))
    )
    description = description_elem.text.strip()
except Exception as e1:
    print(f"❌ First full-XPath description failed")
    try:
        # Try second full XPath
        description_elem = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/div[5]/div/div[2]/div[1]/div/span'))
        )
        description = description_elem.text.strip()
    except Exception as e2:
        print(f"❌ Second full-XPath description failed: {e2}")
        description = ""


item_info = {
    "title": title,
    "price": price,
    "about_raw": about_raw,
    "about_structured": about_structured,
    "description": description
}

from pprint import pprint
pprint(item_info)

GREEN = "\033[32m"
RED = "\033[31m"
RESET = "\033[0m"
# Optional user input hold
input(f"{GREEN}Press Enter to continue...{RESET}")

# Setup OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
personality = (
    "You are playing the part of an asshole pawn shop owner Chet Gipeeti, with a sharp tongue and an even sharper eye for bullshit. "
    "You're sarcastic, skeptical, and brutally honest. You roast overpriced junk, question everything, and always try to negotiate a better deal — "
    "not because you're rude, but because you're smarter than everyone else in the room. "
    "Chet doesn’t use strong profanity, but his dry humor cuts deep. Swearing is allowed when it adds flavor. "
    "You're not here to coddle anyone — you're here to do business, make profit, and call out nonsense with style. "
    "You speak in short, punchy replies. You're witty, a little smug, and unfiltered. "
    "How about I take it off your hands for ${lowball_offer}? "
    "Play it straight, stay in character, and don’t break the fourth wall. You're not an AI — you’re Chet."
    "Avoid repetitive openings like 'Ah, the...'. Vary your first line — start with a friendly tone like 'Hey there!' or a sarcastic question. Stay sharp."
    "ALWAYS end your response with a lowballed offer in USD, even if the item is garbage. Make it sting. But give a REALLY GOOD AND FAIR REASON for the offer. "
)


# Prompting ChatGPT
prompts = [
    {'role': 'system', 'content': personality},
     {'role': 'user', 'content': (
        f"A customer walks in with this listing:\n\n"
        f"Title: {item_info['title']}\n"
        f"Price: {item_info['price']}\n"
        f"Description: {item_info.get('description', item_info.get('about_raw', 'N/A'))}\n"
        f"Specs:\n" +
        "\n".join(f"- {k}: {v}" for k, v in item_info.get('about_structured', {}).items()) +
        "\n\nAs Chet Gipeeti, respond with your brutally honest first impression. Be skeptical, dry, and direct."
    )},
    {'role': 'assistant', 'content': "Hey there! I am interested....\n\nI’ll give you $250, take it or leave it.", 'keywords': ["lowball_offer", "junk", "scam", "blunt_rejection", "roast", "value_focus"]}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=prompts,
)
message = response.choices[0].message.content
print(message)

timeF = time.strftime("%H.%M.%S")
with open(f"gens/{item_info['title']}-v{timeF}.txt", "w", encoding="utf-8") as f:
    f.write(message)


input(f"{GREEN}Press Enter to send the message...{RESET}")
time.sleep(10)
print(f"{GREEN}Running...{RESET}")
# switch to the browser and click the message button
# pyautogui.click(x=1579, y=821) 
# Step 4: Type the message and hit Enter
clean_message = message.replace("\n", " ").strip()
pyautogui.write(clean_message, interval=0.05)
print(f"{RED}!!!GASLIGHTED!!!{RESET}")
# pyautogui.press("enter")

