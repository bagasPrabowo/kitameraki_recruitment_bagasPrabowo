import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Header } from './components/Layout/Header';
import { TaskList } from './components/Tasks/TaskList';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <TaskList />
        </main>
      </div>
    </FluentProvider>
  );
}

export default App;