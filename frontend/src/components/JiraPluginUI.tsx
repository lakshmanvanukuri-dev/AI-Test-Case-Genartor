import React, { useState } from 'react';
import axios from 'axios';

// Define types for our test cases
interface TestCase {
  id: string;
  title: string;
  type: 'Positive' | 'Negative';
  steps: string[];
  expected_result: string;
}

const JiraPluginUI: React.FC = () => {
  const [userStory, setUserStory] = useState<string>('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string>('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [projectKey, setProjectKey] = useState<string>('KAN'); // Default project key
  const [parentKey, setParentKey] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!userStory) {
      setError('Please enter a User Story');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setTestCases([]);

    try {
      // Call our Python Backend API
      const response = await axios.post('http://localhost:8002/api/v1/generate', {
        user_story: userStory,
        acceptance_criteria: acceptanceCriteria
      });

      setTestCases(response.data.test_cases);
    } catch (err) {
      console.error(err);
      setError('Failed to generate test cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToJira = async () => {
    if (testCases.length === 0) return;
    
    setExporting(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:8002/api/v1/export-to-jira', {
        project_key: projectKey,
        parent_key: parentKey || null,
        test_cases: testCases
      });
      setSuccessMsg('Successfully exported to Jira!');
    } catch (err) {
      console.error(err);
      setError('Failed to export to Jira. Check your Project Key.');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!testCases || testCases.length === 0) return;

    // Create headers for Excel
    let clipboardText = "ID\tType\tTitle\tDescription\tSteps\tExpected Result\n";

    // Format each test case as a tab-separated line
    testCases.forEach((tc) => {
      // Clean up newlines within cells to prevent breaking rows in Excel
      const clean = (text: string) => text ? text.replace(/(\r\n|\n|\r)/gm, " ") : "";
      
      // Format steps if they are an array
      const stepsText = Array.isArray(tc.steps) 
        ? tc.steps.map((s: any, i: number) => `${i+1}. ${s}`).join(" | ") 
        : clean(String(tc.steps));

      clipboardText += `${tc.id}\t${tc.type}\t${clean(tc.title)}\t${clean(tc.title)}\t${stepsText}\t${clean(tc.expected_result)}\n`;
    });

    navigator.clipboard.writeText(clipboardText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  // Function to delete a specific test case
  const handleDeleteTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  // Function to update test case content (Title, Steps, Expected Result)
  const handleUpdateTestCase = (id: string, field: string, value: string | string[]) => {
    setTestCases(testCases.map(tc => {
      if (tc.id === id) {
        return { ...tc, [field]: value };
      }
      return tc;
    }));
  };

  // Function to add a manual test case
  const handleAddTestCase = () => {
    const newId = `TC-${String(testCases.length + 1).padStart(3, '0')}`;
    const newTestCase: TestCase = {
      id: newId,
      title: 'New Test Case',
      type: 'Positive',
      steps: ['Step 1...'],
      expected_result: 'Expected result...'
    };
    setTestCases([...testCases, newTestCase]);
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1200px', // Increased from 400px to 1200px
      margin: '20px auto', // Added top margin
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      border: '1px solid #DFE1E6',
      borderRadius: '8px', // Slightly larger radius
      backgroundColor: '#FFFFFF',
      minHeight: '800px', // Increased height
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' // Added shadow for app-like feel
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 24px', // Increased padding
        borderBottom: '1px solid #DFE1E6', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        backgroundColor: '#FAFBFC' // Light background for header
      }}>
        <div style={{ 
          background: '#0052CC', 
          width: '32px', // Larger icon
          height: '32px', 
          borderRadius: '4px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontWeight: 'bold',
          fontSize: '14px'
        }}>AI</div>
        <h3 style={{ margin: 0, color: '#172B4D', fontSize: '20px', fontWeight: 600 }}>Test Case Generator</h3>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', gap: '24px' }}>
        
        {/* Left Column: Inputs */}
        <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5E6C84', marginBottom: '8px', textTransform: 'uppercase' }}>
              User Story
            </label>
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="As a user, I want to..."
              style={{ 
                width: '100%', 
                height: '150px', // Taller input
                padding: '12px', 
                border: '2px solid #DFE1E6', // Thicker border
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5E6C84', marginBottom: '8px', textTransform: 'uppercase' }}>
              Acceptance Criteria (Optional)
            </label>
            <textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="- Must verify email format..."
              style={{ 
                width: '100%', 
                height: '100px', 
                padding: '12px', 
                border: '2px solid #DFE1E6', 
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{
              backgroundColor: '#0052CC',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 20px',
              fontWeight: 600,
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </button>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#FFEBE6', color: '#DE350B', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          {successMsg && (
            <div style={{ padding: '12px', backgroundColor: '#E3FCEF', color: '#006644', borderRadius: '4px', fontSize: '14px' }}>
              {successMsg}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div style={{ flex: 1, borderLeft: '1px solid #DFE1E6', paddingLeft: '24px', display: 'flex', flexDirection: 'column' }}>
          {testCases.length > 0 ? (
            <>
              <div style={{ 
                marginBottom: '20px', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid #DFE1E6'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#42526E', 
                  textTransform: 'uppercase' 
                }}>
                  Generated {testCases.length} Test Cases
                </span>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                   <button 
                     onClick={handleCopyToClipboard}
                     style={{
                       fontSize: '13px',
                       padding: '6px 12px',
                       cursor: 'pointer',
                       backgroundColor: isCopied ? '#00875A' : '#F4F5F7',
                       color: isCopied ? 'white' : '#42526E',
                       border: '1px solid #DFE1E6',
                       borderRadius: '3px',
                       fontWeight: 500,
                       transition: 'all 0.2s'
                     }}
                   >
                     {isCopied ? 'Copied!' : 'Copy Excel'}
                   </button>
                   <div style={{ width: '1px', height: '24px', background: '#DFE1E6', margin: '0 8px' }}></div>
                   <input 
                     type="text" 
                     value={projectKey}
                     onChange={(e) => setProjectKey(e.target.value)}
                     placeholder="Project Key"
                     style={{ width: '80px', fontSize: '13px', padding: '6px', border: '1px solid #DFE1E6', borderRadius: '3px' }}
                   />
                   <input 
                     type="text" 
                     value={parentKey}
                     onChange={(e) => setParentKey(e.target.value)}
                     placeholder="Parent Key (e.g. AT-123)"
                     style={{ width: '140px', fontSize: '13px', padding: '6px', border: '1px solid #DFE1E6', borderRadius: '3px' }}
                   />
                   <button 
                     onClick={handleExportToJira}
                     disabled={exporting}
                     style={{
                       fontSize: '13px',
                       padding: '6px 12px',
                       cursor: 'pointer',
                       backgroundColor: '#0052CC',
                       color: 'white',
                       border: 'none',
                       borderRadius: '3px',
                       fontWeight: 500
                     }}
                   >
                     {exporting ? 'Saving...' : 'Save to Jira'}
                   </button>
                </div>
              </div>

              <div style={{ overflowY: 'auto', paddingRight: '8px' }}>
                {testCases.map((tc) => (
                  <div key={tc.id} style={{ 
                    border: '1px solid #DFE1E6', 
                    borderRadius: '4px', 
                    marginBottom: '16px', 
                    background: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    position: 'relative' // For positioning delete button
                  }}>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTestCase(tc.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#6B778C',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        zIndex: 10
                      }}
                      title="Delete Test Case"
                    >
                      ×
                    </button>

                    <div style={{ 
                      padding: '12px 16px', 
                      backgroundColor: '#FAFBFC', 
                      borderBottom: '1px solid #DFE1E6', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      paddingRight: '40px' // Make room for delete button
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{ fontWeight: 700, color: '#42526E', fontSize: '13px', background: '#EBECF0', padding: '2px 6px', borderRadius: '3px' }}>{tc.id}</span>
                        {/* Editable Title */}
                        <input 
                          type="text"
                          value={tc.title}
                          onChange={(e) => handleUpdateTestCase(tc.id, 'title', e.target.value)}
                          style={{ 
                            fontWeight: 600, 
                            color: '#172B4D', 
                            fontSize: '14px',
                            border: '1px solid transparent',
                            background: 'transparent',
                            width: '100%',
                            padding: '4px'
                          }}
                          className="hover:border-gray-300 hover:bg-white rounded"
                        />
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        color: tc.type === 'Positive' ? '#006644' : '#BF2600',
                        background: tc.type === 'Positive' ? '#E3FCEF' : '#FFEBE6',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        marginRight: '10px'
                      }}>
                        {tc.type}
                      </span>
                    </div>
                    <div style={{ padding: '16px', fontSize: '14px', color: '#172B4D' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#5E6C84', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Steps</strong>
                        {/* Editable Steps (Textarea) */}
                        <textarea
                          value={Array.isArray(tc.steps) ? tc.steps.join('\n') : tc.steps}
                          onChange={(e) => handleUpdateTestCase(tc.id, 'steps', e.target.value.split('\n'))}
                          style={{
                            width: '100%',
                            border: '1px solid #DFE1E6',
                            borderRadius: '4px',
                            padding: '8px',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            resize: 'vertical',
                            minHeight: '80px'
                          }}
                        />
                      </div>
                      <div>
                        <strong style={{ color: '#5E6C84', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Expected Result</strong>
                        {/* Editable Expected Result */}
                        <textarea
                          value={tc.expected_result}
                          onChange={(e) => handleUpdateTestCase(tc.id, 'expected_result', e.target.value)}
                          style={{
                            width: '100%',
                            border: '1px solid #DFE1E6',
                            borderRadius: '4px',
                            padding: '8px',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#42526E',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Manual Test Case Button */}
                <button
                  onClick={handleAddTestCase}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#F4F5F7',
                    border: '2px dashed #DFE1E6',
                    borderRadius: '4px',
                    color: '#5E6C84',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    marginBottom: '20px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#EBECF0';
                    e.currentTarget.style.borderColor = '#C1C7D0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F7';
                    e.currentTarget.style.borderColor = '#DFE1E6';
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add Manual Test Case
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: '#6B778C',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>✨</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#42526E' }}>Ready to Generate</h4>
              <p style={{ margin: 0, maxWidth: '300px' }}>Enter a user story on the left to generate comprehensive test cases powered by AI.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JiraPluginUI;
