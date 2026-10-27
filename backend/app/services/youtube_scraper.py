import urllib.request
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Tuple
from fastapi import HTTPException


def _parse_subscriber_text(text: str) -> int:
    if not text:
        return 0
    t = text.lower().replace("\xa0", " ").replace(",", ".")
    m = re.search(r'([\d.]+)\s*(millones|millón|million|m|mil|k|b)?\s*(de\s*)?(suscriptores|subscribers)', t)
    if not m:
        return 0
    val = float(m.group(1))
    unit = (m.group(2) or '').strip()
    if unit in ('millones', 'millón', 'million', 'm'):
        val *= 1_000_000
    elif unit in ('mil', 'k'):
        val *= 1_000
    elif unit in ('b', 'billones', 'billion'):
        val *= 1_000_000_000
    return int(val)


def extract_youtube_deep(handle_or_id: str) -> Tuple[List[Dict], int, str]:
    raw = handle_or_id.strip().lstrip("@")
    if not raw:
        raise HTTPException(status_code=400, detail="Debes ingresar el canal de YouTube (ej: @NASA o su ID).")

    channel_id = raw if raw.startswith("UC") and len(raw) == 24 else None
    followers_count = 0

    if not channel_id:
        url = f"https://www.youtube.com/@{raw}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                m = re.search(r'\"externalId\":\"(UC[a-zA-Z0-9_-]{22})\"', html) or re.search(r'channel_id=(UC[a-zA-Z0-9_-]{22})', html)
                if m:
                    channel_id = m.group(1)
                
                # Priority 1: High precision accessibility label of the channel header
                for m_sub in re.finditer(r'"accessibilityLabel":"([^"]*(?:suscriptores|subscribers)[^"]*)"', html, re.IGNORECASE):
                    parsed_sub = _parse_subscriber_text(m_sub.group(1))
                    if parsed_sub > 0:
                        followers_count = parsed_sub
                        break

                # Priority 2: Subtitle or content metadata
                if not followers_count:
                    for m_sub in re.finditer(r'"content":"([^"]*(?:suscriptores|subscribers)[^"]*)"', html, re.IGNORECASE):
                        parsed_sub = _parse_subscriber_text(m_sub.group(1))
                        if parsed_sub > 0:
                            followers_count = parsed_sub
                            break

                # Priority 3: Fallback subscriberCountText
                if not followers_count:
                    sub_match = re.search(r'\"subscriberCountText\":\{\"accessibility\":\{\"accessibilityData\":\{\"label\":\"([^\"]+)\"\}\}', html) or re.search(r'\"subscriberCountText\":\{\"simpleText\":\"([^\"]+)\"\}', html)
                    if sub_match:
                        followers_count = _parse_subscriber_text(sub_match.group(1))
        except Exception:
            pass

    if not channel_id:
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo encontrar el canal de YouTube para '@{raw}'. Asegúrate de que el nombre o handle sea correcto."
        )

    # Fetch public RSS feed
    rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    req_rss = urllib.request.Request(rss_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req_rss, timeout=10) as r:
            xml_data = r.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al leer el canal de YouTube: {str(e)}"
        )

    # Parse RSS XML
    try:
        root = ET.fromstring(xml_data)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error interpretando los datos del canal: {str(e)}"
        )

    # Namespaces used in YouTube RSS
    ns = {
        'atom': 'http://www.w3.org/2005/Atom',
        'yt': 'http://www.youtube.com/xml/schemas/2015',
        'media': 'http://search.yahoo.com/mrss/'
    }

    posts: List[Dict] = []
    
    # Extract entries (videos)
    entries = root.findall('atom:entry', ns)
    for entry in entries:
        vid_id_elem = entry.find('yt:videoId', ns)
        vid_id = vid_id_elem.text if vid_id_elem is not None else ""
        if not vid_id:
            continue

        title_elem = entry.find('atom:title', ns)
        title = title_elem.text if title_elem is not None else "Video sin título"

        desc_elem = entry.find('media:group/media:description', ns)
        desc = desc_elem.text if desc_elem is not None else ""

        content = f"{title}\n\n{desc[:300]}...".strip() if desc else title

        link_elem = entry.find('atom:link', ns)
        permalink = link_elem.attrib.get('href', f"https://www.youtube.com/watch?v={vid_id}") if link_elem is not None else f"https://www.youtube.com/watch?v={vid_id}"

        pub_elem = entry.find('atom:published', ns)
        published_at = pub_elem.text if pub_elem is not None else datetime.now(timezone.utc).isoformat()

        # Community metrics (views, stars)
        views_elem = entry.find('media:group/media:community/media:statistics', ns)
        views = int(views_elem.attrib.get('views', 0)) if views_elem is not None else 0

        star_elem = entry.find('media:group/media:community/media:starRating', ns)
        likes = int(star_elem.attrib.get('count', 0)) if star_elem is not None else 0

        # Comments and shares are not in RSS; estimate typical proportions
        comments = int(likes * 0.08) if likes > 0 else int(views * 0.005)
        shares = int(likes * 0.04) if likes > 0 else int(views * 0.002)

        reach = views if views > 0 else max((likes + comments) * 12, 100)
        impressions = int(reach * 1.35)

        posts.append({
            "external_id": f"yt_{vid_id}",
            "permalink": permalink,
            "content": content,
            "media_type": "video",
            "published_at": published_at,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "reach": reach,
            "impressions": impressions,
        })

    return posts, followers_count, "direct_youtube_rss_scraper"
