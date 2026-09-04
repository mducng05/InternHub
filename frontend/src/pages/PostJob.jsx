import { useParams } from "react-router-dom";

export default function JobDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1>Đăng tin tuyển dụng #{id}</h1>
    </div>
  );
}