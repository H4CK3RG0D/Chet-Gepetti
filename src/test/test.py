import pyautogui
import time
import undetected_chromedriver as uc

# create webdriver object
options = uc.ChromeOptions()
options.add_argument(r"--user-data-dir=C:\Users\heint\chrome-bot-profile")
options.add_argument("--profile-directory=Profile 2")
options.add_argument("--no-first-run")
options.add_argument("--start-maximized")

driver = uc.Chrome(options=options)
driver.get("https://www.facebook.com/marketplace/item/2445063692513630/")
UPDATE_INTERVAL = 0.5 # seconds

def track_mouse_position():
    """
    Continuously prints the current mouse cursor's X and Y coordinates
    to the console using pyautogui.
    """
    print("--- PyAutoGUI Mouse Position Tracker ---")
    print(f"Tracking mouse position every {UPDATE_INTERVAL} seconds. Press Ctrl+C to stop.")
    print("-" * 40)

    try:
        while True:
            # Get the current mouse position
            # pyautogui.position() returns a Point object with x and y attributes
            current_x, current_y = pyautogui.position()

            # Print the coordinates
            print(f"X: {current_x}, Y: {current_y}")

            # Wait for a short interval before checking again
            time.sleep(UPDATE_INTERVAL)
    except KeyboardInterrupt:
        # Handle Ctrl+C to gracefully exit the loop
        print("\n--- Tracker stopped. ---")
    except Exception as e:
        # Catch any other potential errors
        print(f"\nAn error occurred: {e}")

def maine(message):
    print("Starting main function...", str(message))
    input("Press Enter to start tracking mouse position...")

# Call the function to start tracking when the script is run
if __name__ == "__main__":
    # track_mouse_position()
    maine("yes")


