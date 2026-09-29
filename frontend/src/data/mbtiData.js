import enfjImg from "../assets/MBTI Thumbnail/enfj.webp";
import enfpImg from "../assets/MBTI Thumbnail/enfp.webp";
import entjImg from "../assets/MBTI Thumbnail/entj.webp";
import entpImg from "../assets/MBTI Thumbnail/entp.webp";
import esfjImg from "../assets/MBTI Thumbnail/esfj.webp";
import esfpImg from "../assets/MBTI Thumbnail/esfp.webp";
import estjImg from "../assets/MBTI Thumbnail/estj.webp";
import estpImg from "../assets/MBTI Thumbnail/estp.webp";
import infjImg from "../assets/MBTI Thumbnail/infj.webp";
import infpImg from "../assets/MBTI Thumbnail/infp.webp";
import intjImg from "../assets/MBTI Thumbnail/intj.webp";
import intpImg from "../assets/MBTI Thumbnail/intp.webp";
import isfjImg from "../assets/MBTI Thumbnail/isfj.webp";
import isfpImg from "../assets/MBTI Thumbnail/isfp.webp";
import istjImg from "../assets/MBTI Thumbnail/istj.webp";
import istpImg from "../assets/MBTI Thumbnail/istp.webp";

export const MBTI_IMAGES = {
  ENFJ: enfjImg,
  ENFP: enfpImg,
  ENTJ: entjImg,
  ENTP: entpImg,
  ESFJ: esfjImg,
  ESFP: esfpImg,
  ESTJ: estjImg,
  ESTP: estpImg,
  INFJ: infjImg,
  INFP: infpImg,
  INTJ: intjImg,
  INTP: intpImg,
  ISFJ: isfjImg,
  ISFP: isfpImg,
  ISTJ: istjImg,
  ISTP: istpImg,
};

export const MBTI_DIMENSIONS = {
  EI: {
    key: "EI",
    left: { code: "E", name: "Hướng ngoại", desc: "Năng động, nhiệt huyết, nạp năng lượng từ tương tác xã hội" },
    right: { code: "I", name: "Hướng nội", desc: "Điềm tĩnh, sâu sắc, nạp năng lượng qua không gian riêng tư" },
  },
  SN: {
    key: "SN",
    left: { code: "S", name: "Thực tế", desc: "Tập trung chi tiết, dữ kiện thực tế và kinh nghiệm đã chứng minh" },
    right: { code: "N", name: "Trực giác", desc: "Tập trung bức tranh tổng thể, khả năng sáng tạo và ý tưởng tương lai" },
  },
  TF: {
    key: "TF",
    left: { code: "T", name: "Lý trí", desc: "Ra quyết định dựa trên tính logic, khách quan và công bằng" },
    right: { code: "F", name: "Cảm xúc", desc: "Ra quyết định dựa trên giá trị nhân văn, cảm xúc và sự hòa hợp" },
  },
  JP: {
    key: "JP",
    left: { code: "J", name: "Nguyên tắc", desc: "Tổ chức rõ ràng, có kế hoạch, tuân thủ nguyên tắc và thời hạn" },
    right: { code: "P", name: "Linh hoạt", desc: "Thích ứng nhanh, cởi mở, tự nhiên và sẵn sàng đón nhận thay đổi" },
  },
};

