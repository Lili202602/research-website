import json
import os
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF
import requests


ROOT = Path(__file__).resolve().parent
PDFS_TO_PROCESS_DIR = ROOT / "pdfs_to_process"
PUBLISHED_PDFS_DIR = ROOT / "pdfs"
POSTS_DIR = ROOT / "posts"
DATA_DIR = ROOT / "data"
ARTICLES_JSON_PATH = DATA_DIR / "articles.json"
PROCESSED_LEDGER_PATH = DATA_DIR / "processed_pdfs.json"
INDEX_HTML_PATH = ROOT / "index.html"
ARCHIVE_HTML_PATH = ROOT / "archive.html"


DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"


@dataclass
class ExtractedPost:
    title: str
    summary: str
    expert_commentary: str


def ensure_dirs() -> None:
    PDFS_TO_PROCESS_DIR.mkdir(parents=True, exist_ok=True)
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLISHED_PDFS_DIR.mkdir(parents=True, exist_ok=True)


def ensure_archive_html_exists() -> None:
    """
    如果 archive.html 不存在，则创建一个与首页风格一致、用于展示全部历史报告的页面。
    页面同样依赖 data/articles.json 与 script.js 进行渲染。
    """
    html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <title>行研精选 · 往期报告归档 | Lili's Supply Chain AI Lab</title>
    <link rel="stylesheet" href="style.css?v=20240321">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>">
</head>
<body>
    <div class="container">
        <header>
            <h1>📈 行研精选 · 往期报告</h1>
            <p class="subtitle">Lili's Supply Chain AI Lab · 历史报告归档</p>
            <div class="header-info">
                <span id="current-date"></span>
                <button onclick="window.location.href='index.html'">返回首页</button>
            </div>
        </header>

        <main>
            <section class="intro">
                <h2>📚 全部历史报告</h2>
                <p>这里展示所有已发布的研究报告，按时间倒序排列。建议结合行业节奏、技术变迁与供应链变化进行纵向对比阅读。</p>
            </section>

            <div id="articles-container">
                <p>正在加载历史报告...</p>
            </div>
        </main>

        <footer>
            <p>© <span id="current-year"></span> Lili's Supply Chain AI Lab · Research & Insights</p>
            <p class="disclaimer">内容仅供学习与研究参考，不构成任何投资、法律或合规建议。业务决策前请结合自身情况审慎评估。</p>
        </footer>
    </div>

    <script src="script.js?v=20240321"></script>
