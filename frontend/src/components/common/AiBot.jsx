import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../services/authService";
import { getStudentCourses } from "../../services/courseService";
import { getAllPackets, getFacultyPackets, getPackets } from "../../services/packetService";

const quickPrompts = {
  admin: ["Pending packets?", "Approval summary", "Where are reports?"],
  faculty: ["My packet status?", "How to submit?", "Pending review?"],
  student: ["Approved packets?", "Course progress?", "Where to request?"],
};

function countStatus(packets, status) {
  return packets.filter((packet) => packet.status === status).length;
}

function latestPacketText(packets) {
  if (!packets.length) return "No packet data is available yet.";
  const packet = packets[0];
  return `Latest packet is "${packet.title}" for ${packet.course}, status: ${packet.status}.`;
}

function buildReply(message, role, data) {
  const text = message.toLowerCase();
  const packets = data.packets || [];
  const courses = data.courses || [];
  const users = data.users || [];
  const pending = countStatus(packets, "pending");
  const approved = countStatus(packets, "approved");
  const rejected = countStatus(packets, "rejected");

  if (text.includes("pending") || text.includes("approval")) {
    if (role === "admin") {
      return `You have ${pending} pending packet requests. Open Approval Workflow to approve or reject them.`;
    }
    if (role === "faculty") {
      return `${pending} of your submitted packets are still under review. ${latestPacketText(packets)}`;
    }
    return `Students can see approved packets only. You currently have ${approved} approved packets available.`;
  }

  if (text.includes("summary") || text.includes("status") || text.includes("packet")) {
    return `Packet summary: ${packets.length} total, ${pending} pending, ${approved} approved, ${rejected} rejected. ${latestPacketText(packets)}`;
  }

  if (text.includes("course") || text.includes("progress")) {
    if (!courses.length) return "No course progress data is available yet.";
    const average = Math.round(courses.reduce((sum, course) => sum + Number(course.progress || 0), 0) / courses.length);
    return `You have ${courses.length} tracked courses with ${average}% average progress. Open Course Tracking for details.`;
  }

  if (text.includes("user") || text.includes("student") || text.includes("faculty")) {
    if (role !== "admin") return "User management is available to admins only.";
    return `There are ${users.length} users in the system. Manage them from Users in the sidebar.`;
  }

  if (text.includes("report")) {
    return role === "admin"
      ? "Reports are available from the sidebar. They show live packet totals and approval progress."
      : "Reports are admin-only. You can use your dashboard for your own progress summary.";
  }

  if (text.includes("submit") || text.includes("request")) {
    if (role === "faculty") return "Use Submit Packet from the sidebar to send a new packet for admin approval.";
    if (role === "student") return "Use Request Packet from the sidebar, then Track Request Status to follow progress.";
    return "Admins review packet requests from Approval Workflow.";
  }

  return `I can help with packet status, approvals, reports, users, and course progress. Current packet summary: ${packets.length} total, ${pending} pending, ${approved} approved.`;
}

export default function AiBot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ packets: [], users: [], courses: [] });
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I can help you read live packet data and find the right page." },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!user?.email || !user?.role || !open) return;

    const loadContext = async () => {
      setLoading(true);
      try {
        if (user.role === "admin") {
          const [packets, users] = await Promise.all([
            getAllPackets(user.role, user.email),
            getUsers(user.role, user.email),
          ]);
          setData({ packets, users, courses: [] });
        } else if (user.role === "faculty") {
          const packets = await getFacultyPackets(user.role, user.email);
          setData({ packets, users: [], courses: [] });
        } else {
          const [packets, courses] = await Promise.all([
            getPackets(user.email, user.role),
            getStudentCourses(user.role, user.email),
          ]);
          setData({ packets, users: [], courses });
        }
      } catch {
        setMessages((current) => [
          ...current,
          { from: "bot", text: "I could not load live data right now. Check that backend is running." },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, [open, user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const prompts = useMemo(() => quickPrompts[user?.role] || [], [user]);

  const sendMessage = (value = input) => {
    const question = value.trim();
    if (!question) return;

    const reply = buildReply(question, user.role, data);
    setMessages((current) => [
      ...current,
      { from: "user", text: question },
      { from: "bot", text: reply },
    ]);
    setInput("");
  };

  const goToSmartPage = () => {
    const target =
      user.role === "admin"
        ? "/admin/approval"
        : user.role === "faculty"
        ? "/faculty/review"
        : "/student/track";
    navigate(target);
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">AI Help Bot</p>
              <p className="text-xs text-slate-300">{loading ? "Reading live data..." : "Live app assistant"}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-sm hover:bg-slate-800">
              Close
            </button>
          </div>

          <div ref={listRef} className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  message.from === "bot"
                    ? "mr-8 bg-slate-100 text-slate-700"
                    : "ml-8 bg-indigo-600 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Ask about packets, reports..."
                className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={() => sendMessage()} className="btn-primary">
                Send
              </button>
            </div>
            <button onClick={goToSmartPage} className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
              Open suggested page
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700"
      >
        AI Bot
      </button>
    </div>
  );
}