export const MBTI_TYPES = {
  INTJ: {
    code: "INTJ",
    name: "Nhà Kiến Tạo",
    englishTitle: "Architect",
    group: "Nhà Phân Tích",
    tagline: "Tư duy chiến lược, độc lập và luôn tìm kiếm giải pháp tối ưu cho mọi vấn đề.",
    summary: "Người có tư duy logic sắc bén, khả năng lên kế hoạch dài hạn xuất sắc và tiêu chuẩn cao về năng lực làm việc.",
    personalityDescription: "Các INTJ là những người có tư duy chiến lược sâu sắc, độc lập và luôn tìm kiếm sự tối ưu trong mọi việc. Họ nhìn nhận thế giới qua lăng kính logic và các quy luật phát triển dài hạn. Ẩn sau vẻ ngoài điềm tĩnh, ít nói là một khối óc nhạy bén, quyết đoán, không ngừng lên kế hoạch chi tiết để biến những ý tưởng lớn thành hiện thực rõ ràng.",
    traits: [
      "Tư duy chiến lược và tầm nhìn xa",
      "Độc lập, kỷ luật và tự chủ cao",
      "Khả năng phân tích hệ thống phức tạp",
      "Hướng đến hiệu quả và sự hoàn thiện",
    ],
    careers: ["Kỹ sư phần mềm / Backend Developer", "Data Scientist / Analyst", "Chuyên viên phân tích hệ thống", "Quản lý chiến lược"],
  },
  INTP: {
    code: "INTP",
    name: "Nhà Tư Duy",
    englishTitle: "Logician",
    group: "Nhà Phân Tích",
    tagline: "Nhà phát minh sáng tạo với niềm đam mê bất tận đối với tri thức và lý thuyết.",
    summary: "Người tò mò, thích khám phá nguyên lý vận hành của mọi thứ và xuất sắc trong việc tư duy trừu tượng.",
    personalityDescription: "Các INTP là những nhà tư duy độc lập với niềm đam mê bất tận trong việc phân tích các học thuyết và cơ chế vận hành của vạn vật. Họ yêu thích sự thật khách quan, ham học hỏi và luôn đặt câu hỏi phản biện. Các INTP có phong cách làm việc tự do, sáng tạo và đặc biệt thăng hoa khi giải quyết những bài toán phức tạp đòi hỏi chiều sâu trí tuệ.",
    traits: [
      "Khả năng tư duy logic và trừu tượng sâu",
      "Tò mò trí tuệ, luôn đặt câu hỏi",
      "Sáng tạo các giải pháp độc đáo",
      "Độc lập và cởi mở với cái mới",
    ],
    careers: ["Lập trình viên / AI Engineer", "Nhà nghiên cứu dữ liệu", "Chuyên viên an ninh mạng", "Thiết kế thuật toán"],
  },
  ENTJ: {
    code: "ENTJ",
    name: "Nhà Lãnh Đạo",
    englishTitle: "Commander",
    group: "Nhà Phân Tích",
    tagline: "Quyết đoán, can đảm và có năng lực dẫn dắt tập thể vượt qua mọi thử thách.",
    summary: "Thủ lĩnh bẩm sinh với sự tự tin mạnh mẽ, tầm nhìn chiến lược và khả năng thúc đẩy đội ngũ đạt mục tiêu.",
    personalityDescription: "Các ENTJ là những nhà lãnh đạo bẩm sinh với sự quyết đoán, tự tin và tầm nhìn chiến lược vượt trội. Họ yêu thích việc thiết lập mục tiêu lớn, sắp xếp nguồn lực và dẫn dắt tập thể vượt qua mọi rào cản. Đối với ENTJ, khó khăn chính là cơ hội để chứng minh bản lĩnh và thúc đẩy hiệu suất làm việc đạt mức tối đa.",
    traits: [
      "Kỹ năng lãnh đạo và quản trị nổi bật",
      "Tự tin, quyết đoán trong mọi tình huống",
      "Tư duy chiến lược và hoạch định mục tiêu",
      "Giao tiếp thuyết phục và truyền cảm hứng",
    ],
    careers: ["Project Manager (Quản lý dự án)", "Chuyên viên tư vấn quản trị", "Giám đốc vận hành / Startup founder", "Trưởng nhóm kinh doanh"],
  },
  ENTP: {
    code: "ENTP",
    name: "Người Phát Minh",
    englishTitle: "Debater",
    group: "Nhà Phân Tích",
    tagline: "Nhanh nhạy, thông minh và không ngại thách thức các giới hạn thông thường.",
    summary: "Người giàu năng lượng ý tưởng, tư duy phản biện sắc sảo và luôn hứng thú giải quyết các bài toán hóc búa.",
    personalityDescription: "Các ENTP là những người thông minh, hóm hỉnh và luôn tràn đầy ý tưởng mới lạ. Họ đam mê tranh luận để tìm ra chân lý và không ngần ngại thử nghiệm những hướng đi đột phá. Với tinh thần cởi mở, nhanh nhạy trước các xu hướng, ENTP luôn là nguồn cảm hứng khởi xướng cho những dự án mang tính đổi mới.",
    traits: [
      "Tư duy phản biện và sáng tạo vượt trội",
      "Giao tiếp hoạt bát, linh hoạt ứng biến",
      "Thích khám phá những ý tưởng đột phá",
      "Khả năng nhìn nhận đa chiều vấn đề",
    ],
    careers: ["Product Manager (Quản lý sản phẩm)", "Chuyên viên chiến lược Marketing", "Consultant (Tư vấn giải pháp)", "Nhà sáng lập công nghệ"],
  },
  INFJ: {
    code: "INFJ",
    name: "Người Khuyên Bảo",
    englishTitle: "Advocate",
    group: "Nhà Ngoại Giao",
    tagline: "Lặng lẽ nhưng kiên định, giàu lòng trắc ẩn và luôn hướng đến những giá trị tốt đẹp.",
    summary: "Người có trực giác nhạy bén, sâu sắc về tâm lý con người và luôn mong muốn tạo ra tác động tích cực cho xã hội.",
    personalityDescription: "Các INFJ là những người có chiều sâu nội tâm phong phú, trực giác nhạy bén và giàu lòng trắc ẩn. Họ có khả năng thấu hiểu tâm tư người khác một cách tự nhiên và luôn hướng tới việc tạo ra giá trị tích cực cho cộng đồng. Dù lặng lẽ và kín đáo, các INFJ sở hữu ý chí kiên định phi thường khi theo đuổi những lý tưởng nhân văn cao đẹp.",
    traits: [
      "Trực giác sâu sắc và thấu hiểu con người",
      "Giàu lòng trắc ẩn và nguyên tắc sống rõ ràng",
      "Tầm nhìn nhân văn và sáng tạo",
      "Kiên trì theo đuổi mục tiêu ý nghĩa",
    ],
    careers: ["Chuyên viên Nhân sự / Đào tạo", "UI/UX Designer", "Biên tập nội dung / Truyền thông", "Cố vấn tâm lý / Hướng nghiệp"],
  },
  INFP: {
    code: "INFP",
    name: "Người lý tưởng hóa",
    englishTitle: "Mediator",
    group: "Nhà Ngoại Giao",
    tagline: "Tâm hồn giàu cảm xúc, giàu lý tưởng và luôn trung thành với giá trị nội tâm.",
    summary: "Người tinh tế, giàu trí tưởng tượng và luôn tìm kiếm sự chân thực cùng những giá trị nhân văn sâu sắc.",
    personalityDescription: "Các INFP khá điềm tĩnh, thậm chí có phần nhút nhát và cả nể, rất ngại từ chối người khác. Tuy vậy, ẩn sâu bên trong họ là một tâm hồn nồng nhiệt và đam mê bất diệt. Các INFP sống có lý tưởng, có mục đích, họ biết mình cần gì, muốn gì và nên làm gì. Chủ nghĩa cá nhân và sự chân thật cũng là một đặc điểm nổi bật ở những người thuộc nhóm tính cách INFP.",
    traits: [
      "Giàu trí tưởng tượng và sáng tạo nghệ thuật",
      "Đồng cảm cao, thấu hiểu cảm xúc người khác",
      "Tôn trọng sự chân thật và cá tính riêng",
      "Tận tâm khi làm việc vì mục tiêu mình tin tưởng",
    ],
    careers: ["Content Creator / Copywriter", "UI/UX & Graphic Designer", "Chuyên viên phát triển cộng đồng", "Biên dịch / Biên tập viên"],
  },
  ENFJ: {
    code: "ENFJ",
    name: "Người Chỉ Dẫn",
    englishTitle: "Protagonist",
    group: "Nhà Ngoại Giao",
    tagline: "Nhiệt huyết, lôi cuốn và luôn đồng hành giúp đỡ người khác phát huy tối đa tiềm năng.",
    summary: "Người truyền lửa bẩm sinh với khả năng thấu cảm tuyệt vời, gắn kết tập thể và tạo dựng niềm tin vững chắc.",
    personalityDescription: "Các ENFJ là những người ấm áp, lôi cuốn và luôn tận tụy vì sự phát triển của người khác. Họ sở hữu khả năng giao tiếp truyền cảm hứng xuất sắc, dễ dàng tạo dựng niềm tin và gắn kết mọi người thành một khối thống nhất. Với tấm lòng rộng mở, ENFJ luôn nỗ lực hết mình vì hạnh phúc và thành công chung của tập thể.",
    traits: [
      "Khả năng truyền cảm hứng và thu hút người khác",
      "Giao tiếp xuất sắc và thấu hiểu tâm lý",
      "Tổ chức và điều phối làm việc nhóm tốt",
      "Trách nhiệm cao với cộng đồng",
    ],
    careers: ["Quản lý nhân sự (HR)", "Quan hệ công chúng (PR / Event)", "Chuyên viên phát triển đối tác", "Giảng viên / Huấn luyện viên"],
  },
  ENFP: {
    code: "ENFP",
    name: "Người Truyền Cảm Hứng",
    englishTitle: "Campaigner",
    group: "Nhà Ngoại Giao",
    tagline: "Nhiệt tình, sáng tạo và luôn nhìn thấy vô vàn tiềm năng hấp dẫn xung quanh.",
    summary: "Người có trái tim tự do, tràn đầy năng lượng tích cực và luôn mang đến sự hứng khởi cho tập thể.",
    personalityDescription: "Các ENFP là những tâm hồn tự do, giàu nhiệt huyết và tràn đầy nguồn năng lượng tích cực. Họ luôn tò mò trước thế giới, trân trọng những kết nối chân thành giữa người với người và nhìn thấy tiềm năng ở khắp mọi nơi. ENFP mang đến sự lạc quan, kích thích sáng tạo và giúp môi trường xung quanh trở nên sống động.",
    traits: [
      "Sáng tạo không giới hạn và giàu năng lượng",
      "Kỹ năng kết nối quan hệ xã hội tuyệt vời",
      "Linh hoạt, thích ứng nhanh với môi trường mới",
      "Lạc quan và truyền cảm hứng mạnh mẽ",
    ],
    careers: ["Marketing Specialist / Brand Manager", "Sáng tạo nội dung (Content Creator)", "Tổ chức sự kiện & PR", "Chuyên viên phát triển kinh doanh"],
  },
  ISTJ: {
    code: "ISTJ",
    name: "Người Trách Nhiệm",
    englishTitle: "Logistician",
    group: "Người Bảo Hộ",
    tagline: "Đáng tin cậy, thực tế, luôn tuân thủ nguyên tắc và giữ trọn lời hứa.",
    summary: "Người cẩn trọng, ngăn nắp và có tinh thần trách nhiệm tuyệt đối trong mọi công việc được giao.",
    personalityDescription: "Các ISTJ là những người mẫu mực, điềm đạm, coi trọng sự chính trực và tinh thần trách nhiệm. Họ làm việc có phương pháp, tỉ mỉ từng chi tiết và luôn tuân thủ nghiêm ngặt các quy tắc, cam kết đã đặt ra. Trong mọi tập thể, ISTJ chính là chỗ dựa vững chắc, đáng tin cậy nhất bởi sự kiên định và chuẩn mực trong hành động.",
    traits: [
      "Kỷ luật cao, trung thực và đáng tin cậy",
      "Làm việc có phương pháp, tỉ mỉ từng chi tiết",
      "Tôn trọng quy trình và thời hạn cam kết",
      "Bình tĩnh xử lý công việc dưới áp lực",
    ],
    careers: ["Kế toán / Kiểm toán viên", "Tester / QA - QC Engineer", "Quản lý cơ sở dữ liệu / DBA", "Chuyên viên pháp chế & hành chính"],
  },
  ISFJ: {
    code: "ISFJ",
    name: "Người Bảo Vệ",
    englishTitle: "Defender",
    group: "Người Bảo Hộ",
    tagline: "Tận tâm, chu đáo và luôn sẵn sàng hỗ trợ, che chở cho những người xung quanh.",
    summary: "Người ấm áp, đáng tin cậy và luôn chu toàn trong từng chi tiết nhỏ để mang lại sự an tâm cho tập thể.",
    personalityDescription: "Các ISFJ là những người dịu dàng, chu đáo và luôn âm thầm cống hiến vì sự bình yên của người khác. Họ có trí nhớ tuyệt vời về những điều nhỏ nhặt, biết lắng nghe và sẵn sàng chia sẻ mọi lúc mọi nơi. Sự kiên nhẫn, trung thành và đức tính chu toàn biến ISFJ thành điểm tựa ấm áp cho gia đình và đồng đội.",
    traits: [
      "Chu đáo, tận tụy và đáng tin cậy",
      "Ghi nhớ chi tiết tốt và cẩn thận",
      "Lắng nghe tích cực, sẵn sàng giúp đỡ",
      "Ổn định và tôn trọng truyền thống",
    ],
    careers: ["Chăm sóc khách hàng (Customer Care)", "Hành chính nhân sự (HR Generalist)", "Quản trị vận hành văn phòng", "Quản lý hồ sơ & chứng từ"],
  },
  ESTJ: {
    code: "ESTJ",
    name: "Người Giám Sát",
    englishTitle: "Executive",
    group: "Người Bảo Hộ",
    tagline: "Tổ chức mẫu mực, quyết đoán và luôn giữ vững trật tự, kỷ cương công việc.",
    summary: "Nhà tổ chức tài ba với năng lực thiết lập quy trình, quản lý nguồn lực hiệu quả và thúc đẩy kết quả rõ ràng.",
    personalityDescription: "Các ESTJ là những người thực tế, kỷ luật và có năng lực tổ chức điều hành xuất sắc. Họ tin vào trật tự, công bằng và tính hiệu quả trong công việc. Bằng sự thẳng thắn, quyết đoán cùng tinh thần làm việc không mệt mỏi, ESTJ luôn là người giữ vững kỷ cương và lèo lái dự án hoàn thành đúng tiến độ.",
    traits: [
      "Tổ chức và điều hành xuất sắc",
      "Rõ ràng, trực tiếp và dứt khoát",
      "Tuân thủ tiêu chuẩn chất lượng cao",
      "Năng suất làm việc vượt trội",
    ],
    careers: ["Quản lý vận hành (Operations)", "Giám sát bán hàng (Sales Supervisor)", "Quản lý dự án xây dựng / IT", "Thanh tra / Kiểm soát chất lượng"],
  },
  ESFJ: {
    code: "ESFJ",
    name: "Người Nuôi Dưỡng",
    englishTitle: "Consul",
    group: "Người Bảo Hộ",
    tagline: "Hòa đồng, chu đáo và luôn mang lại không khí ấm áp, gắn kết mọi thành viên.",
    summary: "Người của tập thể, coi trọng sự hòa thuận và luôn chăm lo chu đáo cho trải nghiệm của mọi người xung quanh.",
    personalityDescription: "Các ESFJ là những người thân thiện, chu toàn và cực kỳ nhạy bén với cảm xúc của những người xung quanh. Họ yêu thích không khí hòa thuận, thích chăm sóc mọi người và luôn biết cách biến nơi làm việc thành một mái nhà thứ hai. Tinh thần trách nhiệm cao và lòng tận tâm là dấu ấn sâu sắc của người ESFJ.",
    traits: [
      "Giao tiếp thân thiện, kết nối tập thể tốt",
      "Tận tâm phục vụ và hỗ trợ người khác",
      "Tổ chức sự kiện và đời sống nhóm khéo léo",
      "Có tinh thần trách nhiệm và trung thành",
    ],
    careers: ["Chuyên viên tuyển dụng (Talent Acquisition)", "Quản lý quan hệ khách hàng (Account Executive)", "Chăm sóc đối tác / PR", "Quản trị sự kiện nội bộ"],
  },
  ISTP: {
    code: "ISTP",
    name: "Nhà Kỹ Thuật",
    englishTitle: "Virtuoso",
    group: "Người Khám Phá",
    tagline: "Thực tế, thích khám phá công cụ và luôn bình tĩnh giải quyết sự cố phát sinh.",
    summary: "Chuyên gia thực hành với tư duy logic sắc bén, phản xạ linh hoạt và đam mê tìm hiểu cơ chế hoạt động của mọi vật.",
    personalityDescription: "Các ISTP là những người thực tế, trầm tính nhưng vô cùng linh hoạt và khéo léo trong hành động. Họ thích khám phá cách mọi vật vận hành, giỏi giải quyết khủng hoảng và giữ được sự điềm tĩnh phi thường trong những tình huống bất ngờ. ISTP làm việc dựa trên trải nghiệm thực tế và luôn tìm ra giải pháp tối giản mà hiệu quả nhất.",
    traits: [
      "Tư duy kỹ thuật và phân tích nguyên nhân tốt",
      "Thích nghi nhanh, bình tĩnh khi có sự cố",
      "Học hỏi qua trải nghiệm thực tế",
      "Linh hoạt và tôn trọng quyền tự chủ",
    ],
    careers: ["Kỹ sư phần mềm / DevOps", "Kỹ sư phần cứng / Mạng", "Chuyên viên phân tích dữ liệu kỹ thuật", "Kiểm thử phần mềm tự động (Automation Tester)"],
  },
  ISFP: {
    code: "ISFP",
    name: "Người Nghệ Sĩ",
    englishTitle: "Adventurer",
    group: "Người Khám Phá",
    tagline: "Nhạy cảm, tinh tế và luôn sống trọn vẹn từng khoảnh khắc với góc nhìn thẩm mỹ riêng.",
    summary: "Người giàu cảm xúc, có gu thẩm mỹ độc đáo và luôn tìm kiếm sự tự do để thể hiện phong cách của mình.",
    personalityDescription: "Các ISFP là những tâm hồn nghệ sĩ đích thực, giàu xúc cảm và luôn sống trọn vẹn trong từng khoảnh khắc. Họ khiêm tốn, hòa nhã, có khiếu thẩm mỹ tinh tế và thích thể hiện bản thân qua những hành động cụ thể hơn là lời nói. ISFP coi trọng tự do cá nhân và luôn đối xử với mọi người bằng sự chân thành, ấm áp.",
    traits: [
      "Gu thẩm mỹ và khiếu nghệ thuật tinh tế",
      "Cởi mở, thân thiện và khiêm tốn",
      "Linh hoạt và tôn trọng trải nghiệm cá nhân",
      "Tập trung vào hiện tại và hành động thực tế",
    ],
    careers: ["Graphic Designer / UI Designer", "Chuyên viên dựng video / Motion Graphics", "Thiết kế thời trang / Nội thất", "Chụp ảnh & sáng tạo hình ảnh"],
  },
  ESTP: {
    code: "ESTP",
    name: "Người Thực Thi",
    englishTitle: "Entrepreneur",
    group: "Người Khám Phá",
    tagline: "Năng động, can đảm và luôn sẵn sàng hành động để nắm bắt mọi cơ hội ngay tức thì.",
    summary: "Người hành động thực tế, xử lý khủng hoảng nhạy bén và tràn đầy năng lượng trên từng bước đi.",
    personalityDescription: "Các ESTP là những người hành động dũng cảm, năng động và luôn tràn ngập sức sống. Họ không thích ngồi một chỗ bàn luận lý thuyết mà thích lao ngay vào thực tế để trải nghiệm và giải quyết vấn đề. Với phản xạ nhạy bén, óc hài hước và khả năng thuyết phục tài tình, ESTP luôn là tâm điểm của mọi hoạt động sôi nổi.",
    traits: [
      "Hành động nhanh chóng và quyết liệt",
      "Đàm phán và thuyết phục thực tế xuất sắc",
      "Thích ứng cực nhanh với thay đổi",
      "Quan sát tinh tường hiện thực",
    ],
    careers: ["Chuyên viên kinh doanh / Sales Executive", "Phát triển thị trường (Business Development)", "Môi giới tài chính / Bất động sản", "Quản lý sự kiện thực địa"],
  },
  ESFP: {
    code: "ESFP",
    name: "Người Trình Diễn",
    englishTitle: "Entertainer",
    group: "Người Khám Phá",
    tagline: "Vui vẻ, cuốn hút và luôn biến cuộc sống xung quanh thành một sân khấu ngập tràn sắc màu.",
    summary: "Người truyền cảm hứng lạc quan, yêu đời và luôn tạo ra không gian tích cực, sôi nổi cho bất kỳ môi trường nào.",
    personalityDescription: "Các ESFP là những người nồng hậu, lạc quan và luôn mang lại tiếng cười cho mọi người xung quanh. Họ yêu cuộc sống, tận hưởng từng phút giây và có khả năng biến những điều bình dị trở nên thú vị. Sự thân thiện, nhiệt tình và khả năng khuấy động không khí khiến ESFP luôn được bạn bè và đồng nghiệp yêu mến.",
    traits: [
      "Tràn đầy năng lượng tích cực và nhiệt huyết",
      "Kỹ năng giao tiếp và hoạt náo tự nhiên",
      "Yêu thích tương tác trực tiếp với con người",
      "Cởi mở và sẵn sàng trải nghiệm điều mới",
    ],
    careers: ["Tổ chức sự kiện & Teambuilding", "Chuyên viên truyền thông nội bộ", "MC / KOL / Host livestream", "Chăm sóc khách hàng cao cấp"],
  },
};

