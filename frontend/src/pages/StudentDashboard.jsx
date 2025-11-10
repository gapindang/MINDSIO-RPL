import React from 'react';
import { TrendingUp, Award, BookOpen, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
    const stats = [
        { title: 'Current GPA', value: '3.70', subtitle: '+0.1 from last month', icon: TrendingUp, color: 'blue' },
        { title: 'Courses', value: '5', subtitle: 'Active this semester', icon: BookOpen, color: 'purple' },
        { title: 'Average Score', value: '87.6%', subtitle: 'Across all subjects', icon: Award, color: 'yellow' },
        { title: 'MBTI Type', value: 'INFP', subtitle: 'The Mediator', icon: Sparkles, color: 'green' },
    ];

    const gpaData = [
        { month: 'Sep', gpa: 3.2 },
        { month: 'Oct', gpa: 3.4 },
        { month: 'Nov', gpa: 3.3 },
        { month: 'Dec', gpa: 3.5 },
        { month: 'Jan', gpa: 3.7 },
    ];

    const subjectPerformance = [
        { name: 'Math', score: 85 },
        { name: 'Science', score: 92 },
        { name: 'English', score: 88 },
        { name: 'History', score: 78 },
        { name: 'Art', score: 95 },
    ];

    const detailedProgress = [
        { subject: 'Math', progress: 88, color: 'blue' },
        { subject: 'Science', progress: 92, color: 'green' },
        { subject: 'English', progress: 88, color: 'blue' },
        { subject: 'History', progress: 73, color: 'yellow' },
        { subject: 'Art', progress: 92, color: 'green' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, Student!</h1>
                    <p className="text-gray-600 mt-1">Here's your academic progress overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* GPA Trend Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">GPA Trend</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={gpaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 4]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="gpa" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subject Performance Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={subjectPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Subject Progress */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Detailed Subject Progress</h2>
                    <div className="space-y-4">
                        {detailedProgress.map((item, index) => {
                            const colorClasses = {
                                blue: 'bg-blue-600',
                                green: 'bg-green-600',
                                yellow: 'bg-yellow-500',
                            };

                            return (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${item.progress >= 90 ? 'bg-green-100 text-green-800' :
                                                item.progress >= 80 ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colorClasses[item.color]}`}
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
