import dynamic from 'next/dynamic';

const AnalysesTable = dynamic(() => import('../../../components/dashboard/AnalysesTable'), {
  loading: () => <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>,
});

export default function BookmarksPage() {
  return (
    <AnalysesTable 
      title="Saved Bookmarks" 
      subtitle="Articles you have bookmarked for later reference."
      isBookmarkedOnly={true}
    />
  );
}
