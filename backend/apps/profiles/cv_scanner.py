"""
CV Scanner — trích xuất Skill và Address từ file PDF bằng pdfminer.six + regex.
Không cần API key hay internet, chạy hoàn toàn offline.
"""
from __future__ import annotations

import io
import re
import unicodedata
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.core.files.uploadedfile import UploadedFile


# ---------------------------------------------------------------------------
# Vietnamese city / province list for address extraction
# ---------------------------------------------------------------------------
VIETNAMESE_CITIES = [
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
    "Biên Hòa", "Nha Trang", "Huế", "Buôn Ma Thuột", "Quy Nhơn",
    "Vũng Tàu", "Đà Lạt", "Thủ Đức", "Long Xuyên", "Mỹ Tho",
    "Rạch Giá", "Cà Mau", "Hội An", "Tam Kỳ", "Hạ Long",
    "Thái Nguyên", "Nam Định", "Vinh", "Thanh Hóa", "Việt Trì",
    "Bắc Giang", "Bắc Ninh", "Ninh Bình", "Hải Dương", "Hưng Yên",
    "Lạng Sơn", "Quảng Ninh", "Vĩnh Phúc", "Phú Thọ", "Thái Bình",
    "Hà Nam", "Thành phố Hồ Chí Minh", "TP.HCM", "TP HCM",
]

# Build case-insensitive regex from city list
_CITY_PATTERN = re.compile(
    r"(?i)\b(" + "|".join(re.escape(c) for c in VIETNAMESE_CITIES) + r")\b"
)

# Keywords that signal address context
_ADDRESS_KEYWORDS_PATTERN = re.compile(
    r"(?i)(địa\s*chỉ|address|location|nơi\s*ở|thành\s*phố|tỉnh|quận|huyện|phường|xã|đường|số\s*nhà)"
)

# ---------------------------------------------------------------------------
# Common tech / soft-skill keyword list (Vietnamese & English)
# ---------------------------------------------------------------------------
KNOWN_SKILLS = [
    # Programming languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C",
    "PHP", "Ruby", "Go", "Golang", "Kotlin", "Swift", "Dart", "R",
    "Scala", "Rust", "Perl", "MATLAB", "SQL", "HTML", "CSS", "SASS", "SCSS",

    # Frameworks / Libraries
    "React", "ReactJS", "React Native", "Vue", "VueJS", "Angular", "AngularJS",
    "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Laravel",
    "Express", "NodeJS", "Node.js", "NestJS", "Next.js", "Nuxt.js",
    "jQuery", "Bootstrap", "Tailwind", "TailwindCSS", "Material UI",
    "Redux", "Zustand", "GraphQL", "REST API", "RESTful", "gRPC",

    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Elasticsearch",
    "Firebase", "DynamoDB", "MariaDB", "Oracle", "MSSQL", "Supabase",

    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Nginx", "Apache",
    "Linux", "Ubuntu", "Terraform", "Ansible",

    # Mobile
    "Android", "iOS", "Flutter", "React Native", "Ionic",

    # Data / AI / ML
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "OpenCV",
    "NLP", "Computer Vision", "Data Analysis", "Data Science", "Power BI",
    "Tableau", "Excel", "Jupyter",

    # Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Trello", "Notion",
    "Figma", "Postman", "VS Code", "IntelliJ", "PyCharm", "Xcode",
    "Android Studio", "Webpack", "Vite",

    # Soft skills (Vietnamese)
    "Làm việc nhóm", "Giao tiếp", "Thuyết trình", "Quản lý thời gian",
    "Giải quyết vấn đề", "Tư duy sáng tạo", "Lãnh đạo", "Teamwork",
]

# Pre-build a fast set and pattern for skill matching
_KNOWN_SKILLS_LOWER: dict[str, str] = {s.lower(): s for s in KNOWN_SKILLS}

# ---------------------------------------------------------------------------
# PDF text extraction helpers
# ---------------------------------------------------------------------------

def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Use pdfminer.six to extract raw text from PDF bytes."""
    from pdfminer.high_level import extract_text_to_fp
    from pdfminer.layout import LAParams

    output = io.StringIO()
    extract_text_to_fp(
        io.BytesIO(file_bytes),
        output,
        laparams=LAParams(),
        output_type="text",
        codec=None,
    )
    return output.getvalue()


def _normalize(text: str) -> str:
    """Normalize unicode to NFC form for consistent Vietnamese handling."""
    return unicodedata.normalize("NFC", text)


# ---------------------------------------------------------------------------
# Skill extraction
# ---------------------------------------------------------------------------

def extract_skills(text: str) -> list[str]:
    """
    Return list of canonical skill names found in text.
    Matching is case-insensitive; returns canonical casing.
    """
    text_lower = text.lower()
    found: list[str] = []
    seen: set[str] = set()
    for lower, canonical in _KNOWN_SKILLS_LOWER.items():
        # Use word-boundary for short names to avoid false positives (e.g. "C" in "CI/CD")
        if len(lower) <= 2:
            pattern = r"(?<![a-zA-Z])" + re.escape(lower) + r"(?![a-zA-Z])"
        else:
            pattern = re.escape(lower)
        if re.search(pattern, text_lower) and canonical not in seen:
            found.append(canonical)
            seen.add(canonical)
    return found


# ---------------------------------------------------------------------------
# Address extraction
# ---------------------------------------------------------------------------

def extract_address(text: str) -> str | None:
    """
    Try to pull the best candidate address from CV text.
    Strategy:
      1. Look for lines containing address keywords, grab the whole line.
      2. Fallback: look for any Vietnamese city name in the text.
    """
    lines = text.split("\n")

    # Strategy 1: find a line with address keywords
    for line in lines:
        if _ADDRESS_KEYWORDS_PATTERN.search(line):
            # Clean: strip label part (before ":" or after keyword)
            clean = re.sub(r"(?i)(địa\s*chỉ|address|location|nơi\s*ở)\s*[:\-–]?\s*", "", line).strip()
            clean = re.sub(r"\s+", " ", clean)
            if clean:
                return clean

    # Strategy 2: find city mention anywhere
    match = _CITY_PATTERN.search(text)
    if match:
        # Try to get some context around the city match
        start = max(0, match.start() - 30)
        end = min(len(text), match.end() + 30)
        snippet = text[start:end].strip()
        snippet = re.sub(r"\s+", " ", snippet)
        return snippet

    return None


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def scan_cv(uploaded_file: "UploadedFile") -> dict:
    """
    Scan an uploaded CV file (PDF only for now).
    Returns:
        {
            "skills": ["Python", "Django", ...],
            "address": "123 Nguyễn Huệ, Hà Nội" | None,
            "raw_text_preview": "first 500 chars of extracted text",
        }
    """
    file_bytes = uploaded_file.read()
    name_lower = getattr(uploaded_file, "name", "").lower()

    if name_lower.endswith(".pdf"):
        try:
            raw_text = _extract_text_from_pdf(file_bytes)
        except Exception as exc:  # noqa: BLE001
            return {"skills": [], "address": None, "error": f"Không thể đọc PDF: {exc}"}
    else:
        # DOC/DOCX: fallback — try to decode as plain text (limited support)
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:  # noqa: BLE001
            raw_text = ""

    normalized = _normalize(raw_text)
    skills = extract_skills(normalized)
    address = extract_address(normalized)

    return {
        "skills": skills,
        "address": address,
        "raw_text_preview": normalized[:500].strip(),
    }
