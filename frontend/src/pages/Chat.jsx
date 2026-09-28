import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchConversations, fetchMessages, openConversation, sendMessage } from "../api/chat";
import { useAuth } from "../store/AuthContext";
import "./Chat.css";

function items(response) {
  const data = response?.data;
  return Array.isArray(data) ? data : data?.results || [];
}

function otherName(conversation, role) {
  return role === "student" ? conversation.company_name : conversation.candidate_name;
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const applicationId = searchParams.get("application_id");
  const requestedConversation = searchParams.get("conversation");
  const role = user?.role;

  const loadConversations = useCallback(async () => {
    const response = await fetchConversations();
    const next = items(response);
    setConversations(next);
    return next;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let list = await loadConversations();
        if (applicationId) {
          const { data } = await openConversation(applicationId);
          list = await loadConversations();
          if (alive) {
            setActiveId(data.id);
            setSearchParams({ conversation: String(data.id) }, { replace: true });
          }
        } else if (alive) {
          const requestedId = Number(requestedConversation);
          setActiveId(list.some((item) => item.id === requestedId) ? requestedId : list[0]?.id || null);
        }
      } catch {
        if (alive) setError("Không thể tải danh sách hội thoại.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [applicationId, requestedConversation, loadConversations, setSearchParams]);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await fetchMessages(id);
      setMessages(items(response));
      setError("");
    } catch {
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    }
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return undefined; }
    loadMessages(activeId);
    const timer = window.setInterval(() => loadMessages(activeId), 4000);
    return () => window.clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (id) => {
    setActiveId(id);
    setSearchParams({ conversation: String(id) });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(activeId, body);
      setDraft("");
      await loadMessages(activeId);
    } catch {
      setError("Gửi tin nhắn chưa thành công. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="chat-page">
      <header className="chat-page__heading">
        <div><span>TIN NHẮN</span><h1>Trao đổi với {role === "student" ? "nhà tuyển dụng" : "ứng viên"}</h1></div>
      </header>
      <section className="chat-shell">
        <aside className="chat-sidebar">
          <h2>Hội thoại <span>{conversations.length}</span></h2>
          {loading ? <p className="chat-muted">Đang tải hội thoại…</p> : conversations.length === 0 ? (
            <p className="chat-muted">Chưa có hội thoại. Bạn có thể bắt đầu chat từ hồ sơ ứng tuyển.</p>
          ) : conversations.map((conversation) => {
            const last = conversation.last_message;
            return (
              <button className={`chat-conversation ${activeId === conversation.id ? "is-active" : ""}`} key={conversation.id} onClick={() => selectConversation(conversation.id)} type="button">
                <span className="chat-avatar"><i className={`bi ${role === "student" ? "bi-building" : "bi-person"}`} /></span>
                <span className="chat-conversation__copy"><strong>{otherName(conversation, role)}</strong><small>{conversation.job_title}</small><span>{last?.body || "Bắt đầu cuộc trò chuyện"}</span></span>
                {conversation.unread_count > 0 && <b className="chat-unread">{conversation.unread_count}</b>}
              </button>
            );
          })}
        </aside>
        <div className="chat-thread">
          {activeId ? <>
            <div className="chat-thread__heading">
              <div><strong>{otherName(conversations.find((item) => item.id === activeId) || {}, role)}</strong><span>{conversations.find((item) => item.id === activeId)?.job_title}</span></div>
            </div>
            <div className="chat-messages" aria-live="polite">
              {messages.map((message) => {
                const mine = message.sender === user?.id;
                return <div className={`chat-message ${mine ? "is-mine" : ""}`} key={message.id}>
                  <p>{message.body}</p><time>{new Date(message.created_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</time>
                </div>;
              })}
              <div ref={bottomRef} />
            </div>
            {error && <p className="chat-error" role="alert">{error}</p>}
            <form className="chat-composer" onSubmit={handleSend}>
              <textarea aria-label="Nội dung tin nhắn" maxLength={5000} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} placeholder="Nhập tin nhắn…" rows={1} value={draft} />
              <button aria-label="Gửi tin nhắn" disabled={!draft.trim() || sending} type="submit"><i className="bi bi-send-fill" /></button>
            </form>
          </> : <div className="chat-empty"><i className="bi bi-chat-dots" /><h2>Chọn một hội thoại</h2><p>Tin nhắn giữa ứng viên và nhà tuyển dụng sẽ hiển thị tại đây.</p>{error && <p className="chat-error">{error}</p>}</div>}
        </div>
      </section>
    </main>
  );
}
