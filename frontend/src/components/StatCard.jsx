import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                {Icon && (
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
            <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};

export default StatCard;
