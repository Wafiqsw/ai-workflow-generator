import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from .agent_tools import tools

# Load environment variables from .env file
load_dotenv()

def get_llm(provider: str = "openrouter"):
    """
    Factory function to get the LLM for a specific provider.
    """
    if provider == "groq":
        return ChatOpenAI(
            model="qwen/qwen3-32b", # ID suggested by user's snippet
            openai_api_key=os.getenv("GROQ_API_KEY"),
            openai_api_base="https://api.groq.com/openai/v1",
            temperature=0.6 
        )
    else:
        # Default to OpenRouter
        return ChatOpenAI(
            model="openrouter/free",
            openai_api_key=os.getenv("OPEN_ROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0
        )

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate

def get_agent_executor(provider: str = "openrouter"):
    """
    Initialize and return the LangChain Agent Executor for a specific provider.
    """
    llm = get_llm(provider)
    if hasattr(llm, 'request_timeout'):
        llm.request_timeout = 60 # Increase timeout

    # ReAct prompt template - Streamlined to stay under TPM limits
    template = """You are a 'Workflow Architect'. Build and PERSIST functional workflows using these tools:
{tools}

Format:
Thought: Do I need a tool? Yes
Action: [{tool_names}]
Action Input: JSON string (keys: "workflow_name", "steps_json", "dag_python")
Observation: result
...
Thought: I know the final answer
Final Answer: [FEASIBILITY_REPORT: is_feasible=True/False, score=0.X, reason='...'] then steps and folder ID.

CRITICAL:
1. Use 'save_workflow_files' for every feasible workflow.
2. Provide ACTUAL APIs and functional DAG code. NO placeholders.
3. Input to 'save_workflow_files' MUST be a single JSON string.
4. Final Answer MUST include the folder ID from the Observation.

Begin!
Request: {input}
Thought: {agent_scratchpad}"""

    prompt = PromptTemplate.from_template(template)
    
    agent = create_react_agent(llm, tools, prompt)
    
    return AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=True, 
        handle_parsing_errors=True,
        max_iterations=10,
        early_stopping_method="generate"
    )

def run_agent_query(user_input: str) -> str:
    """
    Invoke the LangChain agent with a user query.
    Tries Groq (Qwen) first for reliability, falls back to OpenRouter.
    """
    # 1. Try Primary (Groq/Qwen) - Highly reliable for tool use
    try:
        print(f"🚀 [AI] Trying Primary Provider (Groq/Qwen)...")
        if not os.getenv("GROQ_API_KEY"):
             raise Exception("Missing GROQ_API_KEY")

        executor = get_agent_executor(provider="groq")
        response = executor.invoke({"input": user_input})
        output = response.get("output", "").strip()
        
        # Safety Check: If it claims to be saved but NO tool was called (no wf_ in output), it's a hallucination
        if "wf_" not in output and "[FEASIBILITY_REPORT: is_feasible=True" in output:
            print("⚠️ [AI] Primary model hallucinated success without tool call. Retrying with fallback...")
            raise Exception("Hallucination detected")

        if output:
            print(f"✅ [AI] Success with Groq/Qwen.")
            return output
            
    except Exception as e:
        print(f"⚠️ [AI] Primary Provider failed: {str(e)}")
        
    # 2. Try Fallback (OpenRouter)
    try:
        print(f"🔄 [AI] Falling back to OpenRouter...")
        executor = get_agent_executor(provider="openrouter")
        response = executor.invoke({"input": user_input})
        output = response.get("output", "").strip()
        
        if output:
            print(f"✅ [AI] Success with OpenRouter fallback.")
            return output
            
    except Exception as e:
        print(f"❌ [AI] Fallback also failed: {e}")
        return f"❌ Both AI providers failed. Last Error: {str(e)}"

    return "Sorry, I couldn't generate a proper response even with fallback. Could you try rephrasing it?"

# For backward compatibility or simple chat if needed
def chat_with_openrouter(messages: List[Dict[str, Any]], **kwargs) -> Dict[str, Any]:
    # This is a fallback to the old functional style if needed, 
    # but we transition to the agent for complex tasks.
    # For now, let's just make it call the agent for the last user message if it's a list
    if messages and messages[-1]["role"] == "user":
        content = run_agent_query(messages[-1]["content"])
        return {"content": content, "role": "assistant"}
    return {"content": "I can only process user messages for now.", "role": "assistant"}

# For standalone testing
if __name__ == "__main__":
    print("🚀 Testing LangChain Agent...")
    query = "Find an API that handles user login."
    result = run_agent_query(query)
    print(f"\n🤖 Agent Response:\n{result}")