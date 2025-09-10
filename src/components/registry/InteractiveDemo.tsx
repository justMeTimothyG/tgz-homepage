"use client";

import React, { useState } from 'react';

interface InteractiveDemoProps {
  title?: string;
  description?: string;
  initialValue?: number;
  min?: number;
  max?: number;
}

export default function InteractiveDemo({
  title = "Interactive Demo",
  description = "This is a sample interactive component for educational content.",
  initialValue = 50,
  min = 0,
  max = 100
}: InteractiveDemoProps) {
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState<number[]>([initialValue]);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    setHistory(prev => [...prev.slice(-9), newValue]);
  };

  const reset = () => {
    setValue(initialValue);
    setHistory([initialValue]);
  };

  const progressPercentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Value: {value}
          </label>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-600 dark:text-blue-400">Current</div>
            <div className="text-gray-900 dark:text-white">{value}</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-600 dark:text-green-400">Progress</div>
            <div className="text-gray-900 dark:text-white">{progressPercentage.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-600 dark:text-purple-400">Changes</div>
            <div className="text-gray-900 dark:text-white">{history.length - 1}</div>
          </div>
        </div>

        {/* History Visualization */}
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent History:
          </div>
          <div className="flex items-end space-x-1 h-12">
            {history.slice(-10).map((histValue, index) => (
              <div
                key={index}
                className="bg-blue-500 dark:bg-blue-400 rounded-t-sm min-w-[8px] flex-1 opacity-75 hover:opacity-100 transition-opacity"
                style={{
                  height: `${((histValue - min) / (max - min)) * 100}%`,
                }}
                title={`Value: ${histValue}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Reset
          </button>
          <button
            onClick={() => handleValueChange(Math.floor(Math.random() * (max - min + 1)) + min)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Random
          </button>
        </div>
      </div>

      {/* Component Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Interactive Demo Component • Range: {min}-{max} • Built with React
      </div>
    </div>
  );
}