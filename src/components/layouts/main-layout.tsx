import React from 'react';

interface MainLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ leftPanel, rightPanel }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel (Fixed Width) - md以上で表示 */}
      {/* TODO: モバイル用にハンバーガーメニューとドロワー/モーダル表示を追加 */} 
      <aside className="hidden md:block w-64 bg-muted/40 border-r p-4 overflow-y-auto flex-shrink-0">
        {leftPanel}
      </aside>

      {/* Right Panel (Flexible Width) */}
      {/* モバイルでは全幅、md以上で残りの幅 */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {rightPanel}
      </main>
    </div>
  );
}; 