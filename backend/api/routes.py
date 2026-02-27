"""FastAPI routes for the community aggregator API."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
from backend.database.database import get_db
from backend.database.models import Community, ScrapingLog
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["communities"])


class CommunityResponse(BaseModel):
    """Response model for community data."""
    id: int
    name: str
    description: Optional[str]
    platform: str
    url: Optional[str]
    invite_link: Optional[str]
    member_count: int
    categories: List[str]
    image_url: Optional[str]
    language: str
    
    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    """Response model for platform statistics."""
    total_communities: int
    platforms: dict
    top_categories: List[dict]


@router.get("/communities", response_model=List[CommunityResponse])
async def get_communities(
    search: Optional[str] = Query(None, description="Search query for name or description"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_members: Optional[int] = Query(None, description="Minimum member count"),
    max_members: Optional[int] = Query(None, description="Maximum member count"),
    sort_by: str = Query("member_count", description="Sort by: member_count, name, created_at"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    limit: int = Query(50, le=100, description="Maximum results to return"),
    offset: int = Query(0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get communities with optional filtering and sorting.
    """
    query = select(Community)
    
    # Apply filters
    if search:
        search_filter = or_(
            Community.name.ilike(f"%{search}%"),
            Community.description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    if platform:
        query = query.where(Community.platform == platform)
    
    if category:
        # SQLite JSON filtering
        query = query.where(Community.categories.contains(category))
    
    if min_members is not None:
        query = query.where(Community.member_count >= min_members)
    
    if max_members is not None:
        query = query.where(Community.member_count <= max_members)
    
    # Apply sorting
    sort_column = getattr(Community, sort_by, Community.member_count)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    communities = result.scalars().all()
    
    return communities


@router.get("/communities/{community_id}", response_model=CommunityResponse)
async def get_community(
    community_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific community by ID."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()
    
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    return community


@router.get("/platforms")
async def get_platforms(db: AsyncSession = Depends(get_db)):
    """Get list of available platforms with counts."""
    result = await db.execute(
        select(
            Community.platform,
            func.count(Community.id).label('count')
        ).group_by(Community.platform)
    )
    
    platforms = {}
    for row in result:
        platforms[row.platform] = row.count
    
    return platforms


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get list of all categories."""
    result = await db.execute(select(Community.categories))
    
    all_categories = set()
    for row in result:
        if row[0]:  # categories is a list
            all_categories.update(row[0])
    
    return sorted(list(all_categories))


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get platform statistics."""
    # Total communities
    total_result = await db.execute(select(func.count(Community.id)))
    total = total_result.scalar()
    
    # Communities per platform
    platform_result = await db.execute(
        select(
            Community.platform,
            func.count(Community.id).label('count')
        ).group_by(Community.platform)
    )
    
    platforms = {}
    for row in platform_result:
        platforms[row.platform] = row.count
    
    # Top categories (this is simplified - would need more complex query for accurate counts)
    category_result = await db.execute(select(Community.categories))
    category_counts = {}
    for row in category_result:
        if row[0]:
            for cat in row[0]:
                category_counts[cat] = category_counts.get(cat, 0) + 1
    
    top_categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    return {
        "total_communities": total,
        "platforms": platforms,
        "top_categories": top_categories
    }


@router.get("/scraping-logs")
async def get_scraping_logs(
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get recent scraping logs."""
    result = await db.execute(
        select(ScrapingLog)
        .order_by(ScrapingLog.started_at.desc())
        .limit(limit)
    )
    
    logs = result.scalars().all()
    
    return [
        {
            "id": log.id,
            "platform": log.platform,
            "source": log.source,
            "status": log.status,
            "communities_found": log.communities_found,
            "communities_added": log.communities_added,
            "communities_updated": log.communities_updated,
            "started_at": log.started_at.isoformat() if log.started_at else None,
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "error_message": log.error_message
        }
        for log in logs
    ]
