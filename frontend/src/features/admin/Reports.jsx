import Layout from "../../components/layout/Layout";

const reports = [
  { title: "Total Requests", value: 48, color: "from-indigo-500 to-blue-600" },
  { title: "Pending", value: 12, color: "from-yellow-400 to-orange-500" },
  { title: "Approved", value: 30, color: "from-green-500 to-emerald-600" },
  { title: "Rejected", value: 6, color: "from-rose-500 to-red-600" },
];

function ReportCard({ title, value, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white rounded-2xl p-5 shadow`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default function Reports() {
  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <Layout
      title="Reports"
      subtitle="Track packet statistics and progress"
      onLogout={handleLogout}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((item) => (
          <ReportCard
            key={item.title}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </div>

      <div className="mt-6 card">
        <h3 className="text-lg font-semibold text-slate-800">Report Notes</h3>
        <p className="mt-2 text-slate-500">
          Yahan par tum charts, monthly performance, aur packet trends add kar sakte ho.
        </p>
      </div>
    </Layout>
  );
}