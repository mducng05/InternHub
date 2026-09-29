import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { MBTI_IMAGES } from "../data/mbtiData";

export default function MbtiResultModal({
  show,
  onHide,
  result,
  onReset,
  onViewDetails,
}) {
  const navigate = useNavigate();

  if (!result) return null;

  const typeName = result.info?.name || "Người lý tưởng hóa";
  const personalityText =
    result.info?.personalityDescription ||
    result.info?.summary ||
    "Một người có tâm hồn phong phú, nhiệt huyết và luôn theo đuổi những giá trị tích cực.";

  const handleDetailClick = () => {
    if (onViewDetails) {
      onViewDetails(result);
    } else {
      onHide();
      navigate(`/mbti/${result.type.toLowerCase()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToMbti = () => {
    onHide();
    if (onReset) {
      onReset();
    }
    navigate("/mbti-test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="mbti-result-modal"
      contentClassName="mbti-result-modal-content border-0 shadow-lg"
    >
      <Modal.Body className="p-4 p-md-5 pb-5 position-relative bg-white">
        {/* Nút đóng tròn góc trên bên phải */}
        <button
          type="button"
          className="mbti-modal-close-btn"
          onClick={onHide}
          aria-label="Đóng"
          title="Đóng"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Tiêu đề chúc mừng theo theme đỏ hồng đặc trưng của InternHub */}
        <h3 className="mbti-result-congrats">
          Chúc mừng bạn đã hoàn thành bài test!
        </h3>

        {/* Bố cục 2 phần: Ảnh đại diện lớn và cột chữ tự động đồng bộ chiều cao ngang bằng nhau */}
        <div className="mbti-result-layout">
          {/* Cột trái: Ảnh nhân vật MBTI to rõ nét kéo dãn chiều cao bằng cột chữ */}
          <div className="mbti-result-img-col">
            <img
              src={result.image || MBTI_IMAGES[result.type] || MBTI_IMAGES["INTJ"]}
              alt={`Tính cách ${result.type}`}
              className="mbti-result-ref-img"
            />
          </div>

          {/* Cột phải: Phân bổ đều từ trên xuống dưới, không bị đè hay che khuất phần dưới */}
          <div className="mbti-result-info-col">
            <div className="mbti-result-text-top">
              <div className="mbti-result-label">Bạn thuộc nhóm tính cách</div>
              <h2 className="mbti-result-main-heading">
                {result.type} - {typeName}
              </h2>
              <p className="mbti-result-persona-desc">{personalityText}</p>
            </div>

            {/* Các nút hành động phía dưới: Hiển thị đầy đủ, thoáng đãng, thẳng hàng */}
            <div className="mbti-result-actions">
              <button
                type="button"
                className="btn mbti-btn-view-detail w-100"
                onClick={handleDetailClick}
              >
                <i className="bi bi-eye-fill me-1.5"></i> Xem chi tiết
              </button>

              <button
                type="button"
                className="btn btn-link mbti-back-home-link text-decoration-none"
                onClick={handleBackToMbti}
              >
                <i className="bi bi-arrow-left me-1"></i> Về trang chủ MBTI
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