</body>
</html>
"""
    ARCHIVE_HTML_PATH.write_text(html, encoding="utf-8")


def read_pdf_text(pdf_path: Path, max_pages: int = 10, max_chars: int = 60_000) -> str:
    doc = fitz.open(pdf_path)
    parts: List[str] = []
    try:
        pages = min(len(doc), max_pages)
        for i in range(pages):
            text = doc.load_page(i).get_text("text")
            if text:
                parts.append(text)
            if sum(len(p) for p in parts) >= max_chars:
                break
    finally:
        doc.close()
    combined = "\n".join(parts).strip()
    if len(combined) > max_chars:
        combined = combined[:max_chars]
    return combined


def deepseek_extract_json(pdf_text: str, *, api_key: str) -> ExtractedPost:
    if not api_key:
        raise RuntimeError("缺少环境变量 DEEPSEEK_API_KEY")

    system = (
        "你是一名深度理解供应链管理、物流技术、全球贸易合规以及 AI 在供应链应用的资深供应链顾问。"
        "你将从用户提供的 PDF 文本中提取关键信息，并面向供应链从业者给出具有可操作性的专业点评，"
        "特别关注对供应链规划、采购策略、库存与产能布局、物流网络设计、风险管理和合规要求的影响。"
        "必须仅输出 JSON（不要输出多余文字），并确保字段齐全。"
    )

    user = (
        "请从下面的 PDF 文本中提取信息，并严格以 JSON 对象输出。\n\n"
        "要求：\n"
        "1) title：报告/文章标题（中文优先，尽量完整）\n"
        "2) summary：核心摘要（5-10 条要点，必须严格遵守以下格式）：\n"
        "   每条要点格式：【**总结词/短句**】：紧接着展开 1-2 句具体的细节描述。\n"
        "   示例：\n"
        "   【**物流降本**】：通过引入 AI 路径规划算法，预计可降低 15% 的末端配送成本。\n"
        "   【**合规风险**】：针对 2026 年新的贸易法案，报告提示了电子原件进口的准入限制。\n"
        "   注意：总结词必须用 **加粗标记** 包裹，每条要点独立一行，用换行分隔。\n"
        "3) expert_commentary：专家点评（资深供应链顾问视角，聚焦供应链管理、物流技术、贸易合规或 AI/数字化在供应链中的应用，"
        "结合报告结论说明对行业从业者在决策、运营优化和风险管理上的具体影响，并给出可执行建议，300-600 字）：\n"
        "   必须严格遵守以下格式：\n"
        "   每条洞察格式：【**总结词/短句**】：紧接着展开 1-2 句具体的细节描述。\n"
        "   示例：\n"
        "   【**物流降本**】：通过引入 AI 路径规划算法，预计可降低 15% 的末端配送成本。\n"
        "   【**合规风险**】：针对 2026 年新的贸易法案，报告提示了电子原件进口的准入限制。\n"
        "   注意：总结词必须用 **加粗标记** 包裹，每条洞察独立一段，用换行分隔。\n\n"
        "输出 JSON 示例：\n"
        "{\n"
        '  "title": "...",\n'
        '  "summary": "【**总结词1**】：描述1\\n【**总结词2**】：描述2\\n...",\n'
        '  "expert_commentary": "【**洞察1**】：描述1\\n\\n【**洞察2**】：描述2\\n\\n..."\n'
        "}\n\n"
        "PDF 文本如下（可能不完整）：\n"
        "-----\n"
        f"{pdf_text}\n"
        "-----\n"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload: Dict[str, Any] = {
        "model": DEEPSEEK_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        # 尽量强制 JSON 输出（DeepSeek 支持 OpenAI 兼容参数）
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "max_tokens": 1500,
    }

    resp = requests.post(DEEPSEEK_CHAT_COMPLETIONS_URL, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        raise RuntimeError(f"DeepSeek API 调用失败：HTTP {resp.status_code}\n{resp.text}")

    data = resp.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    if not content:
        raise RuntimeError(f"DeepSeek 返回为空：{json.dumps(data, ensure_ascii=False)[:2000]}")

    try:
        obj = json.loads(content)
    except json.JSONDecodeError:
        # 兜底：尝试截取第一个 JSON 对象
        m = re.search(r"\{[\s\S]*\}", content)
        if not m:
            raise
        obj = json.loads(m.group(0))

    title = str(obj.get("title", "")).strip()
    summary = str(obj.get("summary", "")).strip()
    expert = str(obj.get("expert_commentary", "")).strip()

    if not title or not summary or not expert:
        raise RuntimeError(f"DeepSeek JSON 字段缺失：{obj}")

    return ExtractedPost(title=title, summary=summary, expert_commentary=expert)


def slugify(text: str, max_len: int = 80) -> str:
    # 允许中文：用较安全的方式生成 slug（中文保留，空白转-，移除非法文件名字符）
    t = text.strip()
    t = re.sub(r"\s+", "-", t)
    t = re.sub(r"[\\/:*?\"<>|]+", "", t)
    t = re.sub(r"-{2,}", "-", t).strip("-")
    if not t:
        t = "post"
    if len(t) > max_len:
        t = t[:max_len].rstrip("-")
    return t


def human_file_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    for unit in ["KB", "MB", "GB", "TB"]:
        num_bytes /= 1024.0
        if num_bytes < 1024:
            return f"{num_bytes:.1f} {unit}"
    return f"{num_bytes:.1f} PB"


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate_post_html(post: ExtractedPost, *, post_title: str, date_str: str, pdf_rel_url: str) -> str:
    # 内嵌样式：即使单页也美观
    safe_title = html_escape(post_title)
    # 处理 Markdown 加粗标记，然后转行
    summary_html = nl2br(markdown_bold_to_html(post.summary))
    expert_html = nl2br(markdown_bold_to_html(post.expert_commentary))

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{safe_title} | Lili's Supply Chain AI Lab</title>
  <style>
    :root {{
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #1f2d3d;
      --muted: #6b7a90;
      --primary: #2d7ff9;
      --border: #e8eef7;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }}
    .wrap {{
      max-width: 960px;
      margin: 0 auto;
      padding: 28px 18px 60px;
    }}
    .topbar {{
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }}
    .crumb a {{
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }}
    .crumb a:hover {{ text-decoration: underline; }}
    .meta {{
      color: var(--muted);
      font-size: 14px;
    }}
    .card {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 10px 28px rgba(17, 38, 146, 0.08);
      padding: 22px 22px;
    }}
    h1 {{
      font-size: 28px;
      margin: 6px 0 8px;
      letter-spacing: 0.2px;
    }}
    .sub {{
      color: var(--muted);
      margin-bottom: 18px;
    }}
    .pill {{
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(45, 127, 249, 0.10);
      color: var(--primary);
      font-weight: 700;
      font-size: 12px;
      margin-right: 8px;
    }}
    .section {{
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px dashed var(--border);
    }}
    .section h2 {{
      font-size: 18px;
      margin: 0 0 10px;
    }}
    .box {{
      background: #f8fbff;
      border: 1px solid #e7f0ff;
      border-radius: 12px;
      padding: 14px 14px;
      white-space: normal;
    }}
    .actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 18px;
    }}
    .btn {{
      display: inline-block;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      border: 1px solid var(--border);
      background: #fff;
      color: var(--text);
    }}
    .btn.primary {{
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }}
    .btn:hover {{ transform: translateY(-1px); }}
    .footer {{
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="crumb">
        <a href="../index.html">← 返回首页</a>
      </div>
      <div class="meta">发布于 {html_escape(date_str)}</div>
    </div>

    <div class="card">
      <div class="sub">
        <span class="pill">AI 摘要</span>
        <span class="pill">供应链视角</span>
      </div>
      <h1>{safe_title}</h1>
      <div class="sub">自动从 PDF 提取标题、核心摘要与专家点评。</div>

      <div class="actions">
        <a class="btn primary" href="../{html_escape(pdf_rel_url)}" target="_blank" rel="noopener noreferrer">下载原始 PDF</a>
        <a class="btn" href="../index.html">查看首页文章列表</a>
      </div>

      <div class="section">
        <h2>🎯 核心摘要</h2>
        <div class="box">{summary_html}</div>
      </div>

      <div class="section">
        <h2>💬 专家点评（供应链从业者视角）</h2>
        <div class="box">{expert_html}</div>
      </div>

      <div class="footer">
        <div>© {datetime.now().year} Lili's Supply Chain AI Lab</div>
        <div>免责声明：内容仅供学习参考，不构成任何投资或商业建议。</div>
      </div>
    </div>
  </div>
</body>
</html>
"""


