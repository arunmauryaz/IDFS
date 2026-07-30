import sys
import json
from loguru import logger
from datetime import datetime
from app.config import LOGS_DIR

# Remove default logger handler
logger.remove()

# Add Console Handler
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)

# Add File Handler
LOG_FILE = LOGS_DIR / "app.log"
logger.add(
    str(LOG_FILE),
    rotation="10 MB",
    retention="30 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
)

# Runtime buffer for live API log tailing
RUNTIME_LOG_BUFFER = []
MAX_BUFFER_SIZE = 500

def add_log_buffer(level: str, module: str, message: str, details: str = None):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "module": module,
        "message": message,
        "details": details
    }
    RUNTIME_LOG_BUFFER.insert(0, entry)
    if len(RUNTIME_LOG_BUFFER) > MAX_BUFFER_SIZE:
        RUNTIME_LOG_BUFFER.pop()

def get_recent_logs(limit: int = 100, level_filter: str = None):
    logs = RUNTIME_LOG_BUFFER
    if level_filter and level_filter.upper() != "ALL":
        logs = [l for l in logs if l["level"].upper() == level_filter.upper()]
    return logs[:limit]

def clear_logs_buffer():
    global RUNTIME_LOG_BUFFER
    RUNTIME_LOG_BUFFER = []
    # Clear file content if requested
    try:
        with open(LOG_FILE, "w") as f:
            f.truncate(0)
    except Exception:
        pass
