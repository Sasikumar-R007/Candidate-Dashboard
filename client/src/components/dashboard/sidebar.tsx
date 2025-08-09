export default function Sidebar() {
  return (
    <div className="w-64 bg-primary-blue text-white flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-8">Job Portal</h1>
        <nav className="space-y-2">
          <a href="#" className="flex items-center px-4 py-3 rounded-lg bg-blue-700 font-medium">
            <i className="fas fa-tachometer-alt mr-3"></i>
            Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-briefcase mr-3"></i>
            Job Board
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-sign-out-alt mr-3"></i>
            Sign Out
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-cog mr-3"></i>
            Settings
          </a>
        </nav>
      </div>
    </div>
  );
}
