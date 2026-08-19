import { useParams } from "react-router-dom";

export default function JobDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1>Chi tiết tin tuyển dụng #{id}</h1>
      {/* TODO: gọi api/jobs.js:fetchJobDetail, nút Ứng tuyển / Lưu tin */}
    </div>
  );
}
