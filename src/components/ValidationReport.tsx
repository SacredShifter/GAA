import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Download, Info } from 'lucide-react';
import { globalValidationFramework, type ValidationMetrics, type UnverifiableClaim } from '../utils/validationFramework';

export interface ValidationReportProps {
  theme?: 'dark' | 'light';
}

export const ValidationReport: React.FC<ValidationReportProps> = ({ theme = 'dark' }) => {
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'untestable' | 'export'>('summary');

  useEffect(() => {
    const generated = globalValidationFramework.generateFullReport();
    setReport(generated);
  }, []);

  const handleExportJSON = () => {
    const json = globalValidationFramework.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvData = globalValidationFramework.exportToCSV();

    Object.entries(csvData).forEach(([name, data]) => {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validation-${name}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (!report) {
    return <div className={`p-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading validation report...</div>;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    return theme === 'dark' ? 'text-red-400' : 'text-red-600';
  };

  const getScoreIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    );
  };

  const renderMetricCard = (metric: ValidationMetrics) => (
    <div
      key={metric.testType}
      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6 mb-4`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {metric.testType}
        </h3>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${getScoreColor(metric.overallScore)}`}>
            {metric.overallScore.toFixed(0)}%
          </span>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            ({(metric.confidence * 100).toFixed(0)}% confidence)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {metric.results.map((result, idx) => (
          <div
            key={idx}
            className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getScoreIcon(result.passed)}
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.metric}
                  </span>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  <div>Expected: <span className="font-mono">{result.expected}</span></div>
                  <div>Actual: <span className="font-mono">{result.actual}</span></div>
                  {result.notes && (
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {result.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUntestableClaim = (claim: UnverifiableClaim, idx: number) => {
    const testabilityColor =
      claim.testability === 'testable' ? 'bg-green-600' :
      claim.testability.includes('untestable') ? 'bg-red-600' :
      'bg-yellow-600';

    return (
      <div
        key={idx}
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-5 mb-4`}
      >
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {claim.claim}
            </h4>
            <span className={`inline-block px-2 py-1 text-xs rounded ${testabilityColor} text-white mb-2`}>
              {claim.testability.replace(/-/g, ' ')}
            </span>
          </div>
        </div>

        <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <p><strong>Description:</strong> {claim.description}</p>
          <p><strong>Reason:</strong> {claim.reason}</p>
          <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <p className="font-semibold mb-1">Recommended Reframing:</p>
            <p className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              "{claim.recommendedFraming}"
            </p>
          </div>
          <div className={`mt-2 p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <p className="font-semibold mb-1">Measurable Alternative:</p>
            <p className="font-mono text-xs">{claim.measurableAlternative}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full overflow-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Collective Consciousness Validation Report</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Objective validation of all system claims and measurements
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {(['summary', 'details', 'untestable', 'export'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize ${
                activeTab === tab
                  ? `border-b-2 ${theme === 'dark' ? 'border-cyan-400 text-cyan-400' : 'border-cyan-600 text-cyan-600'}`
                  : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'summary' && (
          <div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6 mb-6`}>
              <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
              <pre className={`whitespace-pre-wrap font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {report.summary}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {report.metrics.map((metric: ValidationMetrics) => (
                <div
                  key={metric.testType}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}
                >
                  <h3 className="font-bold mb-2">{metric.testType}</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(metric.overallScore)} mb-1`}>
                    {metric.overallScore.toFixed(0)}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metric.results.filter((r) => r.passed).length}/{metric.results.length} tests passed
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    Confidence: {(metric.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>

            <div className={`${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'} border ${theme === 'dark' ? 'border-yellow-700' : 'border-yellow-300'} rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Important Note on Untestable Claims</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {report.untestableClaims.length} features use terminology that cannot be scientifically validated
                    in their current form. See the "Untestable" tab for detailed analysis and recommended reframings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Detailed Test Results</h2>
            {report.metrics.map((metric: ValidationMetrics) => renderMetricCard(metric))}
          </div>
        )}

        {activeTab === 'untestable' && (
          <div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6 mb-6`}>
              <h2 className="text-2xl font-bold mb-3">Untestable & Imprecise Claims</h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                The following features use language borrowed from quantum mechanics or consciousness studies
                that cannot be directly validated with current measurement capabilities. Each entry includes
                recommended reframing using scientifically precise terminology.
              </p>
              <div className={`${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'} border ${theme === 'dark' ? 'border-blue-700' : 'border-blue-300'} rounded p-4`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Note:</strong> These features still provide value as computational models and metaphors
                  for collective behavior, but should not be represented as literal quantum mechanics or proven
                  consciousness science without appropriate qualifiers.
                </p>
              </div>
            </div>

            <div>
              {report.untestableClaims.map((claim: UnverifiableClaim, idx: number) =>
                renderUntestableClaim(claim, idx)
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Export Validation Data</h2>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6 mb-6`}>
              <h3 className="font-bold mb-3">Data Available for Export</h3>
              <div className="space-y-2 text-sm">
                <div>• Biometric accuracy tests: {report.dataExport.biometricTests.length} samples</div>
                <div>• Synchronization tests: {report.dataExport.syncTests.length} sessions</div>
                <div>• AI prediction tests: {report.dataExport.aiTests.length} predictions</div>
                <div>• Voting validation tests: {report.dataExport.votingTests.length} test cases</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                Export Full Report (JSON)
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                Export All Data (CSV)
              </button>
            </div>

            <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6`}>
              <h3 className="font-bold mb-3">For Independent Researchers</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                All exported data is available for independent analysis. The JSON export contains:
              </p>
              <ul className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} list-disc list-inside space-y-1`}>
                <li>Raw measurement comparisons with timestamps</li>
                <li>Calculated error metrics and statistical summaries</li>
                <li>Complete test result details with pass/fail criteria</li>
                <li>Identified untestable claims with recommended reframings</li>
                <li>Confidence intervals for all reported metrics</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
