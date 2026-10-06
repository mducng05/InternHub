"""
CV Scanner — trích xuất Skill, Contact Info (Email, Phone) và Address từ file PDF & DOCX.
Không cần API key hay internet, chạy hoàn toàn offline bằng pdfminer.six và python-docx.
"""
from __future__ import annotations

import io
import re
import unicodedata
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from django.core.files.uploadedfile import UploadedFile


# ---------------------------------------------------------------------------
# Vietnamese city / province dictionary (alias -> canonical name)
# ---------------------------------------------------------------------------
CITY_ALIASES = {
    "hà nội": "Hà Nội",
    "ha noi": "Hà Nội",
    "hanoi": "Hà Nội",
    "hồ chí minh": "Hồ Chí Minh",
    "ho chi minh": "Hồ Chí Minh",
    "tp.hcm": "Hồ Chí Minh",
    "tp hcm": "Hồ Chí Minh",
    "tphcm": "Hồ Chí Minh",
    "tp. hồ chí minh": "Hồ Chí Minh",
    "tp ho chi minh": "Hồ Chí Minh",
    "sài gòn": "Hồ Chí Minh",
    "sai gon": "Hồ Chí Minh",
    "đà nẵng": "Đà Nẵng",
    "da nang": "Đà Nẵng",
    "hải phòng": "Hải Phòng",
    "hai phong": "Hải Phòng",
    "cần thơ": "Cần Thơ",
    "can tho": "Cần Thơ",
    "bình dương": "Bình Dương",
    "binh duong": "Bình Dương",
    "đồng nai": "Đồng Nai",
    "dong nai": "Đồng Nai",
    "bà rịa - vũng tàu": "Bà Rịa - Vũng Tàu",
    "vũng tàu": "Vũng Tàu",
    "nha trang": "Nha Trang",
    "khánh hòa": "Khánh Hòa",
    "huế": "Thừa Thiên Huế",
    "thừa thiên huế": "Thừa Thiên Huế",
    "quảng nam": "Quảng Nam",
    "bắc ninh": "Bắc Ninh",
    "bắc giang": "Bắc Giang",
    "hải dương": "Hải Dương",
    "quảng ninh": "Quảng Ninh",
    "vĩnh phúc": "Vĩnh Phúc",
    "thái nguyên": "Thái Nguyên",
    "nam định": "Nam Định",
    "nghệ an": "Nghệ An",
    "vinh": "Vinh",
    "thanh hóa": "Thanh Hóa",
}

# Regex to find address context
_ADDRESS_KEYWORDS_PATTERN = re.compile(
    r"(?i)(địa\s*chỉ|address|location|nơi\s*ở|thường\s*trú|tạm\s*trú|thành\s*phố|tỉnh|quận|huyện|phường|xã|đường|số\s*nhà)"
)

# Regex to detect emails and Vietnamese phone numbers
_EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_PHONE_PATTERN = re.compile(r"(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[\s.-]?(?:\d[\s.-]?){7}\b")


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
    "Redux", "Zustand", "GraphQL", "REST API", "RESTful API", "RESTful", "gRPC",

    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Elasticsearch",
    "Firebase", "DynamoDB", "MariaDB", "Oracle", "MSSQL", "Supabase",

    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Nginx", "Apache",
    "Linux", "Ubuntu", "Terraform", "Ansible",

    # Mobile
    "Android", "iOS", "Flutter", "Ionic",

    # Data / AI / ML
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "OpenCV",
    "NLP", "Computer Vision", "Data Analysis", "Data Science", "Power BI",
    "Tableau", "Excel", "Jupyter", "Big Data",

    # Testing & QA
    "Tester", "QA", "QC", "Selenium", "Postman", "JUnit", "PyTest", "Cypress", "JMeter",

    # Design & Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Trello", "Notion",
    "Figma", "Photoshop", "Illustrator", "Canva", "UI/UX", "VS Code", "PyCharm",

    # Business & Soft skills
    "Làm việc nhóm", "Giao tiếp", "Thuyết trình", "Quản lý thời gian",
    "Giải quyết vấn đề", "Tư duy phản biện", "Tư duy sáng tạo", "Lãnh đạo",
    "Teamwork", "Tiếng Anh", "TOEIC", "IELTS",
]

_KNOWN_SKILLS_LOWER: dict[str, str] = {s.lower(): s for s in KNOWN_SKILLS}


# ---------------------------------------------------------------------------
# Text extraction helpers
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


def _extract_text_from_docx(file_bytes: bytes) -> str:
    """Use python-docx to extract text from DOCX paragraphs and tables."""
    import docx
    doc = docx.Document(io.BytesIO(file_bytes))
    parts: list[str] = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            parts.append(t)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                t = cell.text.strip()
                if t and t not in parts:
                    parts.append(t)
    return "\n".join(parts)


def _normalize(text: str) -> str:
    """Normalize unicode to NFC form for consistent Vietnamese handling."""
    if not text:
        return ""
    return unicodedata.normalize("NFC", text)


# ---------------------------------------------------------------------------
# Skill extraction
# ---------------------------------------------------------------------------

