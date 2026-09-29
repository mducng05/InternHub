/**
 * Tiện ích tính toán Thuế Thu nhập Cá nhân (TNCN) và Lương Gross - Net
 * Cập nhật theo luật Thuế TNCN hiện hành của Việt Nam,
 * Nghị quyết 954/2020/UBTVQH14 về giảm trừ gia cảnh,
 * Nghị định 73/2024/NĐ-CP về mức lương cơ sở (2.340.000 đ/tháng),
 * Nghị định 74/2024/NĐ-CP về mức lương tối thiểu vùng từ 01/07/2024.
 */

// Mức lương cơ sở hiện hành từ 01/07/2024: 2.340.000 VNĐ
export const BASE_SALARY = 2340000;

// Mức giảm trừ gia cảnh
export const PERSONAL_DEDUCTION = 11000000; // Giảm trừ bản thân: 11 triệu/tháng
export const DEPENDENT_DEDUCTION = 4400000; // Giảm trừ người phụ thuộc: 4.4 triệu/người/tháng

// Mức đóng bảo hiểm tối đa cho BHXH & BHYT (bằng 20 lần mức lương cơ sở)
export const MAX_INSURANCE_BASE_SALARY = BASE_SALARY * 20; // 46.800.000 VNĐ

// Thông tin mức lương tối thiểu và mức đóng BHTN tối đa theo 4 vùng (NĐ 74/2024/NĐ-CP)
export const REGIONS = {
  I: {
    id: "I",
    name: "Vùng I",
    minSalary: 4960000,
    maxBHTNSalary: 4960000 * 20, // 99.200.000 VNĐ
    description: "Hà Nội, TP.HCM, Hải Phòng, Quảng Ninh, Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu...",
  },
  II: {
    id: "II",
    name: "Vùng II",
    minSalary: 4410000,
    maxBHTNSalary: 4410000 * 20, // 88.200.000 VNĐ
    description: "Đà Nẵng, Cần Thơ, Nha Trang, Huế, Thái Nguyên, các huyện/thị thành phố lớn...",
  },
  III: {
    id: "III",
    name: "Vùng III",
    minSalary: 3860000,
    maxBHTNSalary: 3860000 * 20, // 77.200.000 VNĐ
    description: "Các huyện, thị xã còn lại thuộc các tỉnh trung du, đồng bằng...",
  },
  IV: {
    id: "IV",
    name: "Vùng IV",
    minSalary: 3450000,
    maxBHTNSalary: 3450000 * 20, // 69.000.000 VNĐ
    description: "Khu vực nông thôn, miền núi, hải đảo vùng sâu vùng xa...",
  },
};

// Tỷ lệ đóng bảo hiểm của Người Lao Động (NLĐ)
export const EMPLOYEE_RATES = {
  bhxh: 0.08,  // 8% Bảo hiểm xã hội
  bhyt: 0.015, // 1.5% Bảo hiểm y tế
  bhtn: 0.01,  // 1% Bảo hiểm thất nghiệp
  total: 0.105 // 10.5%
};

// Tỷ lệ đóng bảo hiểm của Người Sử Dụng Lao Động (Công ty / Doanh nghiệp)
export const EMPLOYER_RATES = {
  bhxh: 0.175,  // 17.5% (Hưu trí, tử tuất, ốm đau, thai sản)
  bhyt: 0.03,   // 3% Bảo hiểm y tế
  bhtn: 0.01,   // 1% Bảo hiểm thất nghiệp
  bhtnld: 0.005,// 0.5% Bảo hiểm tai nạn lao động - bệnh nghề nghiệp
  total: 0.215  // 21.5%
};

// Biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN
export const TAX_BRACKETS_CONFIG = [
  {
    bracket: 1,
    min: 0,
    max: 5000000,
    rate: 0.05,
    ratePercent: "5%",
    rangeLabel: "Đến 5 triệu VNĐ",
    formula: "TNTT × 5%",
    quickDeduction: 0,
    maxBracketTax: 250000,
  },
  {
    bracket: 2,
    min: 5000000,
    max: 10000000,
    rate: 0.10,
    ratePercent: "10%",
    rangeLabel: "Trên 5 đến 10 triệu VNĐ",
    formula: "TNTT × 10% - 250.000",
    quickDeduction: 250000,
    maxBracketTax: 500000,
  },
  {
    bracket: 3,
    min: 10000000,
    max: 18000000,
    rate: 0.15,
    ratePercent: "15%",
    rangeLabel: "Trên 10 đến 18 triệu VNĐ",
    formula: "TNTT × 15% - 750.000",
    quickDeduction: 750000,
    maxBracketTax: 1200000,
  },
  {
    bracket: 4,
    min: 18000000,
    max: 32000000,
    rate: 0.20,
    ratePercent: "20%",
    rangeLabel: "Trên 18 đến 32 triệu VNĐ",
    formula: "TNTT × 20% - 1.650.000",
    quickDeduction: 1650000,
    maxBracketTax: 2800000,
  },
  {
    bracket: 5,
    min: 32000000,
    max: 52000000,
    rate: 0.25,
    ratePercent: "25%",
    rangeLabel: "Trên 32 đến 52 triệu VNĐ",
    formula: "TNTT × 25% - 3.250.000",
    quickDeduction: 3250000,
    maxBracketTax: 5000000,
  },
  {
    bracket: 6,
    min: 52000000,
    max: 80000000,
    rate: 0.30,
    ratePercent: "30%",
    rangeLabel: "Trên 52 đến 80 triệu VNĐ",
    formula: "TNTT × 30% - 5.850.000",
    quickDeduction: 5850000,
    maxBracketTax: 8400000,
  },
  {
    bracket: 7,
    min: 80000000,
    max: Infinity,
    rate: 0.35,
    ratePercent: "35%",
    rangeLabel: "Trên 80 triệu VNĐ",
    formula: "TNTT × 35% - 9.850.000",
    quickDeduction: 9850000,
    maxBracketTax: Infinity,
  },
];

/**
 * Tính các khoản bảo hiểm (BHXH, BHYT, BHTN)
 */
export function calculateInsurance(salary, regionKey = "I", customInsuranceSalary = null) {
  const baseSalaryForInsurance =
    customInsuranceSalary !== null && customInsuranceSalary !== undefined
      ? Math.max(0, Number(customInsuranceSalary))
      : Math.max(0, Number(salary));

  const region = REGIONS[regionKey] || REGIONS.I;

  // Căn cứ tính BHXH, BHYT: tối đa 20 lần lương cơ sở (46.800.000đ)
  const salaryForBHXH_BHYT = Math.min(baseSalaryForInsurance, MAX_INSURANCE_BASE_SALARY);

  // Căn cứ tính BHTN: tối đa 20 lần mức lương tối thiểu vùng
  const salaryForBHTN = Math.min(baseSalaryForInsurance, region.maxBHTNSalary);

  // 1. Người lao động đóng
  const employeeBHXH = Math.round(salaryForBHXH_BHYT * EMPLOYEE_RATES.bhxh);
  const employeeBHYT = Math.round(salaryForBHXH_BHYT * EMPLOYEE_RATES.bhyt);
  const employeeBHTN = Math.round(salaryForBHTN * EMPLOYEE_RATES.bhtn);
  const employeeTotal = employeeBHXH + employeeBHYT + employeeBHTN;

  // 2. Doanh nghiệp (Người sử dụng lao động) đóng
  const employerBHXH = Math.round(salaryForBHXH_BHYT * EMPLOYER_RATES.bhxh);
  const employerBHYT = Math.round(salaryForBHXH_BHYT * EMPLOYER_RATES.bhyt);
  const employerBHTN = Math.round(salaryForBHTN * EMPLOYER_RATES.bhtn);
  const employerBHTNLD = Math.round(salaryForBHXH_BHYT * EMPLOYER_RATES.bhtnld);
  const employerTotal = employerBHXH + employerBHYT + employerBHTN + employerBHTNLD;

  return {
    baseSalaryForInsurance,
    salaryForBHXH_BHYT,
    salaryForBHTN,
    maxBHXH_BHYT: MAX_INSURANCE_BASE_SALARY,
    maxBHTN: region.maxBHTNSalary,
    employee: {
      bhxh: employeeBHXH,
      bhyt: employeeBHYT,
      bhtn: employeeBHTN,
      total: employeeTotal,
    },
    employer: {
      bhxh: employerBHXH,
      bhyt: employerBHYT,
      bhtn: employerBHTN,
      bhtnld: employerBHTNLD,
      total: employerTotal,
    },
  };
}

