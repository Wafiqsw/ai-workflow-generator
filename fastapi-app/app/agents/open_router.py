import os
from dotenv import load_dotenv
from typing import List, Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from .agent_tools import tools

load_dotenv()

def get_llm():
    """Get the Gemini LLM instance."""
    return ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.6,
    )

def get_agent_executor():
    """Initialize and return the LangChain Agent Executor."""
    llm = get_llm()

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
        early_stopping_method="generate",
    )

def run_agent_query(user_input: str) -> str:
    """Invoke the LangChain agent with a user query using Gemini."""
    try:
        print("🚀 [AI] Calling Gemini (gemini-3-flash-preview)...")
        if not os.getenv("GOOGLE_API_KEY"):
            raise Exception("Missing GOOGLE_API_KEY")

        executor = get_agent_executor()
        response = executor.invoke({"input": user_input})
        output = response.get("output", "").strip()

        if output:
            print("✅ [AI] Success with Gemini.")
            return output

    except Exception as e:
        print(f"❌ [AI] Gemini call failed: {e}")
        return f"❌ AI provider failed. Error: {str(e)}"

    return "Sorry, I couldn't generate a proper response. Could you try rephrasing it?"

def chat_with_gemini(messages: List[Dict[str, Any]], **kwargs) -> Dict[str, Any]:
    """Simple chat interface that routes to the agent."""
    if messages and messages[-1]["role"] == "user":
        content = run_agent_query(messages[-1]["content"])
        return {"content": content, "role": "assistant"}
    return {"content": "I can only process user messages for now.", "role": "assistant"}

if __name__ == "__main__":
    print("🚀 Testing LangChain Agent with Gemini...")
    query = "Find an API that handles user login."
    result = run_agent_query(query)
    print(f"\n🤖 Agent Response:\n{result}")
