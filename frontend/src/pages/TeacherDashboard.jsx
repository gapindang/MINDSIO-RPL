import React, { useState } from 'react';
import { Users, FileCheck, TrendingUp, FileText, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [grade, setGrade] = useState('');

    const stats = [
        { title: 'Total Students', value: '124', subtitle: 'Across all classes', icon: Users, color: 'blue' },
        { title: 'MBTI Tests Completed', value: '98', subtitle: '98% completion rate', icon: FileCheck, color: 'purple' },
        { title: 'Class Average GPA', value: '3.6', subtitle: '56 ections unfinished', icon: TrendingUp, color: 'green' },
        { title: 'Reports Generated', value: '45', subtitle: 'This month', icon: FileText, color: 'yellow' },
    ];

    const classPerformance = [
        { name: 'Math', value: 85 },
        { name: 'Science', value: 92 },
        { name: 'English', value: 88 },
        { name: 'History', value: 78 },
    ];

    const students = [
        { name: 'Emma Johnson', mbti: 'INFP', gpa: 3.8, performance: 'Excellent' },
        { name: 'Liam Smith', mbti: 'ESTJ', gpa: 3.6, performance: 'Good' },
        { name: 'Olivia Brown', mbti: 'ENFP', gpa: 3.9, performance: 'Excellent' },
        { name: 'Noah Davis', mbti: 'INTJ', gpa: 3.5, performance: 'Good' },
        { name: 'Ava Wilson', mbti: 'ISFJ', gpa: 3.7, performance: 'Good' },
    ];

    const handleUploadGrade = () => {
        if (selectedStudent && selectedSubject && grade) {
            alert(`Grade uploaded: ${grade} for ${selectedSubject}`);
            setSelectedStudent('');
            setSelectedSubject('');
            setGrade('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage students and monitor performance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Upload Student Grades */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Student Grades</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Student
                                </label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose a student</option>
                                    {students.map((student, index) => (
                                        <option key={index} value={student.name}>{student.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose subject</option>
                                    <option value="Math">Math</option>
                                    <option value="Science">Science</option>
                                    <option value="English">English</option>
                                    <option value="History">History</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Grade (%)
                                </label>
                                <input
                                    type="number"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder="Enter grade"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={handleUploadGrade}
                                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            >
                                Upload Grade
                            </button>
                        </div>
                    </div>

                    {/* Class Performance Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Overview</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Overview Table */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Student Overview</h2>
                        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                            <Download className="h-4 w-4" />
                            <span>Export Report</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        MBTI Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GPA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.mbti}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.gpa}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.performance === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {student.performance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
