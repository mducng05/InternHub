import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getMbtiDetail,
  MBTI_PERSONALITIES,
} from "../data/mbtiPersonalities";
import { MBTI_IMAGES } from "../data/mbtiData";
import "./MbtiDetail.css";

const GROUPS_LIST = [
  {
    code: "NT",
    title: "Nhà Phân Tích (Analysts)",
    types: ["INTJ", "INTP", "ENTJ", "ENTP"],
  },
  {
    code: "NF",
    title: "Nhà Ngoại Giao (Diplomats)",
    types: ["INFJ", "INFP", "ENFJ", "ENFP"],
  },
  {
    code: "SJ",
    title: "Người Hộ Vệ (Sentinels)",
    types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  },
  {
    code: "SP",
    title: "Người Khám Phá (Explorers)",
    types: ["ISTP", "ISFP", "ESTP", "ESFP"],
  },
];

export default function MbtiDetail() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Normalize code or default to INTJ
  const activeCode = (type ? type.toUpperCase() : "INTJ").trim();
  const personality = getMbtiDetail(activeCode);
  const imageSrc = MBTI_IMAGES[personality.code] || MBTI_IMAGES.INTJ;

  const acronymList = personality.acronymBreakdown || personality.acronym || [];
  const meaningTitle =
    personality.meaningTitle ||
    personality.meaning?.title ||
    `Ý nghĩa tên gọi ${personality.name}`;
  const meaningExplanation =
    personality.meaningExplanation ||
    personality.meaning?.explanation ||
    "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [personality.code]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectType = (code) => {
    navigate(`/mbti/${code.toLowerCase()}`);
  };

  return (
    <div className="mbti-simple-page text-start">
      {/* Clean, Simple Header with Pink/Red Palette */}
      <header className="mbti-simple-header text-start">
        <div className="container">
          <div className="row align-items-stretch g-4 text-start">
            <div className="col-auto d-flex">
              <div className="mbti-simple-thumb-frame">
                <img
                  src={imageSrc}
                  alt={`${personality.code} - ${personality.name}`}
                  className="mbti-simple-thumb-img"
                />
              </div>
            </div>

            <div className="col text-start d-flex flex-column justify-content-between">
              <div>
                <div className="mbti-simple-category-label">
                  16 Nhóm tính cách MBTI • {personality.group}
                </div>
                <h1 className="mbti-simple-main-title">
                  Nhóm tính cách <span className="mbti-code-brand">{personality.code}</span> - {personality.name} ({personality.englishTitle})
                </h1>
                <p className="mbti-simple-tagline mb-3">
                  {personality.tagline}
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2 text-start">
                <Link to="/mbti-test" className="btn btn-mbti-primary btn-sm px-3 py-1.5 fw-semibold">
                  <i className="bi bi-pencil-square me-1.5"></i>
                  Làm bài test MBTI
                </Link>
                <button
                  type="button"
                  className="btn btn-mbti-outline btn-sm px-3 py-1.5"
                  onClick={handleCopyLink}
                >
                  <i className={`bi ${copied ? "bi-check2 text-success" : "bi-share"} me-1.5`}></i>
                  {copied ? "Đã sao chép liên kết" : "Chia sẻ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Clean Reading / Article Layout */}
      <div className="container py-4 py-lg-5 text-start">
        <div className="row g-4 g-lg-5 text-start">
          {/* Left: Clean Article Body */}
          <div className="col-lg-8 text-start">
            <article className="mbti-article-content text-start">
              {/* 1. Viết tắt của những chữ cái gì? */}
              <section id="viet-tat" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">
                  {personality.code} là viết tắt của những chữ cái gì?
                </h2>
                <ul className="mbti-article-list text-start">
                  {acronymList.map((item, idx) => (
                    <li key={idx}>
                      <strong className="mbti-letter-lead">{item.letter} - {item.nameVi}:</strong> {item.description}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 2. Ý nghĩa tên gọi & Bản chất */}
              <section id="y-nghia-ban-chat" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">{meaningTitle}</h2>
                <p>{meaningExplanation}</p>
                <p>{personality.personalityDescription}</p>
              </section>

              {/* 3. Đặc điểm tính cách */}
              <section id="dac-diem" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">
                  Đặc điểm tính cách của {personality.code}
                </h2>
                <ul className="mbti-article-list text-start">
                  {personality.traits.map((trait, idx) => (
                    <li key={idx}>{trait}</li>
                  ))}
                </ul>
              </section>

              {/* 4. Điểm mạnh và Điểm yếu */}
              <section id="diem-manh-diem-yeu" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">
                  Điểm mạnh và điểm yếu của {personality.code}
                </h2>

                <h3 className="mbti-article-subheading">Điểm mạnh vượt trội</h3>
                <ul className="mbti-article-list text-start">
                  {personality.strengths.map((item, idx) => (
                    <li key={idx}>
                      <strong className="mbti-term-lead">{item.title}:</strong> {item.desc}
                    </li>
                  ))}
                </ul>

                <h3 className="mbti-article-subheading mt-4">Điểm cần khắc phục & Thách thức</h3>
                <ul className="mbti-article-list text-start">
                  {personality.weaknesses.map((item, idx) => (
                    <li key={idx}>
                      <strong className="mbti-term-lead">{item.title}:</strong> {item.desc}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 5. Phong cách làm việc & Nghề nghiệp */}
              <section id="nghe-nghiep" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">
                  Phong cách làm việc & Nghề nghiệp phù hợp
                </h2>

                <h3 className="mbti-article-subheading">Phong cách làm việc</h3>
                <ul className="mbti-article-list text-start">
                  <li>
                    <strong className="mbti-term-lead">Vai trò lý tưởng:</strong> {personality.workStyle.role}
                  </li>
                  <li>
                    <strong className="mbti-term-lead">Môi trường làm việc tối ưu:</strong> {personality.workStyle.idealEnvironment}
                  </li>
                  <li>
                    <strong className="mbti-term-lead">Tương tác nhóm:</strong> {personality.workStyle.teamwork}
                  </li>
                </ul>

                <h3 className="mbti-article-subheading mt-4">Nghề nghiệp phù hợp nhất</h3>
                <ul className="mbti-article-list text-start">
                  {personality.careers.map((career, idx) => (
                    <li key={idx}>
                      <strong className="mbti-term-lead">{career.role}</strong> ({career.field}) &nbsp;
                      <Link
                        to={`/jobs?keyword=${encodeURIComponent(career.role)}`}
                        className="mbti-article-job-link text-decoration-none"
                      >
                        [Tìm việc liên quan]
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 6. Những người nổi tiếng */}
              <section id="nguoi-noi-tieng" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">
                  Những người nổi tiếng mang tính cách {personality.code}
                </h2>
                <ul className="mbti-article-list text-start">
                  {personality.famousPeople.map((person, idx) => (
                    <li key={idx}>
                      <strong className="mbti-term-lead">{person.name}</strong> ({person.role}): {person.detail}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 7. Lời khuyên phát triển */}
              <section id="loi-khuyen" className="mbti-article-section text-start">
                <h2 className="mbti-article-heading">Lời khuyên phát triển bản thân</h2>
                <ul className="mbti-article-list text-start">
                  {personality.advice.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </section>
            </article>
          </div>

          {/* Right: Clean, simple navigation sidebar */}
          <div className="col-lg-4 text-start">
            <aside className="mbti-simple-sidebar text-start">
              {/* Mục lục bài viết */}
              <div className="mbti-sidebar-block mb-4 text-start">
                <h4 className="mbti-sidebar-title">Mục lục nội dung</h4>
                <nav className="mbti-sidebar-toc text-start">
                  <a href="#viet-tat" className="mbti-toc-link">
                    1. {personality.code} là viết tắt của chữ cái gì?
                  </a>
                  <a href="#y-nghia-ban-chat" className="mbti-toc-link">
                    2. Ý nghĩa tên gọi & Bản chất
                  </a>
                  <a href="#dac-diem" className="mbti-toc-link">
                    3. Đặc điểm tính cách cốt lõi
                  </a>
                  <a href="#diem-manh-diem-yeu" className="mbti-toc-link">
                    4. Điểm mạnh và điểm yếu
                  </a>
                  <a href="#nghe-nghiep" className="mbti-toc-link">
                    5. Phong cách làm việc & Nghề nghiệp
                  </a>
                  <a href="#nguoi-noi-tieng" className="mbti-toc-link">
                    6. Những người nổi tiếng
                  </a>
                  <a href="#loi-khuyen" className="mbti-toc-link">
                    7. Lời khuyên phát triển
                  </a>
                </nav>
              </div>

              {/* MBTI Test Callout */}
              <div className="mbti-sidebar-block mbti-sidebar-callout mb-4 p-3 rounded-3 text-start">
                <h5 className="fw-bold mb-1 fs-6 text-pink-dark">Khám phá tính cách của bạn</h5>
                <p className="text-secondary small mb-3">
                  Làm bài trắc nghiệm 60 câu hỏi chuẩn xác để tìm hiểu nhóm tính cách và định hướng nghề nghiệp phù hợp.
                </p>
                <Link to="/mbti-test" className="btn btn-mbti-primary btn-sm w-100 fw-semibold py-2">
                  Làm bài test MBTI ngay
                </Link>
              </div>

              {/* Chuyển nhanh 16 nhóm tính cách */}
              <div className="mbti-sidebar-block text-start">
                <h4 className="mbti-sidebar-title">16 Nhóm tính cách MBTI</h4>
                <div className="mbti-sidebar-groups text-start">
                  {GROUPS_LIST.map((grp) => (
                    <div key={grp.code} className="mb-2.5 text-start">
                      <div className="mbti-sidebar-grp-name">{grp.title}</div>
                      <div className="d-flex flex-wrap gap-1.5 mt-1 text-start">
                        {grp.types.map((c) => {
                          const isCurrent = c === personality.code;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleSelectType(c)}
                              className={`btn btn-sm ${
                                isCurrent
                                  ? "btn-mbti-current"
                                  : "btn-mbti-subtle"
                              }`}
                              style={{ minWidth: "56px", fontSize: "0.82rem" }}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
