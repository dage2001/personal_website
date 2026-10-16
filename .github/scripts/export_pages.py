"""Export an already-built Jekyll site for GitHub Pages (Python stdlib only)."""
import argparse
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


def export(source, output, site_url):
    source, output = source.resolve(), output.resolve()
    if source == output or source in output.parents or output in source.parents:
        raise ValueError("Source and output must be separate directories")
    if not (source / "index.html").is_file():
        raise ValueError("Build the Jekyll site first; index.html is missing")
    if output.exists() and any(output.iterdir()):
        raise ValueError("Output must be empty; use a fresh directory")
    parsed = urlsplit(site_url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.query or parsed.fragment:
        raise ValueError("--url must be an HTTPS site URL without query or fragment")
    origin = f"{parsed.scheme}://{parsed.netloc}"
    prefix = parsed.path.rstrip("/")
    site_url = origin + prefix

    def url(value, absolute=False):
        if not value.startswith("/") or value.startswith("//"):
            return value
        path = value if prefix and (value == prefix or value.startswith(prefix + "/")) else prefix + value
        return (origin if absolute else "") + path

    def json_urls(value):
        if isinstance(value, dict):
            return {k: url(v, True) if k in ("url", "image", "@id") and isinstance(v, str)
                    else json_urls(v) for k, v in value.items()}
        if isinstance(value, list):
            return [json_urls(v) for v in value]
        return value

    class Page(HTMLParser):
        def __init__(self, text):
            super().__init__(convert_charrefs=False)
            self.text = text
            self.lines = [0]
            self.lines.extend(m.end() for m in re.finditer("\n", text))
            self.edits = []
            self.json_script = False

        def handle_starttag(self, tag, attrs):
            data = dict(attrs)
            self.json_script = tag == "script" and data.get("type") == "application/ld+json"
            raw = self.get_starttag_text()
            absolute = tag == "meta" or (tag == "link" and data.get("rel") in ("canonical", "alternate"))
            pattern = r'''(\b(?:href|src|poster|action|content|data-pdf-url)\s*=\s*)(["'])(/[^"']*)\2'''
            updated = re.sub(pattern, lambda m: m[1] + m[2] + url(m[3], absolute) + m[2], raw)
            if updated != raw:
                line, column = self.getpos()
                start = self.lines[line - 1] + column
                self.edits.append((start, start + len(raw), updated))

        handle_startendtag = handle_starttag

        def handle_data(self, data):
            if self.json_script:
                updated = json.dumps(json_urls(json.loads(data)), ensure_ascii=False)
                line, column = self.getpos()
                start = self.lines[line - 1] + column
                self.edits.append((start, start + len(data), updated))

        def handle_endtag(self, tag):
            if tag == "script":
                self.json_script = False

        def result(self):
            self.feed(self.text)
            text = self.text
            for start, end, replacement in reversed(self.edits):
                text = text[:start] + replacement + text[end:]
            return text

    count = 0
    for file in source.rglob("*"):
        relative = file.relative_to(source)
        if not file.is_file() or any(p.startswith(".") for p in relative.parts) or file.name == "CNAME":
            continue
        target = output / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if file.suffix == ".html":
            target.write_text(Page(file.read_text(encoding="utf-8")).result(), encoding="utf-8")
        elif file.suffix == ".xml":
            text = file.read_text(encoding="utf-8")
            text = re.sub(r'(<(?:loc|link|guid)\b[^>]*>)(/[^<]*)(</)',
                          lambda m: m[1] + url(m[2], True) + m[3], text)
            text = re.sub(r'(\bhref=")(/[^"<>]*)(")',
                          lambda m: m[1] + url(m[2], True) + m[3], text)
            target.write_text(text, encoding="utf-8")
        elif file.name == "robots.txt":
            target.write_text(f"User-agent: *\nAllow: /\n\nSitemap: {site_url}/sitemap.xml\n", encoding="utf-8")
        else:
            shutil.copy2(file, target)
        count += 1
    (output / ".nojekyll").touch()
    # Branch-based Pages publishing needs this on every export, otherwise the
    # next artifact sync would remove the domain binding.
    if not prefix and parsed.hostname and not parsed.hostname.endswith(".github.io"):
        (output / "CNAME").write_text(parsed.hostname + "\n", encoding="ascii")
    print(f"Exported {count} files to {output} for {site_url}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("_site"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--url", default="https://jordan-wang.win")
    args = parser.parse_args()
    export(args.source, args.output, args.url)
