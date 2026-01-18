"""
Claude for Mayor - AI Political Transparency Hub Backend
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

app = FastAPI(title="Claude for Mayor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "claude_for_mayor")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
chats_collection = db["chats"]
fact_checks_collection = db["fact_checks"]
leaders_collection = db["political_leaders"]

# Pydantic Models
class ChatMessage(BaseModel):
    role: str
    content: str
    sources: List[str] = []
    timestamp: str = ""

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str
    sources: List[str] = []
    timestamp: str

class FactCheckRequest(BaseModel):
    claim: str
    source_type: str = "general"  # tweet, statement, article

class FactCheckResponse(BaseModel):
    claim: str
    verdict: str  # true, false, misleading, unverifiable
    explanation: str
    sources: List[str]
    confidence: float
    timestamp: str

class XPostAnalysisRequest(BaseModel):
    post_content: str
    author: Optional[str] = None

class LeaderUpdate(BaseModel):
    leader_name: str
    party: str
    position: str
    last_statement: str
    statement_date: str
    topic: str
    source: str

# System prompts
POLITICAL_ANALYST_PROMPT = """You are Claude for Mayor — a neutral, factual US political transparency AI assistant.

Your core principles:
1. NEUTRALITY: Present facts without partisan bias. Cover all political perspectives fairly.
2. ACCURACY: Always cite sources (bill numbers, dates, congress.gov links, FEC filings, official statements).
3. TRANSPARENCY: Be clear about what is verified fact vs. analysis vs. opinion.
4. ACCESSIBILITY: Make complex political information understandable to everyone.

When responding:
- Cite specific sources (Congress.gov, FEC.gov, official government sites, reputable news)
- Include relevant dates and bill/resolution numbers
- Present multiple perspectives when applicable
- Flag any uncertain or contested information
- Be concise but thorough

You have knowledge of:
- Congressional voting records and legislation
- Campaign finance data (FEC filings)
- Public statements by officials
- Government operations and procedures
- Current political events and issues

Format responses clearly with headers and bullet points when helpful."""

FACT_CHECKER_PROMPT = """You are an AI fact-checker for political claims. Your job is to evaluate claims and provide verdicts.

For each claim, you must:
1. Determine if the claim is TRUE, FALSE, MISLEADING, or UNVERIFIABLE
2. Provide a clear explanation with evidence
3. Cite your sources
4. Rate your confidence (0.0 to 1.0)

Response format (JSON):
{
    "verdict": "true/false/misleading/unverifiable",
    "explanation": "Detailed explanation with evidence",
    "sources": ["source1", "source2"],
    "confidence": 0.85
}

Be rigorous and non-partisan. Focus on verifiable facts, not opinions."""

X_POST_ANALYZER_PROMPT = """You are analyzing a post from X (formerly Twitter) about US politics.

Your task:
1. Identify any factual claims made
2. Note the political context and implications
3. Highlight any misleading framing or missing context
4. Identify the author's apparent stance/bias if detectable
5. Provide relevant background information

Be neutral and factual. Focus on informing citizens, not taking sides."""

LEADER_UPDATES_PROMPT = """You are providing updates on recent communications from US political leaders.

Based on your knowledge up to your training cutoff, provide information about:
- Recent public statements
- Policy positions
- Voting records
- Campaign activities
- Official communications

Focus on factual reporting. Include dates and sources where possible.
Format as clear, organized updates."""

# Helper functions
def get_claude_chat(session_id: str, system_prompt: str) -> LlmChat:
    """Initialize Claude chat with Emergent key"""
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=session_id,
        system_message=system_prompt
    )
    chat.with_model("anthropic", "claude-sonnet-4-20250514")
    return chat

def extract_sources(text: str) -> List[str]:
    """Extract likely sources from response text"""
    sources = []
    keywords = {
        'congress': 'Congress.gov',
        'fec': 'FEC.gov',
        'vote': 'Congressional Records',
        'bill': 'Congress.gov',
        'white house': 'WhiteHouse.gov',
        'senate': 'Senate.gov',
        'house': 'House.gov',
        'supreme court': 'SupremeCourt.gov',
        'federal register': 'FederalRegister.gov'
    }
    text_lower = text.lower()
    for keyword, source in keywords.items():
        if keyword in text_lower and source not in sources:
            sources.append(source)
    return sources if sources else ['Government Records']

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Claude for Mayor API", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_claude(request: ChatRequest):
    """Main chat endpoint for political questions"""
    try:
        chat = get_claude_chat(request.session_id, POLITICAL_ANALYST_PROMPT)
        user_msg = UserMessage(text=request.message)
        response = await chat.send_message(user_msg)
        
        timestamp = datetime.now(timezone.utc).isoformat()
        sources = extract_sources(response)
        
        # Store in database
        await chats_collection.insert_one({
            "session_id": request.session_id,
            "user_message": request.message,
            "assistant_response": response,
            "sources": sources,
            "timestamp": timestamp
        })
        
        return ChatResponse(
            role="assistant",
            content=response,
            sources=sources,
            timestamp=timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fact-check", response_model=FactCheckResponse)
async def fact_check_claim(request: FactCheckRequest):
    """Fact-check political claims"""
    try:
        session_id = f"factcheck-{uuid.uuid4().hex[:8]}"
        chat = get_claude_chat(session_id, FACT_CHECKER_PROMPT)
        
        prompt = f"""Fact-check this {request.source_type} claim:

