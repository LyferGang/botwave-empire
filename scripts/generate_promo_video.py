import os
import xai_sdk
import time

# Generalized script to generate a promo video for Botwave.app
# Requirements: pip install xai-sdk
# Set XAI_API_KEY in your environment before running

def generate_promo():
    try:
        client = xai_sdk.Client(api_key=os.getenv("XAI_API_KEY"))
        
        print("Initiating Botwave promo video generation...")
        response = client.video.generate(
            prompt="A sleek, futuristic 3D printed AI agent pod glowing on a dark minimalist desk. The camera pans around as lines of code stream into it from the ether, signifying a $0 cost local AI network coming online. Cinematic lighting, photorealistic, 4k.",
            model="grok-imagine-video",
            duration=10,
            aspect_ratio="16:9",
            resolution="720p",
        )
        
        print(f"Success! Video generated. Download URL: {response.url}")
        print("Save this file to: ../website/videos/promo_loop.mp4")
        
    except Exception as e:
        print(f"Error generating video: {e}")
        print("Ensure you have set the XAI_API_KEY environment variable.")

if __name__ == "__main__":
    generate_promo()