import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Eye, Headphones, Zap, CheckCircle } from 'lucide-react';

const MBTIResults = () => {
    const location = useLocation();
    const mbtiType = location.state?.mbtiType || 'INFP';

    const mbtiInfo = {
        INFP: {
            name: 'The Mediator',
            description: 'INFPs are imaginative idealists, guided by their own core values and beliefs. They are typically curious, flexible, and open-minded, with a deep desire to understand themselves and the world around them.',
            strengths: ['Creative thinking', 'Empathy', 'Idealism', 'Open-mindedness'],
            learningStyle: 'Visual & Reflective',
            learningDescription: 'Best suited for your personality',
        },
        INTJ: {
            name: 'The Architect',
            description: 'INTJs are analytical problem-solvers, eager to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement.',
            strengths: ['Strategic thinking', 'Independence', 'Determination', 'Curiosity'],
            learningStyle: 'Visual & Analytical',
            learningDescription: 'Logic-based learning approach',
        },
        ENFP: {
            name: 'The Campaigner',
            description: 'ENFPs are enthusiastic, creative and sociable free spirits, who can always find a reason to smile.',
            strengths: ['Enthusiasm', 'Creativity', 'Social skills', 'Optimism'],
            learningStyle: 'Kinesthetic & Social',
            learningDescription: 'Interactive learning approach',
        },
        ESTJ: {
            name: 'The Executive',
            description: 'ESTJs are organized achievers who like to get things done. They value structure, rules and tradition.',
            strengths: ['Organization', 'Leadership', 'Dedication', 'Direct communication'],
            learningStyle: 'Structured & Practical',
            learningDescription: 'Step-by-step approach',
        },
    };

    const info = mbtiInfo[mbtiType] || mbtiInfo['INFP'];

    const learningRecommendations = [
        {
            icon: Eye,
            title: 'Visual Learning',
            description: 'Use mind maps, diagrams and color-coded notes to organize information and create visual study guides.',
            color: 'blue',
        },
        {
            icon: Headphones,
            title: 'Auditory Learning',
            description: 'Listen to podcasts, participate in discussions, and record lectures to reinforce your learning through sound.',
            color: 'purple',
        },
        {
            icon: Zap,
            title: 'Kinesthetic Learning',
            description: 'Engage in hands-on activities, use physical objects to represent ideas, and take study breaks to move around while studying.',
            color: 'green',
        },
    ];

    const studyTips = [
        'Set aside dedicated time for reflection and creative exploration',
        'Connect new information to your personal values and experiences',
        'Use storytelling and narratives to remember complex concepts',
        'Create a comfortable, inspiring study environment',
        'Take regular breaks to process information deeply',
    ];

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your MBTI Results</h1>
                    <p className="text-gray-600">Personalized insights for better learning</p>
                </div>

                {/* Main Result Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200 mb-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex p-4 bg-blue-600 rounded-full mb-4">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{mbtiType}</h2>
                        <p className="text-lg text-blue-600 font-semibold mb-4">{info.name}</p>
                        <p className="text-gray-600 max-w-2xl mx-auto">{info.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Strengths</h3>
                            <ul className="space-y-2">
                                {info.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-center text-gray-700">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Preferred Learning Style
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                                <Eye className="h-6 w-6 text-yellow-600" />
                                <span className="text-xl font-bold text-yellow-600">{info.learningStyle}</span>
                            </div>
                            <p className="text-sm text-gray-600">{info.learningDescription}</p>
                        </div>
                    </div>
                </div>

                {/* Learning Style Recommendations */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Style Recommendations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {learningRecommendations.map((rec, index) => {
                            const Icon = rec.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <div className={`inline-flex p-3 rounded-lg ${colorClasses[rec.color]} mb-4`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                                    <p className="text-sm text-gray-600">{rec.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Personalized Study Tips */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Study Tips for {mbtiType}</h2>
                    <ul className="space-y-3">
                        {studyTips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                                    {index + 1}
                                </span>
                                <span className="text-gray-700">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MBTIResults;
