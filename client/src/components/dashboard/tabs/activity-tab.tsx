import { useActivities, useJobApplications } from '@/hooks/use-profile';

export default function ActivityTab() {
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();
  const { data: jobApplications = [], isLoading: jobApplicationsLoading } = useJobApplications();
  
  const isLoading = activitiesLoading || jobApplicationsLoading;

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-gray-600">Loading activities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity: any) => (
                <div key={activity.id} className="text-center py-4">
                  <p className="font-medium text-gray-900">
                    {activity.description} : {activity.date}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="font-medium text-gray-900">Resume Updated on : 12-03-2025</p>
                <p className="font-medium text-gray-900 mt-2">Last Job Applied : 12-03-2025</p>
              </div>
            )}
          </div>
        </div>

        {/* Archives */}
        <div className="bg-primary-blue rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-6">Archives</h3>
          <div className="space-y-3">
            {jobApplications.map((application: any) => (
              <div key={application.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {application.jobTitle} <span className="text-sm text-gray-300">({application.jobType})</span>
                  </p>
                  <p className="text-sm text-gray-300">{application.company}</p>
                </div>
                <span className="text-sm">{application.daysAgo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
