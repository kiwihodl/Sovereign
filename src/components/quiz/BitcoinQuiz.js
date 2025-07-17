import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { questions } from './questions';
import { tooltips } from './tooltips';
import { generateRecommendations } from './recommendations';

const BitcoinQuiz = () => {
  const [answers, setAnswers] = useState({
    question1: undefined,
    question2: undefined,
    question3: [], // MultiSelect expects an array
    question4: undefined,
    question5: undefined,
    question6: undefined,
    question7: undefined,
    question8: undefined,
    question9: undefined,
    question10: undefined,
  });

  const [openTooltip, setOpenTooltip] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value,
    }));
  };

  const toggleTooltip = questionNumber => {
    setOpenTooltip(openTooltip === questionNumber ? null : questionNumber);
  };

  const renderQuestion = question => {
    const { id, text, type, options } = question;
    const questionKey = `question${id}`;
    const currentTooltip = tooltips[id];

    return (
      <div key={id} className={`${cardBgClass} p-6 rounded-lg border ${borderClass} relative`}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className={`text-xl font-semibold ${textClass}`}>
            {id}. {text}
          </h3>
          <button
            onClick={() => toggleTooltip(id)}
            className="text-[#FF9500] text-lg cursor-help hover:text-[#FF9500]/80 transition-colors"
          >
            ⓘ
          </button>
        </div>

        {openTooltip === id && (
          <div
            className={`absolute top-0 left-0 right-0 ${cardBgClass} border ${borderClass} rounded-lg p-4 mb-4 z-20 shadow-lg`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-[#FF9500]">{currentTooltip.title}</h4>
              <button
                onClick={() => toggleTooltip(id)}
                className={`${secondaryTextClass} hover:${textClass} transition-colors`}
              >
                ✕
              </button>
            </div>
            <p className={`${secondaryTextClass} leading-relaxed`}>{currentTooltip.content}</p>
          </div>
        )}

        {type === 'dropdown' ? (
          <Dropdown
            value={answers[questionKey]}
            onChange={e => handleAnswerChange(questionKey, e.value)}
            options={options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        ) : (
          <MultiSelect
            value={answers[questionKey]}
            onChange={e => handleAnswerChange(questionKey, e.value)}
            options={options}
            placeholder="Select your goals (multiple choices allowed)"
            className="w-full"
            showSelectAll={false}
            pt={{
              panel: {
                className: 'py-0',
              },
              header: {
                className: 'hidden',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
              checkbox: {
                className: 'text-[#FF9500]',
              },
              checkboxBox: {
                className: 'border-[#FF9500]',
              },
              checkboxBoxHighlighed: {
                className: 'bg-[#FF9500] border-[#FF9500]',
              },
              checkboxIcon: {
                className: 'text-white',
              },
            }}
          />
        )}
      </div>
    );
  };

  const recommendations = generateRecommendations(answers);

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-black';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const secondaryTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`max-w-4xl mx-auto p-6 ${bgClass} min-h-screen bitcoin-quiz-container`}>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${textClass} mb-4`}>Bitcoin Assessment Quiz</h2>
        <p className={`${secondaryTextClass} mb-6`}>
          Answer these questions to get personalized Bitcoin recommendations.
        </p>
      </div>

      <div className="space-y-8 mb-8">{questions.map(renderQuestion)}</div>

      {/* Recommendations */}
      {recommendations && (
        <div className={`${cardBgClass} p-6 rounded-lg border ${borderClass}`}>
          <h3 className={`text-2xl font-bold ${textClass} mb-6`}>
            Bitcoin Custody & Security Recommendations
          </h3>

          {/* Single cohesive document */}
          <div
            className={`recommendations-content ${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg border ${borderClass}`}
          >
            {recommendations.map((rec, index) => (
              <div key={index} className={index > 0 ? 'mt-8 pt-8 border-t border-gray-600' : ''}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className={`text-xl font-semibold ${textClass}`}>
                    {rec.title.split(' (')[0]}
                  </h4>
                  <span
                    className={`${isDarkMode ? 'text-orange-400' : 'text-black'} text-base font-medium`}
                  >
                    ({rec.title.match(/\(([^)]+)\)/)?.[1] || ''})
                  </span>
                </div>
                <ul className="space-y-3">
                  {rec.content.map((item, itemIndex) => (
                    <li key={itemIndex} className={`${secondaryTextClass} flex items-start`}>
                      <span className={`${isDarkMode ? 'text-orange-400' : 'text-black'} mr-2`}>
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`mt-6 pt-4 border-t ${borderClass} flex justify-between items-center`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              <span>{isDarkMode ? '☀️' : '🌙'}</span>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={() => {
                const printContent = document.querySelector('.recommendations-content');
                const newWindow = window.open('', '_blank', 'width=800,height=600');
                newWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Bitcoin Recommendations</title>
                      <style>
                        body { 
                          font-family: Arial, sans-serif; 
                          margin: 40px; 
                          background: white; 
                          color: black; 
                        }
                        h3 { color: black; margin-bottom: 20px; }
                        h4 { color: black; margin-bottom: 15px; }
                        span { color: #FF9500; }
                        li { margin-bottom: 10px; }
                        .bullet { color: #FF9500; margin-right: 10px; }
                        .recommendations-content { background: white !important; }
                      </style>
                    </head>
                    <body>
                      <h3>Bitcoin Custody & Security Recommendations</h3>
                      ${printContent.outerHTML}
                    </body>
                  </html>
                `);
                newWindow.document.close();
                newWindow.focus();
                newWindow.print();
              }}
              className="bg-orange-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
            >
              Print Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BitcoinQuiz;
