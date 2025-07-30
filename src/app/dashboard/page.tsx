'use client';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Footer from '../../../components/footer/footerComponent';

const Dashboard: NextPage = () => {
    const pathname = usePathname();

    // Helper function to determine active link
    const isActive = (path: string) => {
        return pathname === path;
    };
    // Mock data - will be replaced with real data later
    const incidents = [
        { id: 1, title: 'Server Down', type: 'Infrastructure', status: 'Open', urgency: 'High', date: '2023-05-15' },
        { id: 2, title: 'Login Issues', type: 'Application', status: 'In Progress', urgency: 'Medium', date: '2023-05-14' },
        { id: 3, title: 'Data Sync Problem', type: 'Database', status: 'Resolved', urgency: 'High', date: '2023-05-13' },
        { id: 4, title: 'UI Bug', type: 'Application', status: 'Open', urgency: 'Low', date: '2023-05-12' },
    ];

    const activityLog = [
        { id: 1, action: 'Incident #3 resolved', user: 'Admin User', time: '2 hours ago' },
        { id: 2, action: 'New incident reported', user: 'John Doe', time: '5 hours ago' },
        { id: 3, action: 'Priority changed on incident #1', user: 'Admin User', time: '1 day ago' },
        { id: 4, action: 'Incident #2 assigned to Tech Team', user: 'System', time: '2 days ago' },
    ];

  return (
    <div className="min-h-screen bg-[#EAF6FF]">
      <Head>
        <title>Admin Dashboard | Incident Reporting</title>
      </Head>

      {/* Header */}
      <header className="bg-[#2A2A72] text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <h1 className="text-2xl font-bold">Incident Reporting</h1>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/dashboard" 
                            className={`hover:text-[#FFA400] transition-colors duration-200 font-medium ${
                                isActive('/dashboard') ? 'text-[#FFA400]' : ''
                            }`}
                            aria-current={isActive('/dashboard') ? 'page' : undefined}
                            >
                            Dashboard
                        </Link>
                        <Link 
                        href="/management" 
                        className={`hover:text-[#FFA400] transition-colors duration-200 font-medium ${
                            isActive('/management') ? 'text-[#FFA400]' : ''
                        }`}
                        aria-current={isActive('/management') ? 'page' : undefined}
                        >
                            Incident Management
                        </Link>
                        <Link 
                            href="/analytics" 
                            className={`hover:text-[#FFA400] transition-colors duration-200 font-medium ${
                                isActive('/analytics') ? 'text-[#FFA400]' : ''
                            }`}
                            aria-current={isActive('/analytics') ? 'page' : undefined}
                        >
                            Analytics
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[#009FFD] font-medium hidden sm:inline">Admin User</span>
                    <div className="w-10 h-10 rounded-full bg-[#FFA400] flex items-center justify-center">
                        <span className="text-[#232528] font-bold">AU</span>
                    </div>
                </div>
            </div>
        </header>

      <main className="container mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-main-black-232528 font-semibold mb-2">Total Incidents</h3>
            <p className="text-3xl font-bold text-primary-2A2A72">24</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-main-black-232528 font-semibold mb-2">Open Incidents</h3>
            <p className="text-3xl font-bold text-secondary-FFA400">8</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-main-black-232528 font-semibold mb-2">High Urgency</h3>
            <p className="text-3xl font-bold text-accent-009FFD">5</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incident List */}
          <div className="lg:col-span-2">
            <div className="bg-main-white-EAF6FF rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-main-black-232528">Recent Incidents</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#2A2A72]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-[#EAF6FF]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-main-black-232528">{incident.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-main-black-232528">{incident.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${incident.status === 'Open' ? 'bg-red-100 text-red-800' : 
                              incident.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${incident.urgency === 'High' ? 'bg-red-100 text-red-800' : 
                              incident.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {incident.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Charts */}
            <div className="bg-main-white-EAF6FF rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-main-black-232528 mb-4">Incidents by Type</h2>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                [Pie Chart Placeholder]
              </div>
            </div>

            <div className="bg-main-white-EAF6FF rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-main-black-232528 mb-4">Incidents by Status</h2>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                [Bar Chart Placeholder]
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-main-white-EAF6FF rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-main-black-232528">Recent Activity</h2>
              </div>
              <div className="p-4 bg-white">
                <ul className="space-y-4">
                  {activityLog.map((activity) => (
                    <li key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary-FFA400 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-main-black-232528">{activity.user.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm text-main-black-232528">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;