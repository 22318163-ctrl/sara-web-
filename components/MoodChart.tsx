
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyEntry, Mood } from '../types';
import { MOOD_OPTIONS } from '../constants';

interface MoodChartProps {
    data: DailyEntry[];
}

const moodToValue = (mood: Mood): number => {
    // Assign numerical value for charting, higher is better
    switch (mood) {
        case '😍': return 5;
        case '😊': return 4;
        case '😐': return 3;
        case '😟': return 2;
        case '😭': return 1;
        case '😡': return 0;
        default: return 0;
    }
};

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
    const chartData = data.map(entry => ({
        name: new Date(entry.date).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' }),
        moodValue: moodToValue(entry.mood),
        mood: entry.mood,
    })).reverse(); // Reverse to show chronologically

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5, right: 10, left: -20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#D8EAD6" />
                    <XAxis dataKey="name" tick={{ fill: '#4A7A5A', fontSize: 12 }} />
                    <YAxis 
                        tick={{ fill: '#4A7A5A', fontSize: 12 }}
                        tickFormatter={(value) => MOOD_OPTIONS[5 - value] || ''} // Map value back to emoji
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#F6F2EC',
                            borderColor: '#BFD8C8',
                            borderRadius: '1rem',
                            fontFamily: 'Cairo, sans-serif'
                        }}
                        labelStyle={{ color: '#4A7A5A' }}
                        formatter={(value, name, props) => [`المزاج: ${props.payload.mood}`, null]}
                     />
                    <Bar dataKey="moodValue" fill="#BFD8C8" radius={[10, 10, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MoodChart;