def html_escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def nl2br(s: str) -> str:
    return "<br/>".join(s.splitlines())


def update_latest_post_block(index_html: str, *, title: str, url: str, date_str: str) -> str:
    start = "<!-- AUTO-GENERATED LATEST POST LINK START -->"
    end = "<!-- AUTO-GENERATED LATEST POST LINK END -->"
    if start not in index_html or end not in index_html:
        raise RuntimeError("index.html 中找不到 AUTO-GENERATED LATEST POST LINK 标记块")

    block = f"""<!-- AUTO-GENERATED LATEST POST LINK START -->
            <div id="latest-post" style="margin: 0 0 18px 0;">
                <div style="background:#f8fbff;border:1px solid #e7f0ff;border-radius:10px;padding:14px 16px;">
                    <div style="font-weight:700;color:#2c3e50;margin-bottom:6px;">🆕 最新解读（自动发布）</div>
                    <div style="color:#7f8c8d;font-size:0.95rem;margin-bottom:10px;">{html_escape(date_str)}</div>
                    <a href="{html_escape(url)}" style="color:#3498db;font-weight:700;text-decoration:none;">{html_escape(title)}</a>
                </div>
            </div>
            <!-- AUTO-GENERATED LATEST POST LINK END -->"""

    pattern = re.compile(re.escape(start) + r"[\s\S]*?" + re.escape(end))
    return pattern.sub(block, index_html, count=1)


def upsert_article_entry(
    articles: List[Dict[str, Any]],
    *,
    title: str,
    date_str: str,
    core_viewpoints_html: str,
    comments_html: str,
    pdf_url: str,
    file_size: str,
    post_url: str,
) -> List[Dict[str, Any]]:
    # 新文章放最上方；id 自动递增
    max_id = 0
    for a in articles:
        try:
            max_id = max(max_id, int(a.get("id", 0)))
        except Exception:
            continue

    entry: Dict[str, Any] = {
        "id": max_id + 1,
        "title": title,
        "date": date_str,
        "coreViewpoints": core_viewpoints_html,
        "comments": comments_html,
        "pdfUrl": pdf_url,
        "fileSize": file_size,
        "postUrl": post_url,
        "summary": strip_html(core_viewpoints_html)[:280],
    }

    # 去重：若已有同标题且 pdfUrl 相同，则不重复插入
    for existing in articles:
        if str(existing.get("title", "")).strip() == title and str(existing.get("pdfUrl", "")).strip() == pdf_url:
            return articles

    return [entry] + articles


def strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def markdown_bold_to_html(text: str) -> str:
    """
    将 Markdown 格式的加粗 **文本** 转换为 HTML <strong>文本</strong>
    策略：先提取加粗内容并转义，替换为占位符，转义整行，再替换占位符为 <strong> 标签
    """
    # 使用占位符避免转义冲突
    placeholders = {}
    placeholder_counter = [0]
    
    def extract_bold(match):
        content = match.group(1)
        # 对加粗内容进行 HTML 转义
        escaped_content = html_escape(content)
        placeholder = f"__BOLD_PLACEHOLDER_{placeholder_counter[0]}__"
        placeholder_counter[0] += 1
        placeholders[placeholder] = escaped_content
        return placeholder
    
    # 匹配 **文本** 模式（非贪婪，避免匹配嵌套）
    pattern = r'\*\*([^*]+?)\*\*'
    # 先用占位符替换所有加粗标记
    text_with_placeholders = re.sub(pattern, extract_bold, text)
    
    # 转义整行的其他内容
    escaped_text = html_escape(text_with_placeholders)
    
    # 将占位符替换为 <strong> 标签
    result = escaped_text
    for placeholder, content in placeholders.items():
        result = result.replace(placeholder, f'<strong>{content}</strong>')
    
    return result


