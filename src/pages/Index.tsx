import { DiagnosticHeader } from "@/components/DiagnosticHeader";
import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DiagnosticHeader />
      <main>
        <ChatContainer />
      </main>
    </div>
  );
};

export default Index;
