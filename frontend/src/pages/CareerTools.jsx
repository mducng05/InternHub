import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchJobCategories, fetchLocations } from "../api/catalog";
import { fetchSalaryInsights } from "../api/jobs";
import { PERSONALITY_QUESTIONS, PERSONALITY_TYPES } from "../data/careerToolsData";
import "./CareerTools.css";

const TOOL_TABS = [
  { id: "personality", label: "Trắc nghiệm", icon: "bi-person-vcard" },
  { id: "tax", label: "Thuế TNCN", icon: "bi-receipt" },
  { id: "salary", label: "Mức lương", icon: "bi-search" },
  { id: "compound", label: "Lãi kép", icon: "bi-graph-up-arrow" },
  { id: "savings", label: "Kế hoạch tiết kiệm", icon: "bi-piggy-bank" },
];

const WORK_TYPES = [
  ["", "Mọi hình thức"],
  ["full_time", "Toàn thời gian"],
  ["part_time", "Bán thời gian"],
  ["remote", "Từ xa"],
  ["hybrid", "Kết hợp"],
];

const TAX_BANDS = [
  { limit: 10_000_000, rate: 0.05 },
  { limit: 20_000_000, rate: 0.1 },
  { limit: 30_000_000, rate: 0.2 },
  { limit: 40_000_000, rate: 0.3 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.35 },
];

const money = (value) => `${Math.round(value || 0).toLocaleString("vi-VN")} đ`;
const toNumber = (value) => Math.max(0, Number(value) || 0);

function readItems(response) {
  if (Array.isArray(response?.data)) return response.data;
  return response?.data?.results || [];
}

function getSavedAnswers() {
  try {
    return JSON.parse(localStorage.getItem("career_personality_answers") || "{}");
  } catch {
    return {};
  }
}

function calculateProgressiveTax(taxableIncome) {
  let remaining = taxableIncome;
  let lowerLimit = 0;
  let tax = 0;
  for (const band of TAX_BANDS) {
    const taxableInBand = Math.max(0, Math.min(remaining, band.limit - lowerLimit));
    tax += taxableInBand * band.rate;
    remaining -= taxableInBand;
    lowerLimit = band.limit;
    if (remaining <= 0) break;
  }
  return tax;
}

function projectCompound(principal, monthlyDeposit, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const months = Math.round(years * 12);
  let balance = principal;
  let deposited = principal;
  const rows = [{ period: 0, balance, deposited }];
  for (let month = 1; month <= months; month += 1) {
    balance *= 1 + monthlyRate;
    balance += monthlyDeposit;
    deposited += monthlyDeposit;
    if (month % 12 === 0 || month === months) {
      rows.push({ period: month / 12, balance, deposited });
    }
  }
  return { balance, deposited, interest: balance - deposited, rows };
}

function projectSavings(goal, startingBalance, monthlyDeposit, annualRate) {
  if (startingBalance >= goal) return { reached: true, months: 0, balance: startingBalance, deposited: 0, rows: [] };
  if (monthlyDeposit <= 0 && annualRate <= 0) return { reached: false, months: 0, balance: startingBalance, deposited: 0, rows: [] };

  const monthlyRate = annualRate / 100 / 12;
  let balance = startingBalance;
  let deposited = 0;
  const rows = [];
  for (let month = 1; month <= 600 && balance < goal; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    deposited += monthlyDeposit;
    if (month % 12 === 0 || balance >= goal) rows.push({ period: Math.ceil(month / 12), balance, deposited });
    if (month === 600) return { reached: balance >= goal, months: month, balance, deposited, rows };
    if (balance >= goal) return { reached: true, months: month, balance, deposited, rows };
  }
  return { reached: true, months: 0, balance, deposited, rows };
}

