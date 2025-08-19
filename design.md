# System Design - abbhack

## Architecture
- **Frontend** → React (UI)
- **Backend** → FastAPI (Python)
- **Database** → PostgreSQL
- **Model** → ML pipeline (trained offline, served via API)

##  Data Flow
1. User uploads data (CSV/image/etc.) via frontend.
2. Backend (FastAPI) validates & stores input.
3. If ML required → call ML pipeline.
4. Store results in DB.
5. Return response to frontend.

##  With Docker
- `frontend/` → runs in its own container
- `backend/` → FastAPI in a container
- `db/` → PostgreSQL container
- Containers communicate via `docker-compose`
