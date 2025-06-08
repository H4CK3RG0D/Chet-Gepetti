# Chet-Gepetti
![Chet Gepetti Logo](img/logo.png)

Chet-Gepetti is a tongue-in-cheek Chrome extension that roasts Facebook Marketplace listings and fires back a lowball offer on your behalf. It grabs item details from the page, feeds them to OpenAI's API, and types the response directly into the chat box. Inspired by the Michael Reeves's video "[A Bot that Scams People](https://www.youtube.com/watch?v=LwOITqr_fz4)", this project combines browser scripting with Python automation utilities.

![Screenshot of extension](img/screenshot.png)

## Table of Contents
- [Features](#features)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Requirements](#requirements)
- [OpenAI Integration](#openai-integration)
  - [OpenAI Key](#openai-key)
  - [Model Selection](#model-selection)
  - [Personalization](#personalization)
  - [Prompt Content](#prompt-content)
- [License](#license)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

## Features

- **One-click gaslighting** – Scrapes the listing title, seller info, price, and description.
- **OpenAI integration** – Generates a sharp, sarcastic reply as "Chet Gepetti" with a lowball offer.
- **Auto-type** – Injects the generated message into the Facebook Marketplace chat box.
- **Persistent settings** – Save your OpenAI API key locally in the extension.
- **Tailwind styling** – Clean popup design with minimal CSS.

## Repository structure

```
Chet-Gepetti/
├── extension/       # Chrome extension source
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── styles/
│   └── images/
├── src/             # Helper Python scripts
│   ├── main/
│   ├── utils/
│   └── test/
├── img/             # Example screenshots
├── README.md
└── LICENSE
```

## Getting started

### Prerequisites

- Node.js for building Tailwind assets
- Python 3 for the optional automation scripts
- Google Chrome with Developer Mode enabled
- An OpenAI API key
- Facebook account

### Setting up the extension

1. In Chrome, open **chrome://extensions** and load the `extension/` folder as an unpacked extension.
2. Click the Chet Gepetti icon, open the settings gear, and paste your OpenAI API key.
3. Browse to a Facebook Marketplace listing and hit the **Gaslight** button and let it do the work for you.

### Python utilities

The `src/` directory contains experimental scripts for scraping Marketplace data and packaging the extension. `src/main/main.py` demonstrates using Selenium to pull listing information and generate a response via the OpenAI API. 

For files using `undetected-chromedriver`, the default `--user-data-dir` is set to my personal Chrome profile directory. You may need to change this to your own profile path to avoid login issues. The script uses Selenium to automate the browser, so make sure you have the correct version of ChromeDriver installed that matches your Chrome version. The main default should be set to `C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data\Default`.

`pyautogui` is also used to automate typing the response into the chat box because the extension cannot directly interact with the chat input field due to Facebook's dynamic content loading. This is a workaround to simulate user input. For default usage, it is set to manually select the chat input field before running the script. The commented-out code in `src/main/main.py:227` is an automation script that automatically clicks the chat input field, but you may need to adjust the coordinates based on your screen resolution and browser window size. By running `src/utils/coords-finder.py`, you can find the coordinates of the chat input field for your specific setup.

## Requirements

Python dependencies used by the scripts:

```
openai
python-dotenv
pyautogui
undetected-chromedriver
selenium
```
You can install them using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

---

## OpenAI API Integration

This extension uses the OpenAI API to generate responses based on the scraped Facebook Marketplace listing data. The `background.js` script handles the API requests and processes the responses to create a witty, lowball offer. For those using `main.py`, which is a local Python script, it also integrates with the OpenAI API to generate responses based on the scraped data. The script generates a response using the OpenAI API and then dumps the response to a text file located in the `gens/` directory. This file can be used to copy the response manually into the Facebook Marketplace chat box.

### OpenAI Key
To use the OpenAI API, you need to create an API key by signing up at [OpenAI](https://platform.openai.com/signup). Once you have your key and have credited your account, you can set it in the extension settings by clicking the gear icon in the popup and pasting your key into the input field. The key will be saved locally in the extension's storage.

### Model Selection

To change the model used by the extension, you can modify the `model` variable in `background.js:56`. The default is set to `gpt-4o`, but you can change it to any other model available in your OpenAI account. Rate limits and costs will depend on the model you choose. For reference, here are the models pricing per 1 million tokens according to [OpenAI's pricing page](https://openai.com/pricing):

| Model       | Price per 1M tokens | Cached Input | Output |
|-------------|---------------------|--------------|--------|
| gpt-4.1      | $2                 | $0.50        | $8     |
| gpt-4.1-mini | $0.40              | $0.10        | $1.60  |
| gpt-4.1-nano | $0.100             | $0.025       | $0.400 |
| o3           | $10                | $2.50        | $40    |
| o4-mini      | $1.100             | $0.275       | $4.40  |
| **gpt-4o**   | $5                 | $2.50        | $20    |

### Personalization

You can personalize the generated responses by modifying the `personality` variable in `background.js:21`. The current prompt follows the same prompt used by Michael Reeves in his video, plus many new additions to make it more versatile. You can change the tone, style, or specific phrases to better match your personality or the type of responses you want to generate. 


### Prompt Content
The prompt used to generate the responses contains the information scraped from the Facebook Marketplace listing, including the title, seller name, price, and description. Which follows the format:

```json
{
  "title": "Item Title",
  "seller": "Seller Name",
  "price": "Item Price",
  "description": "Item Description",
  "Specs": "about_structured"
}
```
where `about_structured` is data of the item, such as its condition, brand, model, title, miles, etc. This structured data scrapes any data available as a list. There is also a sentence at the end of the prompt that instructs the AI "As Chet Gepetti", which if you are using a different personality will be overridden by that instruction. I suggest you change the name if you are using a different personality, as it will make the responses more coherent and aligned with the character you want to portray.

---

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Open to contributions! If you have ideas for improvements, bug fixes, or new features, feel free to open an issue or submit a pull request.

## Acknowledgements
This project was inspired by Michael Reeves's hilarious video "[A Bot that Scams People](https://www.youtube.com/watch?v=LwOITqr_fz4)", where he created a bot to lowball people on Facebook Marketplace. I tried to replicate the concept to the closest extent possible. However, everything is not perfect, so there may be some bugs or issues. If you find any, please open an issue or submit a pull request to help improve the project.