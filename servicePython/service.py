from fastapi import FastAPI, Request
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def responseToMessage(message):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message.content

def summarizeConfig(configJson):
    # Ensure configJson is a string
    import json
    if not isinstance(configJson, str):
        configJson = json.dumps(configJson)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "This is a bot configuration in JSON format. Please summarize it briefly, making it sound like the bot introducing itself: " + configJson}
        ]
    )
    return response.choices[0].message.content

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    print(f'this is the message : {data.get("message")}')
    message = data.get("message")
    config = data.get("botConfig")
    print(f'this is the configuration  : {config}')

    bot_id = config.get("cnfigId")
    domaines_expertise = None
    if "generalJson" in config and "domaines_expertise" in config["generalJson"]:
        domaines_expertise = config["generalJson"]["domaines_expertise"]

    response = responseToMessage(message)
    config_summary = summarizeConfig(config)
    return f'{config_summary}\n------\nAnd this is the response to your question: {response}'