/**
 * Tính chi tiết thuế theo Biểu thuế lũy tiến từng phần 7 bậc
 * @param {number} taxableIncome - Thu nhập tính thuế (sau khi trừ BH và các khoản giảm trừ)
 */
export function calculateTaxProgressive(taxableIncome) {
  const income = Math.max(0, Number(taxableIncome));
  let totalTax = 0;

  const bracketResults = TAX_BRACKETS_CONFIG.map((cfg) => {
    let taxableAmountInBracket = 0;
    let taxInBracket = 0;
    let isReached = false;
    let isCurrentBracket = false;

    if (income > cfg.min) {
      isReached = true;
      const bracketUpper = cfg.max === Infinity ? income : Math.min(income, cfg.max);
      taxableAmountInBracket = Math.max(0, bracketUpper - cfg.min);
      taxInBracket = Math.round(taxableAmountInBracket * cfg.rate);
      totalTax += taxInBracket;

      if (income <= cfg.max) {
        isCurrentBracket = true;
      }
    }

    return {
      ...cfg,
      taxableAmountInBracket,
      taxInBracket,
      isReached,
      isCurrentBracket,
    };
  });

  return {
    taxableIncome: income,
    totalTax,
    brackets: bracketResults,
  };
}

/**
 * Tính Lương Gross sang Net
 * @param {Object} options
 * @param {number} options.grossSalary
 * @param {string} options.region
 * @param {number} options.dependents
 * @param {string} options.insuranceSalaryType - 'gross' | 'custom'
 * @param {number} options.customInsuranceSalary
 */
export function calculateGrossToNet({
  grossSalary = 0,
  region = "I",
  dependents = 0,
  insuranceSalaryType = "gross",
  customInsuranceSalary = null,
}) {
  const gross = Math.max(0, Number(grossSalary));
  const numDependents = Math.max(0, Number(dependents));

  const insSalary =
    insuranceSalaryType === "custom" && customInsuranceSalary !== null
      ? Number(customInsuranceSalary)
      : gross;

  // 1. Tính bảo hiểm
  const insurance = calculateInsurance(gross, region, insSalary);

  // 2. Thu nhập trước thuế = Lương Gross - Bảo hiểm nhân viên đóng
  const incomeBeforeTax = Math.max(0, gross - insurance.employee.total);

  // 3. Các khoản giảm trừ gia cảnh
  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = numDependents * DEPENDENT_DEDUCTION;
  const totalDeduction = personalDeduction + dependentDeduction;

  // 4. Thu nhập tính thuế (TNTT) = Thu nhập trước thuế - Giảm trừ gia cảnh
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);

  // 5. Áp dụng biểu thuế lũy tiến 7 bậc
  const taxDetails = calculateTaxProgressive(taxableIncome);
  const pitTax = taxDetails.totalTax;

  // 6. Lương Net thực nhận = Gross - Bảo hiểm - Thuế TNCN
  const netSalary = Math.max(0, gross - insurance.employee.total - pitTax);

  // 7. Tổng chi phí Người sử dụng lao động trả
  const employerTotalCost = gross + insurance.employer.total;

  return {
    mode: "gross_to_net",
    grossSalary: gross,
    netSalary,
    incomeBeforeTax,
    insurance,
    deductions: {
      personal: personalDeduction,
      dependentPerPerson: DEPENDENT_DEDUCTION,
      dependentsCount: numDependents,
      dependentTotal: dependentDeduction,
      total: totalDeduction,
    },
    taxableIncome,
    pitTax,
    brackets: taxDetails.brackets,
    employerTotalCost,
    percentages: {
      netPercent: gross > 0 ? ((netSalary / gross) * 100).toFixed(1) : 0,
      insurancePercent: gross > 0 ? ((insurance.employee.total / gross) * 100).toFixed(1) : 0,
      taxPercent: gross > 0 ? ((pitTax / gross) * 100).toFixed(1) : 0,
    },
  };
}