"{request.claim}"

Respond with a JSON object containing verdict, explanation, sources, and confidence."""
        
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)
        
        # Parse response (Claude should return JSON)
        import json
        try:
            # Try to extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                result = json.loads(response[json_start:json_end])
            else:
                # Fallback parsing
                result = {
                    "verdict": "unverifiable",
                    "explanation": response,
                    "sources": ["Analysis pending verification"],
                    "confidence": 0.5
                }
        except json.JSONDecodeError:
            result = {
                "verdict": "unverifiable",
                "explanation": response,
                "sources": ["Analysis pending verification"],
                "confidence": 0.5
            }
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store fact check
        await fact_checks_collection.insert_one({
            "claim": request.claim,
            "source_type": request.source_type,
            "verdict": result.get("verdict", "unverifiable"),
            "explanation": result.get("explanation", ""),
            "sources": result.get("sources", []),
            "confidence": result.get("confidence", 0.5),
            "timestamp": timestamp
        })
        
        return FactCheckResponse(
            claim=request.claim,
            verdict=result.get("verdict", "unverifiable"),
            explanation=result.get("explanation", response),
            sources=result.get("sources", ["Analysis required"]),
            confidence=result.get("confidence", 0.5),
            timestamp=timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-x-post")
async def analyze_x_post(request: XPostAnalysisRequest):
    """Analyze X (Twitter) posts for political content"""
    try:
        session_id = f"xpost-{uuid.uuid4().hex[:8]}"
        chat = get_claude_chat(session_id, X_POST_ANALYZER_PROMPT)
        
        prompt = f"""Analyze this X post:

Author: {request.author or 'Unknown'}
Content: "{request.post_content}"

Provide:
1. Summary of claims made
2. Factual accuracy assessment
3. Political context
4. Any missing context or potential bias"""
        
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)
        
        return {
            "analysis": response,
            "post_content": request.post_content,
            "author": request.author,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leader-updates")
async def get_leader_updates(party: Optional[str] = None):
    """Get recent updates on political leaders"""
    try:
        session_id = f"leaders-{uuid.uuid4().hex[:8]}"
        chat = get_claude_chat(session_id, LEADER_UPDATES_PROMPT)
        
        if party:
            prompt = f"Provide recent updates on key {party} political leaders in the US. Include their recent statements, positions, and activities."
        else:
            prompt = "Provide recent updates on key political leaders from both major US parties. Include recent statements, positions, and activities from leaders like the President, congressional leadership, and prominent figures."
        
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)
        
        return {
            "updates": response,
            "party_filter": party,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/political-calendar")
async def get_political_calendar():
    """Get upcoming political events and dates"""
    try:
        session_id = f"calendar-{uuid.uuid4().hex[:8]}"
        chat = get_claude_chat(session_id, """You are providing information about upcoming US political events and important dates.

Include:
- Upcoming elections and primaries
- Congressional session dates
- Supreme Court calendar
- Major political events
- Filing deadlines
- State-level important dates

Be specific with dates and locations where known.""")
        
        prompt = "What are the key upcoming political events, elections, and important dates for US politics in 2026? Include federal, state, and local events where significant."
        
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)
        
        return {
            "calendar": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recent-fact-checks")
async def get_recent_fact_checks(limit: int = 10):
    """Get recent fact checks from database"""
    try:
        cursor = fact_checks_collection.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit)
        
        results = await cursor.to_list(length=limit)
        return {"fact_checks": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat-history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        cursor = chats_collection.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1)
        
        results = await cursor.to_list(length=100)
        return {"history": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
