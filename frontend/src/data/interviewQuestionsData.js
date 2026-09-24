export const INTERVIEW_CATEGORIES = [
  { id: "all", label: "Tất cả câu hỏi", icon: "bi-grid-fill" },
  { id: "personal", label: "Giới thiệu & Bản thân", icon: "bi-person-badge" },
  { id: "experience", label: "Kinh nghiệm & Thành tích", icon: "bi-briefcase" },
  { id: "skills", label: "Kỹ năng & Công nghệ / AI", icon: "bi-cpu" },
  { id: "situational", label: "Tình huống & Văn hóa", icon: "bi-chat-heart" },
  { id: "company_salary", label: "Về công ty & Mức lương", icon: "bi-cash-coin" }
];

export const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    title: "Hãy giới thiệu về bản thân bạn?",
    category: "personal",
    difficulty: "Cơ bản",
    purpose: "Đánh giá phong thái, khả năng giao tiếp, sự tự tin và tóm tắt những điểm cốt lõi nhất về năng lực phù hợp với vị trí tuyển dụng.",
    tips: [
      "Áp dụng cấu trúc Hiện tại - Quá khứ - Tương lai (Present - Past - Future).",
      "Nêu bật trình độ học vấn, kinh nghiệm cốt lõi liên quan trực tiếp đến vị trí ứng tuyển.",
      "Giữ thời lượng ngắn gọn từ 1.5 đến 2 phút, nói mạch lạc, không lan man sang chuyện gia đình hay đời tư."
    ],
    sampleAnswer: `Em xin phép được giới thiệu đôi nét về bản thân: Em tên là Nguyễn Văn A, tốt nghiệp chuyên ngành Công nghệ thông tin tại Trường Đại học Bách Khoa Hà Nội. Trong quá trình học tập và làm việc, em đã tích lũy hơn 1 năm kinh nghiệm thực chiến với ReactJS và NodeJS qua các dự án web thực tế. Điểm mạnh lớn nhất của em là tư duy logic nhanh nhạy, khả năng tự học công nghệ mới và kỹ năng làm việc nhóm hiệu quả. Hiện tại, em đang tìm kiếm cơ hội được đóng góp năng lực và phát triển sâu hơn trong môi trường chuyên nghiệp tại Quý công ty.`,
    donts: [
      "Tránh đọc y nguyên lại những gì đã viết trong CV một cách khô cứng.",
      "Không kể lể quá nhiều chi tiết cá nhân không liên quan đến công việc.",
      "Tránh nói quá dài dòng vượt quá 2-3 phút khiến người nghe mất tập trung."
    ]
  },
  {
    id: 2,
    title: "Sở thích của bạn là gì?",
    category: "personal",
    difficulty: "Cơ bản",
    purpose: "Tìm hiểu tính cách, cách bạn cân bằng cuộc sống và xem bạn có những phẩm chất tích cực hỗ trợ cho văn hóa công ty hay không.",
    tips: [
      "Chọn các sở thích tích cực, phát triển tư duy hoặc thể chất (đọc sách, thể thao, học ngoại ngữ, lập trình open-source...).",
      "Liên hệ khéo léo giữa sở thích với các phẩm chất cần thiết trong công việc (sự kiên trì, làm việc nhóm, sáng tạo)."
    ],
    sampleAnswer: `Ngoài thời gian làm việc, em rất thích đọc sách về công nghệ, phát triển kỹ năng mềm và tham gia chạy bộ cuối tuần. Thói quen chạy bộ giúp em rèn luyện tính kiên trì, sự bền bỉ và giải tỏa căng thẳng sau những giờ làm việc tập trung cao độ. Đồng thời, việc đọc sách giúp em luôn cập nhật những xu hướng tư duy mới để ứng dụng vào giải quyết vấn đề.`,
    donts: [
      "Tránh nêu sở thích thụ động hoặc tiêu cực như: chỉ thích ngủ nướng, lướt mạng xã hội cả ngày.",
      "Đừng trả lời 'Em không có sở thích gì đặc biệt'."
    ]
  },
  {
    id: 3,
    title: "Mục tiêu nghề nghiệp của bạn là gì?",
    category: "personal",
    difficulty: "Quan trọng",
    purpose: "Đo lường sự nghiêm túc, tầm nhìn dài hạn và mức độ gắn bó lâu dài của bạn với vị trí và lộ trình phát triển của doanh nghiệp.",
    tips: [
      "Chia rõ ràng thành mục tiêu ngắn hạn (6 tháng - 1 năm) và mục tiêu dài hạn (3 - 5 năm).",
      "Mục tiêu ngắn hạn nên tập trung vào việc làm quen nhanh, đóng góp giá trị cụ thể. Mục tiêu dài hạn gắn với nâng cao chuyên môn hoặc vai trò dẫn dắt."
    ],
    sampleAnswer: `Về ngắn hạn trong 6 tháng đến 1 năm tới, mục tiêu của em là nhanh chóng hòa nhập với văn hóa công ty, nắm bắt quy trình và hoàn thành xuất sắc các dự án được giao, đồng thời trau dồi chứng chỉ chuyên môn liên quan. Về dài hạn trong 3 - 5 năm tới, em định hướng phát triển bản thân trở thành một Senior Developer / Chuyên viên nòng cốt có khả năng dẫn dắt nhóm nhỏ và đóng góp trực tiếp vào các giải pháp công nghệ chiến lược của công ty.`,
    donts: [
      "Không đưa ra mục tiêu viển vông, phi thực tế hoặc không liên quan đến ngành nghề.",
      "Tránh nói 'Em muốn tích lũy kinh nghiệm rồi mở công ty riêng trong 2 năm tới'."
    ]
  },
  {
    id: 4,
    title: "Điểm mạnh/Sở trường của bạn là gì?",
    category: "personal",
    difficulty: "Cơ bản",
    purpose: "Xem xét sự tự nhận thức về năng lực bản thân và các giá trị nổi trội nhất mà bạn có thể mang lại ngay cho đội ngũ.",
    tips: [
      "Chọn 2-3 điểm mạnh phù hợp nhất với bảng mô tả công việc (JD).",
      "Mỗi điểm mạnh phải đi kèm dẫn chứng cụ thể từ trải nghiệm thực tế (số liệu hoặc kết quả)."
    ],
    sampleAnswer: `Em nhận thấy bản thân có 3 điểm mạnh nổi bật: Thứ nhất là khả năng tự nghiên cứu và tiếp thu công nghệ mới rất nhanh, em từng tự học và áp dụng thành công Next.js vào dự án chỉ sau 2 tuần. Thứ hai là sự cẩn thận, chú trọng chất lượng mã nguồn và hạn chế tối đa lỗi phát sinh. Thứ ba là tinh thần trách nhiệm cao, luôn chủ động cập nhật tiến độ và hỗ trợ đồng đội hoàn thành đúng hạn mục tiêu chung.`,
    donts: [
      "Tránh liệt kê hàng loạt sáo rỗng (như 'em chăm chỉ, thông minh') mà không có ví dụ chứng minh.",
      "Không quá khiêm tốn hoặc ngược lại là tự cao, thiếu thực tế."
    ]
  },
  {
    id: 5,
    title: "Điểm yếu/Sở đoản của bạn là gì?",
    category: "personal",
    difficulty: "Tình huống",
    purpose: "Đánh giá mức độ thành thật, tính tự nhận thức và quan trọng nhất là bạn đang chủ động khắc phục điểm yếu đó như thế nào.",
    tips: [
      "Nêu một điểm yếu thực tế nhưng không phải là kỹ năng cốt lõi bắt buộc gây nguy hại trực tiếp đến vị trí.",
      "Nhấn mạnh ngay vào hành động và lộ trình bạn đang cải thiện bản thân để biến điểm yếu thành bài học tích cực."
    ],
    sampleAnswer: `Trước đây, điểm yếu của em là thường có xu hướng ngần ngại khi thuyết trình trước đám đông lớn, điều này đôi khi làm em chưa tự tin bộc lộ hết quan điểm của mình. Để khắc phục, em đã chủ động tham gia câu lạc bộ thuyết trình và tình nguyện làm người báo cáo tiến độ dự án nhóm ở trường. Nhờ vậy, hiện tại em đã cảm thấy tự tin và truyền đạt ý kiến mạch lạc hơn rất nhiều.`,
    donts: [
      "Tuyệt đối không nói 'Em là người cầu toàn' hoặc 'Em làm việc quá chăm chỉ' - sáo rỗng và thiếu chân thực.",
      "Không nói 'Em không có điểm yếu nào'."
    ]
  },
  {
    id: 6,
    title: "Chia sẻ về kinh nghiệm làm việc của bạn?",
    category: "experience",
    difficulty: "Quan trọng",
    purpose: "Xác thực năng lực thực tế, các dự án bạn đã từng tham gia và vai trò thực tế của bạn trong nhóm.",
    tips: [
      "Áp dụng nguyên tắc CAR (Context - Action - Result) hoặc STAR.",
      "Tập trung vào các dự án/kinh nghiệm có liên quan mật thiết nhất với vị trí ứng tuyển hiện tại.",
      "Nêu rõ các công nghệ, công cụ đã sử dụng và kết quả đạt được."
    ],
    sampleAnswer: `Trong hơn 1 năm qua tại vị trí cộng tác viên dự án, em chịu trách nhiệm chính về phát triển module quản lý người dùng và thanh toán. Em đã trực tiếp thiết kế RESTful APIs, tối ưu hóa câu truy vấn cơ sở dữ liệu giúp giảm 30% thời gian phản hồi hệ thống. Trải nghiệm này đã giúp em rèn luyện tư duy lập trình vững chắc, thành thạo Git và thích ứng tốt với quy trình Agile/Scrum.`,
    donts: [
      "Tránh kể lể mọi việc vặt không liên quan đến vị trí ứng tuyển.",
      "Không nhận vơ công sức của cả nhóm là của riêng mình."
    ]
  },
  {
    id: 7,
    title: "Chia sẻ về một thành tích nổi bật trong công việc",
    category: "experience",
    difficulty: "Quan trọng",
    purpose: "Đánh giá mức độ tạo ra tác động (impact) và khả năng tạo ra kết quả vượt trội của ứng viên.",
    tips: [
      "Chọn thành tích có số liệu đo lường cụ thể (tăng %, tiết kiệm thời gian, giải thưởng, khen thưởng).",
      "Kể theo mô hình STAR: Hoàn cảnh (Situation) -> Thách thức (Task) -> Hành động của bạn (Action) -> Kết quả (Result)."
    ],
    sampleAnswer: `Thành tích đáng nhớ nhất của em là khi tham gia dự án tốt nghiệp và cuộc thi Sáng tạo sinh viên. Nhóm em gặp bài toán hệ thống bị quá tải khi mô phỏng 500 yêu cầu đồng thời. Em đã chủ động đề xuất áp dụng giải pháp bộ nhớ đệm Redis và cấu trúc lại luồng xử lý bất đồng bộ. Kết quả là hệ thống chịu tải tăng gấp 4 lần, đạt 2.000 requests/s và đề tài của nhóm đã xuất sắc đạt Giải Nhất nghiên cứu khoa học cấp viện.`,
    donts: [
      "Nói chung chung 'Dự án thành công tốt đẹp' mà không có dẫn chứng hay con số.",
      "Kể thành tích mà bản thân chỉ đóng vai trò mờ nhạt."
    ]
  },
  {
    id: 8,
    title: "Hãy kể về một lần thất bại của bạn trong công việc, bạn đã giải quyết ra sao và rút ra được bài học gì?",
    category: "experience",
    difficulty: "Tình huống",
    purpose: "Xem khả năng chịu áp lực, tinh thần trách nhiệm, phản ứng khi đối mặt khủng hoảng và năng lực học hỏi từ sai lầm.",
    tips: [
      "Thẳng thắn nhận trách nhiệm, không đổ lỗi cho ngoại cảnh hay đồng nghiệp.",
      "Nhấn mạnh vào phương án khắc phục hậu quả tức thì và bài học kinh nghiệm sâu sắc để không lặp lại."
    ],
    sampleAnswer: `Trong một dự án thực tập, do muốn tối ưu tốc độ triển khai nên em đã chủ quan không viết đầy đủ unit test cho một API cập nhật dữ liệu, dẫn đến phát sinh lỗi khi lên môi trường staging. Ngay khi phát hiện, em đã lập tức báo cáo với trưởng nhóm, nhận trách nhiệm và ở lại làm thêm 3 tiếng để viết lại test suite, sửa mã nguồn và kiểm thử cẩn thận. Bài học lớn nhất em rút ra là sự cẩn trọng và tính tuân thủ quy trình kiểm thử luôn phải đặt lên hàng đầu, nhanh nhưng phải đi đôi với sự an toàn.`,
    donts: [
      "Đổ lỗi cho khách hàng, trưởng nhóm hay đồng đội.",
      "Nói rằng 'Em chưa bao giờ gặp thất bại'."
    ]
  },
  {
    id: 9,
    title: "Tại sao bạn lại nghỉ việc ở công ty cũ?",
    category: "experience",
    difficulty: "Nhạy cảm",
    purpose: "Tìm hiểu lý do thay đổi công việc, thái độ đối với công ty cũ và xem liệu vấn đề tương tự có tái diễn ở vị trí mới.",
    tips: [
      "Luôn giữ thái độ tích cực, tôn trọng công ty cũ và đồng nghiệp cũ.",
      "Hướng lý do về phía tìm kiếm cơ hội học hỏi mới, mở rộng thử thách hoặc môi trường phù hợp với định hướng dài hạn."
    ],
    sampleAnswer: `Em rất biết ơn công ty cũ vì đã cho em môi trường khởi đầu tốt đẹp và học hỏi được nhiều kiến thức nền tảng. Tuy nhiên, sau một thời gian, em nhận thấy bản thân mong muốn được thử sức với các dự án có quy mô lớn hơn, công nghệ hiện đại hơn và lộ trình phát triển sâu hơn về chuyên môn. Nhận thấy công ty mình đang mở rộng và có định hướng công nghệ rất phù hợp với mục tiêu của em, nên em quyết định nắm bắt cơ hội này.`,
    donts: [
      "Nói xấu công ty cũ, sếp cũ hay đồng nghiệp cũ.",
      "Nêu lý do liên quan đến xung đột cá nhân hoặc thái độ tiêu cực."
    ]
  },
  {
    id: 10,
    title: "Bạn xử lý ra sao nếu nhận được phản hồi tiêu cực từ cấp trên hoặc khách hàng?",
    category: "experience",
    difficulty: "Tình huống",
    purpose: "Đánh giá trí tuệ cảm xúc (EQ), khả năng lắng nghe và tư duy giải quyết vấn đề theo hướng xây dựng.",
    tips: [
      "Giữ bình tĩnh, không phản ứng phòng thủ hay tự ái cá nhân.",
      "Lắng nghe để hiểu rõ nguyên nhân gốc rễ, ghi chép lại và đưa ra giải pháp khắc phục cụ thể kèm thời gian hoàn thành."
    ],
    sampleAnswer: `Khi nhận phản hồi tiêu cực, việc đầu tiên của em là giữ bình tĩnh và tách bạch cảm xúc cá nhân ra khỏi công việc. Em sẽ lắng nghe chân thành, ghi chép lại các điểm chưa đạt và đặt câu hỏi làm rõ nếu cần. Sau đó, em phân tích nguyên nhân, đề xuất phương án điều chỉnh cụ thể và thống nhất với cấp trên/khách hàng về thời hạn hoàn thành. Em xem phản hồi tiêu cực là cơ hội quý báu để nhìn ra điểm mù và hoàn thiện chất lượng công việc tốt hơn.`,
    donts: [
      "Cãi tay đôi hoặc tỏ thái độ vùng vằng, khó chịu.",
      "Im lặng chịu trận mà không đưa ra giải pháp khắc phục."
    ]
  },
  {
    id: 11,
    title: "Bạn xử lý thế nào khi được giao một nhiệm vụ không nằm trong chuyên môn?",
    category: "experience",
    difficulty: "Tình huống",
    purpose: "Đo lường tính linh hoạt, tinh thần dám đương đầu với cái mới và khả năng tự học của ứng viên.",
    tips: [
      "Thể hiện thái độ sẵn sàng đón nhận thử thách mới.",
      "Trình bày các bước tiếp cận: Phân tích yêu cầu -> Tự nghiên cứu tài liệu -> Hỏi xin định hướng từ tiền bối -> Thực hiện từng bước nhỏ -> Báo cáo tiến độ."
    ],
    sampleAnswer: `Em luôn nhìn nhận đây là cơ hội tốt để mở rộng vùng an toàn và tích lũy thêm kỹ năng mới. Ban đầu, em sẽ làm rõ mục tiêu và kỳ vọng của công việc với cấp trên. Tiếp theo, em chủ động tìm đọc tài liệu, khóa học hoặc case study liên quan. Nếu gặp khúc mắc chuyên sâu, em sẽ chuẩn bị câu hỏi cụ thể để xin tư vấn từ đồng nghiệp có chuyên môn, sau đó triển khai thử nghiệm từng phần nhỏ và báo cáo thường xuyên để đảm bảo đúng hướng.`,
    donts: [
      "Từ chối ngay lập tức: 'Đây không phải việc của em'.",
      "Âm thầm làm sai mà không dám trao đổi hay hỏi han."
    ]
  },
  {
    id: 12,
    title: "Kỹ năng nổi bật nhất của bạn là gì?",
    category: "skills",
    difficulty: "Cơ bản",
    purpose: "Xác định 'vũ khí sắc bén nhất' của bạn và xem nó mang lại lợi ích cạnh tranh gì cho vị trí ứng tuyển.",
    tips: [
      "Chọn một kỹ năng quan trọng nhất (chuyên môn hoặc kỹ năng mềm) mà bạn tự tin nhất.",
      "Cung cấp ví dụ thực tế chứng minh kỹ năng đó đã giúp ích gì cho công việc."
    ],
    sampleAnswer: `Kỹ năng nổi bật nhất của em là khả năng phân tích và giải quyết vấn đề (Problem-solving). Khi gặp sự cố kỹ thuật hoặc yêu cầu phức tạp, em luôn bóc tách bài toán thành các phần nhỏ, tìm nguyên nhân gốc rễ (root cause) thay vì chỉ xử lý bề mặt. Nhờ kỹ năng này, trong dự án trước em đã tìm ra và xử lý triệt để lỗi rò rỉ bộ nhớ (memory leak) mà hệ thống gặp phải suốt nhiều tuần.`,
    donts: [
      "Nói chung chung không có chứng minh.",
      "Chọn kỹ năng không liên quan tới công việc ứng tuyển."
    ]
  },
  {
    id: 13,
    title: "Kỹ năng nào bạn muốn phát triển thêm trong tương lai?",
    category: "skills",
    difficulty: "Cơ bản",
    purpose: "Xem xét tinh thần cầu tiến, thái độ học tập suốt đời và tính nhất quán với định hướng nghề nghiệp.",
    tips: [
      "Chọn kỹ năng bổ trợ nâng tầm năng lực hiện tại (ví dụ: System Design, Quản trị dự án, Ngoại ngữ chuyên ngành, AI prompt engineering).",
      "Nêu kế hoạch học tập cụ thể bạn đang hoặc sắp triển khai."
    ],
    sampleAnswer: `Trong tương lai gần, em muốn phát triển chuyên sâu hơn về kiến trúc hệ thống phân tán (System Architecture) và kỹ năng quản lý dự án Agile. Em nhận thấy việc nắm vững kiến trúc giúp mã nguồn mở rộng tốt hơn khi lượng người dùng tăng cao. Hiện tại em đang tự học khóa học về Microservices và thực hành thiết kế các sơ đồ hệ thống thực tế vào thời gian rảnh.`,
    donts: [
      "Chọn một kỹ năng căn bản mà vị trí hiện tại bắt buộc phải thành thạo từ trước.",
      "Không có kế hoạch cụ thể nào để học tập."
    ]
  },
  {
    id: 14,
    title: "Bạn thành thạo những phần mềm/công cụ hỗ trợ công việc nào?",
    category: "skills",
    difficulty: "Cơ bản",
    purpose: "Đánh giá mức độ sẵn sàng bắt tay vào làm việc ngay mà không mất nhiều thời gian đào tạo cơ bản.",
    tips: [
      "Phân nhóm công cụ rõ ràng: Quản lý công việc (Jira, Trello), Giao tiếp (Slack, Teams), Kỹ thuật/Chuyên môn (Git, VS Code, Postman, Docker), Thiết kế (Figma).",
      "Nhấn mạnh mức độ thành thạo và thói quen sử dụng chuẩn chỉ."
    ],
    sampleAnswer: `Em thành thạo các công cụ phát triển như Git/GitHub để quản lý phiên bản mã nguồn, VS Code, Postman để kiểm thử API, Docker cho môi trường đóng gói ứng dụng. Về quản lý công việc và cộng tác, em thường xuyên sử dụng Jira/Trello để theo dõi Sprint và Slack, Notion để lưu trữ tài liệu quy trình. Nhờ làm chủ các công cụ này, em có thể hòa nhập vào luồng công việc của đội ngũ một cách nhanh chóng.`,
    donts: [
      "Liệt kê những công cụ chỉ biết qua loa mà không thể giải thích cách dùng.",
      "Quên nhắc tới Git nếu ứng tuyển vào ngành CNTT."
    ]
  },
  {
    id: 15,
    title: "Bạn có sử dụng AI trong công việc không? Cách bạn ứng dụng AI như thế nào?",
    category: "skills",
    difficulty: "Hiện đại / Xu hướng",
    purpose: "Đánh giá độ nhạy bén với công nghệ mới, khả năng tối ưu năng suất lao động và tư duy bảo mật thông tin.",
    tips: [
      "Khẳng định việc sử dụng AI như một 'trợ lý đắc lực' để tăng tốc công việc.",
      "Nêu các trường hợp cụ thể: brainstorm ý tưởng, viết nháp tài liệu, debug mã nguồn, tối ưu truy vấn.",
      "Nhấn mạnh nguyên tắc kiểm chứng (double-check) kết quả và bảo mật dữ liệu công ty."
    ],
    sampleAnswer: `Em coi AI (như ChatGPT, GitHub Copilot) là một trợ lý đắc lực giúp tối ưu hóa hiệu suất làm việc. Em thường ứng dụng AI để tạo khung tài liệu, gợi ý cú pháp, hỗ trợ viết test case và phân tích log lỗi nhanh chóng. Tuy nhiên, em luôn tuân thủ nguyên tắc: Không tải dữ liệu nhạy cảm của dự án lên công cụ bên ngoài, và luôn chủ động đọc hiểu, kiểm chứng kỹ lưỡng từng kết quả AI tạo ra trước khi áp dụng vào thực tế.`,
    donts: [
      "Thừa nhận copy-paste hoàn toàn mã nguồn hay nội dung của AI mà không hiểu.",
      "Phủ nhận sạch trơn không dùng AI trong thời đại hiện nay (thể hiện sự thiếu cập nhật)."
    ]
  },
  {
    id: 16,
    title: "Bạn sắp xếp công việc như thế nào khi có nhiều deadline cùng lúc?",
    category: "situational",
    difficulty: "Tình huống",
    purpose: "Kiểm tra kỹ năng quản lý thời gian, tư duy sắp xếp thứ tự ưu tiên và khả năng chịu áp lực tiến độ.",
    tips: [
      "Nhắc đến các phương pháp quản lý kinh điển: Ma trận Eisenhower (Khẩn cấp vs Quan trọng), Pomodoro hoặc Kanban.",
      "Chủ động giao tiếp với cấp trên khi khối lượng công việc vượt quá tải trọng thực tế."
    ],
    sampleAnswer: `Khi đối mặt với nhiều deadline, em áp dụng Ma trận Eisenhower để phân loại: Nhiệm vụ vừa khẩn cấp vừa quan trọng sẽ được ưu tiên làm đầu tiên. Em chia nhỏ các đầu việc lớn thành các mốc theo từng buổi, ước tính thời gian và tập trung xử lý dứt điểm. Nếu nhận thấy có nguy cơ trễ hạn dù đã nỗ lực hết sức, em sẽ chủ động báo cáo sớm với trưởng nhóm để xin ý kiến điều phối lại nguồn lực hoặc thương lượng điều chỉnh timeline kịp thời.`,
    donts: [
      "Nói 'Em cố gắng làm ngày đêm không ngủ' - thiếu tính bền vững và dễ dẫn đến sai sót.",
      "Im lặng đến sát giờ G mới báo cáo không kịp."
    ]
  },
  {
    id: 17,
    title: "Bạn xử lý như thế nào khi bị burnout?",
    category: "situational",
    difficulty: "Tình huống",
    purpose: "Đánh giá khả năng tự chăm sóc sức khỏe tinh thần, tính bền bỉ và sự duy trì hiệu suất làm việc lâu dài.",
    tips: [
      "Thừa nhận burnout là trạng thái tự nhiên mà ai cũng có thể gặp phải.",
      "Trình bày các giải pháp phục hồi lành mạnh: tạm dừng nghỉ ngơi ngắn, chia sẻ với người thân/mentor, rà soát lại lối sống và phương pháp làm việc."
    ],
    sampleAnswer: `Khi nhận thấy dấu hiệu mệt mỏi quá độ, em sẽ chủ động dừng lại để đánh giá nguyên nhân gốc rễ. Em áp dụng việc ngắt kết nối tạm thời sau giờ làm, dành thời gian chạy bộ, nghe nhạc và ngủ đủ giấc để phục hồi năng lượng. Sau đó, em rà soát lại quy trình làm việc, loại bỏ những việc lãng phí thời gian và học cách đặt ranh giới lành mạnh giữa công việc và cuộc sống để duy trì ngọn lửa đam mê lâu dài.`,
    donts: [
      "Nói rằng 'Em là người của công việc, em không bao giờ bị stress hay burnout'.",
      "Đưa ra các cách xả stress thiếu lành mạnh."
    ]
  },
  {
    id: 18,
    title: "Bạn thích làm việc độc lập hay làm việc theo nhóm?",
    category: "situational",
    difficulty: "Phổ biến",
    purpose: "Đánh giá mức độ linh hoạt, khả năng tự chủ và tinh thần hợp tác trong môi trường doanh nghiệp.",
    tips: [
      "Câu trả lời lý tưởng là bạn có thể linh hoạt thích ứng tốt ở cả hai hình thức tùy thuộc vào tính chất giai đoạn công việc.",
      "Giải thích giá trị của từng phương thức và cách bạn phát huy bản thân."
    ],
    sampleAnswer: `Em cảm thấy thoải mái và có thể làm tốt ở cả hai hình thức. Khi làm việc độc lập, em phát huy tối đa sự tập trung cao độ, khả năng tự nghiên cứu và tính chịu trách nhiệm cá nhân để hoàn thành phần việc được giao. Khi làm việc nhóm, em hào hứng với việc trao đổi ý tưởng, học hỏi thế mạnh từ đồng nghiệp và kết hợp sức mạnh tập thể để giải quyết những bài toán lớn hơn mà một cá nhân khó lòng tự hoàn thành.`,
    donts: [
      "Chọn hẳn một bên cực đoan (chỉ thích làm một mình hoặc không thể tự làm việc nếu thiếu người chỉ đạo)."
    ]
  },
  {
    id: 19,
    title: "Bạn sẽ làm gì khi gặp xung đột với các thành viên trong nhóm?",
    category: "situational",
    difficulty: "Tình huống",
    purpose: "Đo lường năng lực hòa giải, kỹ năng lắng nghe và tư duy đặt mục tiêu chung lên trên cái tôi cá nhân.",
    tips: [
      "Tách bạch quan điểm công việc (task conflict) khỏi xung đột cá nhân (relationship conflict).",
      "Trực tiếp trao đổi riêng tư, thiện chí trên cơ sở dữ liệu và mục tiêu dự án."
    ],
    sampleAnswer: `Theo em, sự khác biệt quan điểm trong công việc là điều bình thường và thậm chí cần thiết để tạo ra giải pháp tốt hơn. Khi có bất đồng, em sẽ chủ động hẹn gặp riêng đồng nghiệp để trao đổi trên tinh thần tôn trọng và lắng nghe góc nhìn của họ. Chúng em sẽ cùng bám sát vào mục tiêu chung của dự án và các tiêu chí đo lường khách quan để đưa ra quyết định tối ưu. Nếu vẫn không thống nhất được, em sẽ xin ý kiến phân xử từ Tech Lead hoặc Project Manager và tuyệt đối tôn trọng quyết định cuối cùng.`,
    donts: [
      "Mang xung đột lên nhóm chat chung hoặc nói xấu sau lưng.",
      "Cố chấp bảo vệ ý kiến của mình bất chấp lý lẽ."
    ]
  },
  {
    id: 20,
    title: "Nếu cấp trên của bạn làm sai, bạn sẽ góp ý trực tiếp hay bỏ qua?",
    category: "situational",
    difficulty: "Tình huống nhạy cảm",
    purpose: "Xem xét sự khéo léo, tinh thần trách nhiệm và lòng can đảm xây dựng tổ chức.",
    tips: [
      "Khẳng định không bỏ qua nếu sai sót ảnh hưởng đến chất lượng dự án hoặc uy tín công ty.",
      "Góp ý khéo léo ở không gian riêng tư (1-on-1), dùng câu hỏi gợi mở thay vì khẳng định buộc tội."
    ],
    sampleAnswer: `Nếu nhận thấy có điểm chưa chính xác và có thể ảnh hưởng đến kết quả công việc, em chắc chắn sẽ không bỏ qua. Tuy nhiên, em sẽ chọn cách trao đổi riêng 1-on-1 với cấp trên để giữ sự tôn trọng. Thay vì nói 'Sếp đã làm sai', em sẽ đặt câu hỏi gợi mở như: 'Em thấy phần này nếu làm theo hướng X thì có rủi ro Y, không biết anh/chị nhận định thế nào ạ?'. Cách tiếp cận dựa trên tinh thần cùng tìm giải pháp tốt nhất cho dự án sẽ giúp câu chuyện diễn ra nhẹ nhàng và hiệu quả.`,
    donts: [
      "Bêu xấu hoặc phản bác sếp công khai trước toàn thể cuộc họp.",
      "Nhắm mắt làm ngơ để mặc hậu quả xảy ra."
    ]
  },
  {
    id: 21,
    title: "Theo bạn, yếu tố quan trọng nhất để thành công trong vị trí này là gì?",
    category: "company_salary",
    difficulty: "Chuyên sâu",
    purpose: "Đánh giá mức độ thấu hiểu của bạn về bản chất công việc và những tiêu chuẩn cần có để tạo ra giá trị.",
    tips: [
      "Bám sát yêu cầu trọng tâm của vị trí ứng tuyển.",
      "Kết hợp giữa năng lực chuyên môn và thái độ làm việc chuyên nghiệp."
    ],
    sampleAnswer: `Đối với vị trí này, em tin rằng yếu tố quan trọng nhất là 'Sự kiên trì học hỏi và tinh thần trách nhiệm đến cùng'. Lĩnh vực của chúng ta thay đổi rất nhanh, công nghệ hôm nay có thể lỗi thời ngày mai, nên khả năng tự cập nhật là sống còn. Đồng thời, tinh thần trách nhiệm bảo đảm rằng dù gặp lỗi khó hay phát sinh sự cố, mình vẫn luôn theo đuổi đến khi vấn đề được giải quyết triệt để và mang lại trải nghiệm tốt nhất cho người dùng.`,
    donts: [
      "Nêu yếu tố may mắn hoặc mơ hồ không liên quan.",
      "Trả lời qua loa không thể hiện sự tìm hiểu về ngành nghề."
    ]
  },
  {
    id: 22,
    title: "Bạn biết gì về công ty chúng tôi?",
    category: "company_salary",
    difficulty: "Cơ bản",
    purpose: "Kiểm tra mức độ chuẩn bị, sự quan tâm thực sự của bạn đối với doanh nghiệp trước khi bước vào phòng phỏng vấn.",
    tips: [
      "Tìm hiểu trước: Lĩnh vực hoạt động, sản phẩm/dịch vụ cốt lõi, sứ mệnh, tệp khách hàng và các tin tức nổi bật gần đây.",
      "Bày tỏ sự đồng điệu giữa giá trị cá nhân với sứ mệnh của công ty."
    ],
    sampleAnswer: `Em đã tìm hiểu kỹ về công ty qua website và các phương tiện truyền thông. Em được biết công ty là một trong những đơn vị tiên phong trong giải pháp kết nối tuyển dụng và cung cấp nền tảng quản lý việc làm thông minh cho hàng ngàn doanh nghiệp và sinh viên. Em đặc biệt ấn tượng với định hướng lấy người dùng làm trung tâm và tốc độ đổi mới sản phẩm của công ty trong năm qua, đó là lý do lớn khiến em khao khát được trở thành một mảnh ghép tại đây.`,
    donts: [
      "Trả lời 'Em chỉ thấy tuyển dụng trên mạng nên nộp thử thôi'.",
      "Nói sai tên sản phẩm hoặc lĩnh vực hoạt động của công ty."
    ]
  },
  {
    id: 23,
    title: "Tại sao bạn lại chọn nghề nghiệp này?",
    category: "company_salary",
    difficulty: "Cơ bản",
    purpose: "Tìm hiểu động lực nội tại, đam mê thực sự và sự gắn bó lâu dài của bạn với ngành nghề.",
    tips: [
      "Kể lại câu chuyện hoặc khoảnh khắc bạn nhận ra tình yêu với nghề.",
      "Nhấn mạnh cảm giác thỏa mãn khi giải quyết vấn đề và tạo ra sản phẩm hữu ích."
    ],
    sampleAnswer: `Niềm đam mê của em bắt đầu từ những năm đầu đại học khi lần đầu tiên tự tay viết những dòng code và thấy ứng dụng hoạt động trên trình duyệt. Cảm giác biến một ý tưởng trên giấy thành một sản phẩm thực tế có người dùng sử dụng và giải quyết được vấn đề thực sự mang lại cho em nguồn năng lượng rất lớn. Nghề này đòi hỏi tư duy logic không ngừng và học hỏi liên tục, đó chính là môi trường lý tưởng để em phát triển bản thân mỗi ngày.`,
    donts: [
      "Nói lý do duy nhất là 'Vì nghề này lương cao' hoặc 'Vì bố mẹ bắt học'."
    ]
  },
  {
    id: 24,
    title: "Tại sao chúng tôi nên tuyển bạn?",
    category: "company_salary",
    difficulty: "Quan trọng",
    purpose: "Đây là cơ hội 'chốt sale' - bạn cần tổng hợp lý do vì sao bạn là sự lựa chọn phù hợp nhất cho doanh nghiệp.",
    tips: [
      "Kết hợp 3 yếu tố: Kỹ năng phù hợp + Thái độ nhiệt huyết + Sự ăn ý với văn hóa công ty.",
      "Tự tin nhưng khiêm tốn, nhấn mạnh vào giá trị bạn cam kết mang lại."
    ],
    sampleAnswer: `Quý công ty nên chọn em vì ba lý do: Thứ nhất, nền tảng kỹ năng chuyên môn của em khớp tới hơn 80% yêu cầu công việc ngay từ ngày đầu. Thứ hai, em có tốc độ học hỏi nhanh và thái độ làm việc kỷ luật, sẵn sàng nhận thêm việc khó để giảm tải cho các anh chị đi trước. Và thứ ba, em thực sự yêu thích sản phẩm của công ty và cam kết gắn bó lâu dài để cùng xây dựng những giải pháp có tầm ảnh hưởng lớn.`,
    donts: [
      "So sánh dìm hàng các ứng viên khác.",
      "Tỏ vẻ trịch thượng hoặc nói câu trả lời chung chung."
    ]
  },
  {
    id: 25,
    title: "Mức lương ở công ty cũ của bạn là bao nhiêu?",
    category: "company_salary",
    difficulty: "Nhạy cảm",
    purpose: "Khảo sát mặt bằng thu nhập của bạn và làm cơ sở để đưa ra mức đãi ngộ hợp lý.",
    tips: [
      "Bạn có thể chia sẻ mức thu nhập trung bình (bao gồm lương cứng + thưởng/phụ cấp).",
      "Hoặc nếu có điều khoản bảo mật hợp đồng, hãy khéo léo viện dẫn bảo mật và hướng về mức lương mong muốn theo giá trị thị trường."
    ],
    sampleAnswer: `Tại công ty trước, tổng thu nhập của em dao động trong khoảng từ 8 đến 10 triệu đồng/tháng tùy theo kết quả dự án. Tuy nhiên, ở vị trí mới này, với khối lượng trách nhiệm và phạm vi công việc lớn hơn, em tin rằng mức đãi ngộ sẽ được cân nhắc dựa trên năng lực thực tế và khung lương chuẩn của Quý công ty.`,
    donts: [
      "Khai gian dối số tiền gấp đôi, gấp ba mức thực tế.",
      "Tỏ thái độ gay gắt từ chối trả lời một cách thô lỗ."
    ]
  },
  {
    id: 26,
    title: "Bạn mong muốn mức lương bao nhiêu?",
    category: "company_salary",
    difficulty: "Quan trọng",
    purpose: "Đo lường sự tự tin về giá trị của bạn và xem có nằm trong ngân sách dự kiến của công ty hay không.",
    tips: [
      "Khảo sát trước dải lương thị trường của vị trí và cấp bậc tương đương.",
      "Đưa ra một khoảng lương (range) thay vì một con số cứng nhắc và bày tỏ sự cởi mở thương lượng."
    ],
    sampleAnswer: `Dựa trên khảo sát thị trường cho vị trí này và năng lực thực tế em có thể đóng góp ngay, em kỳ vọng mức lương khởi điểm trong khoảng từ 10.000.000 đến 14.000.000 VNĐ net/tháng. Tuy nhiên, bên cạnh lương cứng, em cũng rất quan tâm đến cơ hội học hỏi, chế độ đào tạo và môi trường phát triển lâu dài, nên em hoàn toàn sẵn lòng thảo luận thêm để thống nhất con số hợp lý nhất cho cả hai bên.`,
    donts: [
      "Nói 'Công ty trả bao nhiêu cũng được ạ' - làm giảm giá trị bản thân.",
      "Đưa ra con số quá cao phi thực tế mà không giải thích được lý do."
    ]
  },
  {
    id: 27,
    title: "Bạn kỳ vọng gì về cấp trên và môi trường làm việc mới?",
    category: "company_salary",
    difficulty: "Cơ bản",
    purpose: "Xem xét mức độ hòa hợp về phong cách quản lý và văn hóa tổ chức của ứng viên.",
    tips: [
      "Tập trung vào yếu tố: Giao tiếp cởi mở, minh bạch, trao quyền và tinh thần hỗ trợ lẫn nhau.",
      "Thể hiện mong muốn được học hỏi từ người lãnh đạo có tâm và có tầm."
    ],
    sampleAnswer: `Em kỳ vọng một môi trường làm việc minh bạch, nơi các thành viên thẳng thắn trao đổi, chia sẻ kiến thức và cùng hướng về mục tiêu chung. Về cấp trên, em mong muốn có một người quản lý sẵn sàng đưa ra phản hồi mang tính xây dựng, tin tưởng trao cơ hội thử sức và định hướng giúp em nhìn nhận rõ lộ trình phát triển nghề nghiệp.`,
    donts: [
      "Kể ra một danh sách yêu sách đòi hỏi như sếp phải chiều chuộng hay không bao giờ được giao việc gấp."
    ]
  },
  {
    id: 28,
    title: "Bạn có sẵn sàng đi công tác hoặc làm thêm giờ không?",
    category: "company_salary",
    difficulty: "Tình huống",
    purpose: "Kiểm tra mức độ sẵn sàng cống hiến khi dự án bước vào giai đoạn cao điểm (release/gấp rút).",
    tips: [
      "Thể hiện sự sẵn sàng cống hiến cho thành công của dự án.",
      "Có thể khéo léo nêu rõ việc ưu tiên sắp xếp công việc khoa học để hạn chế tối đa OT không cần thiết."
    ],
    sampleAnswer: `Em hoàn toàn sẵn sàng làm thêm giờ hoặc đi công tác khi dự án bước vào giai đoạn nước rút cần bàn giao. Em hiểu rằng đối với các dự án thực tế, có những thời điểm cao điểm cần cả đội ngũ dồn sức. Về lâu dài, em luôn nỗ lực tối ưu hóa năng suất trong giờ hành chính để đảm bảo tiến độ và sức khỏe tốt nhất cho công việc.`,
    donts: [
      "Từ chối thẳng thừng: 'Em chỉ làm đúng 8 tiếng rồi về'.",
      "Hứa hẹn quá đà rằng em có thể OT thâu đêm suốt tuần."
    ]
  },
  {
    id: 29,
    title: "Khi nào bạn có thể nhận việc?",
    category: "company_salary",
    difficulty: "Thực tế",
    purpose: "Kiểm tra tính khả dụng của ứng viên để lên kế hoạch Onboarding nhân sự.",
    tips: [
      "Nếu đang đi làm: Nêu rõ thời hạn bàn giao theo luật lao động hoặc hợp đồng (thường 15-30 ngày) - điều này thể hiện tính chuyên nghiệp.",
      "Nếu là sinh viên/mới tốt nghiệp: Sẵn sàng nhận việc ngay hoặc sau vài ngày chuẩn bị."
    ],
    sampleAnswer: `Hiện tại em đã hoàn tất các thủ tục tại trường/công ty cũ nên em hoàn toàn có thể bắt đầu công việc ngay từ đầu tuần tới. Nếu công ty cần em tiếp nhận bàn giao sớm hơn vài ngày, em cũng rất sẵn lòng sắp xếp thời gian.`,
    donts: [
      "Nói 'Em cũng chưa biết nữa' hoặc chần chừ không rõ lý do.",
      "Bỏ ngang công ty cũ mà không bàn giao trách nhiệm."
    ]
  },
  {
    id: 30,
    title: "Bạn có câu hỏi gì dành cho chúng tôi không?",
    category: "company_salary",
    difficulty: "Cực kỳ quan trọng",
    purpose: "Đánh giá mức độ quan tâm sâu sắc, tư duy phân tích và sự chuẩn bị của ứng viên. Đừng bao giờ nói 'Em không có câu hỏi nào'!",
    tips: [
      "Chuẩn bị trước 2-3 câu hỏi thông minh về: Dự án sắp tới, kỳ vọng trong 3 tháng đầu, văn hóa nhóm hoặc quy trình đào tạo.",
      "Tránh hỏi ngay câu đầu tiên về lương thưởng hay nghỉ phép nếu chưa được đề cập."
    ],
    sampleAnswer: `Dạ em có một vài câu hỏi mong muốn được anh/chị chia sẻ thêm ạ:
1. Thưa anh/chị, tiêu chí quan trọng nhất để đánh giá một nhân sự mới hoàn thành tốt thời gian thử việc 2 tháng ở vị trí này là gì?
2. Nếu được nhận vào làm, dự án đầu tiên mà em sẽ tham gia giải quyết bài toán gì của công ty?
3. Đội ngũ hiện tại thường phối hợp và chia sẻ kiến thức (knowledge sharing) với nhau theo hình thức nào ạ?`,
    donts: [
      "Trả lời 'Em không còn câu hỏi nào cả'.",
      "Chỉ hỏi dồn dập về quyền lợi nghỉ phép, du lịch, thưởng Tết ngay từ đầu."
    ]
  }
];