/**
 * Quy đổi Thu nhập quy đổi (Net - Giảm trừ) sang Thu nhập tính thuế (TNTT)
 * Theo bảng quy đổi tại Thông tư 111/2013/TT-BTC
 */
export function convertConvertedIncomeToTaxableIncome(convertedIncome) {
  if (convertedIncome <= 0) return 0;
  if (convertedIncome <= 4750000) {
    return convertedIncome / 0.95;
  }
  if (convertedIncome <= 9250000) {
    return (convertedIncome - 250000) / 0.9;
  }
  if (convertedIncome <= 16050000) {
    return (convertedIncome - 750000) / 0.85;
  }
  if (convertedIncome <= 27250000) {
    return (convertedIncome - 1650000) / 0.8;
  }
  if (convertedIncome <= 42250000) {
    return (convertedIncome - 3250000) / 0.75;
  }
  if (convertedIncome <= 61850000) {
    return (convertedIncome - 5850000) / 0.7;
  }
  return (convertedIncome - 9850000) / 0.65;
}

/**
 * Tính Lương Net sang Gross
 * @param {Object} options
 * @param {number} options.netSalary
 * @param {string} options.region
 * @param {number} options.dependents
 * @param {string} options.insuranceSalaryType - 'gross' | 'custom'
 * @param {number} options.customInsuranceSalary
 */
export function calculateNetToGross({
  netSalary = 0,
  region = "I",
  dependents = 0,
  insuranceSalaryType = "gross",
  customInsuranceSalary = null,
}) {
  const net = Math.max(0, Number(netSalary));
  const numDependents = Math.max(0, Number(dependents));

  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = numDependents * DEPENDENT_DEDUCTION;
  const totalDeduction = personalDeduction + dependentDeduction;

  // 1. Thu nhập làm căn cứ quy đổi
  const convertedIncome = Math.max(0, net - totalDeduction);

  // 2. Thu nhập tính thuế (TNTT)
  const taxableIncome = Math.round(convertConvertedIncomeToTaxableIncome(convertedIncome));

  // 3. Tính thuế TNCN
  const taxDetails = calculateTaxProgressive(taxableIncome);
  const pitTax = taxDetails.totalTax;

  // 4. Thu nhập trước bảo hiểm = Net + Thuế TNCN
  const incomeBeforeInsurance = net + pitTax;

  // 5. Xác định Gross
  let grossSalary = incomeBeforeInsurance;

  if (insuranceSalaryType === "custom" && customInsuranceSalary !== null) {
    // Nếu mức đóng bảo hiểm cố định
    const ins = calculateInsurance(0, region, customInsuranceSalary);
    grossSalary = Math.round(incomeBeforeInsurance + ins.employee.total);
  } else {
    // Đóng trên 100% Gross: Cần tìm Gross sao cho: Gross - Insurance.employee.total(Gross) = incomeBeforeInsurance
    // Hàm này đơn điệu tăng nên ta dùng Binary Search
    let low = incomeBeforeInsurance;
    let high = incomeBeforeInsurance * 1.5 + 20000000;
    let bestGross = incomeBeforeInsurance;

    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const ins = calculateInsurance(mid, region);
      const testIncomeBeforeInsurance = mid - ins.employee.total;

      if (Math.abs(testIncomeBeforeInsurance - incomeBeforeInsurance) < 0.5) {
        bestGross = mid;
        break;
      }
      if (testIncomeBeforeInsurance < incomeBeforeInsurance) {
        low = mid;
      } else {
        high = mid;
      }
      bestGross = mid;
    }
    grossSalary = Math.round(bestGross);
  }

  // Chạy lại GrossToNet để đảm bảo số liệu chuẩn xác 100% từng hạng mục
  const result = calculateGrossToNet({
    grossSalary,
    region,
    dependents: numDependents,
    insuranceSalaryType,
    customInsuranceSalary,
  });

  return {
    ...result,
    mode: "net_to_gross",
    inputNet: net,
  };
}

/**
 * Format tiền tệ VNĐ
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
}

/**
 * Format số không kèm chữ đ
 */
export function formatNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount));
}

/**
 * Parse chuỗi số có dấu chấm/phẩy thành số nguyên
 */
export function parseCurrencyInput(value) {
  if (!value) return 0;
  const clean = String(value).replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}
