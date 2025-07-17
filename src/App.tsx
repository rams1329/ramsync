import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { UploadForm } from './components/upload/UploadForm';
import { RetrieveContent } from './components/retrieve/RetrieveContent';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'retrieve'>('upload');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 py-8">
        {activeTab === 'upload' ? <UploadForm /> : <RetrieveContent />}
      </main>
      
      <Footer />
      
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
    </div>
  );
}

export default App;