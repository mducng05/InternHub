import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchConversations, fetchMessages, sendMessage } from "../api/chat";
import { useAuth } from "../store/AuthContext";
import "./MessengerWidget.css";

function responseItems(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

function conversationName(conversation, role) {
  return role === "student" ? conversation.company_name : conversation.candidate_name;
}

function messagesEqual(current, next) {
  return current.length === next.length && current.every((message, index) => {
    const other = next[index];
    return message.id === other.id && message.body === other.body && message.read_at === other.read_at;
  });
}

export default function MessengerWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);
  const activeConversationRef = useRef(activeId);
  activeConversationRef.current = activeId;
  const role = user?.role;
  const canChat = role === "student" || role === "employer";
  const hidden = ["/login", "/register", "/change-password"].includes(location.pathname)
    || location.pathname.startsWith("/admin/");
  const activeConversation = conversations.find((item) => item.id === activeId);

  const loadConversations = useCallback(async () => {
    const response = await fetchConversations();
    const next = responseItems(response);
    setConversations(next);
    return next;
  }, []);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await fetchMessages(id);
      const next = responseItems(response);
      if (activeConversationRef.current !== id) return;
      setMessages((current) => messagesEqual(current, next) ? current : next);
      setError("");
    } catch {
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    }
  }, []);

  useEffect(() => {
    if (!open || !canChat) return undefined;
    let current = true;
    setLoading(true);
    loadConversations()
      .then((list) => {
        if (current) setActiveId((id) => list.some((item) => item.id === id) ? id : list[0]?.id || null);
      })
      .catch(() => { if (current) setError("Không thể tải danh sách hội thoại."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [open, canChat, loadConversations]);

  useEffect(() => {
    if (!open || !activeId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    let timer;
    const poll = async () => {
      await loadMessages(activeId);
      if (!cancelled) timer = window.setTimeout(poll, 2500);
    };
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, activeId, loadMessages]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 90;
    if (nearBottom) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setError("");
    setDraft("");
    const optimisticId = `pending-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      sender: user.id,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((current) => [...current, optimisticMessage]);
    try {
      const { data } = await sendMessage(activeId, body);
      setMessages((current) => {
        if (current.some((message) => message.id === data.id)) return current;
        if (current.some((message) => message.id === optimisticId)) {
          return current.map((message) => message.id === optimisticId ? data : message);
        }
        return [...current, data];
      });
      await loadConversations();
    } catch {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setDraft(body);
      setError("Gửi tin nhắn chưa thành công. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      {open && <section className="messenger-panel" aria-label="Khung chat">
        <header className="messenger-header">
          <div><strong>Tin nhắn</strong><span>{canChat ? "Trao đổi nhanh" : "Kết nối với nhà tuyển dụng"}</span></div>
          <button type="button" aria-label="Đóng khung chat" onClick={() => setOpen(false)}><i className="bi bi-x-lg" /></button>
        </header>
        {!canChat ? <div className="messenger-login">
          <i className="bi bi-chat-dots" />
          <p>Đăng nhập để xem và gửi tin nhắn.</p>
          <Link to="/login" onClick={() => setOpen(false)}>Đăng nhập</Link>
        </div> : <>
          <div className="messenger-body">
            <aside className="messenger-list">
              {loading ? <p className="messenger-muted">Đang tải hội thoại…</p> : conversations.length === 0 ? (
                <p className="messenger-muted">Chưa có hội thoại. Hãy bắt đầu chat từ hồ sơ ứng tuyển.</p>
              ) : conversations.map((conversation) => (
                <button key={conversation.id} type="button" className={`messenger-conversation ${activeId === conversation.id ? "is-active" : ""}`} onClick={() => { if (activeId !== conversation.id) { setMessages([]); setActiveId(conversation.id); } }}>
                  <span className="messenger-avatar"><i className={`bi ${role === "student" ? "bi-building" : "bi-person"}`} /></span>
                  <span className="messenger-conversation-copy"><strong>{conversationName(conversation, role)}</strong><small>{conversation.last_message?.body || conversation.job_title}</small></span>
                  {conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}
                </button>
              ))}
            </aside>
            <div className="messenger-thread">
              {activeId ? <>
                <div className="messenger-thread-title">
                  <span>{conversationName(activeConversation || {}, role)}</span>
                  <button type="button" className="messenger-info-button" aria-label="Xem thông tin người đang chat" aria-expanded={infoOpen} onClick={() => setInfoOpen((value) => !value)}>
                    <i className="bi bi-info-circle" />
                  </button>
                </div>
                {infoOpen && <aside className="messenger-person-info">
                  <span className="messenger-person-info-avatar"><i className={`bi ${role === "student" ? "bi-building" : "bi-person"}`} /></span>
                  <div className="messenger-person-info-copy">
                    <strong>{conversationName(activeConversation || {}, role)}</strong>
                    {role === "student" ? <>
                      <span>{activeConversation?.job_title}</span>
                      {activeConversation?.company_profile_id && <Link to={`/companies/${activeConversation.company_profile_id}`}>Xem trang doanh nghiệp</Link>}
                    </> : <>
                      <span>{activeConversation?.candidate_university || "Chưa cập nhật trường"}</span>
                      <span>{activeConversation?.candidate_major || "Chưa cập nhật chuyên ngành"}</span>
                      <small>Ứng tuyển: {activeConversation?.job_title}</small>
                    </>}
                  </div>
                  <button type="button" className="messenger-info-close" aria-label="Đóng thông tin" onClick={() => setInfoOpen(false)}><i className="bi bi-x" /></button>
                </aside>}
                <div className="messenger-messages" aria-live="polite" ref={messagesRef}>
                  {messages.map((message) => <div key={message.id} className={`messenger-message ${message.sender === user?.id ? "is-mine" : ""}`}>
                    <p>{message.body}</p>
                    <time>{new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time>
                  </div>)}
                </div>
                {error && <p className="messenger-error" role="alert">{error}</p>}
                <form className="messenger-composer" onSubmit={handleSend}>
                  <input aria-label="Nội dung tin nhắn" maxLength={5000} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} placeholder="Nhập tin nhắn…" value={draft} />
                  <button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim() || sending}><i className="bi bi-send-fill" /></button>
                </form>
              </> : <div className="messenger-no-thread">Chọn một hội thoại để xem tin nhắn</div>}
            </div>
          </div>
          <footer className="messenger-footer"><Link to="/chat" onClick={() => setOpen(false)}>Mở trang tin nhắn <i className="bi bi-arrow-up-right" /></Link></footer>
        </>}
      </section>}
      <button className={`messenger-launcher ${open ? "is-open" : ""}`} type="button" aria-label={open ? "Đóng khung chat" : "Mở khung chat"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <i className={`bi ${open ? "bi-x-lg" : "bi-chat-dots-fill"}`} />
        {!open && canChat && conversations.some((conversation) => conversation.unread_count > 0) && <span className="messenger-launcher-badge" />}
      </button>
    </>
  );
}
