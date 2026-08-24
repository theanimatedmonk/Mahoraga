#!/usr/bin/env python3
"""Capture website screenshots + sitemap via Playwright.

Usage:
  python3 capture_url.py https://example.com
  python3 capture_url.py https://example.com --max-pages 20 --full-page
  python3 capture_url.py https://example.com --out ./captures/my-site --mobile
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright

UA = "Mozilla/5.0 (compatible; MahoragaCapture/1.0; +https://github.com/theanimatedmonk/Mahoraga)"


def slugify_host(url: str) -> str:
    host = urlparse(url).netloc.lower()
    host = host.removeprefix("www.")
    return re.sub(r"[^a-z0-9.-]+", "-", host) or "site"


def normalize_url(url: str) -> str:
    url = url.strip()
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    parsed = urlparse(url)
    # Drop fragment; keep path/query
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path or "/", parsed.params, parsed.query, ""))


def same_origin(a: str, b: str) -> bool:
    pa, pb = urlparse(a), urlparse(b)
    return pa.scheme == pb.scheme and pa.netloc == pb.netloc


def fetch_text(url: str, timeout: int = 20) -> str | None:
    try:
        req = Request(url, headers={"User-Agent": UA})
        with urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            charset = resp.headers.get_content_charset() or "utf-8"
            return raw.decode(charset, errors="replace")
    except Exception:
        return None


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def parse_sitemap_xml(xml_text: str, base_url: str) -> tuple[list[str], list[str]]:
    """Return (page_urls, nested_sitemap_urls)."""
    pages: list[str] = []
    nested: list[str] = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return pages, nested

    for parent in root.iter():
        p_name = local_name(parent.tag)
        if p_name not in ("url", "sitemap"):
            continue
        for child in list(parent):
            if local_name(child.tag) == "loc" and child.text:
                loc = urljoin(base_url, child.text.strip())
                if p_name == "sitemap":
                    nested.append(loc)
                else:
                    pages.append(loc)
    return pages, nested


def discover_sitemap_urls(seed: str, max_sitemaps: int = 20) -> tuple[list[str], list[str]]:
    """Discover page URLs from robots.txt + sitemap.xml. Returns (pages, sources)."""
    origin = f"{urlparse(seed).scheme}://{urlparse(seed).netloc}"
    sources: list[str] = []
    sitemap_queue: list[str] = []
    pages: list[str] = []
    seen_sitemaps: set[str] = set()

    robots = fetch_text(urljoin(origin, "/robots.txt"))
    if robots:
        sources.append(urljoin(origin, "/robots.txt"))
        for line in robots.splitlines():
            if line.lower().startswith("sitemap:"):
                sm = line.split(":", 1)[1].strip()
                if sm:
                    sitemap_queue.append(sm)

    for candidate in ("/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"):
        sitemap_queue.append(urljoin(origin, candidate))

    while sitemap_queue and len(seen_sitemaps) < max_sitemaps:
        sm_url = sitemap_queue.pop(0)
        if sm_url in seen_sitemaps:
            continue
        seen_sitemaps.add(sm_url)
        text = fetch_text(sm_url)
        if not text or ("<urlset" not in text and "<sitemapindex" not in text):
            continue
        sources.append(sm_url)
        page_urls, nested = parse_sitemap_xml(text, sm_url)
        for u in page_urls:
            if same_origin(origin, u):
                pages.append(u)
        for n in nested:
            if n not in seen_sitemaps:
                sitemap_queue.append(n)

    # Dedupe preserve order
    pages = list(dict.fromkeys(pages))
    sources = list(dict.fromkeys(sources))
    return pages, sources


def crawl_links(page, seed: str, max_pages: int) -> list[str]:
    """Shallow same-origin link harvest from the loaded page."""
    hrefs = page.eval_on_selector_all(
        "a[href]",
        """els => els.map(a => a.href).filter(Boolean)""",
    )
    out: list[str] = []
    seen = {normalize_url(seed)}
    for href in hrefs:
        try:
            u = normalize_url(href)
        except Exception:
            continue
        if not same_origin(seed, u):
            continue
        if u in seen:
            continue
        # Skip common non-page targets
        path = urlparse(u).path.lower()
        if any(path.endswith(ext) for ext in (".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".zip", ".mp4")):
            continue
        seen.add(u)
        out.append(u)
        if len(out) >= max_pages:
            break
    return out


def safe_filename(url: str, index: int) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/") or "home"
    path = re.sub(r"[^a-zA-Z0-9._-]+", "-", path)[:80].strip("-") or "page"
    query = re.sub(r"[^a-zA-Z0-9._-]+", "-", parsed.query)[:40].strip("-")
    name = f"{index:02d}-{path}"
    if query:
        name += f"--{query}"
    return name + ".png"


def capture(
    url: str,
    out_dir: Path,
    max_pages: int = 12,
    full_page: bool = True,
    mobile: bool = False,
    width: int = 1440,
    height: int = 900,
    wait_ms: int = 1500,
) -> dict:
    seed = normalize_url(url)
    out_dir.mkdir(parents=True, exist_ok=True)
    shots_dir = out_dir / "screenshots"
    shots_dir.mkdir(exist_ok=True)

    sitemap_pages, sitemap_sources = discover_sitemap_urls(seed)
    discovery = "sitemap" if sitemap_pages else "crawl"

    pages: list[str] = []
    if sitemap_pages:
        # Prefer seed first, then sitemap order
        pages = [seed] + [p for p in sitemap_pages if normalize_url(p) != seed]
    else:
        pages = [seed]

    pages = list(dict.fromkeys(normalize_url(p) for p in pages))[: max(1, max_pages)]

    screenshots: list[dict] = []
    crawl_extra: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        if mobile:
            device = p.devices["iPhone 14"]
            context = browser.new_context(**device)
        else:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                user_agent=UA,
                device_scale_factor=2,
            )
        page = context.new_page()

        for i, page_url in enumerate(pages):
            entry = {
                "url": page_url,
                "index": i,
                "ok": False,
                "title": None,
                "path": None,
                "error": None,
            }
            try:
                page.goto(page_url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(wait_ms)
                title = page.title()
                fname = safe_filename(page_url, i)
                fpath = shots_dir / fname
                page.screenshot(path=str(fpath), full_page=full_page)
                entry.update(ok=True, title=title, path=str(fpath.relative_to(out_dir)))

                if discovery == "crawl" and i == 0 and max_pages > 1:
                    crawl_extra = crawl_links(page, seed, max_pages - 1)
                    # Extend pages list in-place for remaining iterations
                    for extra in crawl_extra:
                        if extra not in pages and len(pages) < max_pages:
                            pages.append(extra)
            except Exception as e:
                entry["error"] = str(e)
            screenshots.append(entry)

        browser.close()

    all_urls = list(dict.fromkeys(sitemap_pages or (pages + crawl_extra)))
    if seed not in all_urls:
        all_urls.insert(0, seed)

    manifest = {
        "seed": seed,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "discovery": discovery,
        "sitemap_sources": sitemap_sources,
        "viewport": "mobile" if mobile else {"width": width, "height": height},
        "full_page": full_page,
        "max_pages": max_pages,
        "url_count": len(all_urls),
        "screenshots": screenshots,
        "urls": all_urls,
    }

    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (out_dir / "sitemap.json").write_text(
        json.dumps({"seed": seed, "sources": sitemap_sources, "urls": all_urls}, indent=2),
        encoding="utf-8",
    )

    md_lines = [
        f"# Sitemap — {urlparse(seed).netloc}",
        "",
        f"- Seed: {seed}",
        f"- Captured: {manifest['captured_at']}",
        f"- Discovery: `{discovery}`",
        f"- URLs: {len(all_urls)}",
        f"- Screenshots: {sum(1 for s in screenshots if s['ok'])}/{len(screenshots)}",
        "",
        "## URLs",
        "",
    ]
    for u in all_urls:
        md_lines.append(f"- {u}")
    md_lines += ["", "## Screenshots", ""]
    for s in screenshots:
        status = "ok" if s["ok"] else f"fail: {s.get('error')}"
        md_lines.append(f"- `{s.get('path') or '—'}` — {s['url']} ({status})")
    (out_dir / "sitemap.md").write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    # Print machine-readable summary for the agent
    print(json.dumps({
        "ok": True,
        "out_dir": str(out_dir),
        "seed": seed,
        "discovery": discovery,
        "url_count": len(all_urls),
        "screenshot_ok": sum(1 for s in screenshots if s["ok"]),
        "screenshot_fail": sum(1 for s in screenshots if not s["ok"]),
        "manifest": str(out_dir / "manifest.json"),
        "sitemap_md": str(out_dir / "sitemap.md"),
    }, indent=2))
    return manifest


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Capture screenshots + sitemap for a URL")
    parser.add_argument("url", help="Website URL (or bare domain)")
    parser.add_argument("--out", help="Output directory (default: captures/<host>)")
    parser.add_argument("--max-pages", type=int, default=12, help="Max pages to screenshot (default 12)")
    parser.add_argument("--full-page", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--mobile", action="store_true", help="iPhone 14 viewport")
    parser.add_argument("--width", type=int, default=1440)
    parser.add_argument("--height", type=int, default=900)
    parser.add_argument("--wait-ms", type=int, default=1500, help="Wait after load before screenshot")
    args = parser.parse_args(list(argv) if argv is not None else None)

    seed = normalize_url(args.url)
    out = Path(args.out) if args.out else Path("captures") / slugify_host(seed)

    try:
        capture(
            seed,
            out_dir=out,
            max_pages=args.max_pages,
            full_page=args.full_page,
            mobile=args.mobile,
            width=args.width,
            height=args.height,
            wait_ms=args.wait_ms,
        )
        return 0
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
