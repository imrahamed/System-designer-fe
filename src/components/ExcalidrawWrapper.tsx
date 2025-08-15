import React, {
  useState,
  useRef,
  useCallback,
  type ComponentProps,
} from 'react';
import { Excalidraw, Sidebar } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
// import { systemDesign } from '../lib/system-design';

type ExcalidrawApi = ComponentProps<typeof Excalidraw>['excalidrawAPI'];
type ExcalidrawImperativeAPIRef = ExcalidrawApi extends
  | ((api: infer T) => void)
  | undefined
  ? T
  : never;

type Tab = 'interview' | 'ai-tools' | 'feedback';

const ExcalidrawWrapper: React.FC = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPIRef | null>(null);
  const isAIUpdateInProgress = useRef(false);

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [interviewQuestion, setInterviewQuestion] = useState(
    'Your interview question will appear here.'
  );
  const [userInputText, setUserInputText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('interview');

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPIRef) => {
    excalidrawAPIRef.current = api;
    // try {
    //   api.updateLibrary({libraryItems:systemDesign.libraryItems});
    // } catch (error) {
    //   console.error('Failed to load local Excalidraw library:', error);
    // }
  }, []);

  const handleStartInterview = async () => {
    setIsLoadingAI(true);
    setFeedbackMessage('Starting new interview...');
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'social media feed' }),
      });
      if (!response.ok) throw new Error('Failed to start interview');
      const { question, initialDiagram } = await response.json();
      setInterviewQuestion(question);
      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.resetScene();
      excalidrawAPIRef.current?.updateScene({ elements: initialDiagram });
      setFeedbackMessage('New interview started.');
    } catch (error) {
      setFeedbackMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  };

  const handleGenerateFromText = async () => {
    setIsLoadingAI(true);
    setFeedbackMessage('Generating diagram from text...');
    try {
      const elements = excalidrawAPIRef.current?.getSceneElements() || [];
      const response = await fetch('/api/diagram/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          userTextPrompt: userInputText,
          analysisType: 'generation',
        }),
      });
      if (!response.ok) throw new Error('Failed to generate diagram');
      const { diagramUpdate } = await response.json();
      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.updateScene({
        elements: [...elements, ...diagramUpdate],
      });
      setFeedbackMessage('Diagram generated.');
    } catch (error) {
      setFeedbackMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  };

  const handleAnalyzeDesign = async () => {
    setIsLoadingAI(true);
    setFeedbackMessage('Analyzing your design...');
    try {
      const elements = excalidrawAPIRef.current?.getSceneElements() || [];
      const response = await fetch('/api/diagram/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, analysisType: 'feedback' }),
      });
      if (!response.ok) throw new Error('Failed to analyze design');
      const { diagramUpdate } = await response.json();
      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.updateScene({
        elements: [...elements, ...diagramUpdate],
      });
      setFeedbackMessage('Analysis complete.');
    } catch (error) {
      setFeedbackMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'interview':
        return (
          <div>
            <h4>Interview Question</h4>
            <p>{interviewQuestion}</p>
            <button onClick={handleStartInterview} disabled={isLoadingAI}>
              Start New Interview
            </button>
          </div>
        );
      case 'ai-tools':
        return (
          <div>
            <h4>Generate from Text</h4>
            <textarea
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              placeholder="Describe the diagram you want to generate..."
              style={{ width: '100%', minHeight: '100px' }}
            />
            <button onClick={handleGenerateFromText} disabled={isLoadingAI} style={{ marginTop: '10px' }}>
              Generate Diagram
            </button>
            <hr style={{ margin: '20px 0' }} />
            <h4>Analyze Design</h4>
            <button onClick={handleAnalyzeDesign} disabled={isLoadingAI}>
              Analyze My Design
            </button>
          </div>
        );
      case 'feedback':
        return (
          <div>
            <h4>Feedback</h4>
            {isLoadingAI && <p>AI is thinking...</p>}
            <p>{feedbackMessage}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <Excalidraw excalidrawAPI={handleApiReady}>
        <Sidebar name="panel">
          <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <button onClick={() => setActiveTab('interview')} disabled={activeTab === 'interview'}>Interview</button>
              <button onClick={() => setActiveTab('ai-tools')} disabled={activeTab === 'ai-tools'}>AI Tools</button>
              <button onClick={() => setActiveTab('feedback')} disabled={activeTab === 'feedback'}>Feedback</button>
            </div>
            <div>{renderContent()}</div>
          </div>
        </Sidebar>
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawWrapper;
