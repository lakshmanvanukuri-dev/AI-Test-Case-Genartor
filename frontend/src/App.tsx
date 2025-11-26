import React from 'react';
import JiraPluginUI from './components/JiraPluginUI';

function App() {
  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px', backgroundColor: '#F4F5F7', minHeight: '100vh' }}>
      <JiraPluginUI />
    </div>
  );
}

export default App;