def render_summary_as_html_list(summary: str) -> str:
    # summary 可能是多行或条目文本：在页面中渲染为一组洞察条目
    # 处理 Markdown 加粗标记（**文本** -> <strong>文本</strong>），并为每条外层包裹 .insight-item
    lines = [ln.strip() for ln in summary.splitlines() if ln.strip()]
    if not lines:
        # 即使只有一行，也要处理加粗标记
        content = markdown_bold_to_html(summary)
        return f'<div class="insight-item">{content}</div>'
    
    # 对每一行处理加粗标记，并包裹为独立的洞察条目
    processed_lines = [
        f'<div class="insight-item">{markdown_bold_to_html(ln)}</div>'
        for ln in lines
    ]
    return "".join(processed_lines)


def main() -> int:
    ensure_dirs()
    ensure_archive_html_exists()

    api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()

    # 读取 ledger
    processed: List[str] = load_json(PROCESSED_LEDGER_PATH, default=[])
    processed_set = set(processed)

    # 确保 articles.json 存在
    if ARTICLES_JSON_PATH.exists():
        articles: List[Dict[str, Any]] = load_json(ARTICLES_JSON_PATH, default=[])
    else:
        articles = []

    pdf_files = sorted(PDFS_TO_PROCESS_DIR.glob("*.pdf"))
    if not pdf_files:
        print("pdfs_to_process/ 中没有待处理 PDF。")
        return 0

    any_changed = False

    for pdf_path in pdf_files:
        if pdf_path.name in processed_set:
            print(f"跳过已处理：{pdf_path.name}")
            continue

        print(f"开始处理：{pdf_path.name}")

        pdf_text = read_pdf_text(pdf_path)
        if not pdf_text:
            print(f"警告：PDF 提取文本为空，跳过：{pdf_path.name}")
            continue

        extracted = deepseek_extract_json(pdf_text, api_key=api_key)

        # 发布 PDF：移动到 /pdfs
        target_pdf_path = PUBLISHED_PDFS_DIR / pdf_path.name
        if target_pdf_path.exists():
            # 防止覆盖：加时间戳
            stem = target_pdf_path.stem
            ts = datetime.now().strftime("%Y%m%d%H%M%S")
            target_pdf_path = PUBLISHED_PDFS_DIR / f"{stem}-{ts}{target_pdf_path.suffix}"

        shutil.move(str(pdf_path), str(target_pdf_path))
        pdf_rel_url = f"pdfs/{target_pdf_path.name}"

        # 生成 post HTML
        date_str = datetime.now().strftime("%Y年%m月%d日")
        slug = slugify(extracted.title)
        post_filename = f"{datetime.now().strftime('%Y%m%d')}-{slug}.html"
        post_path = POSTS_DIR / post_filename
        post_rel_url = f"posts/{post_filename}"

        html = generate_post_html(extracted, post_title=extracted.title, date_str=date_str, pdf_rel_url=pdf_rel_url)
        post_path.write_text(html, encoding="utf-8")

        # 更新 articles.json（用于首页渲染）
        file_size = human_file_size(target_pdf_path.stat().st_size)
        core_viewpoints_html = render_summary_as_html_list(extracted.summary)
        comments_html = render_summary_as_html_list(extracted.expert_commentary)
        articles = upsert_article_entry(
            articles,
            title=extracted.title,
            date_str=date_str,
            core_viewpoints_html=core_viewpoints_html,
            comments_html=comments_html,
            pdf_url=pdf_rel_url,
            file_size=file_size,
            post_url=post_rel_url,
        )

        # 更新 index.html 最新链接块
        index_html = INDEX_HTML_PATH.read_text(encoding="utf-8")
        index_html = update_latest_post_block(index_html, title=extracted.title, url=post_rel_url, date_str=date_str)
        INDEX_HTML_PATH.write_text(index_html, encoding="utf-8")

        processed.append(pdf_path.name)
        processed_set.add(pdf_path.name)

        any_changed = True
        print(f"已发布：{post_rel_url} （PDF：{pdf_rel_url}）")

    if any_changed:
        save_json(ARTICLES_JSON_PATH, articles)
        save_json(PROCESSED_LEDGER_PATH, processed)
        print("处理完成：已更新 index.html / data/articles.json / posts/ / pdfs/")
    else:
        print("没有需要处理的新 PDF。")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
