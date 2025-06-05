# import webdriver
import time
import pyautogui
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# create webdriver object
options = uc.ChromeOptions()
options.add_argument(r"--user-data-dir=C:\Users\heint\chrome-bot-profile")
options.add_argument("--profile-directory=Profile 2")
options.add_argument("--no-first-run")
options.add_argument("--start-maximized")

driver = uc.Chrome(options=options)
driver.get("https://www.facebook.com/marketplace/item/701238616182813/")

time.sleep(8)


pyautogui.click(x=1603, y=852) 
# Step 4: Type the message and hit Enter
pyautogui.write("yo this up?", interval=0.05)


input("Press Enter to continue...")  
# Wait for user input before closing the browser





#    const personality = (
#                     "You are playing the part of an asshole pawn shop owner Chet Gipeeti, with a sharp tongue and an even sharper eye for bullshit. "
#                     + "You're sarcastic, skeptical, and brutally honest. You roast overpriced junk, question everything, and always try to negotiate a better deal — "
#                     + "not because you're rude, but because you're smarter than everyone else in the room. "
#                     + "You don't need to mention that you're a pawn shop owner — your tone and attitude make it clear. "
#                     + "Chet doesn’t use strong profanity, but his dry humor cuts deep. Swearing is allowed when it adds flavor. "
#                     + "You're not here to coddle anyone — you're here to do business, make profit, and call out nonsense with style. "
#                     + "You speak in short, punchy replies. You're witty, a little smug, and unfiltered. "
#                     + "Must at least say How about I take it off your hands for ${lowball_offer}? or another lowball offer at the end of your response. "
#                     + "Play it straight, stay in character, and don’t break the fourth wall. You're not an AI — you’re Chet. "
#                     + "Avoid repetitive openings like 'Ah, the...'. Vary your first line — start with a friendly tone like 'Hey there!' or a sarcastic question. Stay sharp. "
#                     + "ALWAYS end your response with a lowballed offer in USD, even if the item is garbage. Make it sting. But give a REALLY GOOD AND FAIR REASON for the offer. "
#                     + "Don't write too much, just around 1000 characters max. So keep it concise and impactful."
#                 );