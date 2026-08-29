from __future__ import annotations

import os
from urllib.parse import urlparse


def validate_public_trendyol_url(url: str) -> str:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    if parsed.scheme != "https":
        raise ValueError("Only HTTPS URLs are allowed")
    if hostname != "trendyol.com" and not hostname.endswith(".trendyol.com"):
        raise ValueError("Only Trendyol-owned public hosts are allowed")
    if parsed.username or parsed.password:
        raise ValueError("Credential-bearing URLs are not allowed")
    return url


async def collect_public_pages(urls: list[str]) -> list[dict[str, str | None]]:
    if os.environ.get("CLINIGA_ALLOW_PUBLIC_CRAWL", "").lower() != "true":
        raise PermissionError("Public crawling is disabled; use the official seller API by default")
    if not 1 <= len(urls) <= 10:
        raise ValueError("One to ten URLs are allowed per run")
    safe_urls = [validate_public_trendyol_url(url) for url in urls]

    from crawlee import ConcurrencySettings
    from crawlee.crawlers import BeautifulSoupCrawler, BeautifulSoupCrawlingContext

    results: list[dict[str, str | None]] = []
    crawler = BeautifulSoupCrawler(
        max_requests_per_crawl=len(safe_urls),
        respect_robots_txt_file=True,
        concurrency_settings=ConcurrencySettings(
            min_concurrency=1,
            max_concurrency=1,
            max_tasks_per_minute=10,
        ),
    )

    @crawler.router.default_handler
    async def request_handler(context: BeautifulSoupCrawlingContext) -> None:
        description = context.soup.find("meta", attrs={"name": "description"})
        results.append(
            {
                "url": context.request.url,
                "title": context.soup.title.string.strip() if context.soup.title else None,
                "description": description.get("content") if description else None,
            }
        )

    await crawler.run(safe_urls)
    return results
