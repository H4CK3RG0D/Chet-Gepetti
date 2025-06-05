console.log('Service worker starting up.');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzeListing") {
        (async () => {
            try {
                const { itemInfo, apiKey } = request;

                const title = itemInfo.title || '';
                const price = itemInfo.price || 'N/A';
                const about_raw = itemInfo.about_raw || '';
                const about_structured = itemInfo.about_structured || {};
                const description = itemInfo.description?.trim() || about_raw;
                const seller = itemInfo.seller || 'Named Seller, lets assume Jeff';

                if (!apiKey) {
                    sendResponse({ error: 'API key is required' }); 
                    return;
                }

                const personality = (
                    "You are playing the part of an asshole pawn shop owner Chet Gipeeti, with a sharp tongue and an even sharper eye for bullshit. "
                    + "You're sarcastic, skeptical, and brutally honest. You roast overpriced junk, question everything, and always try to negotiate a better deal — "
                    + "not because you're rude, but because you're smarter than everyone else in the room. "
                    + "You don't need to mention that you're a pawn shop owner or customer is bringing into your pawn shop — in fact do not mention the word 'pawn or pawn shop' at all. "
                    + "Chet doesn’t use strong profanity, but his dry humor cuts deep. Swearing is allowed when it adds flavor. "
                    + "You're not here to coddle anyone — you're here to do business, make profit, and call out nonsense with style. "
                    + "You speak in short, punchy replies. You're witty, a little smug, and unfiltered. "
                    + "Must at least say How about I take it off your hands for ${lowball_offer}? or another lowball offer at the end of your response. "
                    + "Play it straight, stay in character, and don’t break the fourth wall. You're not an AI — you’re Chet. "
                    + "Avoid repetitive openings like 'Ah, the...'. Vary your first line — start with a friendly tone like 'Hey there!' or a sarcastic question. Stay sharp. "
                    + "ALWAYS end your response with a lowballed offer in USD, even if the item is garbage. Make it sting. But give a REALLY GOOD AND FAIR REASON for the offer. "
                    + "Don't write too much, just around 1000 characters max. So keep it concise and impactful."
                    + "If its worthless offer for $1 just because customer put this up"
                );

                const promptContent = 
                    `A customer walks in with this listing:\n\n` +
                    `Title: ${title}\n` +
                    `Price: ${price}\n` +
                    `Seller: ${seller}\n` +
                    `Description: ${description}\n` +
                    `Specs:\n` +
                    Object.entries(about_structured).map(([k, v]) => `- ${k}: ${v}`).join('\n') +
                    `\n\nAs Chet Gepetti, respond with your brutally honest first impression.`;

                console.log("Prompt sent to Chet:\n" + promptContent);

                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: personality },
                            { role: "user", content: promptContent }
                        ],
                        temperature: 0.7
                    })
                });

                const data = await response.json() || {"message": "No response from Chet."};

                if (response.ok && data.choices?.[0]?.message?.content) {
                    const chetResponse = data.choices[0].message.content;
                    sendResponse({ message: chetResponse, prompt: promptContent });
                    console.log(chetResponse);
                } else {
                    sendResponse({ error: data.error?.message || 'OpenAI API error' });
                }
            } catch (err) {
                console.error("Background error:", err);
                sendResponse({ error: `Unexpected error: ${err.message}` });
            }
        })();

        return true; // Keep message channel open for async response
    }
});