/**
 * Quy luật chấm điểm MBTI theo 70 câu:
 * Chia 70 câu thành 10 chu kỳ (mỗi chu kỳ 7 câu):
 * - Câu chia 7 dư 1 (1, 8, 15...): E vs I (Option 0 -> E, Option 1 -> I) [Tổng 10 câu]
 * - Câu chia 7 dư 2 và 3 (2, 3, 9, 10...): S vs N (Option 0 -> S, Option 1 -> N) [Tổng 20 câu]
 * - Câu chia 7 dư 4 và 5 (4, 5, 11, 12...): T vs F (Option 0 -> T, Option 1 -> F) [Tổng 20 câu]
 * - Câu chia 7 dư 6 và chia hết cho 7 (6, 7, 13, 14...): J vs P (Option 0 -> J, Option 1 -> P) [Tổng 20 câu]
 */
export function getQuestionDimension(questionId) {
  const rem = questionId % 7;
  if (rem === 1) {
    return {
      key: "EI",
      dimensionName: "Hướng ngoại (E) vs Hướng nội (I)",
      optionA: { code: "E", label: "Hướng ngoại (E)" },
      optionB: { code: "I", label: "Hướng nội (I)" },
    };
  }
  if (rem === 2 || rem === 3) {
    return {
      key: "SN",
      dimensionName: "Thực tế (S) vs Trực giác (N)",
      optionA: { code: "S", label: "Thực tế (S)" },
      optionB: { code: "N", label: "Trực giác (N)" },
    };
  }
  if (rem === 4 || rem === 5) {
    return {
      key: "TF",
      dimensionName: "Lý trí (T) vs Cảm xúc (F)",
      optionA: { code: "T", label: "Lý trí (T)" },
      optionB: { code: "F", label: "Cảm xúc (F)" },
    };
  }
  // rem === 6 || rem === 0
  return {
    key: "JP",
    dimensionName: "Nguyên tắc (J) vs Linh hoạt (P)",
    optionA: { code: "J", label: "Nguyên tắc (J)" },
    optionB: { code: "P", label: "Linh hoạt (P)" },
  };
}

