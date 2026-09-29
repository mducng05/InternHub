import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  REGIONS,
  PERSONAL_DEDUCTION,
  DEPENDENT_DEDUCTION,
  BASE_SALARY,
  MAX_INSURANCE_BASE_SALARY,
  calculateGrossToNet,
  calculateNetToGross,
  formatCurrency,
  formatNumber,
  parseCurrencyInput,
} from "../utils/taxCalculator";
import "./TaxCalculator.css";

const PRESET_SALARIES = [
  { label: "10 triệu", value: 10000000 },
  { label: "15 triệu", value: 15000000 },
  { label: "20 triệu", value: 20000000 },
  { label: "30 triệu", value: 30000000 },
  { label: "40 triệu", value: 40000000 },
  { label: "60 triệu", value: 60000000 },
];

const DRAFT_STORAGE_KEY = "internhub_tax_calculator_draft";

const loadSavedDraft = () => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Lỗi khi đọc dữ liệu tạm từ localStorage:", err);
  }
  return null;
};

export default function TaxCalculator() {
  const initialData = useMemo(() => loadSavedDraft(), []);

  // Mode: 'gross_to_net' | 'net_to_gross'
  const [mode, setMode] = useState(initialData?.mode || "gross_to_net");

  // Input states: Lần đầu vào = rỗng "", người dùng tự điền. Lần tiếp theo = khôi phục từ bộ nhớ tạm
  const [salaryInput, setSalaryInput] = useState(initialData?.salaryInput || "");
  const [selectedRegion, setSelectedRegion] = useState(initialData?.selectedRegion || "I");
  const [dependents, setDependents] = useState(
    typeof initialData?.dependents === "number" ? initialData.dependents : 0
  );
  const [insuranceType, setInsuranceType] = useState(initialData?.insuranceType || "gross"); // 'gross' | 'custom'
  const [customInsuranceInput, setCustomInsuranceInput] = useState(
    initialData?.customInsuranceInput || ""
  );

  // Tab in result details: 'brackets' | 'insurance' | 'steps'
  const [activeTab, setActiveTab] = useState("brackets");

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Set document title
  useEffect(() => {
    document.title = "Công Cụ Tính Thuế Thu Nhập Cá Nhân (TNCN) & Lương Gross - Net | InternHub";
  }, []);

  // Lưu tạm thời vào localStorage khi có thay đổi (chỉ lưu trên máy người dùng, không vào DB)
  useEffect(() => {
    if (salaryInput || dependents > 0 || insuranceType !== "gross" || customInsuranceInput) {
      try {
        const draft = {
          salaryInput,
          selectedRegion,
          dependents,
          insuranceType,
          customInsuranceInput,
          mode,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error("Lỗi khi lưu dữ liệu tạm vào localStorage:", err);
      }
    }
  }, [salaryInput, selectedRegion, dependents, insuranceType, customInsuranceInput, mode]);

  // Parse raw numbers
  const numericSalary = useMemo(() => parseCurrencyInput(salaryInput), [salaryInput]);
  const numericCustomInsurance = useMemo(
    () => parseCurrencyInput(customInsuranceInput),
    [customInsuranceInput]
  );

  // Calculate results dynamically
  const result = useMemo(() => {
    if (mode === "gross_to_net") {
      return calculateGrossToNet({
        grossSalary: numericSalary,
        region: selectedRegion,
        dependents,
        insuranceSalaryType: insuranceType,
        customInsuranceSalary: insuranceType === "custom" ? numericCustomInsurance : null,
      });
    } else {
      return calculateNetToGross({
        netSalary: numericSalary,
        region: selectedRegion,
        dependents,
        insuranceSalaryType: insuranceType,
        customInsuranceSalary: insuranceType === "custom" ? numericCustomInsurance : null,
      });
    }
  }, [mode, numericSalary, selectedRegion, dependents, insuranceType, numericCustomInsurance]);

  // Handle salary text input
  const handleSalaryChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setSalaryInput("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setSalaryInput(formatNumber(num));
  };

  // Handle custom insurance salary input
  const handleCustomInsuranceChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setCustomInsuranceInput("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setCustomInsuranceInput(formatNumber(num));
  };

  // Preset salary quick selection
  const handleSelectPreset = (value) => {
    setSalaryInput(formatNumber(value));
  };

  // Dependents counter handlers
  const handleIncrementDependents = () => {
    setDependents((prev) => Math.min(20, prev + 1));
  };

  const handleDecrementDependents = () => {
    setDependents((prev) => Math.max(0, prev - 1));
  };

  const handleDependentsChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setDependents(0);
    } else {
      setDependents(Math.max(0, Math.min(20, val)));
    }
  };

  // Đặt lại dữ liệu: xóa toàn bộ dữ liệu lưu tạm trong localStorage và đưa về mặc định
  const handleResetData = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    setSalaryInput("");
    setSelectedRegion("I");
    setDependents(0);
    setInsuranceType("gross");
    setCustomInsuranceInput("");
    setMode("gross_to_net");
    showToast("Đã đặt lại dữ liệu và xóa bộ nhớ tạm!");
  };

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const isGrossToNet = mode === "gross_to_net";
    const summaryText = `[KẾT QUẢ TÍNH THUẾ TNCN - INTERNHUB]
- Chế độ tính: ${isGrossToNet ? "Lương Gross sang Net" : "Lương Net sang Gross"}
- Lương Gross: ${formatCurrency(result.grossSalary)}
- Lương Net thực nhận: ${formatCurrency(result.netSalary)}
- Bảo hiểm bắt buộc (NLĐ đóng 10.5%): ${formatCurrency(result.insurance.employee.total)}
  + BHXH (8%): ${formatCurrency(result.insurance.employee.bhxh)}
  + BHYT (1.5%): ${formatCurrency(result.insurance.employee.bhyt)}
  + BHTN (1%): ${formatCurrency(result.insurance.employee.bhtn)}
- Giảm trừ gia cảnh: ${formatCurrency(result.deductions.total)} (Bản thân 11tr + ${result.deductions.dependentsCount} người phụ thuộc)
- Thu nhập tính thuế: ${formatCurrency(result.taxableIncome)}
- Thuế TNCN phải nộp: ${formatCurrency(result.pitTax)}
- Chi phí doanh nghiệp trả: ${formatCurrency(result.employerTotalCost)}
Công cụ tính thuế TNCN chuẩn tại InternHub.vn`;

    navigator.clipboard.writeText(summaryText);
    showToast("Đã sao chép tóm tắt phiếu lương vào bộ nhớ tạm!");
  };

  // Print results
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="tax-calc-page">
      {/* Hero Section */}
      <section className="tax-hero">
        <div className="tax-hero-badge">
          <i className="bi bi-shield-check"></i>
          <span>Luật Thuế TNCN &amp; Bảo Hiểm Hiện Hành</span>
        </div>
        <h1 className="tax-hero-title">
          Công Cụ <span>Tính Thuế Thu Nhập Cá Nhân</span> (TNCN)
        </h1>
        <p className="tax-hero-desc">
          Tính nhanh lương Gross sang Net &amp; Net sang Gross chuẩn xác nhất. Áp dụng biểu thuế lũy tiến
          từng phần 7 bậc và quy định bảo hiểm bắt buộc theo Nghị định 73/2024/NĐ-CP &amp; 74/2024/NĐ-CP.
        </p>

        {/* Legal Reference Pills */}
        <div className="tax-law-badges">
          <span className="tax-law-pill">
            <i className="bi bi-person-fill"></i> Giảm trừ bản thân: <strong>11 triệu/tháng</strong>
          </span>
          <span className="tax-law-pill">
            <i className="bi bi-people-fill"></i> Người phụ thuộc: <strong>4.4 triệu/người</strong>
          </span>
          <span className="tax-law-pill">
            <i className="bi bi-layers-fill"></i> Biểu thuế: <strong>Lũy tiến 7 bậc</strong>
          </span>
          <span className="tax-law-pill">
            <i className="bi bi-bank"></i> Lương cơ sở: <strong>{formatCurrency(BASE_SALARY)}</strong>
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="tax-container">
        <div className="tax-calculator-grid">
          {/* ==============================================================
              LEFT COLUMN: Interactive Form
              ============================================================== */}
          <div className="tax-input-card">
            <div className="tax-card-header">
              <h2 className="tax-card-header-title">
                <i className="bi bi-sliders"></i>
                Thông Tin Tính Lương
              </h2>
            </div>

            {/* Mode Switch Tabs */}
            <div className="tax-mode-toggle">
              <button
                type="button"
                className={`tax-mode-btn ${mode === "gross_to_net" ? "active" : ""}`}
                onClick={() => setMode("gross_to_net")}
              >
                <i className="bi bi-arrow-right-circle"></i>
                GROSS ➔ NET
              </button>
              <button
                type="button"
                className={`tax-mode-btn ${mode === "net_to_gross" ? "active" : ""}`}
                onClick={() => setMode("net_to_gross")}
              >
                <i className="bi bi-arrow-left-circle"></i>
                NET ➔ GROSS
              </button>
            </div>

            {/* Salary Input */}
            <div className="tax-form-group">
              <label htmlFor="salary-input" className="tax-label">
                <span>
                  {mode === "gross_to_net" ? "Thu nhập Lương GROSS" : "Thu nhập Lương NET thực nhận"}
                </span>
                <span className="tax-label-sub">
                  {mode === "gross_to_net" ? "Lương trước thuế & bảo hiểm" : "Lương thực tế cầm về tay"}
                </span>
              </label>
              <div className="tax-input-wrapper">
                <input
                  id="salary-input"
                  type="text"
                  className="tax-input-currency"
                  value={salaryInput}
                  onChange={handleSalaryChange}
                  placeholder="Nhập mức lương (VD: 15.000.000)..."
                />
                <span className="tax-currency-unit">VNĐ</span>
              </div>

              {/* Quick Select Chips */}
              <div className="tax-quick-chips">
                {PRESET_SALARIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`tax-chip-btn ${numericSalary === item.value ? "active" : ""}`}
                    onClick={() => handleSelectPreset(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Selection */}
            <div className="tax-form-group">
              <div className="tax-label">
                <span>Vùng áp dụng lương tối thiểu</span>
                <span className="tax-label-sub">Để xác định mức đóng BHTN tối đa</span>
              </div>
              <div className="tax-region-grid">
                {Object.values(REGIONS).map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    className={`tax-region-btn ${selectedRegion === reg.id ? "active" : ""}`}
                    onClick={() => setSelectedRegion(reg.id)}
                  >
                    <span className="region-title">{reg.name}</span>
                    <span className="region-wage">{formatCurrency(reg.minSalary).replace(" đ", "")}</span>
                  </button>
                ))}
              </div>
              <div className="tax-region-info-box">
                <i className="bi bi-geo-alt-fill"></i>
                <strong>{REGIONS[selectedRegion].name}: </strong>
                {REGIONS[selectedRegion].description}
                <br />
                <span className="text-muted">
                  (Lương tối thiểu: {formatCurrency(REGIONS[selectedRegion].minSalary)} - Mức trần BHTN:{" "}
                  {formatCurrency(REGIONS[selectedRegion].maxBHTNSalary)})
                </span>
              </div>
            </div>

            {/* Number of Dependents */}
            <div className="tax-form-group">
              <div className="tax-label">
                <span>Số người phụ thuộc</span>
                <span className="tax-label-sub">
                  -4.400.000 đ/người/tháng
                </span>
              </div>
              <div className="tax-counter-group">
                <button
                  type="button"
                  className="tax-counter-btn"
                  onClick={handleDecrementDependents}
                  disabled={dependents <= 0}
                  aria-label="Giảm người phụ thuộc"
                >
                  <i className="bi bi-dash"></i>
                </button>
                <input
                  type="number"
                  className="tax-counter-input"
                  value={dependents}
                  onChange={handleDependentsChange}
                  min="0"
                  max="20"
                />
                <button
                  type="button"
                  className="tax-counter-btn"
                  onClick={handleIncrementDependents}
                  disabled={dependents >= 20}
                  aria-label="Tăng người phụ thuộc"
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              <div className="tax-dependent-preview">
                Giảm trừ phụ thuộc: <strong>{formatCurrency(dependents * DEPENDENT_DEDUCTION)}</strong> (
                {dependents} người)
              </div>
            </div>

            {/* Insurance Calculation Option */}
            <div className="tax-form-group">
              <div className="tax-label">
                <span>Mức lương đóng bảo hiểm</span>
                <span className="tax-label-sub">BHXH 8%, BHYT 1.5%, BHTN 1%</span>
              </div>
              <div className="tax-radio-group">
                <label className="tax-radio-label">
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "gross"}
                    onChange={() => setInsuranceType("gross")}
                  />
                  <span>Đóng trên 100% lương chính thức (Khuyên dùng)</span>
                </label>
                <label className="tax-radio-label">
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "custom"}
                    onChange={() => setInsuranceType("custom")}
                  />
                  <span>Mức lương đóng bảo hiểm khác (Doanh nghiệp quy định)</span>
                </label>
              </div>

              {insuranceType === "custom" && (
                <div className="tax-custom-ins-input">
                  <div className="tax-input-wrapper">
                    <input
                      type="text"
                      className="tax-input-currency"
                      value={customInsuranceInput}
                      onChange={handleCustomInsuranceChange}
                      placeholder="Mức lương đóng BH..."
                    />
                    <span className="tax-currency-unit">VNĐ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="tax-form-actions">
              <button
                type="button"
                className="tax-btn-submit"
                onClick={() => {
                  if (!numericSalary) {
                    showToast("Vui lòng nhập số tiền lương để bắt đầu tính!");
                  } else {
                    showToast("Kết quả tính thuế đã được cập nhật tức thì!");
                  }
                }}
              >
                <i className="bi bi-calculator-fill"></i>
                Tính Thuế Ngay
              </button>
              <button
                type="button"
                className="tax-btn-reset"
                onClick={handleResetData}
                title="Xóa toàn bộ dữ liệu đã nhập và đưa về mặc định"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                Đặt lại dữ liệu
              </button>
            </div>
          </div>

          {/* ==============================================================
              RIGHT COLUMN: Results Dashboard
              ============================================================== */}
          <div className="tax-result-area">
            {numericSalary <= 0 ? (
              <div className="tax-empty-state-card">
                <div className="tax-empty-state-icon">
                  <i className="bi bi-calculator"></i>
                </div>
                <h3 className="tax-empty-state-title">Chưa Có Dữ Liệu Tính Lương</h3>
                <p className="tax-empty-state-desc">
                  Vui lòng nhập mức lương ở bảng bên trái hoặc bấm chọn nhanh các gợi ý bên dưới để
                  xem kết quả tính thuế TNCN, tiền bảo hiểm và lương Net thực nhận tức thì.
                </p>

                <div className="tax-empty-state-presets">
                  <span className="tax-empty-preset-label">Gợi ý chọn nhanh mức lương:</span>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {PRESET_SALARIES.slice(0, 4).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className="tax-chip-btn"
                        onClick={() => handleSelectPreset(item.value)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tax-empty-state-tips">
                  <div className="tax-empty-tip-item">
                    <i className="bi bi-shield-check text-danger"></i>
                    <span>Áp dụng biểu thuế lũy tiến từng phần 7 bậc chuẩn pháp luật Việt Nam.</span>
                  </div>
                  <div className="tax-empty-tip-item">
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>Giảm trừ gia cảnh: Bản thân 11 triệu/tháng + 4.4 triệu/người phụ thuộc.</span>
                  </div>
                  <div className="tax-empty-tip-item">
                    <i className="bi bi-save2 text-primary"></i>
                    <span>Dữ liệu tính toán được lưu tạm tự động trên trình duyệt cho các lần sau.</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Big Highlight Result Card */}
                <div className="tax-net-highlight-card">
                  <div className="tax-net-header">
                    <span className="tax-net-label">
                      <i className="bi bi-wallet2"></i>
                      {mode === "gross_to_net" ? "LƯƠNG NET THỰC NHẬN" : "LƯƠNG GROSS CẦN ĐỀ XUẤT"}
                    </span>
                    <span className="tax-net-badge">
                      {mode === "gross_to_net"
                        ? `Thực nhận ${result.percentages.netPercent}% thu nhập`
                        : "Mức lương thỏa thuận Gross"}
                    </span>
                  </div>

                  <div className="tax-net-amount">
                    {formatCurrency(mode === "gross_to_net" ? result.netSalary : result.grossSalary)}
                  </div>

                  <div className="tax-net-subtext">
                    <i className="bi bi-info-circle"></i>
                    {mode === "gross_to_net"
                      ? `Đã trừ ${formatCurrency(result.insurance.employee.total)} bảo hiểm và ${formatCurrency(
                          result.pitTax
                        )} thuế TNCN.`
                      : `Để nhận về đúng ${formatCurrency(result.netSalary)} Net sau khi trừ thuế & bảo hiểm.`}
                  </div>

                  {/* Quick Actions */}
                  <div className="tax-result-quick-actions">
                    <button type="button" className="tax-action-pill-btn" onClick={handleCopySummary}>
                      <i className="bi bi-clipboard-check"></i>
                      Sao chép tóm tắt
                    </button>
                    <button type="button" className="tax-action-pill-btn" onClick={handlePrint}>
                      <i className="bi bi-printer"></i>
                      In kết quả / PDF
                    </button>
                    <Link to="/jobs" className="tax-action-pill-btn" style={{ textDecoration: "none" }}>
                      <i className="bi bi-briefcase"></i>
                      Xem việc làm phù hợp
                    </Link>
                  </div>
                </div>

            {/* 4 Stat Cards */}
            <div className="tax-stat-cards-grid">
              {/* Lương Gross */}
              <div className="tax-stat-card">
                <div className="tax-stat-top">
                  <span className="tax-stat-title">Lương Gross</span>
                  <div className="tax-stat-icon gross">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                </div>
                <div className="tax-stat-value">{formatCurrency(result.grossSalary)}</div>
                <span className="tax-stat-sub">Tổng thu nhập ban đầu</span>
              </div>

              {/* Bảo hiểm bắt buộc */}
              <div className="tax-stat-card">
                <div className="tax-stat-top">
                  <span className="tax-stat-title">Bảo hiểm (10.5%)</span>
                  <div className="tax-stat-icon insurance">
                    <i className="bi bi-shield-shaded"></i>
                  </div>
                </div>
                <div className="tax-stat-value">{formatCurrency(result.insurance.employee.total)}</div>
                <span className="tax-stat-sub">BHXH + BHYT + BHTN</span>
              </div>

              {/* Giảm trừ gia cảnh */}
              <div className="tax-stat-card">
                <div className="tax-stat-top">
                  <span className="tax-stat-title">Giảm trừ gia cảnh</span>
                  <div className="tax-stat-icon deduction">
                    <i className="bi bi-people"></i>
                  </div>
                </div>
                <div className="tax-stat-value">{formatCurrency(result.deductions.total)}</div>
                <span className="tax-stat-sub">Bản thân + {dependents} người PT</span>
              </div>

              {/* Thuế TNCN */}
              <div className="tax-stat-card">
                <div className="tax-stat-top">
                  <span className="tax-stat-title">Thuế TNCN nộp</span>
                  <div className="tax-stat-icon tax">
                    <i className="bi bi-receipt"></i>
                  </div>
                </div>
                <div className="tax-stat-value">{formatCurrency(result.pitTax)}</div>
                <span className="tax-stat-sub">
                  {result.pitTax > 0 ? "Theo 7 bậc lũy tiến" : "Miễn thuế TNCN"}
                </span>
              </div>
            </div>

            {/* Income Distribution Visual Breakdown Bar */}
            <div className="tax-breakdown-card">
              <div className="tax-breakdown-title">
                <i className="bi bi-pie-chart-fill" style={{ color: "#c9184a" }}></i>
                Tỷ Lệ Phân Bổ Thu Nhập Trên Tổng Lương Gross
              </div>

              <div className="tax-bar-container" title="Thanh phân bổ thu nhập">
                <div
                  className="tax-bar-segment net"
                  style={{ width: `${result.percentages.netPercent}%` }}
                ></div>
                <div
                  className="tax-bar-segment ins"
                  style={{ width: `${result.percentages.insurancePercent}%` }}
                ></div>
                <div
                  className="tax-bar-segment tax"
                  style={{ width: `${result.percentages.taxPercent}%` }}
                ></div>
              </div>

              <div className="tax-legend-grid">
                <div className="tax-legend-item">
                  <span className="tax-legend-dot net"></span>
                  <div className="tax-legend-info">
                    <span className="tax-legend-name">Lương Net thực nhận</span>
                    <span className="tax-legend-val">{formatCurrency(result.netSalary)}</span>
                    <span className="tax-legend-percent">{result.percentages.netPercent}% tổng lương</span>
                  </div>
                </div>

                <div className="tax-legend-item">
                  <span className="tax-legend-dot ins"></span>
                  <div className="tax-legend-info">
                    <span className="tax-legend-name">Bảo hiểm nhân viên đóng</span>
                    <span className="tax-legend-val">
                      {formatCurrency(result.insurance.employee.total)}
                    </span>
                    <span className="tax-legend-percent">
                      {result.percentages.insurancePercent}% tổng lương
                    </span>
                  </div>
                </div>

                <div className="tax-legend-item">
                  <span className="tax-legend-dot tax"></span>
                  <div className="tax-legend-info">
                    <span className="tax-legend-name">Thuế TNCN nộp ngân sách</span>
                    <span className="tax-legend-val">{formatCurrency(result.pitTax)}</span>
                    <span className="tax-legend-percent">{result.percentages.taxPercent}% tổng lương</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Interactive Detail Tabs */}
            <div className="tax-details-card">
              <div className="tax-tabs-header">
                <button
                  type="button"
                  className={`tax-tab-btn ${activeTab === "brackets" ? "active" : ""}`}
                  onClick={() => setActiveTab("brackets")}
                >
                  <i className="bi bi-list-ol"></i>
                  Diễn Giải 7 Bậc Thuế TNCN
                </button>
                <button
                  type="button"
                  className={`tax-tab-btn ${activeTab === "insurance" ? "active" : ""}`}
                  onClick={() => setActiveTab("insurance")}
                >
                  <i className="bi bi-shield-check"></i>
                  Chi Tiết Bảo Hiểm &amp; Doanh Nghiệp
                </button>
                <button
                  type="button"
                  className={`tax-tab-btn ${activeTab === "steps" ? "active" : ""}`}
                  onClick={() => setActiveTab("steps")}
                >
                  <i className="bi bi-diagram-3"></i>
                  Công Thức Tính Từng Bước
                </button>
              </div>

              <div className="tax-tab-body">
                {/* TAB 1: 7 TAX BRACKETS TABLE */}
                {activeTab === "brackets" && (
                  <div className="table-responsive">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <strong>Thu nhập tính thuế (TNTT): </strong>
                        <span className="text-danger fw-bold">
                          {formatCurrency(result.taxableIncome)}
                        </span>
                      </div>
                      <small className="text-muted">
                        TNTT = Thu nhập trước thuế - Giảm trừ gia cảnh
                      </small>
                    </div>

                    <table className="tax-custom-table">
                      <thead>
                        <tr>
                          <th>Bậc</th>
                          <th>Thu nhập tính thuế / tháng</th>
                          <th>Thuế suất</th>
                          <th>Tiền tính trong bậc</th>
                          <th className="text-end">Thuế nộp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.brackets.map((b) => (
                          <tr
                            key={b.bracket}
                            className={`${b.isCurrentBracket ? "current-bracket" : ""} ${
                              b.isReached ? "active-bracket" : ""
                            }`}
                          >
                            <td>
                              <div className="tax-bracket-cell">
                                <span className={`bracket-badge ${b.isReached ? "active" : ""}`}>
                                  {b.bracket}
                                </span>
                                {b.isCurrentBracket && (
                                  <span className="badge-current-pill">
                                    <i className="bi bi-geo-alt-fill" style={{ fontSize: "0.62rem" }}></i>
                                    Bậc chạm tới
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{b.rangeLabel}</td>
                            <td>
                              <span className="badge bg-light text-dark border fw-medium" style={{ borderRadius: "4px" }}>
                                {b.ratePercent}
                              </span>
                            </td>
                            <td>{formatCurrency(b.taxableAmountInBracket)}</td>
                            <td className="text-end fw-bold">
                              {b.taxInBracket > 0 ? (
                                <span className="text-danger">{formatCurrency(b.taxInBracket)}</span>
                              ) : (
                                <span className="text-muted">0 đ</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="tax-table-total-row">
                          <td colSpan="4">
                            <strong>TỔNG TIỀN THUẾ TNCN PHẢI NỘP</strong>
                          </td>
                          <td className="text-end text-danger fw-bold fs-6">
                            {formatCurrency(result.pitTax)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 2: INSURANCE & EMPLOYER COSTS */}
                {activeTab === "insurance" && (
                  <div>
                    <div className="ins-section-title">
                      <i className="bi bi-person-check-fill text-danger"></i>
                      Khoản Đóng Bảo Hiểm Bắt Buộc (Người Lao Động &amp; Doanh Nghiệp)
                    </div>

                    <div className="table-responsive">
                      <table className="tax-custom-table">
                        <thead>
                          <tr>
                            <th>Loại bảo hiểm</th>
                            <th>Mức lương tính BH</th>
                            <th>NLĐ đóng (%)</th>
                            <th>Tiền NLĐ đóng</th>
                            <th>Công ty đóng (%)</th>
                            <th className="text-end">Tiền công ty đóng</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <strong>BHXH (Bảo hiểm xã hội)</strong>
                              <br />
                              <small className="text-muted">
                                Trần: {formatCurrency(MAX_INSURANCE_BASE_SALARY)}
                              </small>
                            </td>
                            <td>{formatCurrency(result.insurance.salaryForBHXH_BHYT)}</td>
                            <td>8%</td>
                            <td className="fw-semibold">
                              {formatCurrency(result.insurance.employee.bhxh)}
                            </td>
                            <td>17.5%</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(result.insurance.employer.bhxh)}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>BHYT (Bảo hiểm y tế)</strong>
                              <br />
                              <small className="text-muted">
                                Trần: {formatCurrency(MAX_INSURANCE_BASE_SALARY)}
                              </small>
                            </td>
                            <td>{formatCurrency(result.insurance.salaryForBHXH_BHYT)}</td>
                            <td>1.5%</td>
                            <td className="fw-semibold">
                              {formatCurrency(result.insurance.employee.bhyt)}
                            </td>
                            <td>3%</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(result.insurance.employer.bhyt)}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>BHTN (Bảo hiểm thất nghiệp)</strong>
                              <br />
                              <small className="text-muted">
                                Trần {REGIONS[selectedRegion].name}:{" "}
                                {formatCurrency(result.insurance.maxBHTN)}
                              </small>
                            </td>
                            <td>{formatCurrency(result.insurance.salaryForBHTN)}</td>
                            <td>1%</td>
                            <td className="fw-semibold">
                              {formatCurrency(result.insurance.employee.bhtn)}
                            </td>
                            <td>1%</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(result.insurance.employer.bhtn)}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Bảo hiểm TNLĐ - BNN</strong>
                              <br />
                              <small className="text-muted">Doanh nghiệp đóng 100%</small>
                            </td>
                            <td>{formatCurrency(result.insurance.salaryForBHXH_BHYT)}</td>
                            <td>0%</td>
                            <td className="text-muted">0 đ</td>
                            <td>0.5%</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(result.insurance.employer.bhtnld)}
                            </td>
                          </tr>
                          <tr className="tax-table-total-row">
                            <td colSpan="2">
                              <strong>TỔNG CỘNG TIỀN BẢO HIỂM</strong>
                            </td>
                            <td>
                              <span className="badge bg-danger">10.5%</span>
                            </td>
                            <td className="text-danger fw-bold">
                              {formatCurrency(result.insurance.employee.total)}
                            </td>
                            <td>
                              <span className="badge bg-secondary">21.5%</span>
                            </td>
                            <td className="text-end text-dark fw-bold">
                              {formatCurrency(result.insurance.employer.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="ins-callout-box">
                      <i className="bi bi-building-check me-2 text-danger"></i>
                      <strong>Tổng chi phí người sử dụng lao động (Doanh nghiệp) phải chi trả: </strong>
                      <span className="fw-bold text-danger fs-6">
                        {formatCurrency(result.employerTotalCost)}
                      </span>{" "}
                      (bao gồm Lương Gross {formatCurrency(result.grossSalary)} + Bảo hiểm công ty đóng{" "}
                      {formatCurrency(result.insurance.employer.total)}).
                    </div>
                  </div>
                )}

                {/* TAB 3: STEP BY STEP FORMULA */}
                {activeTab === "steps" && (
                  <div className="tax-steps-timeline">
                    <div className="tax-step-item">
                      <div className="tax-step-num">1</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Tính bảo hiểm bắt buộc người lao động đóng</div>
                        <div className="tax-step-formula">
                          Bảo hiểm = (BHXH 8%) + (BHYT 1.5%) + (BHTN 1%) = 10.5%
                        </div>
                        <p className="tax-step-desc">
                          Số tiền: <strong>{formatCurrency(result.insurance.employee.total)}</strong> (áp
                          dụng mức trần theo lương cơ sở 46.800.000đ và lương tối thiểu {REGIONS[selectedRegion].name}
                          ).
                        </p>
                      </div>
                    </div>

                    <div className="tax-step-item">
                      <div className="tax-step-num">2</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Tính thu nhập trước thuế</div>
                        <div className="tax-step-formula">
                          Thu nhập trước thuế = Lương Gross - Bảo hiểm bắt buộc
                        </div>
                        <p className="tax-step-desc">
                          = {formatCurrency(result.grossSalary)} -{" "}
                          {formatCurrency(result.insurance.employee.total)} ={" "}
                          <strong>{formatCurrency(result.incomeBeforeTax)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="tax-step-item">
                      <div className="tax-step-num">3</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Xác định các khoản giảm trừ gia cảnh</div>
                        <div className="tax-step-formula">
                          Tổng giảm trừ = Giảm trừ bản thân (11tr) + ({dependents} người phụ thuộc × 4.4tr)
                        </div>
                        <p className="tax-step-desc">
                          = 11.000.000 + {formatCurrency(dependents * DEPENDENT_DEDUCTION)} ={" "}
                          <strong>{formatCurrency(result.deductions.total)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="tax-step-item">
                      <div className="tax-step-num">4</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Tính thu nhập tính thuế (TNTT)</div>
                        <div className="tax-step-formula">
                          Thu nhập tính thuế = Max(0, Thu nhập trước thuế - Tổng giảm trừ)
                        </div>
                        <p className="tax-step-desc">
                          = Max(0, {formatCurrency(result.incomeBeforeTax)} -{" "}
                          {formatCurrency(result.deductions.total)}) ={" "}
                          <strong>{formatCurrency(result.taxableIncome)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="tax-step-item">
                      <div className="tax-step-num">5</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Áp dụng biểu thuế lũy tiến từng phần 7 bậc</div>
                        <div className="tax-step-formula">
                          Thuế TNCN = Tổng thuế từng bậc (từ Bậc 1 đến Bậc 7)
                        </div>
                        <p className="tax-step-desc">
                          Tổng số thuế TNCN phải nộp trong tháng ={" "}
                          <strong className="text-danger">{formatCurrency(result.pitTax)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="tax-step-item">
                      <div className="tax-step-num">6</div>
                      <div className="tax-step-content">
                        <div className="tax-step-title">Tính tiền lương Net thực nhận</div>
                        <div className="tax-step-formula">
                          Lương Net = Lương Gross - Bảo hiểm bắt buộc - Thuế TNCN
                        </div>
                        <p className="tax-step-desc">
                          = {formatCurrency(result.grossSalary)} -{" "}
                          {formatCurrency(result.insurance.employee.total)} - {formatCurrency(result.pitTax)} ={" "}
                          <strong className="text-success fs-6">{formatCurrency(result.netSalary)}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          BOTTOM FAQ SECTION
          ============================================================== */}
      <section className="tax-faq-section">
        <div className="tax-faq-header">
          <div className="tax-faq-badge">
            <i className="bi bi-question-circle-fill"></i>
            <span>Hỏi Đáp Pháp Luật</span>
          </div>
          <h2 className="tax-faq-title">Câu Hỏi Thường Gặp Về Thuế Thu Nhập Cá Nhân</h2>
        </div>

        <div className="tax-faq-grid">
          <div className="tax-faq-card">
            <div className="tax-faq-q">
              <i className="bi bi-patch-question-fill"></i>
              <span>Khi nào người lao động phải nộp thuế TNCN?</span>
            </div>
            <p className="tax-faq-a">
              Người lao động chỉ phải nộp thuế TNCN khi Thu nhập tính thuế &gt; 0. Tức là thu nhập sau khi đã
              trừ đi các khoản đóng bảo hiểm bắt buộc (10.5%) vẫn vượt quá mức giảm trừ gia cảnh (11 triệu
              cho bản thân + 4.4 triệu cho mỗi người phụ thuộc). Nếu thu nhập trước thuế dưới 11 triệu (không
              người phụ thuộc), bạn hoàn toàn không phải nộp thuế.
            </p>
          </div>

          <div className="tax-faq-card">
            <div className="tax-faq-q">
              <i className="bi bi-patch-question-fill"></i>
              <span>Ai được đăng ký làm người phụ thuộc để giảm trừ thuế?</span>
            </div>
            <p className="tax-faq-a">
              Người phụ thuộc gồm: Con chưa thành niên (dưới 18 tuổi), con thành niên đang học đại học/cao
              đẳng không có thu nhập hoặc thu nhập bình quân tháng không quá 1 triệu đồng; Vợ/chồng, cha mẹ đẻ,
              cha mẹ chồng/vợ hết tuổi lao động hoặc mất khả năng lao động có thu nhập không quá 1 triệu/tháng.
              Mỗi người phụ thuộc chỉ được tính giảm trừ 1 lần cho 1 người nộp thuế.
            </p>
          </div>

          <div className="tax-faq-card">
            <div className="tax-faq-q">
              <i className="bi bi-patch-question-fill"></i>
              <span>Nên thỏa thuận nhận lương Gross hay lương Net khi phỏng vấn?</span>
            </div>
            <p className="tax-faq-a">
              Nhận lương Gross minh bạch và có lợi hơn về lâu dài cho người lao động. Khi nhận lương Gross, bạn
              chủ động nắm rõ mức tiền công ty đóng BHXH, BHYT, BHTN và quyền lợi về thai sản, ốm đau, trợ cấp
              thất nghiệp sẽ được hưởng ở mức cao nhất theo quy định luật lao động.
            </p>
          </div>

          <div className="tax-faq-card">
            <div className="tax-faq-q">
              <i className="bi bi-patch-question-fill"></i>
              <span>Mức trần đóng bảo hiểm xã hội và BHTN được quy định ra sao?</span>
            </div>
            <p className="tax-faq-a">
              Theo quy định, tiền lương tháng đóng BHXH, BHYT tối đa bằng 20 lần mức lương cơ sở (20 ×
              2.340.000đ = 46.800.000đ). Tiền lương đóng BHTN tối đa bằng 20 lần lương tối thiểu vùng (Vùng
              I là 99.200.000đ, Vùng II là 88.200.000đ, Vùng III là 77.200.000đ, Vùng IV là 69.000.000đ).
            </p>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="tax-toast" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
