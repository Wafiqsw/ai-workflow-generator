import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Load environment variables from .env file
load_dotenv()

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPEN_ROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )

    def chat(
        self, 
        messages: List[Dict[str, Any]], 
        model: str = "openrouter/free", 
        reasoning: bool = True
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to OpenRouter.
        """
        extra_body = {}
        if reasoning:
            extra_body["reasoning"] = {"enabled": True}

        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            extra_body=extra_body
        )

        message = response.choices[0].message
        
        return {
            "content": message.content,
            "reasoning_details": getattr(message, "reasoning_details", None),
            "role": message.role
        }

# For standalone testing
if __name__ == "__main__":
    service = OpenRouterService()
    test_messages = [
        {"role": "user", "content": "How many r's are in the word 'strawberry'?"}
    ]
    
    print("🚀 Testing OpenRouter Service...")
    result = service.chat(test_messages)
    
    print(f"\n🧠 Reasoning:\n{result['reasoning_details']}\n")
    print(f"🤖 Response: {result['content']}")