import React from 'react';

interface MainLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ leftPanel, rightPanel }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Left Panel (Fixed Width) - md以上で表示 */}
      {/* TODO: モバイル用にハンバーガーメニューとドロワー/モーダル表示を追加 */} 
      <aside className="block w-full md:w-64 bg-muted/40 border-r md:border-b-0 border-b p-4 overflow-y-auto flex-shrink-0 h-1/3 md:h-full">
        {leftPanel}
      </aside>

      {/* Right Panel (Flexible Width) */}
      {/* モバイルでは全幅、md以上で残りの幅 */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-2/3 md:h-full">
        {rightPanel}
      </main>
    </div>
  );
}; 