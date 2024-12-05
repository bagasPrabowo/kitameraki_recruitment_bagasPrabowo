import { Text } from '@fluentui/react-components';
import { StickyNote } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2">
          <StickyNote className="h-6 w-6 text-blue-600" />
          <Text size={500} weight="semibold">Task Manager</Text>
        </div>
      </div>
    </header>
  );
};