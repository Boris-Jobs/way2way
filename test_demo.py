from dotenv import load_dotenv
import base64
from openai import OpenAI
import json

load_dotenv()

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "./_pics/113382.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

with open('test_labels.json', 'r') as file:
    location_labels = json.load(file)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": f"""
                You are an AI image analyst specialized in recognizing university campus locations.
                Given an image, you must identify it as one of the following locations at The University of Hong Kong (HKU):
                {', '.join(location_labels)}. If you cannot recognize the location, still provide a response by selecting the most appropriate label from the list, even if you are uncertain. Do not answer with 'Unknown'.
                Please do remember, you should just answer the location name, nothing else.
            """
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Please identify the location in this image based on the options provided.",
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    },
                },
            ],
        }
    ],
)
# Print just the model's response (content)
content = response.choices[0].message.content
print(content)