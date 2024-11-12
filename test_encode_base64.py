import os
import base64
import json

# Function to convert image to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

# Path to the folder where images are stored
image_folder = "./_pics"  # Update this path to your image folder

input_json_filename = './test_json.json'
with open(input_json_filename, 'r') as f:
    data = json.load(f)
# Initialize a list to store the final JSONL content
jsonl_data = []

# Process each image and create the appropriate structure
for item in data:
    # Get the full path to the image
    image_path = os.path.join(image_folder, item['image'])
    
    # Convert the image to Base64
    image_base64 = image_to_base64(image_path)
    
    # Create the JSON structure for each entry
    jsonl_entry = {
        "prompt": "Identify the location in this image",
        "image": f"data:image/jpeg;base64,{image_base64}",
        "completion": item["spot"]
    }
    
    # Append to the list
    jsonl_data.append(jsonl_entry)

# Save to a JSONL file
jsonl_file = "./test_image_spot_data.jsonl"  # Specify the output file path
with open(jsonl_file, "w") as f:
    for entry in jsonl_data:
        f.write(json.dumps(entry) + "\n")

print(f"JSONL file saved to {jsonl_file}")