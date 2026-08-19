import { useEffect, useState } from "react";
import client from "../api/client";

export default function Home() {
  const [status, setStatus] = useState("Đang kiểm tra kết nối backend...");

  useEffect(() => {
    client
      .get("/health/")
      .then((res) => setStatus(`Backend OK (status: ${res.data.status})`))
      .catch(() => setStatus("Không kết nối được backend"));
  }, []);

  return (
    <div>
      <h1>Trang chủ - Gợi ý việc làm thực tập</h1>
      <p>{status}</p>
      <p>Danh sách tin tuyển dụng thực tập nổi bật sẽ hiển thị ở đây.</p>
    </div>
  );
}
