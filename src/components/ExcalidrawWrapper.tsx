import React, {
  useState,
  useRef,
  useCallback,
  type ComponentProps,
} from "react";
import { Excalidraw, MainMenu, Footer } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { systemDesign } from "../lib/system-design";
import ReactMarkdown from "react-markdown";
type ExcalidrawApi = ComponentProps<typeof Excalidraw>["excalidrawAPI"];
type ExcalidrawImperativeAPIRef = ExcalidrawApi extends
  | ((api: infer T) => void)
  | undefined
  ? T
  : never;

const ExcalidrawWrapper: React.FC = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPIRef | null>(null);
  const isAIUpdateInProgress = useRef(false);

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [interviewQuestion, setInterviewQuestion] = useState(
    "Your interview question will appear here."
  );
  const [interviewDescription, setInterviewDescription] = useState("");
  const [interviewRequirements, setInterviewRequirements] = useState<string[]>([]);
  const [userInputText, setUserInputText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPIRef) => {
    excalidrawAPIRef.current = api;
    try {
      api.updateLibrary({ libraryItems: systemDesign.libraryItems });
    } catch (error) {
      console.error("Failed to load local Excalidraw library:", error);
    }
  }, []);

  // Define handlers with useCallback to prevent re-creation
  const handleStartInterview = useCallback(async () => {
    console.log("Start Interview clicked"); // Debug log
    setIsLoadingAI(true);
    setFeedbackMessage("Starting new interview...");

    try {
      const response = await fetch("http://localhost:3000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "system design" }),
      });

      if (!response.ok) throw new Error("Failed to start interview");

      const { question, initialDiagram } = await response.json();
      setInterviewQuestion(question.title);
      setInterviewDescription(question.description);
      setInterviewRequirements(question.requirements.map((req: string) => req));

      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.resetScene();
      excalidrawAPIRef.current?.updateScene({ elements: initialDiagram });
      setFeedbackMessage("");

      // Show success toast
      excalidrawAPIRef.current?.setToast?.({
        message: "New interview started successfully!",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setFeedbackMessage(`Error: ${errorMsg}`);

      // Show error toast
      excalidrawAPIRef.current?.setToast?.({
        message: `Error: ${errorMsg}`,
        duration: 5000,
        closable: true,
      });
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  }, []);

  const handleGenerateFromText = useCallback(async () => {
    console.log("Generate from Text clicked"); // Debug log

    if (!userInputText.trim()) {
      excalidrawAPIRef.current?.setToast?.({
        message: "Please enter text to generate diagram",
        duration: 3000,
        closable: true,
      });
      return;
    }

    setIsLoadingAI(true);
    setFeedbackMessage("Generating diagram from text...");

    try {
      const elements = excalidrawAPIRef.current?.getSceneElements() || [];
      const response = await fetch("/api/diagram/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          userTextPrompt: userInputText,
          analysisType: "generation",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate diagram");

      const { diagramUpdate } = await response.json();
      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.updateScene({
        elements: [...elements, ...diagramUpdate],
      });
      setFeedbackMessage("Diagram generated successfully.");
      setShowTextInput(false);
      setUserInputText("");

      excalidrawAPIRef.current?.setToast?.({
        message: "Diagram generated successfully!",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setFeedbackMessage(`Error: ${errorMsg}`);
      excalidrawAPIRef.current?.setToast?.({
        message: `Error: ${errorMsg}`,
        duration: 5000,
        closable: true,
      });
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  }, [userInputText]);

  const handleAnalyzeDesign = useCallback(async () => {
    console.log("Analyze Design clicked"); // Debug log

    const elements = excalidrawAPIRef.current?.getSceneElements() || [];
    if (elements.length === 0) {
      excalidrawAPIRef.current?.setToast?.({
        message: "Please create some elements to analyze",
        duration: 3000,
        closable: true,
      });
      return;
    }

    setIsLoadingAI(true);
    setFeedbackMessage("Analyzing your design...");

    try {
      const response = await fetch("/api/diagram/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements, analysisType: "feedback" }),
      });

      if (!response.ok) throw new Error("Failed to analyze design");

      const { diagramUpdate } = await response.json();
      isAIUpdateInProgress.current = true;
      excalidrawAPIRef.current?.updateScene({
        elements: [...elements, ...diagramUpdate],
      });
      setFeedbackMessage("Analysis complete.");

      excalidrawAPIRef.current?.setToast?.({
        message: "Design analysis complete!",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setFeedbackMessage(`Error: ${errorMsg}`);
      excalidrawAPIRef.current?.setToast?.({
        message: `Error: ${errorMsg}`,
        duration: 5000,
        closable: true,
      });
    } finally {
      setIsLoadingAI(false);
      isAIUpdateInProgress.current = false;
    }
  }, []);

  const handleOpenTextInput = useCallback(() => {
    console.log("Open Text Input clicked"); // Debug log
    setShowTextInput(true);
  }, []);

  const handleCloseTextInput = useCallback(() => {
    setShowTextInput(false);
    setUserInputText("");
  }, []);

  const renderTextInputModal = () => {
    if (!showTextInput) return null;

    return (
      <>
        {/* Modal Backdrop */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9998,
          }}
          onClick={handleCloseTextInput}
        />

        {/* Modal Content */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 9999,
            minWidth: "400px",
            maxWidth: "600px",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0" }}>Generate Diagram from Text</h3>
          <textarea
            value={userInputText}
            onChange={(e) => setUserInputText(e.target.value)}
            placeholder="Describe the diagram you want to generate... (e.g., 'Create a social media architecture with user service, posts service, and database')"
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
            }}
            autoFocus
          />
          <div
            style={{
              marginTop: "15px",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleCloseTextInput}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f1f1f1",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateFromText}
              disabled={isLoadingAI || !userInputText.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  isLoadingAI || !userInputText.trim() ? "#ccc" : "#007acc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor:
                  isLoadingAI || !userInputText.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isLoadingAI ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <Excalidraw
        excalidrawAPI={handleApiReady}
        renderTopRightUI={() => (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleStartInterview}
              disabled={isLoadingAI}
              title="Start Interview"
              style={{ padding: 4 }}
            >
              🤖
            </button>
            <button
              onClick={handleOpenTextInput}
              disabled={isLoadingAI}
              title="Generate from Text"
              style={{ padding: 4 }}
            >
              ✍️
            </button>
            <button
              onClick={handleAnalyzeDesign}
              disabled={isLoadingAI}
              title="Analyze Design"
              style={{ padding: 4 }}
            >
              🔍
            </button>
          </div>
        )}
      >

        {/* Custom Footer for Status Display */}
        <Footer>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "0 10px",
              fontSize: "12px",
            }}
          >
            {/* Interview Question Display */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", marginBottom: "2px" }}>
                Interview:
              </strong>
              <div
                style={{
                  color: "#666",
                }}
              >
                <ReactMarkdown>{interviewQuestion}</ReactMarkdown>
              </div>
              {interviewDescription && (
                <div style={{ marginTop: "10px", color: "#666" }}>
                  <strong>Description:</strong>
                  <ReactMarkdown>{interviewDescription}</ReactMarkdown>
                </div>
              )}
              {interviewRequirements.length > 0 && (
                <div style={{ marginTop: "10px", color: "#666" }}>
                  <strong>Requirements:</strong>
                  <ul>
                    {interviewRequirements.map((req, index) => (
                      <li key={index}>
                        <ReactMarkdown>{req}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Status Display */}
            {feedbackMessage && (
              <div
                style={{
                  fontStyle: "italic",
                  color: isLoadingAI ? "#007acc" : "#666",
                  maxWidth: "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Status: {feedbackMessage}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoadingAI && (
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #f3f3f3",
                  borderTop: "2px solid #007acc",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </div>

          {/* CSS for spinner animation */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Footer>
      </Excalidraw>

      {/* Text Input Modal */}
      {renderTextInputModal()}
    </div>
  );
};

export default ExcalidrawWrapper;