function Metric({ label, value, detail }) {
  return (
    <div className="career-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default function CareerTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTool = searchParams.get("tool");
  const activeTool = TOOL_TABS.some((tool) => tool.id === requestedTool) ? requestedTool : "personality";
  const [answers, setAnswers] = useState(getSavedAnswers);
  const [personalityResult, setPersonalityResult] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [salaryFilters, setSalaryFilters] = useState({ category: "", location: "", internship_type: "" });
  const [salaryResult, setSalaryResult] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [taxForm, setTaxForm] = useState({ gross: 15_000_000, insurance: "", otherDeduction: 0, dependents: 0, personalDeduction: 15_500_000, dependentDeduction: 6_200_000 });
  const [investment, setInvestment] = useState({ principal: 10_000_000, monthlyDeposit: 2_000_000, annualRate: 6, years: 5 });
  const [savings, setSavings] = useState({ goal: 100_000_000, current: 10_000_000, monthlyDeposit: 5_000_000, annualRate: 5 });

  useEffect(() => {
    localStorage.setItem("career_personality_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    Promise.all([fetchJobCategories(), fetchLocations()]).then(([categoryResponse, locationResponse]) => {
      setCategories(readItems(categoryResponse));
      setLocations(readItems(locationResponse));
    }).catch(() => {});
  }, []);

  const switchTool = (toolId) => {
    setSearchParams({ tool: toolId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answerQuestion = (questionId, value) => {
    setPersonalityResult(false);
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const answeredCount = PERSONALITY_QUESTIONS.filter((question) => answers[question.id]).length;
  const scores = PERSONALITY_TYPES.map((type) => ({
    ...type,
    score: PERSONALITY_QUESTIONS
      .filter((question) => question.type === type.code)
      .reduce((sum, question) => sum + (Number(answers[question.id]) || 0), 0),
  })).sort((left, right) => right.score - left.score);

  const searchSalary = async (event) => {
    event.preventDefault();
    setSalaryLoading(true);
    setSalaryError("");
    try {
      const params = Object.fromEntries(Object.entries(salaryFilters).filter(([, value]) => value));
      const { data } = await fetchSalaryInsights(params);
      setSalaryResult(data);
    } catch {
      setSalaryError("Không thể tải dữ liệu lương lúc này.");
    } finally {
      setSalaryLoading(false);
    }
  };

  const updateForm = (setter) => (event) => {
    setter((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const grossSalary = toNumber(taxForm.gross);
  const insurance = taxForm.insurance === "" ? Math.round(grossSalary * 0.105) : toNumber(taxForm.insurance);
  const taxableIncome = Math.max(0, grossSalary - insurance - toNumber(taxForm.otherDeduction) - toNumber(taxForm.personalDeduction) - toNumber(taxForm.dependents) * toNumber(taxForm.dependentDeduction));
  const monthlyTax = calculateProgressiveTax(taxableIncome);
  const effectiveTaxRate = grossSalary ? (monthlyTax / grossSalary) * 100 : 0;
  const netSalary = Math.max(0, grossSalary - insurance - monthlyTax);
  const investmentResult = projectCompound(toNumber(investment.principal), toNumber(investment.monthlyDeposit), toNumber(investment.annualRate), toNumber(investment.years));
  const savingsResult = projectSavings(toNumber(savings.goal), toNumber(savings.current), toNumber(savings.monthlyDeposit), toNumber(savings.annualRate));

  return (
    <main className="career-tools-page">
      <div className="career-tools-page__inner">
        <header className="career-tools-header">
          <div>
            <span className="career-tools-eyebrow">INTERNHUB · TIỆN ÍCH</span>
            <h1>Công cụ nghề nghiệp &amp; tài chính</h1>
            <p>Khám phá hướng đi nghề nghiệp, chuẩn bị phỏng vấn và chủ động kế hoạch tài chính.</p>
          </div>
          <Link className="career-interview-link" to="/interview-questions">
            <i className="bi bi-chat-square-text" aria-hidden="true" /> Bộ câu hỏi phỏng vấn
            <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </Link>
        </header>

        <nav className="career-tool-tabs" aria-label="Chọn công cụ">
          {TOOL_TABS.map((tool) => (
            <button
              aria-current={activeTool === tool.id ? "page" : undefined}
              className={activeTool === tool.id ? "is-active" : ""}
              key={tool.id}
              onClick={() => switchTool(tool.id)}
              type="button"
            >
              <i className={`bi ${tool.icon}`} aria-hidden="true" />{tool.label}
            </button>
          ))}
        </nav>

        {activeTool === "personality" && (
          <section className="career-tool-section">
            <div className="career-tool-heading">
              <div>
                <span className="career-tools-eyebrow">RIASEC · 24 MỆNH ĐỀ</span>
                <h2>Khám phá thiên hướng nghề nghiệp</h2>
                <p>Chọn mức độ phù hợp với bạn. Kết quả gợi ý nhóm môi trường làm việc, không phải đánh giá năng lực.</p>
              </div>
              <span className="career-progress-count">{answeredCount}<small> / 24</small></span>
            </div>

            <div className="career-personality-scale"><span>Không giống tôi</span><span>Rất giống tôi</span></div>
            <div className="career-question-list">
              {PERSONALITY_QUESTIONS.map((question, index) => (
                <fieldset className="career-question" key={question.id}>
                  <legend><span>{String(index + 1).padStart(2, "0")}</span>{question.text}</legend>
                  <div className="career-rating" role="group" aria-label={`Mức độ phù hợp câu ${index + 1}`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        aria-pressed={Number(answers[question.id]) === value}
                        className={Number(answers[question.id]) === value ? "is-selected" : ""}
                        key={value}
                        onClick={() => answerQuestion(question.id, value)}
                        type="button"
                      >{value}</button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="career-tool-actions">
              <button className="career-secondary-button" onClick={() => { setAnswers({}); setPersonalityResult(false); }} type="button">Làm lại</button>
              <button className="career-primary-button" disabled={answeredCount !== PERSONALITY_QUESTIONS.length} onClick={() => setPersonalityResult(true)} type="button">
                Xem kết quả <i className="bi bi-arrow-right" aria-hidden="true" />
              </button>
            </div>

            {personalityResult && (
              <section className="career-result-panel" aria-live="polite">
                <span className="career-tools-eyebrow">KẾT QUẢ NỔI BẬT</span>
                <h3>{scores.slice(0, 3).map((type) => type.code).join(" · ")}</h3>
                <div className="career-result-grid">
                  {scores.slice(0, 3).map((type, index) => (
                    <article className="career-result-type" key={type.code}>
                      <div><span>{index + 1}</span><h4>{type.title}</h4><strong>{type.score}/20</strong></div>
                      <div className="career-score-track"><span style={{ width: `${type.score * 5}%` }} /></div>
                      <p>{type.description}</p>
                      <small>Nhóm nghề tham khảo: {type.careers}</small>
                    </article>
                  ))}
                </div>
                <p className="career-result-note">Dùng kết quả như điểm bắt đầu để tự khám phá; sở thích và trải nghiệm thực tế có thể thay đổi theo thời gian.</p>
              </section>
            )}
          </section>
        )}

        {activeTool === "tax" && (
          <section className="career-tool-section">
            <div className="career-tool-heading">
              <div><span className="career-tools-eyebrow">ƯỚC TÍNH HÀNG THÁNG</span><h2>Tính thuế thu nhập cá nhân</h2><p>Nhập lương gross và các khoản giảm trừ để ước tính lương thực nhận.</p></div>
              <i className="bi bi-receipt career-heading-icon" aria-hidden="true" />
            </div>
            <div className="career-calculator-layout">
              <form className="career-input-grid" onSubmit={(event) => event.preventDefault()}>
                <label className="career-field career-field--wide"><span>Lương gross mỗi tháng</span><div className="career-number-wrap"><input min="0" name="gross" onChange={updateForm(setTaxForm)} type="number" value={taxForm.gross} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Bảo hiểm bắt buộc</span><div className="career-number-wrap"><input min="0" name="insurance" onChange={updateForm(setTaxForm)} placeholder={`${Math.round(grossSalary * 0.105)}`} type="number" value={taxForm.insurance} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Khoản giảm trừ khác</span><div className="career-number-wrap"><input min="0" name="otherDeduction" onChange={updateForm(setTaxForm)} type="number" value={taxForm.otherDeduction} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Số người phụ thuộc</span><input min="0" name="dependents" onChange={updateForm(setTaxForm)} type="number" value={taxForm.dependents} /></label>
                <label className="career-field"><span>Giảm trừ bản thân / tháng</span><div className="career-number-wrap"><input min="0" name="personalDeduction" onChange={updateForm(setTaxForm)} type="number" value={taxForm.personalDeduction} /><small>VNĐ</small></div></label>
                <label className="career-field career-field--wide"><span>Giảm trừ mỗi người phụ thuộc / tháng</span><div className="career-number-wrap"><input min="0" name="dependentDeduction" onChange={updateForm(setTaxForm)} type="number" value={taxForm.dependentDeduction} /><small>VNĐ</small></div></label>
              </form>
              <div className="career-results-stack">
                <Metric label="Thuế TNCN ước tính" value={money(monthlyTax)} detail={`Thuế suất hiệu dụng ${effectiveTaxRate.toFixed(1)}%`} />
                <Metric label="Lương net ước tính" value={money(netSalary)} detail={`Thu nhập tính thuế ${money(taxableIncome)}`} />
                <div className="career-tax-bands"><strong>Biểu thuế lũy tiến tháng</strong><span>Đến 10 triệu · 5%</span><span>10–30 triệu · 10%</span><span>30–60 triệu · 20%</span><span>60–100 triệu · 30%</span><span>Trên 100 triệu · 35%</span></div>
              </div>
            </div>
            <p className="career-disclaimer">Kết quả chỉ để tham khảo. Mức giảm trừ và bảo hiểm có thể chỉnh theo trường hợp thực tế; vui lòng đối chiếu quy định thuế hiện hành hoặc bảng lương của bạn.</p>
          </section>
        )}

        {activeTool === "salary" && (
          <section className="career-tool-section">
            <div className="career-tool-heading"><div><span className="career-tools-eyebrow">DỮ LIỆU TIN ĐÃ DUYỆT</span><h2>Tra cứu mức lương</h2><p>Thống kê từ các tin tuyển dụng công khai trên InternHub có mức lương cụ thể.</p></div><i className="bi bi-search career-heading-icon" aria-hidden="true" /></div>
            <form className="career-salary-filters" onSubmit={searchSalary}>
              <label className="career-field"><span>Vị trí công việc</span><select onChange={(event) => setSalaryFilters((current) => ({ ...current, category: event.target.value }))} value={salaryFilters.category}><option value="">Tất cả vị trí</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="career-field"><span>Địa điểm</span><select onChange={(event) => setSalaryFilters((current) => ({ ...current, location: event.target.value }))} value={salaryFilters.location}><option value="">Tất cả địa điểm</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="career-field"><span>Hình thức</span><select onChange={(event) => setSalaryFilters((current) => ({ ...current, internship_type: event.target.value }))} value={salaryFilters.internship_type}>{WORK_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <button className="career-primary-button" disabled={salaryLoading} type="submit">{salaryLoading ? "Đang tra..." : "Tra cứu"} <i className="bi bi-search" aria-hidden="true" /></button>
            </form>
            {salaryError && <p className="career-inline-error" role="alert">{salaryError}</p>}
            {salaryResult && (salaryResult.count > 0 ? (
              <div className="career-salary-result" aria-live="polite">
                <div className="career-salary-result__top"><span>{salaryResult.count} tin có mức lương phù hợp</span><small>Nguồn: tin đã duyệt trên InternHub</small></div>
                <div className="career-metric-grid">
                  <Metric label="Mức thấp nhất" value={money(salaryResult.salary_min)} />
                  <Metric label="Trung vị khoảng lương" value={money(salaryResult.salary_median)} />
                  <Metric label="Mức cao nhất" value={money(salaryResult.salary_max)} />
                </div>
              </div>
            ) : <div className="career-empty-result"><i className="bi bi-bar-chart" aria-hidden="true" /><p>Chưa có đủ tin đã duyệt để thống kê lựa chọn này.</p></div>)}
            {!salaryResult && <div className="career-empty-result"><i className="bi bi-bar-chart" aria-hidden="true" /><p>Chọn bộ lọc rồi bấm Tra cứu để xem thống kê.</p></div>}
          </section>
        )}

        {activeTool === "compound" && (
          <section className="career-tool-section">
            <div className="career-tool-heading"><div><span className="career-tools-eyebrow">MÔ PHỎNG ĐẦU TƯ ĐỊNH KỲ</span><h2>Tính lãi kép</h2><p>Ước tính giá trị tích lũy khi đầu tư ban đầu và góp thêm hàng tháng.</p></div><i className="bi bi-graph-up-arrow career-heading-icon" aria-hidden="true" /></div>
            <div className="career-calculator-layout">
              <form className="career-input-grid" onSubmit={(event) => event.preventDefault()}>
                <label className="career-field"><span>Vốn ban đầu</span><div className="career-number-wrap"><input min="0" name="principal" onChange={updateForm(setInvestment)} type="number" value={investment.principal} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Góp thêm mỗi tháng</span><div className="career-number-wrap"><input min="0" name="monthlyDeposit" onChange={updateForm(setInvestment)} type="number" value={investment.monthlyDeposit} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Lãi suất trung bình / năm</span><div className="career-number-wrap"><input min="0" max="100" name="annualRate" onChange={updateForm(setInvestment)} step="0.1" type="number" value={investment.annualRate} /><small>%</small></div></label>
                <label className="career-field"><span>Thời gian đầu tư</span><div className="career-number-wrap"><input min="1" max="60" name="years" onChange={updateForm(setInvestment)} type="number" value={investment.years} /><small>năm</small></div></label>
              </form>
              <div className="career-results-stack">
                <Metric label="Giá trị dự kiến" value={money(investmentResult.balance)} detail={`${investment.years} năm · góp cuối mỗi tháng`} />
                <div className="career-metric-grid career-metric-grid--two">
                  <Metric label="Tổng vốn góp" value={money(investmentResult.deposited)} />
                  <Metric label="Lãi tích lũy" value={money(investmentResult.interest)} />
                </div>
              </div>
            </div>
            <ProjectionChart rows={investmentResult.rows} valueKey="balance" />
            <p className="career-disclaimer">Mô phỏng giả định lãi suất không đổi và lãi nhập gốc hàng tháng; chưa tính thuế, phí hoặc biến động thị trường.</p>
          </section>
        )}

        {activeTool === "savings" && (
          <section className="career-tool-section">
            <div className="career-tool-heading"><div><span className="career-tools-eyebrow">MỤC TIÊU TÀI CHÍNH</span><h2>Lập kế hoạch tiết kiệm</h2><p>Tính thời gian dự kiến để đạt mục tiêu từ số dư và khoản góp hàng tháng.</p></div><i className="bi bi-piggy-bank career-heading-icon" aria-hidden="true" /></div>
            <div className="career-calculator-layout">
              <form className="career-input-grid" onSubmit={(event) => event.preventDefault()}>
                <label className="career-field career-field--wide"><span>Mục tiêu tiết kiệm</span><div className="career-number-wrap"><input min="0" name="goal" onChange={updateForm(setSavings)} type="number" value={savings.goal} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Đã có</span><div className="career-number-wrap"><input min="0" name="current" onChange={updateForm(setSavings)} type="number" value={savings.current} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Dự định để dành / tháng</span><div className="career-number-wrap"><input min="0" name="monthlyDeposit" onChange={updateForm(setSavings)} type="number" value={savings.monthlyDeposit} /><small>VNĐ</small></div></label>
                <label className="career-field"><span>Lãi suất tiết kiệm / năm</span><div className="career-number-wrap"><input min="0" max="100" name="annualRate" onChange={updateForm(setSavings)} step="0.1" type="number" value={savings.annualRate} /><small>%</small></div></label>
              </form>
              <div className="career-results-stack">
                <Metric
                  label="Thời gian dự kiến"
                  value={savingsResult.months === 0 && savingsResult.reached ? "Đã đạt mục tiêu" : savingsResult.reached ? `${Math.floor(savingsResult.months / 12)} năm ${savingsResult.months % 12} tháng` : "Chưa thể đạt mục tiêu"}
                  detail={savingsResult.reached && savingsResult.months > 0 ? `Số dư ước tính ${money(savingsResult.balance)}` : "Tăng khoản góp hàng tháng để rút ngắn thời gian."}
                />
                <Metric label="Tiền tự góp dự kiến" value={money(savingsResult.deposited)} detail={`Hiện có ${money(savings.current)}`} />
              </div>
            </div>
            <ProjectionChart rows={savingsResult.rows} valueKey="balance" />
            <p className="career-disclaimer">Thời gian tính theo lãi suất cố định và khoản góp cuối mỗi tháng; kết quả thực tế tùy sản phẩm tiết kiệm.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function ProjectionChart({ rows, valueKey }) {
  if (!rows || rows.length < 2) return null;
  const maxValue = Math.max(...rows.map((row) => row[valueKey]));
  return (
    <div className="career-projection" aria-label="Biểu đồ tăng trưởng dự kiến">
      {rows.slice(1).map((row) => (
        <div className="career-projection-row" key={row.period}>
          <span>{row.period} năm</span>
          <div className="career-projection-track"><i style={{ width: `${Math.max(3, (row[valueKey] / maxValue) * 100)}%` }} /></div>
          <strong>{money(row[valueKey])}</strong>
        </div>
      ))}
    </div>
  );
}