export const CAREER_HANDBOOK_ITEMS = [
  {
    id: "confirm-email",
    title: "Mẫu email xác nhận phỏng vấn",
    icon: "bi-envelope-check-fill",
    badge: "Email mẫu",
    color: "#2a9d8f",
    summary: "Cách viết email phản hồi chuyên nghiệp khi nhận được lời mời phỏng vấn từ nhà tuyển dụng.",
    details: {
      intro: "Khi nhận được thư mời phỏng vấn, việc phản hồi nhanh chóng (trong vòng 24 giờ) với thái độ lịch sự sẽ tạo thiện cảm rất lớn với nhà tuyển dụng.",
      templateTitle: "Mẫu Email Xác Nhận Tham Gia Phỏng Vấn",
      subject: "[Họ và tên] - Xác nhận tham gia phỏng vấn vị trí [Tên vị trí]",
      body: `Kính gửi [Tên người liên hệ / Bộ phận Tuyển dụng Công ty ABC],

Em xin chân thành cảm ơn Quý công ty đã quan tâm đến hồ sơ ứng tuyển của em và gửi lời mời tham dự buổi phỏng vấn cho vị trí [Tên vị trí].

Em xin trân trọng xác nhận em sẽ có mặt tham dự buổi phỏng vấn theo đúng lịch trình đã thông báo:
- Thời gian: [Giờ], ngày [Ngày/Tháng/Năm]
- Hình thức: [Trực tiếp tại văn phòng: Địa chỉ / Trực tuyến qua Google Meet/Zoom: Link]

Em đã chuẩn bị đầy đủ các giấy tờ và thiết bị cần thiết cho buổi phỏng vấn. Nếu Quý công ty cần em cung cấp thêm thông tin hoặc tài liệu gì trước buổi gặp, xin vui lòng phản hồi qua email này.

Em rất mong có cơ hội được trao đổi trực tiếp cùng Quý công ty.

Trân trọng,
[Họ và tên của bạn]
Số điện thoại: [Số điện thoại]
Email: [Email của bạn]
LinkedIn / Portfolio: [Đường dẫn nếu có]`,
      tips: [
        "Phản hồi trong vòng tối đa 24h kể từ khi nhận thư mời.",
        "Kiểm tra lại chính xác ngày, giờ, địa điểm hoặc link phỏng vấn.",
        "Nếu bị trùng lịch, hãy đề xuất lịch thay thế một cách lịch sự và kèm lý do chính đáng."
      ]
    }
  },
  {
    id: "thankyou-email",
    title: "Thư cảm ơn sau phỏng vấn",
    icon: "bi-heart-fill",
    badge: "Email mẫu",
    color: "#e76f51",
    summary: "Mẫu thư cảm ơn gửi trong vòng 24h sau buổi phỏng vấn giúp bạn nổi bật hơn 80% ứng viên khác.",
    details: {
      intro: "Gửi thư cảm ơn sau buổi phỏng vấn thể hiện tính chuyên nghiệp, sự chu đáo và tái khẳng định niềm khao khát được cống hiến cho công ty.",
      templateTitle: "Mẫu Thư Cảm Ơn Sau Phỏng Vấn Chuẩn",
      subject: "[Họ và tên] - Thư cảm ơn sau buổi phỏng vấn vị trí [Tên vị trí]",
      body: `Kính gửi [Anh/Chị Tên người phỏng vấn hoặc Bộ phận Tuyển dụng],

Em xin chân thành cảm ơn Anh/Chị đã dành thời gian quý báu để trao đổi với em trong buổi phỏng vấn vị trí [Tên vị trí] vào ngày hôm nay [hoặc ngày hôm qua].

Buổi trò chuyện đã giúp em hiểu sâu sắc hơn về sứ mệnh, định hướng phát triển cũng như những thách thức thú vị của dự án [Tên dự án hoặc bộ phận]. Đặc biệt, những chia sẻ của Anh/Chị về [nêu 1 chi tiết ấn tượng trong buổi nói chuyện] càng củng cố thêm niềm tin và mong muốn được trở thành một thành viên trong đội ngũ của Quý công ty.

Với nền tảng về [nêu ngắn 1-2 thế mạnh cốt lõi] và tinh thần cầu tiến, em tin tưởng mình có thể đóng góp hiệu quả vào mục tiêu chung của đội ngũ.

Nếu Anh/Chị cần thêm bất kỳ thông tin nào, xin vui lòng liên hệ lại với em. Em rất mong sớm nhận được kết quả từ Quý công ty.

Kính chúc Anh/Chị và Quý công ty luôn gặt hái nhiều thành công rực rỡ!

Trân trọng,
[Họ và tên của bạn]
Số điện thoại: [Số điện thoại]
Email: [Email]`,
      tips: [
        "Nên gửi trong vòng 12 - 24 giờ sau khi kết thúc buổi phỏng vấn.",
        "Nhắc lại 1 chi tiết cụ thể mà bạn tâm đắc trong cuộc trao đổi để bức thư mang tính cá nhân hóa cao.",
        "Kiểm tra lỗi chính tả và danh xưng người nhận trước khi nhấn gửi."
      ]
    }
  },
  {
    id: "intern-questions",
    title: "Câu hỏi phỏng vấn thực tập sinh - sinh viên",
    icon: "bi-mortarboard-fill",
    badge: "Bí quyết",
    color: "#457b9d",
    summary: "Bộ câu hỏi đặc thù dành riêng cho sinh viên thực tập chưa có nhiều năm kinh nghiệm làm việc.",
    details: {
      intro: "Khi tuyển dụng thực tập sinh, nhà tuyển dụng không kỳ vọng bạn là chuyên gia 5 năm kinh nghiệm, họ quan tâm hàng đầu đến: Tố chất nền tảng, tinh thần trách nhiệm, khả năng tự học và thái độ khiêm tốn tích cực.",
      keyQuestions: [
        {
          q: "1. Tại sao em lại chọn thực tập tại công ty mà không phải nơi khác?",
          a: "Nhấn mạnh vào sản phẩm của công ty, môi trường đào tạo và văn hóa mentor tận tâm."
        },
        {
          q: "2. Em sắp xếp việc học ở trường và thời gian thực tập như thế nào?",
          a: "Cung cấp lịch học cụ thể, khẳng định cam kết đáp ứng tối thiểu 20-30 giờ/tuần hoặc full-time."
        },
        {
          q: "3. Đề tài tốt nghiệp hoặc đồ án lớn nhất em từng làm là gì?",
          a: "Trình bày rõ bài toán, công nghệ sử dụng, vai trò của em và điều em tâm đắc nhất sau khi hoàn thành."
        },
        {
          q: "4. Nếu được giao một việc đơn giản như nhập liệu hay dọn dẹp mã nguồn, em cảm thấy thế nào?",
          a: "Khẳng định mọi việc lớn đều bắt đầu từ việc nhỏ, em sẵn sàng làm tốt từ chi tiết để nắm vững quy trình."
        }
      ],
      tips: [
        "Luôn chuẩn bị sẵn link GitHub hoặc Portfolio các đồ án môn học.",
        "Thể hiện thái độ lắng nghe, sẵn sàng tiếp thu góp ý.",
        "Đừng ngại thừa nhận mình chưa biết, nhưng hãy nói kèm cam kết sẽ tìm hiểu ngay."
      ]
    }
  },
  {
    id: "online-interview",
    title: "Kỹ năng phỏng vấn online",
    icon: "bi-camera-video-fill",
    badge: "Cẩm nang",
    color: "#6a4c93",
    summary: "Bí quyết chuẩn bị kỹ thuật, âm thanh, ánh sáng và phong thái ghi điểm tối đa qua màn hình máy tính.",
    details: {
      intro: "Phỏng vấn trực tuyến (Google Meet, Zoom, MS Teams) ngày càng phổ biến. Chuẩn bị tốt khâu kỹ thuật giúp bạn loại bỏ 90% rủi ro bất ngờ.",
      checklist: [
        "Kiểm tra đường truyền Internet ổn định, chuẩn bị sẵn 4G dự phòng.",
        "Ánh sáng chiếu từ phía trước mặt, không ngồi ngược sáng làm tối mặt.",
        "Góc máy ngang tầm mắt, khung hình lấy từ ngực trở lên, phông nền gọn gàng hoặc dùng hiệu ứng làm mờ (blur).",
        "Sử dụng tai nghe có micro để âm thanh trong trẻo, không bị vang vọng.",
        "Vào phòng họp sớm từ 5 - 10 phút trước giờ hẹn để sẵn sàng."
      ],
      bodyLanguageTips: [
        "Nhìn thẳng vào webcam khi trả lời thay vì chỉ nhìn vào khuôn mặt mình trên màn hình.",
        "Ngồi thẳng lưng, giữ nụ cười thân thiện và gật đầu nhẹ để thể hiện sự tương tác.",
        "Mặc trang phục lịch sự như khi đi phỏng vấn trực tiếp."
      ]
    }
  },
  {
    id: "chinese-interview",
    title: "Câu hỏi phỏng vấn tiếng Trung",
    icon: "bi-translate",
    badge: "Ngoại ngữ",
    color: "#d90429",
    summary: "Các câu hỏi phỏng vấn tiếng Trung thông dụng kèm phiên âm Pinyin và dịch nghĩa.",
    details: {
      intro: "Ứng tuyển vào các doanh nghiệp Đài Loan, Trung Quốc hoặc vị trí yêu cầu tiếng Trung thường gặp các câu hỏi sau:",
      phrases: [
        {
          cn: "请先简单做一下自我介绍。",
          pinyin: "Qǐng xiān jiǎndān zuò yíxià zìwǒ jièshào.",
          vi: "Xin mời bạn giới thiệu ngắn gọn về bản thân.",
          hint: "Trả lời theo cấu trúc: Tên, trường tốt nghiệp, chuyên ngành và số năm kinh nghiệm."
        },
        {
          cn: "你为什么想应聘我们公司？",
          pinyin: "Nǐ wèishénme xiǎng yìngpìn wǒmen gōngsī?",
          vi: "Tại sao bạn muốn ứng tuyển vào công ty chúng tôi?",
          hint: "Nhấn mạnh: 贵公司的发展前景很好，我很认同公司的文化 (Công ty có triển vọng tốt, tôi rất đồng tình với văn hóa của quý công ty)."
        },
        {
          cn: "你有什么优缺点？",
          pinyin: "Nǐ yǒu shénme yōu quēdiǎn?",
          vi: "Bạn có những ưu điểm và khuyết điểm gì?",
          hint: "Ưu điểm: 认真负责 (chăm chỉ trách nhiệm), 学习能力强 (khả năng học hỏi cao)."
        },
        {
          cn: "你期望的薪资是多少？",
          pinyin: "Nǐ qīwàng de xīnzī shì duōshao?",
          vi: "Mức lương kỳ vọng của bạn là bao nhiêu?",
          hint: "我期望的薪资在...左右 (Mức lương tôi kỳ vọng khoảng...)."
        }
      ]
    }
  },
  {
    id: "japanese-interview",
    title: "Câu hỏi phỏng vấn tiếng Nhật",
    icon: "bi-globe-asia-australia",
    badge: "Ngoại ngữ",
    color: "#b5179e",
    summary: "Mẫu câu hỏi phỏng vấn chuẩn mực với văn hóa doanh nghiệp Nhật Bản (Housouran, Kaizen).",
    details: {
      intro: "Phỏng vấn công ty Nhật đặc biệt chú trọng lễ nghi, cách chào hỏi (Aisatsu) và tinh thần trách nhiệm, gắn bó.",
      phrases: [
        {
          jp: "自己紹介をお願いします。(Jiko shoukai wo onegaishimasu)",
          vi: "Xin mời bạn giới thiệu bản thân.",
          hint: "Bắt đầu bằng: はじめまして、[Tên]と申します。(Hajimemashite, [Tên] to moushimasu...)"
        },
        {
          jp: "志望動機を教えてください。(Shibou douki wo oshiete kudasai)",
          vi: "Hãy cho chúng tôi biết động lực/lý do ứng tuyển của bạn.",
          hint: "Nêu lý do yêu thích sản phẩm và mong muốn đóng góp lâu dài cho doanh nghiệp."
        },
        {
          jp: "長所と短所は何ですか？(Chousho to tansho wa nan desu ka?)",
          vi: "Điểm mạnh và điểm yếu của bạn là gì?",
          hint: "Nêu điểm mạnh kèm ví dụ thực tế; điểm yếu kèm cách bạn đang khắc phục."
        },
        {
          jp: "何か質問はありますか？(Nanika shitsumon wa arimasu ka?)",
          vi: "Bạn có câu hỏi gì dành cho chúng tôi không?",
          hint: "Luôn đặt câu hỏi ngược lại (Gyakushitsumon) để thể hiện sự quan tâm sâu sắc."
        }
      ]
    }
  },
  {
    id: "korean-interview",
    title: "Câu hỏi phỏng vấn tiếng Hàn thường gặp",
    icon: "bi-chat-left-dots-fill",
    badge: "Ngoại ngữ",
    color: "#3a86ff",
    summary: "Tổng hợp câu hỏi phỏng vấn tiếng Hàn phổ biến tại các tập đoàn Hàn Quốc (Samsung, LG, CJ...).",
    details: {
      intro: "Doanh nghiệp Hàn Quốc đánh giá cao tác phong nhanh nhẹn, tinh thần làm việc chăm chỉ (Palli Palli) và sự tôn trọng thứ bậc.",
      phrases: [
        {
          kr: "간단하게 자기소개 해주세요. (Gandan-hage jagi-sogae hae-juseyo.)",
          vi: "Xin vui lòng giới thiệu ngắn gọn về bản thân.",
          hint: "Chào lịch sự: 안녕하십니까 (Annyeonghasimnikka), sau đó tóm tắt kinh nghiệm và năng lực."
        },
        {
          kr: "우리 회사에 지원한 동기는 무엇입니까? (Uri hoesa-e jiwonhan donggi-neun mueos-imnikka?)",
          vi: "Động lực nào khiến bạn nộp hồ sơ vào công ty chúng tôi?",
          hint: "Bày tỏ sự khâm phục với chất lượng sản phẩm và danh tiếng của tập đoàn."
        },
        {
          kr: "자신의 장점과 단점을 말씀해 주세요. (Jasin-ui jangjeom-gwa danjeom-eul malsseumhae juseyo.)",
          vi: "Hãy nói về ưu điểm và khuyết điểm của bản thân bạn.",
          hint: "Ưu điểm: 책임감이 강합니다 (Tôi có tinh thần trách nhiệm cao)."
        },
        {
          kr: "마지막으로 하고 싶은 질문이 있습니까? (Majimag-euro hago sipeun jilmuni isseumnikka?)",
          vi: "Cuối cùng bạn có câu hỏi nào muốn đặt ra không?",
          hint: "Hỏi về các kỳ vọng công việc hoặc chương trình đào tạo của công ty."
        }
      ]
    }
  },
  {
    id: "english-interview",
    title: "Câu hỏi phỏng vấn tiếng Anh kinh điển",
    icon: "bi-chat-quote-fill",
    badge: "Ngoại ngữ",
    color: "#0077b6",
    summary: "Bộ câu hỏi phỏng vấn tiếng Anh chuẩn mực nhất kèm mẫu câu trả lời ấn tượng.",
    details: {
      intro: "Tiếng Anh là ngôn ngữ giao tiếp chuẩn tại hầu hết các công ty công nghệ và tập đoàn đa quốc gia.",
      phrases: [
        {
          en: "Tell me about yourself.",
          vi: "Hãy giới thiệu về bản thân bạn.",
          hint: "Structure: Present - Past - Future. Example: 'I'm a passionate software engineer with a strong background in React and Node.js...'"
        },
        {
          en: "What are your greatest strengths and weaknesses?",
          vi: "Điểm mạnh và điểm yếu lớn nhất của bạn là gì?",
          hint: "Highlight a core technical strength with metrics, and a real weakness that you are actively improving."
        },
        {
          en: "Where do you see yourself in 5 years?",
          vi: "Bạn thấy mình ở đâu trong 5 năm tới?",
          hint: "Focus on continuous skill development, mentorship, and leadership roles within the company."
        },
        {
          en: "Why should we hire you over other candidates?",
          vi: "Tại sao chúng tôi nên chọn bạn thay vì các ứng viên khác?",
          hint: "Connect your specific skill set directly to solving the immediate problems listed in the JD."
        },
        {
          en: "Do you have any questions for us?",
          vi: "Bạn có câu hỏi gì dành cho chúng tôi không?",
          hint: "Ask about team goals, sprint processes, or key success indicators for this role."
        }
      ]
    }
  }
];