def extract_skills(text: str, extra_skills: list[str] | None = None) -> list[str]:
    """
    Return list of canonical skill names found in text.
    Matching is case-insensitive, word-boundary safe.
    """
    text_lower = text.lower()
    skills_map = dict(_KNOWN_SKILLS_LOWER)
    if extra_skills:
        for s in extra_skills:
            if s and s.strip():
                skills_map[s.strip().lower()] = s.strip()

    found: list[str] = []
    seen: set[str] = set()

    # Sort keys by length descending so multi-word skills like "Spring Boot" match before "Spring"
    sorted_lowers = sorted(skills_map.keys(), key=len, reverse=True)

    for lower in sorted_lowers:
        canonical = skills_map[lower]
        if canonical in seen:
            continue

        # Use strict boundary for short or special characters
        if lower in ("c++", "c#", ".net", "node.js", "next.js", "vue.js", "rest api", "restful api"):
            pattern = r"(?<![\w])" + re.escape(lower) + r"(?![\w])"
        elif len(lower) <= 2 or lower in ("c", "r", "go", "ai", "qa", "qc"):
            pattern = r"(?<![\w])" + re.escape(lower) + r"(?![\w])"
        else:
            pattern = r"(?<![\w])" + re.escape(lower) + r"(?![\w])"

        if re.search(pattern, text_lower):
            found.append(canonical)
            seen.add(canonical)

    return found


# ---------------------------------------------------------------------------
# Contact & Address extraction
# ---------------------------------------------------------------------------

def extract_contact_info(text: str) -> dict[str, str | None]:
    """Extract candidate email and phone number if present."""
    email_match = _EMAIL_PATTERN.search(text)
    phone_match = _PHONE_PATTERN.search(text)

    email = email_match.group(0).strip() if email_match else None
    phone = re.sub(r"[\s.-]", "", phone_match.group(0)) if phone_match else None

    return {
        "email": email,
        "phone": phone,
    }


def extract_address(text: str) -> dict[str, str | None]:
    """
    Extract address and canonical city name from text.
    Returns: {"raw_address": "...", "canonical_city": "Hà Nội" | None}
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    raw_candidate = None

    # 1. Check lines explicitly labeled with address keywords
    for line in lines:
        if _ADDRESS_KEYWORDS_PATTERN.search(line):
            clean = re.sub(r"(?i)(địa\s*chỉ|address|location|nơi\s*ở)\s*[:\-–]?\s*", "", line).strip()
            clean = re.sub(r"\s+", " ", clean)
            if len(clean) >= 3 and not _EMAIL_PATTERN.search(clean):
                raw_candidate = clean
                break

    # 2. Check for city aliases
    text_lower = text.lower()
    canonical_city = None

    # Check longer aliases first (e.g. "thành phố hồ chí minh" before "hồ chí minh")
    sorted_aliases = sorted(CITY_ALIASES.keys(), key=len, reverse=True)
    for alias in sorted_aliases:
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, text_lower):
            canonical_city = CITY_ALIASES[alias]
            break

    if not raw_candidate and canonical_city:
        raw_candidate = canonical_city

    return {
        "raw_address": raw_candidate,
        "canonical_city": canonical_city,
    }


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def scan_cv(uploaded_file: "UploadedFile", extra_skills: list[str] | None = None) -> dict[str, Any]:
    """
    Scan an uploaded CV file (PDF or DOCX).
    Returns:
        {
            "skills": ["Python", "Django", ...],
            "address": "Hà Nội" | None,
            "raw_address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội" | None,
            "candidate": { "email": "...", "phone": "..." },
            "raw_text_preview": "...",
            "error": "..." (if any)
        }
    """
    file_bytes = uploaded_file.read()
    if hasattr(uploaded_file, "seek"):
        uploaded_file.seek(0)

    name_lower = getattr(uploaded_file, "name", "").lower()
    raw_text = ""
    error_msg = None

    if name_lower.endswith(".pdf"):
        try:
            raw_text = _extract_text_from_pdf(file_bytes)
        except Exception as exc:  # noqa: BLE001
            error_msg = f"Không thể đọc file PDF: {exc}"
    elif name_lower.endswith((".docx", ".doc")):
        try:
            raw_text = _extract_text_from_docx(file_bytes)
        except Exception:
            # Fallback for plain text or older doc formats
            try:
                raw_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception as exc:  # noqa: BLE001
                error_msg = f"Không thể đọc file văn bản: {exc}"
    else:
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as exc:  # noqa: BLE001
            error_msg = f"Định dạng file không hỗ trợ: {exc}"

    normalized = _normalize(raw_text)
    skills = extract_skills(normalized, extra_skills=extra_skills)
    addr_info = extract_address(normalized)
    contact_info = extract_contact_info(normalized)

    result = {
        "skills": skills,
        "address": addr_info["canonical_city"] or addr_info["raw_address"],
        "raw_address": addr_info["raw_address"],
        "candidate": contact_info,
        "raw_text_preview": normalized[:500].strip(),
    }
    if error_msg and not skills:
        result["error"] = error_msg

    return result