export function calculateMbtiResult(answers) {
  const scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  for (let id = 1; id <= 70; id++) {
    const chosenIndex = answers[id];
    if (chosenIndex === undefined || chosenIndex === null) continue;

    const rem = id % 7;
    if (rem === 1) {
      if (chosenIndex === 0) scores.E += 1;
      else scores.I += 1;
    } else if (rem === 2 || rem === 3) {
      if (chosenIndex === 0) scores.S += 1;
      else scores.N += 1;
    } else if (rem === 4 || rem === 5) {
      if (chosenIndex === 0) scores.T += 1;
      else scores.F += 1;
    } else {
      // rem === 6 || rem === 0
      if (chosenIndex === 0) scores.J += 1;
      else scores.P += 1;
    }
  }

  // Xác định chữ cái đại diện (Ưu tiên E/S/T/J nếu bằng điểm)
  const letter1 = scores.E >= scores.I ? "E" : "I";
  const letter2 = scores.S >= scores.N ? "S" : "N";
  const letter3 = scores.T >= scores.F ? "T" : "F";
  const letter4 = scores.J >= scores.P ? "J" : "P";

  const typeCode = `${letter1}${letter2}${letter3}${letter4}`;
  const info = MBTI_TYPES[typeCode] || MBTI_TYPES["INTJ"];
  const image = MBTI_IMAGES[typeCode] || MBTI_IMAGES["INTJ"];

  // Tỉ lệ phần trăm
  const totalEI = scores.E + scores.I || 1;
  const totalSN = scores.S + scores.N || 1;
  const totalTF = scores.T + scores.F || 1;
  const totalJP = scores.J + scores.P || 1;

  const percentages = {
    E: Math.round((scores.E / totalEI) * 100),
    I: 100 - Math.round((scores.E / totalEI) * 100),
    S: Math.round((scores.S / totalSN) * 100),
    N: 100 - Math.round((scores.S / totalSN) * 100),
    T: Math.round((scores.T / totalTF) * 100),
    F: 100 - Math.round((scores.T / totalTF) * 100),
    J: Math.round((scores.J / totalJP) * 100),
    P: 100 - Math.round((scores.J / totalJP) * 100),
  };

  return {
    type: typeCode,
    info,
    image,
    scores,
    percentages,
    dimensions: [
      {
        key: "EI",
        title: "Năng lượng",
        codeA: "E",
        labelA: "Hướng ngoại",
        percentA: percentages.E,
        codeB: "I",
        labelB: "Hướng nội",
        percentB: percentages.I,
        dominant: letter1,
      },
      {
        key: "SN",
        title: "Nhận thức",
        codeA: "S",
        labelA: "Thực tế",
        percentA: percentages.S,
        codeB: "N",
        labelB: "Trực giác",
        percentB: percentages.N,
        dominant: letter2,
      },
      {
        key: "TF",
        title: "Quyết định",
        codeA: "T",
        labelA: "Lý trí",
        percentA: percentages.T,
        codeB: "F",
        labelB: "Cảm xúc",
        percentB: percentages.F,
        dominant: letter3,
      },
      {
        key: "JP",
        title: "Lối sống",
        codeA: "J",
        labelA: "Nguyên tắc",
        percentA: percentages.J,
        codeB: "P",
        labelB: "Linh hoạt",
        percentB: percentages.P,
        dominant: letter4,
      },
    ],
  };
}
